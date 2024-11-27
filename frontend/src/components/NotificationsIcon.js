import React, { useState, useEffect } from 'react';
import { IoNotificationsCircleOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // State to track unread notifications count
  const userData = JSON.parse(sessionStorage.getItem('user'));
  const keys = Object.keys(userData);
  const userid = userData[keys[1]];

  // Fetch unread count and notifications periodically
  useEffect(() => {
    const fetchNotificationsAndUnreadCount = () => {
      fetch(`http://localhost:3001/api/notifications/${userid}`)
        .then((response) => response.json())
        .then((data) => {
          setNotifications(data); // Update the notifications state
          const unread = data.filter((notif) => !notif.read).length; // Count unread notifications
          setUnreadCount(unread);
        })
        .catch((error) => console.error('Error fetching notifications:', error));
    };

    // Initial fetch
    fetchNotificationsAndUnreadCount();

    // Set interval to fetch notifications every 5 seconds
    const interval = setInterval(fetchNotificationsAndUnreadCount, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [userid]);

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setIsOpen(!isOpen);

    // Mark notifications as read when the dropdown is opened
    if (!isOpen) {
      fetch(`http://localhost:3001/api/markNotificationsRead/${userid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(() => setUnreadCount(0)) // Reset unread count after marking as read
        .catch((error) =>
          console.error('Error marking notifications as read:', error)
        );
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]); // Clear notifications locally

    fetch(`http://localhost:3001/api/clearNotifications/${userid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          console.log('Notifications cleared successfully on the server.');
        } else {
          console.error('Failed to clear notifications on the server.');
        }
      })
      .catch((error) => console.log('Error clearing notifications:', error));
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Icon with Unread Badge */}
      <Link className="picons" onClick={toggleNotifications}>
        <IoNotificationsCircleOutline />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            {unreadCount}
          </span>
        )}
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
          <h4 style={{ color: 'white', margin: '0 0 10px', textAlign: 'center' }}>Notifications</h4>
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
              {/* Scrollable Notifications List */}
              <div
                style={{
                  maxHeight: '200px', // Set a fixed height
                  overflowY: 'auto', // Add vertical scroll
                  paddingRight: '5px', // Add space for scroll bar
                }}
              >
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
                  >
                    {notif.message}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
