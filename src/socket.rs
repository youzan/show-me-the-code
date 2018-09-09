use actix::*;
use actix_web::*;
use serde_json::{from_str, to_string};
use uuid::*;

use super::server;
use super::State;

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Message {
  Ping,
  Pong,
  #[serde(rename_all = "camelCase")]
  Join {
    to: Uuid,
    name: String,
    from: Option<Uuid>,
    request_id: Uuid,
  },
  #[serde(rename_all = "camelCase")]
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
  JoinAck {
    from: Option<Uuid>,
    to: Uuid,
    request_id: Uuid,
    ok: bool,
  },
  #[serde(rename_all = "camelCase")]
  Offline {
    client_id: Uuid,
  },
  Connected {
    id: Uuid,
  },
  #[serde(rename_all = "camelCase")]
  Error {
    request_id: Option<Uuid>,
    reason: String,
  },
}

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

impl Actor for WsSession {
  type Context = ws::WebsocketContext<Self, State>;

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
            ctx.text(to_string(&Message::Connected { id: act.id }).expect("Error sending message"));
          }
          Err(_) => ctx.stop(),
        }
        fut::ok(())
      }).wait(ctx);
  }

  fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
    ctx
      .state()
      .signal_server_addr
      .do_send(server::Disconnect(self.id, self.host_id));
    Running::Stop
  }
}

impl Handler<server::Message> for WsSession {
  type Result = ();
  fn handle(&mut self, server::Message(_, _, msg): server::Message, ctx: &mut Self::Context) {
    ctx.text(to_string(&msg).expect("error sending message"));
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
          Ok(Message::Join {
            from: _,
            to,
            name,
            request_id,
          }) => {
            ctx
              .state()
              .signal_server_addr
              .send(server::Message(
                self.id,
                Some(to),
                Message::Join {
                  from: Some(self.id),
                  to,
                  name,
                  request_id,
                },
              )).into_actor(self)
              .then(|res, _, ctx| {
                if let Err(_) = res {
                  ctx.stop();
                }
                fut::ok(())
              }).wait(ctx);
          }
          Ok(Message::JoinResponse {
            to,
            from: _,
            request_id,
            ok,
            code_id,
            code_name,
            code_content,
            language,
          }) => {
            ctx
              .state()
              .signal_server_addr
              .send(server::Message(
                self.id,
                Some(to),
                Message::JoinResponse {
                  from: Some(self.id),
                  to,
                  request_id,
                  ok,
                  code_id,
                  code_name,
                  code_content,
                  language,
                },
              )).into_actor(self)
              .then(|res, _, ctx| {
                if let Err(_) = res {
                  ctx.stop();
                }
                fut::ok(())
              }).wait(ctx);
          }
          Ok(Message::JoinAck {
            from: _,
            to,
            request_id,
            ok,
          }) => {
            ctx
              .state()
              .signal_server_addr
              .send(server::Message(
                self.id,
                Some(to),
                Message::JoinAck {
                  from: Some(self.id),
                  to,
                  request_id,
                  ok,
                },
              )).into_actor(self)
              .then(|res, _, ctx| {
                if let Err(_) = res {
                  ctx.stop();
                }
                fut::ok(())
              }).wait(ctx);
          }
          Ok(_) => {
            println!("Unimplemented message received");
          }
          Err(e) => {
            println!("{:?}", e);
            ctx.text(
              to_string::<Message>(&Message::Error {
                reason: "invalid request".to_owned(),
                request_id: None,
              }).expect("fatal sending error"),
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
