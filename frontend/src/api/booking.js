import API from './axios';

/**
 * Creates a new booking
 * @param {Object} bookingData - { flightId, seatNumber, userId, fareClass }
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await API.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error.response?.data || error.message;
  }
};
