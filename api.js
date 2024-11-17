import axios from 'axios';

// URL dasar API
const API_URL = 'http://127.0.0.1:5001/api';

// Fungsi untuk mendapatkan semua pengguna
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/user`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

// Fungsi untuk menambahkan pengguna baru
export const addUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/user`, userData);
    console.log('API Response:', response); // Cek respons API

    // Pastikan respons mengandung `success` dan `message`
    if (response.data.success) {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message || 'Registration failed' };
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    return { success: false, message: 'Failed to register user' };
  }
};

// Fungsi untuk memperbarui pengguna
export const updateUser = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/user`, userData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};

// Fungsi untuk login
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Failed to login:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan semua destinasi
export const getDestinations = async () => {
  try {
    const response = await axios.get(`${API_URL}/destination`);
    console.log('API Response:', response.data); // Debug: Periksa respons dari API
    return response.data;
  } catch (error) {
    console.error('Failed to fetch destinations:', error);
    throw error;
  }
};

// Fungsi untuk menambahkan destinasi baru
export const addDestination = async (destinationData) => {
  try {
    const response = await axios.post(`${API_URL}/destination`, destinationData);
    return response.data;
  } catch (error) {
    console.error('Failed to add destination:', error);
    throw error;
  }
};

// Fungsi untuk memperbarui destinasi
export const updateDestination = async (destinationData) => {
  try {
    const response = await axios.put(`${API_URL}/destination`, destinationData);
    return response.data;
  } catch (error) {
    console.error('Failed to update destination:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan cuaca destinasi berdasarkan ID
export const getDestinationWeather = async (id_destination) => {
  try {
    const response = await axios.get(`${API_URL}/destination/weather?id_destination=${id_destination}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan semua destinasi
export const getTrip = async () => {
  try {
    // Pastikan token sudah tersedia
    const token = localStorage.getItem('token'); // Atau ambil token dari tempat lain jika disimpan di state atau cookie

    if (!token) {
      throw new Error('Token is missing');
    }

    const response = await axios.get(`${API_URL}/trip`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Menyertakan token dalam header Authorization
      },
    });

    console.log('API Response:', response.data); // Debug: Periksa respons dari API
    return response.data;
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    throw error; // Lempar error jika terjadi kesalahan
  }
};


// Fungsi untuk menambahkan trip baru
export const addTrip = async (tripData) => {
  const token = localStorage.getItem('token'); // Get token from localStorage

  if (!token) {
    console.error('Token tidak ditemukan');
    throw new Error('Token tidak ditemukan');
  }

  try {
    const response = await axios.post(`${API_URL}/trip`, tripData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include token in Authorization header
      },
    });

    return response.data; // Return the data received from the API
  } catch (error) {
    // Improved error logging
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error during API request:', error.message);
    }

    throw error; // Rethrow error if needed
  }
};

// Fungsi untuk memperbarui trip
export const updateTrip = async (tripData) => {
  const token = localStorage.getItem('token'); // Get token from localStorage

  if (!token) {
    console.error('Token tidak ditemukan');
    throw new Error('Token tidak ditemukan');
  }

  try {
    const response = await axios.put(`${API_URL}/trip`, tripData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include token in Authorization header
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error during API request:', error.message);
    }

    throw error;
  }
};

export const deleteTrip = async (id_trip) => {
  try {
    const token = localStorage.getItem('token'); // Ambil token dari local storage
    const response = await axios.delete(`${API_URL}/trip`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Mengirimkan token untuk otentikasi
      },
      data: { id_trip },  // Mengirimkan id_trip untuk mengidentifikasi trip yang akan dihapus
    });
    return response.data; // Mengembalikan data respons
  } catch (error) {
    throw error;  // Tangani error di tempat yang memanggil fungsi ini
  }
};

