import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import '../Styles/Login.css';

function Login({ onClose, onSwitchRegister }) {
  const { setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);

      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userData', JSON.stringify(res.data.user));

        setUser(res.data.user);

        const nameToShow = res.data.user.Username || "Thành viên";
        alert(`Chào mừng ${nameToShow} quay trở lại!`);
        
        onClose();
      }
    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data?.message || "Đăng nhập thất bại!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-overlay">
      <div className="login-container">
        <button onClick={onClose} className="close-button">
          ✕
        </button>

        <h2 className="login-title">
          LOGIN <span className="title-dawn">DAWN</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="input-group">
            <label className="input-label">Identity / Email</label>
            <input
              name="email"
              type="email"
              placeholder="Your email..."
              className="input-field"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Security / Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="input-field"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'submit-button-loading' : 'submit-button-active'}`}
          >
            {loading ? "AUTHENTICATING..." : "GET STARTED"}
          </button>
        </form>

        <p className="switch-auth-text">
          New here? 
          <button onClick={onSwitchRegister} className="switch-link">
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;