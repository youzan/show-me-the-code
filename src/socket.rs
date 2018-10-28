use actix::prelude::*;
use actix::*;
use actix_web::*;
use futures::future;
use futures::Future;
use serde_json::{from_str, to_string};
use uuid::*;

use super::msg;
use super::msg::Msg;
use super::server;
use super::State;

pub struct WsSession {
  id: Uuid,
  host_id: Option<Uuid>,
}

impl Default for WsSession {
  fn default() -> WsSession {
    WsSession {
      id: Uuid::new_v4(),
      host_id: None,
    }
  }
}

type Context = ws::WebsocketContext<WsSession, State>;

impl WsSession {
  fn send_to_server(&mut self, ctx: &mut Context, msg: msg::Msg) {
    ctx
      .state()
      .signal_server_addr
      .send(msg)
      .into_actor(self)
      .then(|res, _, ctx| {
        if let Err(_) = res {
          ctx.stop();
        }
        fut::ok(())
      })
      .wait(ctx);
  }
}

impl Actor for WsSession {
  type Context = Context;

  fn started(&mut self, ctx: &mut Self::Context) {
    let addr = ctx.address();
    ctx
      .state()
      .signal_server_addr
      .send(server::Connect(self.id, addr.recipient()))
      .into_actor(self)
      .then(|res, act, ctx| {
        match res {
          Ok(_) => {
            ctx.text(to_string(&Msg::Connected(act.id)).expect("Error sending message"));
          }
          Err(_) => ctx.stop(),
        }
        fut::ok(())
      })
      .wait(ctx);
  }

  fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
    let fut = ctx
      .state()
      .signal_server_addr
      .send(server::Disconnect {
        client_id: self.id,
        host_id: self.host_id,
      })
      .or_else(|_| future::ok(()));
    spawn(fut);
    Running::Stop
  }
}

impl Handler<msg::Msg> for WsSession {
  type Result = ();
  fn handle(&mut self, msg: msg::Msg, ctx: &mut Self::Context) {
    ctx.text(to_string(&msg).expect("error sending message"));
  }
}

impl StreamHandler<ws::Message, ws::ProtocolError> for WsSession {
  fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
    match msg {
      ws::Message::Ping(msg) => ctx.pong(&msg),
      ws::Message::Pong(_) => {}
      ws::Message::Text(text) => {
        let mut m = from_str::<Msg>(text.trim());
        match m {
          Ok(Msg::Ping) => ctx.text(to_string::<Msg>(&Msg::Pong).expect("error sending pong")),
          Ok(Msg::Pong) => {}
          Ok(Msg::JoinReq(mut inner)) => {
            inner.from = Some(self.id);
            self.send_to_server(ctx, Msg::JoinReq(inner));
          }
          Ok(Msg::JoinRes(mut inner)) => {
            inner.from = Some(self.id);
            self.send_to_server(ctx, Msg::JoinRes(inner));
          }
          Ok(Msg::JoinAck(mut inner)) => {
            inner.from = Some(self.id);
            self.send_to_server(ctx, Msg::JoinAck(inner));
          }
          Ok(_) => {
            println!("Unimplemented message received");
          }
          Err(e) => {
            println!("{:?}", e);
            ctx.text(
              to_string::<Msg>(&Msg::Error("invalid request".to_owned(), None))
                .expect("fatal sending error"),
            )
          }
        }
      }
      ws::Message::Binary(_) => println!("Unexpected binary"),
      ws::Message::Close(_) => {
        ctx.stop();
      }
    }
  }
}
