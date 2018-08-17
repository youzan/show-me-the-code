extern crate actix;
extern crate actix_web;
extern crate dotenv;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate uuid;

use std::env;
use std::path::PathBuf;

use actix::*;
use actix_web::*;

mod server;
mod socket;

pub struct State {
    pub signal_server_addr: Addr<Syn, server::SignalServer>,
}

fn index(_: HttpRequest<State>) -> Result<fs::NamedFile> {
    let path = PathBuf::from("./static/index.html");
    Ok(fs::NamedFile::open(path)?)
}

fn ws_route(req: HttpRequest<State>) -> Result<HttpResponse, Error> {
    ws::start(
        req,
        socket::WsSession::default(),
    )
}


fn main() {
    dotenv::dotenv().ok();

    let sys = actix::System::new("show-me-the-code");

    let server: Addr<Syn, _> = Arbiter::start(|_| server::SignalServer::default());
    let address = env::var("ADDRESS").unwrap();
    actix_web::server::HttpServer::new(move || {
        let state = State {
            signal_server_addr: server.clone(),
        };

        App::with_state(state)
            .handler(
                "/static",
                fs::StaticFiles::new("./static").show_files_listing(),
            )
            .resource("/ws", |r| r.route().f(ws_route))
            .default_resource(|r| r.get().f(index))
    }).bind(address.clone())
        .unwrap()
        .start();

    println!("Started http server: {}", address);
    let _ = sys.run();
}
