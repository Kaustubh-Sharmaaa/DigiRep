import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../css/ChatComponent.css";

const socket = io("http://localhost:3001"); // Backend URL

const ChatComponent = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const currentUser = JSON.parse(sessionStorage.getItem("user")); // Assuming user info is stored in session
  currentUser.id = currentUser.studentID  || currentUser.departmentAdminID  || currentUser.advisorID
  useEffect(() => {
    if (currentUser) {
      socket.emit("join", currentUser.id); // Join the user's room
    }
  }, [currentUser]);
  



 
  // Fetch registered users (only approved users will be displayed in the chat list)
  useEffect(() => {
    
    axios
      .get("http://localhost:3001/api/chat/users/order",{params: { id: currentUser.id  }})
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, [selectedUser]);

  // Fetch chat history with the selected user
  useEffect(() => {
    if (selectedUser) {
      console.log(selectedUser)
      axios
        .get("http://localhost:3001/api/chat/history", {
          params: { senderId: currentUser.id, receiverId: selectedUser.userID },
        })
        .then((response) => setMessages(response.data))
        .catch((error) => console.error("Error fetching chat history:", error));
    }
  }, [selectedUser, currentUser.id]);

  // **New UseEffect: Listen for Real-Time Messages**
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (
        data.senderId === selectedUser?.id &&
        data.receiverId === currentUser.id
      ) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedUser, currentUser]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (
        selectedUser && // Check if a user is selected
        data.senderId === selectedUser.id && // Match sender
        data.receiverId === currentUser.id// Match receiver
      ) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });
  
    return () => {
      socket.off("receive_message");
    };
  }, [selectedUser, currentUser.id]);

  // Handle sending a new message
  const sendMessage = async() => {
    if (!newMessage.trim()) return; // Ensure the message is not empty or just spaces
  
    if (!selectedUser) {
      console.error("No user selected to send the message.");
      return;
    }
  
    const messageData = {
      senderId: currentUser.id ,
      receiverId: selectedUser.userID,
      message: newMessage,
    };
  
    console.log("Sending message:", messageData); // Debugging
  
    try {
      // Emit the message to the server
      //socket.emit("send_message", messageData);
      const response = await axios.post(
        "http://localhost:3001/api/chat/send",
         messageData,
      );
      console.log("Message sent to database successfully:", response.data);
      // Add the message to the local state for immediate feedback
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...messageData,
          timestamp: new Date(),
        },
      ]);
  
      setNewMessage(""); // Clear the input field
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  

  return (
    <div className="chat-component">
      {/* Chat Icon */}
      <div className="chat-icon" onClick={() => setIsChatOpen(!isChatOpen)}>
        💬
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="chat-window">
          {/* User List */}
          {!selectedUser ? (
            <div className="user-list">
              <h3>Chat with:</h3>
              {users.map((user) => (
                <div
                  key={user.userID}
                  className="user-item"
                  onClick={() =>{
                    
                    setSelectedUser(user);
                    console.log("Selected user set to:", user);
                  }}
                >
                  {user.firstName} {user.lastName} ({user.role})
                  {user.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="chat-box">
              <h3>
                Chat with {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <button
                className="back-button"
                onClick={() => {
                  
                  setSelectedUser(null);
                  console.log("Selected user reset to null");

                } }
              >
                Back to Users
              </button>
              <div className="message-list" style={{ overflowY: "auto", maxHeight: "250px", padding: "10px" }}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.senderId === currentUser.id ? "sent" : "received"}`}
                  >
                   {msg.senderId}: {msg.message}
                  </div>
                ))}
              </div>
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
