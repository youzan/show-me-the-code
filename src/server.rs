use std::collections::{HashMap, HashSet};

use actix::prelude::*;
use uuid::Uuid;

use super::socket;

pub struct Message(
    // from
    pub Uuid,
    // to
    pub Option<Uuid>,
    // message
    pub socket::Message,
);

impl actix::Message for Message {
    type Result = ();
}

pub struct Connect(pub Uuid, pub Recipient<Syn, Message>);

impl actix::Message for Connect {
    type Result = ();
}

pub struct Disconnect(
    // client id
    pub Uuid,
    // host id
    pub Option<Uuid>,
);

impl actix::Message for Disconnect {
    type Result = ();
}

type Sessions = HashMap<Uuid, Recipient<Syn, Message>>;

pub struct SignalServer {
    sessions: Sessions,
    groups: HashMap<Uuid, HashSet<Uuid>>,
}

impl Default for SignalServer {
    fn default() -> SignalServer {
        SignalServer {
            sessions: HashMap::new(),
            groups: HashMap::new(),
        }
    }
}

impl Actor for SignalServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for SignalServer {
    type Result = MessageResult<Connect>;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        self.sessions.insert(msg.0, msg.1);
        MessageResult(())
    }
}

impl Handler<Disconnect> for SignalServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) -> Self::Result {
        if let Some(host_id) = msg.1 {
            let groups = &mut self.groups;
            if let Some(set) = groups.get_mut(&host_id) {
                set.remove(&msg.0);
                for val in set.iter() {
                    if let Some(addr) = self.sessions.get(&val) {
                        let _ = addr.do_send(Message(
                            msg.0,
                            None,
                            socket::Message::Offline { client_id: msg.0 },
                        ));
                    }
                }
            }
        }
        self.sessions.remove(&msg.0);
    }
}

impl Handler<Message> for SignalServer {
    type Result = ();

    fn handle(&mut self, msg: Message, _: &mut Context<Self>) -> Self::Result {
        if let Some(id) = msg.1 {
            if let Some(addr) = self.sessions.get(&id) {
                let _ = addr.do_send(msg);
            }
        }
    }
}
