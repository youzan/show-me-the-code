use serde::ser::*;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use uuid::Uuid;

/**
 * when receiving from client, from is always null, request_id can be null
 * when sending to client, from never be null, request_id can be null
 */
pub struct SendMsg<T>
where
  T: Serialize,
{
  pub to: Uuid,
  pub content: T,
  pub from: Option<Uuid>,
  pub request_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JoinRes {
  pub ok: bool,
  pub code_id: Uuid,
  pub code_name: String,
  pub code_content: String,
  pub language: String,
}

pub enum Msg {
  Ping,
  Pong,
  JoinReq(SendMsg<String>),
  JoinRes(SendMsg<JoinRes>),
  JoinAck(SendMsg<bool>),
  Tunnel(SendMsg<String>),
  Offline(Uuid),
  Connected(Uuid),
  Error(String, Option<String>),
}

impl Msg {
  fn serialize_send<S, T>(t: u32, inner: &SendMsg<T>, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
    T: Serialize,
  {
    let request_id = &inner.request_id;
    let mut seq = if let Some(_) = request_id {
      serializer.serialize_seq(Some(5))?
    } else {
      serializer.serialize_seq(Some(4))?
    };
    seq.serialize_element(&t)?;
    seq.serialize_element(&inner.to)?;
    seq.serialize_element(&inner.content)?;
    if let Some(req_id) = request_id {
      seq.serialize_element(&req_id)?;
    }
    seq.end()
  }
}

impl Serialize for Msg {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    match self {
      Msg::Ping => {
        let mut seq = serializer.serialize_seq(Some(1))?;
        seq.serialize_element(&0)?;
        seq.end()
      }
      Msg::Pong => {
        let mut seq = serializer.serialize_seq(Some(1))?;
        seq.serialize_element(&1)?;
        seq.end()
      }
      Msg::JoinReq(inner) => Msg::serialize_send(2, inner, serializer),
      Msg::JoinRes(inner) => Msg::serialize_send(3, inner, serializer),
      Msg::JoinAck(inner) => Msg::serialize_send(4, inner, serializer),
      Msg::Tunnel(inner) => Msg::serialize_send(5, inner, serializer),
      Msg::Offline(id) => {
        let mut seq = serializer.serialize_seq(Some(2))?;
        seq.serialize_element(&6)?;
        seq.serialize_element(&id)?;
        seq.end()
      }
      Msg::Connected(id) => {
        let mut seq = serializer.serialize_seq(Some(2))?;
        seq.serialize_element(&7)?;
        seq.serialize_element(&id)?;
        seq.end()
      }
      Msg::Error(reason, None) => {
        let mut seq = serializer.serialize_seq(Some(2))?;
        seq.serialize_element(&999)?;
        seq.serialize_element(reason)?;
        seq.end()
      }
      Msg::Error(reason, req) => {
        let mut seq = serializer.serialize_seq(Some(3))?;
        seq.serialize_element(&999)?;
        seq.serialize_element(reason)?;
        seq.serialize_element(req)?;
        seq.end()
      }
    }
  }
}

impl<'de> Deserialize<'de> for Msg {
  fn deserialize<D>(deserializer: D) -> Result<Msg, D::Error>
  where
    D: Deserializer<'de>,
  {
    use serde::de;
    use serde::de::{SeqAccess, Unexpected, Visitor};
    use std::fmt;

    struct SeqVisitor;

    impl<'de> SeqVisitor {
      fn deserialize_send<T, A>(mut seq: A) -> Result<SendMsg<T>, A::Error>
      where
        A: SeqAccess<'de>,
        T: Serialize + Deserialize<'de>,
      {
        let to = if let Some(to) = seq.next_element()? {
          to
        } else {
          return Err(de::Error::invalid_value(Unexpected::Option, &"client id"));
        };
        let content = if let Some(c) = seq.next_element()? {
          c
        } else {
          return Err(de::Error::invalid_value(Unexpected::Option, &"content"));
        };
        let request_id = seq.next_element()?;
        Ok(SendMsg {
          to,
          content,
          from: None,
          request_id,
        })
      }
    }

    impl<'de> Visitor<'de> for SeqVisitor {
      type Value = Msg;

      fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("valid tuple message")
      }

      fn visit_seq<A>(self, mut seq: A) -> Result<Self::Value, A::Error>
      where
        A: SeqAccess<'de>,
      {
        match seq.next_element()? {
          Some(0) => Ok(Msg::Ping),
          Some(1) => Ok(Msg::Pong),
          Some(2) => Ok(Msg::JoinReq(Self::deserialize_send(seq)?)),
          Some(3) => Ok(Msg::JoinRes(Self::deserialize_send(seq)?)),
          Some(4) => Ok(Msg::JoinAck(Self::deserialize_send(seq)?)),
          Some(5) => Ok(Msg::Tunnel(Self::deserialize_send(seq)?)),
          Some(6) => {
            if let Some(id) = seq.next_element()? {
              Ok(Msg::Offline(id))
            } else {
              Err(de::Error::invalid_value(Unexpected::Option, &"client id"))
            }
          }
          Some(7) => {
            if let Some(id) = seq.next_element()? {
              Ok(Msg::Connected(id))
            } else {
              Err(de::Error::invalid_value(Unexpected::Option, &"client id"))
            }
          }
          Some(t) => Err(de::Error::invalid_value(
            Unexpected::Signed(t),
            &"0 ~ 7 or 999",
          )),
          None => Err(de::Error::invalid_value(
            Unexpected::Option,
            &"0 ~ 7 or 999",
          )),
        }
      }
    }

    let visitor = SeqVisitor;
    deserializer.deserialize_seq(visitor)
  }
}
