extern crate actix;
extern crate actix_web;
extern crate dotenv;
extern crate env_logger;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate uuid;

use std::env;
// use std::path::PathBuf;

use actix::*;
use actix_web::*;

mod server;
mod socket;

pub struct State {
    pub signal_server_addr: Addr<server::SignalServer>,
}

// fn index(_: &HttpRequest<State>) -> Result<fs::NamedFile> {
//     let path = PathBuf::from("./static/index.html");
//     Ok(fs::NamedFile::open(path)?)
// }

fn ws_route(req: &HttpRequest<State>) -> Result<HttpResponse, Error> {
    ws::start(
        req,
        socket::WsSession::default(),
    )
}


fn main() {
    ::std::env::set_var("RUST_LOG", "actix_web=info");
    dotenv::dotenv().ok();
    env_logger::init();

    let sys = actix::System::new("show-me-the-code");

    let server = Arbiter::start(|_| server::SignalServer::default());
    let address = env::var("ADDRESS").unwrap();
    actix_web::server::HttpServer::new(move || {
        let state = State {
            signal_server_addr: server.clone(),
        };

        App::with_state(state)
            .resource("/ws", |r| r.route().f(ws_route))
            .handler(
                "/",
                fs::StaticFiles::new("./static").expect("serve static").index_file("index.html"),
            )
            // .default_resource(|r| r.get().f(index))
    }).bind(address.clone())
        .unwrap()
        .start();

    println!("Started http server: {}", address);
    let _ = sys.run();
}
