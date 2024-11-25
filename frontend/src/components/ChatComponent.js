import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChatbubbles } from "react-icons/io5";
import '../css/Chatbubble.css';

const ChatComponent = () => {
    const [userData, setUserData] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Retrieve user data from session storage
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        if (storedUserData) {
            setUserData(storedUserData);
        }
    }, []);

    useEffect(() => {
        // Fetch unread messages periodically
        if (userData) {
            const userId = getUserId(userData);
            if (!userId) return;

            fetchUnreadMessages(userId); // Fetch immediately

            const interval = setInterval(() => {
                fetchUnreadMessages(userId);
            }, 100); // Poll every 10 seconds

            return () => clearInterval(interval); // Cleanup interval on unmount
        }
    }, [userData]);

    const getUserId = (data) => {
        // Helper to get user ID based on role
        return data.role === 'Student'
            ? data.studentID
            : data.role === 'Advisor'
            ? data.advisorID
            : data.visitorID;
    };

    const fetchUnreadMessages = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/unreadMessagesCount?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch unread messages');

            const data = await response.json();
            setUnreadCount(data?.unreadCount || 0); // Update unread count state
        } catch (error) {
            console.error('Error fetching unread messages:', error);
            setUnreadCount(0); // Reset unread count on error
        }
    };
    const navigate = useNavigate();
    const handleChatClick = () => {
        console.log("called");
        navigate('/chat');  // Navigate to /chat when the bubble is clicked
    };
    return (
        <div>
            <IoChatbubbles
                className={`chatbubble ${unreadCount === 0 ? 'no-messages' : ''}`}
                onClick={handleChatClick}
            />
            {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
            )}
        </div>
    );
};

export default ChatComponent;
