import React, {useState, useEffect} from 'react';
import { Link, useLocation } from 'react-router-dom';

import { FaHome, FaClipboard, FaSignInAlt, FaSignOutAlt, FaRegCalendarAlt, FaUserPlus, FaCog, FaCheckCircle, FaTasks, FaPowerOff } from 'react-icons/fa';

import './sidebar.css';

function Sidebar({ toggleSidebar, sidebarVisible, role, username }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
      const checkInStatus = localStorage.getItem('isCheckedIn');
      if (checkInStatus === 'true') {
          setIsCheckedIn(true); // User is already checked in
      }

      const handleStatusChange = () => {
        const updatedStatus = localStorage.getItem('isCheckedIn');
        setIsCheckedIn(updatedStatus === 'true');
      };

      window.addEventListener('checkInStatusChanged', handleStatusChange);

      // Cleanup listener
      return () => {
          window.removeEventListener('checkInStatusChanged', handleStatusChange);
      };
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleItemClick = () => {
    toggleSidebar();
  };

  const renderItems = () => {
    switch (role) {
      case 'Employee':
        return (
          <>
            <li className={isActive('/home2') ? 'active' : ''}><Link to="/home2" onClick={handleItemClick}><FaHome /> Home</Link></li>
            <li className={isActive('/dashboard') ? 'active' : ''}><Link to="/dashboard" onClick={handleItemClick}><FaClipboard /> Report</Link></li>
            {isCheckedIn ? (
                <li className={isActive('/checkout') ? 'active' : ''}><Link to="/checkout" onClick={handleItemClick}><FaSignOutAlt /> Check-out</Link></li>
            ) : (
              <li className={isActive('/checkin') ? 'active' : ''}><Link to="/checkin" onClick={handleItemClick}><FaSignInAlt /> Check-in</Link></li>
            )}
            <li className={isActive('/leave') ? 'active' : ''}><Link to="/leave" onClick={handleItemClick}><FaRegCalendarAlt /> Leave Request</Link></li>
            <li className={isActive('/offsite') ? 'active' : ''}><Link to="/offsite" onClick={handleItemClick}><FaUserPlus /> Off-site Request</Link></li>
            <li className={isActive('/logout') ? 'active' : ''}><Link to="/logout" onClick={handleItemClick}><FaPowerOff /> Logout</Link></li>
          </>
        )
      case 'Supervisor':
        return (
          <>
            <li className={isActive('/home2') ? 'active' : ''}><Link to="/home2" onClick={handleItemClick}><FaHome /> Home</Link></li>
            <li className={isActive('/dashboard') ? 'active' : ''}><Link to="/dashboard" onClick={handleItemClick}><FaClipboard /> Report</Link></li>
            {isCheckedIn ? (
                <li className={isActive('/checkout') ? 'active' : ''}><Link to="/checkout" onClick={handleItemClick}><FaSignOutAlt /> Check-out</Link></li>
            ) : (
              <li className={isActive('/checkin') ? 'active' : ''}><Link to="/checkin" onClick={handleItemClick}><FaSignInAlt /> Check-in</Link></li>
            )}
            <li className={isActive('/leave') ? 'active' : ''}><Link to="/leave" onClick={handleItemClick}><FaRegCalendarAlt /> Leave Request</Link></li>
            <li className={isActive('/offsite') ? 'active' : ''}><Link to="/offsite" onClick={handleItemClick}><FaUserPlus /> Off-site Request</Link></li>
            <li className={isActive('/approve') ? 'active' : ''}><Link to="/approve" onClick={handleItemClick}><FaCheckCircle /> Approve/Deny Requests</Link></li>
            <li className={isActive('/assign') ? 'active' : ''}><Link to="/assign" onClick={handleItemClick}><FaTasks /> Assign Job</Link></li>
            <li className={isActive('/logout') ? 'active' : ''}><Link to="/logout" onClick={handleItemClick}><FaPowerOff /> Logout</Link></li>
          </>
        )
      case 'HR':
        return (
          <>
            <li className={isActive('/home2') ? 'active' : ''}><Link to="/home2" onClick={handleItemClick}><FaHome /> Home</Link></li>
            <li className={isActive('/dashboard') ? 'active' : ''}><Link to="/dashboard" onClick={handleItemClick}><FaClipboard /> Report</Link></li>
            {isCheckedIn ? (
                <li className={isActive('/checkout') ? 'active' : ''}><Link to="/checkout" onClick={handleItemClick}><FaSignOutAlt /> Check-out</Link></li>
            ) : (
              <li className={isActive('/checkin') ? 'active' : ''}><Link to="/checkin" onClick={handleItemClick}><FaSignInAlt /> Check-in</Link></li>
            )}
            <li className={isActive('/leave') ? 'active' : ''}><Link to="/leave" onClick={handleItemClick}><FaRegCalendarAlt /> Leave Request</Link></li>
            <li className={isActive('/offsite') ? 'active' : ''}><Link to="/offsite" onClick={handleItemClick}><FaUserPlus /> Off-site Request</Link></li>
            <li className={isActive('/approve') ? 'active' : ''}><Link to="/approve" onClick={handleItemClick}><FaCheckCircle /> Approve/Deny Requests</Link></li>
            <li className={isActive('/settings') ? 'active' : ''}><Link to="/settings" onClick={handleItemClick}><FaCog /> Settings</Link></li>
            <li className={isActive('/logout') ? 'active' : ''}><Link to="/logout" onClick={handleItemClick}><FaPowerOff /> Logout</Link></li>
          </>
        )
      case 'Admin':
        return (
          <>
            <li className={isActive('/home2') ? 'active' : ''}><Link to="/home2" onClick={handleItemClick}><FaHome /> Home</Link></li>
            <li className={isActive('/dashboard') ? 'active' : ''}><Link to="/dashboard" onClick={handleItemClick}><FaClipboard /> Report</Link></li>
            {isCheckedIn ? (
                <li className={isActive('/checkout') ? 'active' : ''}><Link to="/checkout" onClick={handleItemClick}><FaSignOutAlt /> Check-out</Link></li>
            ) : (
              <li className={isActive('/checkin') ? 'active' : ''}><Link to="/checkin" onClick={handleItemClick}><FaSignInAlt /> Check-in</Link></li>
            )}
            <li className={isActive('/leave') ? 'active' : ''}><Link to="/leave" onClick={handleItemClick}><FaRegCalendarAlt /> Leave Request</Link></li>
            <li className={isActive('/offsite') ? 'active' : ''}><Link to="/offsite" onClick={handleItemClick}><FaUserPlus /> Off-site Request</Link></li>
            <li className={isActive('/approve') ? 'active' : ''}><Link to="/approve" onClick={handleItemClick}><FaCheckCircle /> Approve/Deny Requests</Link></li>
            <li className={isActive('/assign') ? 'active' : ''}><Link to="/assign" onClick={handleItemClick}><FaTasks /> Assign Job</Link></li>
            <li className={isActive('/settings') ? 'active' : ''}><Link to="/settings" onClick={handleItemClick}><FaCog /> Settings</Link></li>
            <li className={isActive('/logout') ? 'active' : ''}><Link to="/logout" onClick={handleItemClick}><FaPowerOff /> Logout</Link></li>
          </>
        )
      default:
        return null;
    }
  }

  return (
    <div>
      <div className="sidebar">
        <ul>
          <div className="sidebar-username">
            Welcome, {username}!
          </div>
          {renderItems()}
        </ul>
      </div>
    </div>
  );
}
  
export default Sidebar;