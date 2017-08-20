import * as http from 'http';
import * as path from 'path';
import * as Koa from 'koa';
import * as socket from 'socket.io'
import * as nunjucks from 'koa-nunjucks-2';

import router from './router';
import SocketManager from './socket/Manager';

const app = new Koa();
const server = http.createServer(app.callback());
const io = socket(server);

const manager = new SocketManager(io);

app.use(nunjucks({
    ext: 'njk',
    path: path.resolve(__dirname, './view')
}));
if (process.env.NODE_ENV === 'development') {
    const serve = require('koa-static');
    const mount = require('koa-mount');
    app.use(mount('/static', serve(path.resolve(__dirname, '../static'))));
}
app.use(router.routes())
app.use(router.allowedMethods());

server.listen(3000);
