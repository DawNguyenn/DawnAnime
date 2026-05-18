import React, { useState } from 'react';
import axios from 'axios';
import { IoClose } from 'react-icons/io5';
import '../Styles/Register.css';

function Register({ onClose, onSwitchLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPass: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPass) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        alert(response.data.message || "Đăng ký thành công!");
        onSwitchLogin(); 
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const msg = error.response?.data?.message || "Không thể kết nối đến máy chủ!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-overlay">
      <div className="register-container">
        <button onClick={onClose} className="close-button">
          <IoClose />
        </button>

        <h2 className="register-title">
          JOIN <span className="title-dawn">DAWN</span>
        </h2>
        
        <form onSubmit={handleRegister}>
          <input 
            name="username"
            type="text" 
            placeholder="Username" 
            className="input-field"
            onChange={handleChange}
            value={formData.username}
            required
          />
          
          <input 
            name="email"
            type="email" 
            placeholder="Email Address" 
            className="input-field"
            onChange={handleChange}
            value={formData.email}
            required
          />

          <input 
            name="password"
            type="password" 
            placeholder="Password" 
            className="input-field"
            onChange={handleChange}
            value={formData.password}
            required
          />

          <input 
            name="confirmPass"
            type="password" 
            placeholder="Confirm Password" 
            className="input-field"
            onChange={handleChange}
            value={formData.confirmPass}
            required
          />

          <button 
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'submit-button-loading' : 'submit-button-active'}`}
          >
            {loading ? "CREATING ACCOUNT..." : "REGISTER NOW"}
          </button>
        </form>

        <p className="switch-auth-text">
          Already a member? 
          <span onClick={onSwitchLogin} className="switch-link">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;