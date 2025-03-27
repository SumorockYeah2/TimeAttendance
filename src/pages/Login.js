import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('โปรดกรอกชื่อผู้ใช้และรหัสผ่านให้ครบทั้งสองช่อง');
      return;
    }

    try {
      console.log('Sending login request with:', { email, password });
      const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);
      if (response.ok) {
          const result = await response.json();
          console.log('Login response:', result);
          if (result.success) {
              const { token, user } = result;
              const idemployees = user.idemployees;

              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('idemployees', idemployees);
              console.log('User stored in localStorage:', user);
              console.log('idemployees:', idemployees);
              window.dispatchEvent(new Event('storage'));
              navigate('/checkin');
          } else {
              alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
          }
      } else {
          const errorText = await response.text();
          console.error('Error:', errorText);
          alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }

  return (
    <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
      <h5>เข้าสู่ระบบ</h5>
      <div>
        <input
          type="text"
          className="form-control"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="password"
          className="form-control"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div style={{ paddingTop: '10px' }}>
        <button className="btn btn-success" onClick={handleLogin}>เข้าระบบ</button>
      </div>
    </div>
  );
};

export default Login;