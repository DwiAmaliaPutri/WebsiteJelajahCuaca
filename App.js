import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import './App.css'; // Pastikan file CSS yang sudah diperbarui

function App() {
  return (
    <Router>
      {/* Header tetap yang akan muncul di semua halaman */}
      <header className="app-header">
        <h1 className="app-title">☀☁ JELAJAH CUACA ☀☁</h1>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* PrivateRoute untuk halaman home */}
        <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
      </Routes>
    </Router>
  );
}

export default App;
