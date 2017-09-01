import * as Router from 'koa-router';

import index from './controller/index';
import auth from './controller/auth';

const { PREFIX } = eval('require')('../config');

const router = new Router();

router.use('/', index.routes(), index.allowedMethods());
router.use('/auth', auth.routes(), auth.allowedMethods());

export default router;

