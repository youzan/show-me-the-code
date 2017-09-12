import * as http from 'http';
import * as path from 'path';
import * as Koa from 'koa';
import * as socket from 'socket.io'
import * as nunjucks from 'koa-nunjucks-2';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import * as Router from 'koa-router';

import passport from './passport';

import router from './router';
import SocketManager from './socket/Manager';

const config = require('../config/config');
const resource = require('../config/resource');

try {
    const app = new Koa();
    const server = http.createServer(app.callback());
    const io = socket(server);

    const manager = new SocketManager(io);
    app.use(async (ctx, next) => {
        Object.assign(ctx.state, {
            url: config.URL,
            resource
        });
        await next();
    });
    app.use(bodyParser());
    app.keys = ['secret'];
    app.use(session({}, app));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(nunjucks({
        ext: 'njk',
        path: path.resolve(__dirname, './view'),
        nunjucksConfig: {
            trimBlocks: true,
            lstripBlocks: true,
            watch: process.env.NODE_ENV === 'development'
        }
    }));
    if (process.env.NODE_ENV === 'development') {
        const serve = require('koa-static');
        const mount = require('koa-mount');
        app.use(mount('/static', serve(path.resolve(__dirname, '../static'))));
    }
    app.use(router.routes())
    app.use(router.allowedMethods());
    
    server.listen(5000);
    console.log('app listen on port 5000');
    
} catch (error) {
    console.error(error);
}
