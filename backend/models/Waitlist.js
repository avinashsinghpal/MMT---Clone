const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Waitlist = sequelize.define('Waitlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  flightId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Flights',
      key: 'id',
    },
  },
  priorityScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Higher score = higher priority
  },
  status: {
    type: DataTypes.ENUM('active', 'promoted', 'cancelled'),
    defaultValue: 'active',
  },
}, {
  timestamps: true, // createdAt will handle FIFO
});

module.exports = Waitlist;
