/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('room', {
		id: {
			type: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		key: {
			type: DataTypes.CHAR,
			allowNull: false
		},
		code: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		lang: {
			type: DataTypes.CHAR,
			allowNull: false
		},
		last_time: {
			type: DataTypes.DATE,
			allowNull: false
		}
	}, {
		tableName: 'room',
		timestamps: false
	});
};
