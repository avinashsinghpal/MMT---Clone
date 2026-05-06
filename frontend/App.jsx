import React, { useState } from 'react';
import './index.css';
import { searchFlights } from './api/flights';

function App() {
  const [search, setSearch] = useState({ from: 'DEL', to: 'BOM', date: '2026-05-15' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await searchFlights(search.from, search.to, search.date);
      setResults(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch flights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>MMT Private Jet Experience</h1>
      
      <div className="glass-card">
        <form onSubmit={handleSearch}>
          <div className="search-grid">
            <div className="input-group">
              <label>From</label>
              <input 
                type="text" 
                value={search.from} 
                onChange={(e) => setSearch({...search, from: e.target.value.toUpperCase()})}
                placeholder="e.g. DEL"
              />
            </div>
            <div className="input-group">
              <label>To</label>
              <input 
                type="text" 
                value={search.to} 
                onChange={(e) => setSearch({...search, to: e.target.value.toUpperCase()})}
                placeholder="e.g. BOM"
              />
            </div>
            <div className="input-group">
              <label>Date</label>
              <input 
                type="date" 
                value={search.date} 
                onChange={(e) => setSearch({...search, date: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Analyzing Routes...' : 'Search Luxury Flights'}
          </button>
        </form>

        {error && <div style={{ color: '#ff4f17', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}

        <div style={{ marginTop: '2.5rem' }}>
          {results.length > 0 && results.map((flight, i) => (
            <div key={i} className="flight-card">
              <div className="airline-info">
                <img src={flight.logo} alt={flight.airline} className="airline-logo" />
                <div>
                  <div style={{ fontWeight: 600 }}>{flight.airline}</div>
                  <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{flight.flightNumber}</div>
                </div>
              </div>
              
              <div className="time-info">
                <div className="time">{flight.departure}</div>
                <div className="iata">{flight.from}</div>
              </div>

              <div style={{ color: '#aaa' }}>——— {flight.duration} ———</div>

              <div className="time-info">
                <div className="time">{flight.arrival}</div>
                <div className="iata">{flight.to}</div>
              </div>

              <div className="price-tag">
                ₹{flight.price.toLocaleString()}
              </div>
              
              <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                Reserve
              </button>
            </div>
          ))}

          {!loading && results.length === 0 && !error && (
            <div style={{ textAlign: 'center', color: '#aaa', marginTop: '2rem' }}>
              Enter route and search for premium availability.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
