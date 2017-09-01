import Sequelize from 'sequelize';

import * as room from './room';

const config = eval('require')('../config/db_config');

const sequelize = new Sequelize(config);

const Room = room(sequelize, Sequelize);

sequelize.sync();

export {
  Room
};
