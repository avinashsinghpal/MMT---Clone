const User = require('./User');
const Flight = require('./Flight');
const Booking = require('./Booking');
const Waitlist = require('./Waitlist');

// Associations
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Flight.hasMany(Booking, { foreignKey: 'flightId' });
Booking.belongsTo(Flight, { foreignKey: 'flightId' });

User.hasMany(Waitlist, { foreignKey: 'userId' });
Waitlist.belongsTo(User, { foreignKey: 'userId' });

Flight.hasMany(Waitlist, { foreignKey: 'flightId' });
Waitlist.belongsTo(Flight, { foreignKey: 'flightId' });

module.exports = {
  User,
  Flight,
  Booking,
  Waitlist,
};
