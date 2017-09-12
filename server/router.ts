import { Context } from 'koa';
import * as Router from 'koa-router';

import index from './controller/index';
import auth from './controller/auth';

const { PREFIX } = require('../config/config');

const router = new Router();

router.use('/auth', auth.routes(), auth.allowedMethods());
router.use('/', index.routes(), index.allowedMethods());

export default router;

