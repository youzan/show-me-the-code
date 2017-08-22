/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('room', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    key: {
      type: DataTypes.CHAR,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    lang: {
      type: DataTypes.CHAR,
      allowNull: false,
      defaultValue: 'javascript'
    },
    last_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now()
    }
  }, {
    tableName: 'room'
  });
};
