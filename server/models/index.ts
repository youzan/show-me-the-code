import Sequelize from 'sequelize';

import * as room from './room';

const config = require('../config/db_config');

const sequelize = new Sequelize(config);

const Room = room(sequelize, Sequelize);

if (process.env.RUN_MODE !== 'qa') {
  sequelize.sync();
}

export {
  Room
};
