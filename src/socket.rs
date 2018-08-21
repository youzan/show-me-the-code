use actix::*;
use actix_web::*;
use serde_json::{from_str, to_string};
use uuid::*;

use super::server;
use super::State;

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Message {
  Ping,
  Pong,
  Join {
    to: Uuid,
    name: String,
    from: Option<Uuid>,
    request_id: String,
  },
  JoinResponse {
    to: Uuid,
    from: Option<Uuid>,
    request_id: Uuid,
    ok: bool,
    code_id: Uuid,
    code_name: String,
    code_content: String,
    language: String,
  },
  Offline {
    client_id: Uuid,
  },
  Connected {
    id: Uuid,
  },
  Error {
    request_id: Option<String>,
    reason: String,
  },
}

#[derive(Serialize, Deserialize)]
pub struct SendMessage {
  from: Uuid,
  msg: Box<Message>,
}

pub struct WsSession {
  id: Option<Uuid>,
}

impl Default for WsSession {
  fn default() -> WsSession {
    WsSession { id: None }
  }
}

impl Actor for WsSession {
  type Context = ws::WebsocketContext<Self, State>;

  fn started(&mut self, ctx: &mut Self::Context) {
    let addr: Addr<Syn, _> = ctx.address();
    ctx
      .state()
      .signal_server_addr
      .send(server::Connect {
        addr: addr.recipient(),
      }).into_actor(self)
      .then(|res, act, ctx| {
        match res {
          Ok(res) => {
            ctx.text(to_string(&Message::Connected { id: res }).expect("error sending connected"));
            act.id = Some(res)
          }
          Err(_) => ctx.stop(),
        }
        fut::ok(())
      }).wait(ctx);
  }

  fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
    if let Some(id) = self.id {
      ctx
        .state()
        .signal_server_addr
        .do_send(server::Disconnect { id });
    }
    Running::Stop
  }
}

impl Handler<server::Message> for WsSession {
  type Result = ();
  fn handle(&mut self, server::Message(from, msg): server::Message, ctx: &mut Self::Context) {
    match msg {
      Message::Join {
        to,
        name,
        from: _,
        request_id,
      } => {
        ctx.text(
          to_string::<Message>(&Message::Join {
            from: Some(from),
            to,
            name,
            request_id,
          }).expect("error sending message"),
        );
      }
      _ => {}
    }
  }
}

impl StreamHandler<ws::Message, ws::ProtocolError> for WsSession {
  fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
    match msg {
      ws::Message::Ping(msg) => ctx.pong(&msg),
      ws::Message::Pong(_) => {}
      ws::Message::Text(text) => {
        let m = from_str::<Message>(text.trim());
        match m {
          Ok(Message::Ping) => {
            ctx.text(to_string::<Message>(&Message::Pong).expect("error sending pong"))
          }
          Ok(Message::Pong) => {}
          Ok(msg) => {
            if let Some(id) = self.id {
              ctx
                .state()
                .signal_server_addr
                .send(server::Message(id, msg))
                .into_actor(self)
                .then(|res, _, ctx| {
                  if let Err(_) = res {
                    ctx.stop();
                  }
                  fut::ok(())
                }).wait(ctx);
            }
          }
          Err(_) => ctx.text(
            to_string::<Message>(&Message::Error {
              reason: "invalid request".to_owned(),
              request_id: None,
            }).expect("fatal sending error"),
          ),
        }
      }
      ws::Message::Binary(_) => println!("Unexpected binary"),
      ws::Message::Close(_) => {
        ctx.stop();
      }
    }
  }
}
