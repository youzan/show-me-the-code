import { Context } from 'koa';

export async function getIndexHTML(ctx: Context) {
    await (<any>ctx).render('index');
}

export async function getRoomHTML(ctx: Context) {
    await (<any>ctx).render('room');
}
