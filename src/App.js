import './App.css';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';

import Dashboard from './pages/Dashboard';
// import Location from './pages/Location';
import Checkin from './pages/Checkin';
import Checkout from './pages/Checkout';
import Home2 from './pages/Home2';
import Leave from './pages/Leave';
import Offsite from './pages/Offsite';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Approve from './pages/Approve';
import Assign from './pages/Assign';
import EmpData from './pages/EmpData';
import ManageReport from './pages/ManageReport';
import LeaveDays from './pages/LeaveDays';
import Profile from './pages/Profile';
import Login3 from './pages/Login3';
// import RoleData from './pages/Roles';

import Logout from './pages/Logout';

import { useState, useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  // const role = "HR";
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true')

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const mainContainerRef = use100vh();

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        setSidebarVisible(false);
        setUsername('');
        setRole('');
      } else {
        const user = JSON.parse(localStorage.getItem('user'));
        setUsername(user?.name || '');
        setRole(user?.role || '');
      }
    };

    handleStorageChange();
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <div>
        <Navbar className="navbar" username={username} toggleSidebar={toggleSidebar} isLoggedIn={isLoggedIn} role={role}/>
        <div className="main-content">
          {isLoggedIn && role && (
            <div className={`sidebar-container ${sidebarVisible ? 'visible' : ''}`}>
              <Sidebar
                toggleSidebar={toggleSidebar} 
                sidebarVisible={sidebarVisible} 
                role={role}
                username={username}
              />
            </div>
          )}
          <div className={`content ${sidebarVisible ? 'with-sidebar' : ''}`}>
            <Routes>
              {/* <Route path="/login" element={<Login />} /> */}
              <Route path="/login3" element={<Login3 />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard role={role} /> : <Navigate to ="/login3" />} />
              {/* <Route path="/location" element={isLoggedIn ? <Location /> : <Navigate to ="/login" />} /> */}
              <Route path="/checkin" element={isLoggedIn ? <Checkin /> : <Navigate to ="/login3" />} />
              <Route path="/checkout" element={isLoggedIn ? <Checkout /> : <Navigate to ="/login3" />} />
              <Route path="/home2" element={isLoggedIn ? <Home2 /> : <Navigate to ="/login3" />} />
              <Route path="/leave" element={isLoggedIn ? <Leave /> : <Navigate to ="/login3" />} />
              <Route path="/offsite" element={isLoggedIn ? <Offsite /> : <Navigate to ="/login3" />} /> 
              <Route path="/settings" element={isLoggedIn ? <Settings role={role} /> : <Navigate to ="/login3" />} />
              <Route path="/approve" element={isLoggedIn ? <Approve role={role} /> : <Navigate to ="/login3" />} />
              <Route path="/assign" element={isLoggedIn ? <Assign role={role} /> : <Navigate to ="/login3" />} />
              <Route path="/empdata" element={isLoggedIn ? <EmpData /> : <Navigate to ="/login3" />} />
              <Route path="/managereport" element={isLoggedIn ? <ManageReport /> : <Navigate to ="/login3" />} />
              <Route path="/leavedays" element={isLoggedIn ? <LeaveDays /> : <Navigate to ="/login3" />} />
              <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to ="/login3" />} />
              {/* <Route path="/roles" element={isLoggedIn ? <RoleData /> : <Navigate to ="/login" />} /> */}

              <Route path="/logout" element={isLoggedIn ? <Logout /> : <Navigate to ="/login3" />} />

              <Route path="/" element={isLoggedIn ? <Navigate to="/checkin" /> : <Navigate to="/login3" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
