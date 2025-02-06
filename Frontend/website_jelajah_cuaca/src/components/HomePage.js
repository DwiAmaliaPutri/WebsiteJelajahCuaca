import React, { useEffect, useState } from 'react';
import {getDestinations,getDestinationWeather,addTrip,getTrip,updateTrip,deleteTrip} from '../api'; // Ensure these API functions are correctly set up
import './styles/HomePage.css';
import { jwtDecode } from 'jwt-decode'; // Ensure you import jwtDecode properly

const HomePage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState({});
  const [selectedDestination, setSelectedDestination] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [trip, setTrip] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const destinationsList = await getDestinations();
        setDestinations(destinationsList);

        const weatherPromises = destinationsList.map(async (destination) => {
          const weather = await getDestinationWeather(destination.ID_DESTINATION);
          return {
            id: destination.ID_DESTINATION,
            weather,
          };
        });

        const weatherResults = await Promise.all(weatherPromises);
        const weatherMap = weatherResults.reduce((acc, { id, weather }) => {
          acc[id] = weather;
          return acc;
        }, {});

        setWeatherData(weatherMap);
      } catch (error) {
        console.error('Error loading destinations and weather:', error);
        setMessage('Error loading destinations and weather.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTrip = async () => {
      try {
        const tripList = await getTrip();
        setTrip(tripList);
      } catch (error) {
        console.error('Error loading trips:', error);
        setMessage('Error loading trips.');
      }
    };

    fetchDestinations();
    fetchTrip();
  }, []);

  const handleTripSubmit = async (event) => {
    event.preventDefault();

    if (!tripDate || !selectedDestination || !endDate) {
      setMessage('Please fill in all fields!');
      return;
    }

    if (new Date(endDate) < new Date(tripDate)) {
      setMessage('End date cannot be earlier than start date!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Token not found. Please log in.');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const id_user = decodedToken.id_user;

      const tripData = {
        id_user,
        id_destination: selectedDestination,
        start_date: tripDate,
        end_date: endDate,
      };

      if (editingTrip && editingTrip.id_trip) {
        tripData.id_trip = editingTrip.id_trip;
      }

      setLoading(true);

      let response;
      if (editingTrip && editingTrip.id_trip) {
        response = await updateTrip(tripData);
        setMessage(response.message || 'Trip updated successfully!');
      } else {
        response = await addTrip(tripData);
        setMessage(response.message || 'Trip added successfully!');
      }

      const tripList = await getTrip();
      setTrip(tripList);

      setSelectedDestination('');
      setTripDate('');
      setEndDate('');
      setEditingTrip(null);
    } catch (error) {
      console.error('Error adding/updating trip:', error);
      setMessage(error.response?.data?.message || 'Error adding/updating trip.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (id_trip) => {
    try {
      setLoading(true); // Tampilkan loading saat proses berjalan
      const response = await deleteTrip(id_trip); // Memanggil API untuk menghapus trip
      setMessage(response.message || 'Trip deleted successfully!'); // Tampilkan pesan sukses
  
      // Perbarui daftar trip setelah penghapusan berhasil
      const updatedTripList = await getTrip();
      setTrip(updatedTripList);
    } catch (error) {
      // Tangani error dan tampilkan pesan error
      console.error('Error deleting trip:', error);
      setMessage(error.response?.data?.message || 'Error deleting trip.');
    } finally {
      setLoading(false); // Sembunyikan loading setelah proses selesai
    }
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setSelectedDestination(trip.id_destination);
    setTripDate(trip.start_date);
    setEndDate(trip.end_date);
  };

  const handleCancelEdit = () => {
    setEditingTrip(null);
    setSelectedDestination('');
    setTripDate('');
    setEndDate('');
  };

  return (
    <div className="homepage-container">
      <h2 className="homepage-header">Destination List and Weather</h2>
      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : destinations.length === 0 ? (
        <p className="no-destination-message">No destinations available.</p>
      ) : (
        <div className="destination-section">
          <table className="destination-table">
            <thead>
              <tr>
                <th>Destination Name</th>
                <th>City</th>
                <th>Rating</th>
                <th>Weather</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((destination) => (
                <tr key={destination.ID_DESTINATION}>
                  <td>{destination.DESTINATION_NAME}</td>
                  <td>{destination.CITY}</td>
                  <td>{destination.RATING}</td>
                  <td>
                    {weatherData[destination.ID_DESTINATION] ? (
                      <div className="weather-info">
                        <p>Temperature: {weatherData[destination.ID_DESTINATION].temperature}°C</p>
                        <p>Weather: {weatherData[destination.ID_DESTINATION].weather}</p>
                        <p>Humidity: {weatherData[destination.ID_DESTINATION].humidity}</p>
                        <p>Wind Speed: {weatherData[destination.ID_DESTINATION].wind_speed}</p>
                      </div>
                    ) : (
                      <p>Loading weather...</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="add-trip-container">
        <div className="add-trip-section">
          <h2>{editingTrip ? 'Edit Trip' : 'Add Trip'}</h2>
          <form className="add-trip-form" onSubmit={handleTripSubmit}>
            <div className="form-group">
              <label htmlFor="destination">Select Destination:</label>
              <select
                id="destination"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                required
              >
                <option value="">Select a destination</option>
                {destinations.map((destination) => (
                  <option key={destination.ID_DESTINATION} value={destination.ID_DESTINATION}>
                    {destination.DESTINATION_NAME}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tripDate">Trip Date:</label>
              <input
                type="date"
                id="tripDate"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <button type="submit">{editingTrip ? 'Update Trip' : 'Add Trip'}</button>
            {editingTrip && <button type="button" onClick={handleCancelEdit}>Cancel Edit</button>}
          </form>
          {message && <p className="message">{message}</p>}
        </div>

        <div className="trip-list">
          <h2>Trip List</h2>
          <table className="trip-table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>Trip Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trip.map((trip) => (
                <tr key={trip.id_trip}>
                  <td>{trip.destination_name}</td>
                  <td>{trip.start_date}</td>
                  <td>{trip.end_date}</td>
                  <td>
                    <button onClick={() => handleEditTrip(trip)}>Edit</button>
                    <button onClick={() => handleDeleteTrip(trip.id_trip)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
