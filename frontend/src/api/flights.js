import API from './axios';

/**
 * Searches for flights based on criteria
 * @param {string} from - Origin IATA code
 * @param {string} to - Destination IATA code
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const searchFlights = async (from, to, date) => {
  try {
    const response = await API.get('/flights/search', {
      params: { from, to, date }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error.response?.data || error.message;
  }
};
