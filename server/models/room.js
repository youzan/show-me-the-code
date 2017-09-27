/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('room', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'coding_id'
    },
    key: {
      type: DataTypes.STRING(4),
      allowNull: false,
      field: 'coding_key'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      field: 'coding_content'
    },
    language: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'javascript',
      field: 'coding_language'
    },
    creatorKey: {
      type: DataTypes.STRING(36),
      allowNull: false,
      field: 'creator_key'
    }
  }, {
    tableName: 'coding_room'
  });
};
