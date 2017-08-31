/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('room', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    room_key: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    lang: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'javascript'
    },
    last_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'room'
  });
};
