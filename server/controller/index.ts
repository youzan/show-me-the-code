import { Context } from 'koa';
import * as models from '../models';

export async function getIndexHTML(ctx: Context) {
    await (<any>ctx).render('index');
}

export async function postCreateRoomJSON(ctx: Context) {
    
}

export async function getRoomHTML(ctx: Context) {
    const { id } = (<any>ctx);
    const room = await models.Room.findOne({
        where: {
            id
        }
    });
    if (room) {
        await (<any>ctx).render('room', {
            id: (<any>ctx).id
        });
    } else {
        ctx.redirect('/');
    }
}
