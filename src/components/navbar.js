import React, { useState, useEffect, useRef } from 'react';
import { BsClock } from "react-icons/bs";
import { BsList } from 'react-icons/bs';
import { BsBellFill } from "react-icons/bs";

import './navbar.css';

function Navbar({ username, toggleSidebar, isLoggedIn, role }) {
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const [notifications, setNotifications] = useState([
    "Notification 1: Leave approved",
    "Notification 2: Pending request",
    "Notification 3: New announcement"
  ])

  const notificationsRef = useRef(null);

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
  }

  useEffect(() => {
    const isLoggedInFromStorage = JSON.parse(localStorage.getItem("isLoggedIn"));
    setIsSidebarVisible(isLoggedInFromStorage === true);
    console.log("The login status has changed:", isLoggedInFromStorage);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      console.log("Storage event triggered", event);
      const isLoggedInFromStorage = JSON.parse(localStorage.getItem("isLoggedIn"));
      setIsSidebarVisible(isLoggedInFromStorage === true);
      console.log("The login status has changed:", isLoggedInFromStorage);
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  return (
    <>
      <nav class="navbar navbar-expand-sm navbar-light bg-light justify-content-between">
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginLeft: "5px" }}>
          {isSidebarVisible && (
            <a class="menu" href="#" onClick={toggleSidebar}>
              <BsList />
            </a>
          )}
          <a class="navbar-brand" href="#" style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <BsClock />
            Leave and Time Attendance
          </a>
        </div>

        <div class="justify-content-between" id="navbarSupportedContent">
          <div></div>
          <div className="d-flex align-items-center">
            {isSidebarVisible && (
              <>
                <div className="bell" onClick={toggleNotifications} style={{ cursor: "pointer", marginRight: "15px" }}>
                  <BsBellFill />
                </div>
                <div className="navbar-text d-none d-sm-block" style={{ marginRight: "15px" }}>
                    {username}<br/>{role}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {notificationsVisible && (
        <div className="notifications-dropdown" ref={notificationsRef}>
          <div className="notifications-header">
            <h6 className="notifications-title">Notifications</h6>
            <button className="btn clear-button" onClick={() => setNotifications([])}>
              Clear All
            </button>
          </div>
          <ul className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <li className="notification-item" key={index}>
                  {notification}
                </li>
              ))
            ) : (
              <li className="notification-item no-notifications">No notifications</li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

export default Navbar;