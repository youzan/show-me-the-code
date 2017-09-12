import { Context } from 'koa';
import * as Router from 'koa-router';

import passport from '../passport';
const { URL } = require('../config/config');

const router = new Router();

router.get('/', async (ctx: Context) => {
  await (ctx as any).render('auth');
 });

router.get('/github', passport.authenticate('github'));

router.get('/github/callback', passport.authenticate('github', {
  successRedirect: `${URL.base}/`,
  failureRedirect: `${URL.base}/auth`
}));

export default router;
