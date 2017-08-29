import { Context } from 'koa';
import * as Router from 'koa-router';

import passport from '../passport';

const router = new Router();

router.get('/', async (ctx: Context) => {

});

router.get('/github', passport.authenticate('github'));

router.get('/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/auth'
}));

export default router;
