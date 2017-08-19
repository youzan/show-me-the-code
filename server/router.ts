import * as Router from 'koa-router';

import { getIndexHTML } from './controller/index';

const router = new Router();

router.get('/', getIndexHTML);
router.get('/room/:id', () => {});

export default router;

