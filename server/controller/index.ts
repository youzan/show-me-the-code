import { Context } from 'koa';
import { generate } from 'randomstring';
import * as Router from 'koa-router';

import * as models from '../models';

const { APPLICATION } = eval('require')('../config');

const router = new Router();

router.get('/', async (ctx: Context) => {
    if (ctx.isUnauthenticated()) {
        await ctx.redirect('auth');
    }
    await (ctx as any).render('index');
});

router.post('/create', async (ctx: Context) => {
    if (ctx.isUnauthenticated()) {
        await ctx.redirect('auth');
    } else {
        const key = generate(4);
        const room = await models.Room.create({
            room_key: key
        });
        ctx.body = JSON.stringify(room.dataValues);
        ctx.type = 'application/json';
    }
});

router.get('/room/:id', async (ctx: Context) => {
    const { id } = ctx.params;
    const room = await models.Room.findOne({
        where: {
            id
        }
    });
    if (room) {
        await (<any>ctx).render('room', {
            id
        });
    } else {
        ctx.status = 404;
    }
});

export default router;
