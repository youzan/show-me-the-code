use std::collections::HashMap;

use actix::prelude::*;
use uuid::Uuid;

use super::socket;

#[derive(Message)]
pub struct Message(pub Uuid, pub socket::Message);

#[derive(Message)]
#[rtype(Uuid)]
pub struct Connect {
    pub addr: Recipient<Syn, Message>,
}

#[derive(Message)]
pub struct Disconnect {
    pub id: Uuid,
}

pub struct SignalServer {
    sessions: HashMap<Uuid, Recipient<Syn, Message>>,
}

impl Default for SignalServer {
    fn default() -> SignalServer {
        SignalServer {
            sessions: HashMap::new(),
        }
    }
}

impl Actor for SignalServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for SignalServer {
    type Result = MessageResult<Connect>;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        let id = Uuid::new_v4();
        self.sessions.insert(id, msg.addr);
        MessageResult(id)
    }
}

impl Handler<Disconnect> for SignalServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) -> Self::Result {
        self.sessions.remove(&msg.id);
    }
}

impl Handler<Message> for SignalServer {
    type Result = ();

    fn handle(&mut self, msg: Message, _: &mut Context<Self>) -> Self::Result {
        match msg.1 {
            socket::Message::Join { to, name: _, from: _, request_id: _ } => {
                if let Some(addr) = self.sessions.get(&to) {
                    let _ = addr.do_send(msg);
                }
            }
            _ => {}
        }
        // match s {
        //     socket::Message::Join { to, from, name } => {
        //         s.from = Some(msg.0);

        //     }
        // }
    }
}
