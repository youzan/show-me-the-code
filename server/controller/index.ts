import { Context } from 'koa';
import { generate } from 'randomstring';

import * as models from '../models';

export async function getIndexHTML(ctx: Context) {
    await (<any>ctx).render('index');
}

export async function postCreateRoomJSON(ctx: Context) {
    const key = generate(4);
    const room = await models.Room.create({
        key
    });
    ctx.body = JSON.stringify(room.dataValues);
    ctx.type = 'application/json';
}

export async function getRoomHTML(ctx: Context) {
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
        ctx.redirect('/');
    }
}
