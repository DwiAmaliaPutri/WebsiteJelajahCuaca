import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import './styles/LoginPage.css';  // Mengimpor file CSS

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Panggil API login
    const data = await login({ username, password });

    if (data && data.success) {
      // Simpan data ke localStorage jika login berhasil
      localStorage.setItem('id_user', data.id_user);
      localStorage.setItem('token', data.token);

      // Redirect ke halaman /home setelah login berhasil
      navigate('/home');
    } else {
      setMessage(data.message || 'Login gagal: Username atau password salah.');
    }
  };

  return (
    <div className="container">
      <div className="login-card">
        <h2>Login Page</h2>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <a href="/register" className="link">Don't have an account? Register</a>
      </div>
    </div>
  );
}

export default LoginPage;
