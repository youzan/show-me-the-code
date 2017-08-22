import * as Router from 'koa-router';

import { getIndexHTML, getRoomHTML } from './controller/index';

const router = new Router();

router.get('/', getIndexHTML);
router.redirect('/room', '/');
router.get('/room/:id', getRoomHTML);

export default router;

