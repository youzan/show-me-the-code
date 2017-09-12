import { Context } from 'koa';
import { generate } from 'randomstring';
import * as Router from 'koa-router';

import * as models from '../models';
import auth from './auth';

const { APPLICATION, URL } = require('../config/config');

const router = new Router();

async function checkLogin(ctx: Context, next) {
    if (ctx.isUnauthenticated()) {
        await ctx.redirect(`${URL.base}/auth`);
    } else {
        await next();
    }
}

router.get('/room/:id', async (ctx: Context) => {
    const { id } = ctx.params;

    if (ctx.isUnauthenticated()) {
        ctx.redirect(`${URL.base}/auth?room=${id}`);
    }

    const room = await models.Room.findOne({
        where: {
            id
        }
    });
    if (room) {
        await (<any>ctx).render('room', {
            id,
            userName: ctx.state.user.name
        });
    } else {
        ctx.body = 'room does not exist'
    }
});


router.get('/', checkLogin, async (ctx: Context) => {
    await (ctx as any).render('index');
});

router.get('/monaco_proxy.js', async (ctx: Context) => {
    ctx.type = 'text/javascript';
    ctx.body = `
        self.MonacoEnvironment = {
            baseUrl: '${URL.monaco}/'
        };
        importScripts('${URL.monaco}/vs/base/worker/workerMain.js');
    `;
});

router.post('/create', checkLogin, async (ctx: Context) => {
    const key = generate(4);
    const room = await models.Room.create({
        key
    });
    ctx.body = JSON.stringify(room.dataValues);
    ctx.type = 'application/json';
});

router.use('/auth', auth.routes(), auth.allowedMethods());

export default router;
