import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AboutUs.css';
import '../css/logo.css';
import { IoHome } from "react-icons/io5";
import { FaLinkedin, FaGithub, FaInstagram, FaGlobe, FaEnvelope } from "react-icons/fa";
import Navbar from './NavBar';
import SearchNavbar from './SearchNavBar';
import Footer from './Footer';
import '../css/Chat.css';

const Chat = () => {
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        if (storedUserData) {
            setUserData(storedUserData);
        }
        fetchData();
    }, []);
    
    useEffect(() => {
        if (userData) {
            const userId = userData?.role === 'Student' ? userData.studentID :
                userData?.role === 'Advisor' ? userData.advisorID : userData?.visitorID;
            // Fetch users only if userData is loaded
            fetchData(userId);
        }
    }, [userData]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Store selected user
    const [message, setMessage] = useState(''); // Store the current message
    const [messages, setMessages] = useState([]); // Store messages for the chat
    const [isScrolledUp, setIsScrolledUp] = useState(false); // Track if the user scrolled up

    const messagesEndRef = useRef(null); // Reference for the messages container
    const messagesContainerRef = useRef(null); // Reference to the messages container div
    const [unreadCountMap, setUnreadCountMap] = useState({});

    // Fetch user data from the API
    const fetchData = (userId) => {
        if (!userId) return;  // Early return if no userId is available
        console.log("userID::", userId);
        fetch(`http://localhost:3001/api/users?excludeUserId=${userId}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setUsers(data) : setUsers([]))
            .catch(error => {
                console.log('Error fetching users:', error);
                setUsers([]); // fallback to an empty array on error
            });
    };



    useEffect(() => {
        if (userData && selectedUser) {
            // Fetch messages when a user is selected
            fetchMessages(userData, selectedUser);

            // Set interval to refetch messages every 100ms (0.1 second)
            const interval = setInterval(() => {
                fetchMessages(userData, selectedUser);
            }, 100); // 100ms interval

            // Cleanup interval on component unmount or change
            return () => clearInterval(interval);
        }
    }, [userData, selectedUser]); // Depend on userData and selectedUser

    useEffect(() => {
        // Scroll to the bottom when messages change, but only if the user is not scrolled up
        if (messagesEndRef.current && !isScrolledUp) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isScrolledUp]); // Depend on messages and isScrolledUp
    const markMessagesAsRead = (fromUser, toUser) => {
        fetch('http://localhost:3001/api/messages/read', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fromUser, toUser }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Messages marked as READ:', data);
                // Optionally refetch messages to update UI
                fetchMessages();
            })
            .catch(error => {
                console.error('Error marking messages as READ:', error);
            });
    };
    const fetchMessages = () => {
        if (selectedUser && userData) {
            const fromUser = userData.role === 'Student' ? userData.studentID :
                userData.role === 'Advisor' ? userData.advisorID : userData.visitorID;

            const toUser = selectedUser.userId;

            fetch(`http://localhost:3001/api/getmessages?fromUser=${fromUser}&toUser=${toUser}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Messages fetched successfully:', data);
                    setMessages(data); // Set the retrieved messages
                    // Mark these messages as read
                    fetch('http://localhost:3001/api/messages/read', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ fromUser, toUser }),
                    })
                        .then(response => response.json())
                        .then(() => {
                            console.log('Messages automatically marked as read');
                        })
                        .catch(error => {
                            console.error('Error marking messages as read:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching messages:', error);
                });
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user); // Set selected user

        if (userData) {
            const fromUser = userData.role === 'Student' ? userData.studentID :
                userData.role === 'Advisor' ? userData.advisorID : userData.visitorID;
            const toUser = user.userId;

            // Mark messages as READ when a user is selected
            markMessagesAsRead(fromUser, toUser);
        }
    };

    // Handle message input
    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (selectedUser && message.trim()) {
            const fromUser = userData.role === 'Student' ? userData.studentID :
                userData.role === 'Advisor' ? userData.advisorID : userData.visitorID;

            const messageData = {
                fromUser: fromUser,
                toUser: selectedUser.userId, // Use selected user's ID
                message: message,
            };

            // Send message to backend
            fetch('http://localhost:3001/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Message sent successfully:', data);
                    setMessage(''); // Clear message input after sending
                    fetchMessages(userData, selectedUser); // Refresh the chat messages

                    // Scroll to the bottom after sending the message
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                });
        }
    };


    // Handle scroll event
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
            setIsScrolledUp(!isAtBottom); // Set isScrolledUp if the user scrolls up
        }
    };
    // Fetch unread counts and latest sentAt for each user
    const fetchUnreadCounts = (userId) => {
        fetch(`http://localhost:3001/api/unreadMessages?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                const unreadMap = {};
                const sentAtMap = {};

                data.forEach(item => {
                    unreadMap[item.fromUser] = item.unreadCount;
                    sentAtMap[item.fromUser] = new Date(item.latestSentAt).getTime(); // Convert to timestamp
                });

                setUnreadCountMap(unreadMap);

                // Sort users based on the latest `sentAt` timestamp
                setUsers(prevUsers =>
                    [...prevUsers].sort((a, b) => {
                        const timeA = sentAtMap[a.userId] || 0; // Default to 0 if no sentAt
                        const timeB = sentAtMap[b.userId] || 0;
                        return timeB - timeA; // Descending order
                    })
                );

                console.log("Unread message data with sentAt:", data);
            })
            .catch(error => console.error('Error fetching unread counts:', error));
    };



    // Setup interval for unread message count refresh
    useEffect(() => {
        if (userData) {
            const userId = userData.role === 'Student' ? userData.studentID :
                userData.role === 'Advisor' ? userData.advisorID : userData.visitorID;

            // Fetch unread counts every 100 ms
            const interval = setInterval(() => {
                fetchUnreadCounts(userId);
            }, 100); // 100 ms interval

            // Clear interval when component unmounts or userData changes
            return () => clearInterval(interval);
        }
    }, [userData]);

    return (
        <div>
            {userData ? <SearchNavbar /> : <Navbar />}
            <div className='fcenter'>
                <br />
                <fieldset className='fieldsetChat'>
                    <div className="chatmaindiv">
                        <div className="chatusersdiv">
                            <h3>Users</h3>
                            {Array.isArray(users) && users.length > 0 ? (
                                users.map(user => (
                                    <div
                                        key={user.id}
                                        className={`chat-user-card ${unreadCountMap[user.userId] > 0 ? 'unread-user' : ''}`}
                                        onClick={() => handleUserClick(user)}
                                    >
                                        <div className="userDetails">
                                            <strong>
                                                <p>{user.firstname} {user.lastname}</p>
                                            </strong>
                                            <p>{user.email}</p>
                                        </div>
                                        <div>
                                            <p>
                                                &nbsp;
                                                {unreadCountMap[user.userId] > 0 && (
                                                    <span className="unread-count">{unreadCountMap[user.userId]}</span>
                                                )}
                                                &nbsp;
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No approved users.</p>
                            )}

                        </div>
                        <div className="chatdiv">
                            <h3>{userData ? `You are logged in as: ${userData.firstName} ${userData.lastName}` : null}<br></br>{selectedUser ? `Chat with ${selectedUser.firstname} ${selectedUser.lastname}` : 'Select a user'}</h3>

                            <div
                                className="messagesDiv"
                                ref={messagesContainerRef}
                                onScroll={handleScroll}
                            >
                                {messages.map(msg => (
                                    <div
                                    key={msg.id}
                                    className={`messageCard ${
                                        msg.fromUser ===
                                        (userData.role === 'Student'
                                            ? userData.studentID
                                            : userData.role === 'Advisor'
                                            ? userData.advisorID
                                            : userData.visitorID)
                                            ? 'userMessage'
                                            : 'otherMessage'
                                    }`}
                                >
                                
                                        <p>
                                            {msg.message}
                                        </p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef}></div>
                            </div>
                            <div className="messageDiv">
                                {selectedUser && (  // Only render if a user is selected
                                    <>
                                        <div className="textDiv">
                                            <textarea
                                                value={message}
                                                onChange={handleMessageChange}
                                                placeholder="Enter your reply here..."
                                                className="reply-textarea"
                                                required
                                            />
                                        </div>
                                        <div className="sendDiv">
                                            <button className="send-reply" onClick={handleSendMessage}>
                                                Send
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                </fieldset>
            </div>
            <Footer />
        </div>
    );
};

export default Chat;
