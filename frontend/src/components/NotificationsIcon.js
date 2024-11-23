/* File written by: Chagamreddy Navyasree, Student ID: 1002197805 */

import React, { useState } from 'react';
import { IoNotificationsCircleOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userData = JSON.parse(sessionStorage.getItem('user'));
  const keys = Object.keys(userData);
  const userid = userData[keys[1]];

  const toggleNotifications = () => {
    setIsOpen(!isOpen);

    fetch(`http://localhost:3001/api/notifications/${userid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setNotifications(data);
      })
      .catch((error) => {
        console.log("Notification Error:", error);
      });
  };

  const clearNotifications = () => {
    setNotifications([]); // Clear notifications locally

    // Optional: Send a request to clear notifications on the server
    fetch(`http://localhost:3001/api/clearNotifications/${userid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          console.log("Notifications cleared successfully on the server.");
        } else {
          console.error("Failed to clear notifications on the server.");
        }
      })
      .catch((error) => console.log("Error clearing notifications:", error));
  };

  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Icon */}
      <Link className="picons" onClick={toggleNotifications}>
        <IoNotificationsCircleOutline />
      </Link>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '0',
            backgroundColor: 'black',
            border: '1px solid #ccc',
            borderRadius: '5px',
            width: '200px',
            padding: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            zIndex: '100',
          }}
        >
          <h4 style={{ color: 'white', margin: '0 0 10px' }}>Notifications</h4>
          {notifications.length === 0 ? (
            <p style={{ color: 'white' }}>No notifications</p>
          ) : (
            <>
              <button
                onClick={clearNotifications}
                style={{
                  display: 'block',
                  margin: '0 auto 10px',
                  padding: '5px 10px',
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: '8px',
                    marginBottom: '5px',
                    backgroundColor: notif.read ? '#f0f0f0' : '#e8e8e8',
                    borderRadius: '3px',
                    color: 'black',
                  }}
                  onClick={() => markAsRead(notif.id)}
                >
                  {notif.message}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
