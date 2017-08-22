import * as Router from 'koa-router';

import { getIndexHTML, getRoomHTML, postCreateRoomJSON } from './controller/index';

const router = new Router();

router.get('/', getIndexHTML);
router.post('/create', postCreateRoomJSON);
router.redirect('/room', '/');
router.get('/room/:id', getRoomHTML);

export default router;

