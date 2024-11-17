import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/RegisterPage.css';
import { addUser } from '../api';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const userData = { username, email, password };
      const response = await addUser(userData);
      console.log("API response:", response);

      if (response.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          console.log('Redirecting to /login');
          navigate('/login'); // Redirect ke halaman login setelah registrasi
        }, 2000);
      } else {
        setErrorMessage(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Failed to register user:', error);
      setErrorMessage('Failed to register user');
    }
  };

  return (
    <div className="container">
      <div className="register-card">
        <h2>Register</h2>
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button onClick={handleRegister}>Register</button>
        <a href="/login" className="link">Already have an account? Login</a>
      </div>

      {showSuccessModal && (
        <div className="success-modal">
          <div className="modal-content">
            <h3>Successfully Registered!</h3>
            <p>You will be redirected to the loginpage shortly.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;
