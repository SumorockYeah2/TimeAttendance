import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) {
      alert('Please fill in both username and password.');
      return;
    }
    if (username === 'John Doe' && password === 'password123') {
      localStorage.setItem('isLoggedIn', 'true');
      window.dispatchEvent(new Event('storage'));
      navigate('/home2');
    } else {
      alert('Invalid username or password');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }

  return (
    <div　style={{ paddingTop: '10px', paddingLeft: '10px' }}>
      <h5>Login</h5>
      <div>
        <input
          type="text"
          className="form-control"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div style={{ paddingTop: '10px' }}>
        <button className="btn btn-success" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;