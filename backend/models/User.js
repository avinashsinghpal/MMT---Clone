const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING, // Clerk User ID
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'corporate'),
    defaultValue: 'user',
  },
}, {
  timestamps: true,
});

module.exports = User;
