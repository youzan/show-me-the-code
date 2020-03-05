# Show Me The Code <a href="http://www.icode.live">www.icode.live</a>

> Talk is cheap. Show me the code. —— Linus Torvalds

## Features
* Real time multi user editing.
* View execution result immediately.
* Lightweight. Everything runs inside browser.

## Browser compatibility
Since this is for developers, latest web features are used and only latest versions of modern browsers are supported.

## Development
Server is based on [Phoenix](http://www.phoenixframework.org/). Development guides [here](https://hexdocs.pm/phoenix/overview.html).
UUID support is required for DBMS.

Client browser app is based on [Angular](https://angular.io/). Run `npm run proto:gen` first to generate protobuf files.
Remember to run this script every time `client/serializers/*.proto` is changed.

## Deployment
Use `npm run build` to build. Then deploy every thing in `dist` to a static file server such as Nginx or your CDN.

Refer [here](https://hexdocs.pm/phoenix/deployment.html) for server deployment.

**Remember to change origin check in `config/prod.exs`**

## License

Project licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License) license, feel free to enjoy and participate in Open Source.
