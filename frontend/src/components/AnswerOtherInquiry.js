import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './NavBar';
import Footer from './Footer';
import SearchNavbar from './SearchNavBar';
import ChatComponent from './ChatComponent';
const AnswerOtherInquiry = () => {
    const { id } = useParams(); // Retrieve the inquiry ID from the URL params
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [inquiryDetails, setInquiryDetails] = useState(null); // Store inquiry details
    const [replyMessage, setReplyMessage] = useState(''); // Store reply message

    // Fetch inquiry details on component mount
    useEffect(() => {
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        console.log("data", storedUserData);
        if (storedUserData) {
            setUserData(storedUserData);
        }
        fetch(`http://localhost:3001/api/otherinquirydetail/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setInquiryDetails(data);
                console.log("inquiryd:", data);
            })
            .catch((error) => console.error('Error fetching inquiry details:', error));
    }, [id]);

    // Handle reply message change
    const handleReplyChange = (e) => {
        setReplyMessage(e.target.value);
    };

    // Handle form submission to send the response
    const handleSendReply = (e) => {
        e.preventDefault();

        // Use window.confirm for confirmation
        const confirmed = window.confirm('Are you sure you want to send this reply?');
        if (confirmed) {
            fetch(`http://localhost:3001/api/answer-other-inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: inquiryDetails[0].id,
                    firstName: inquiryDetails[0].first_name,
                    lastName: inquiryDetails[0].last_name,
                    email: inquiryDetails[0].email,
                    type: inquiryDetails[0].inquiry_type,
                    reply: replyMessage,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log('Reply sent successfully:', data);
                    navigate('/otherInquiries'); // Redirect to inquiries list after reply is sent
                })
                .catch((error) => {
                    console.error('Error sending reply:', error);
                });
        }
    };

    return (
        <div>
            {userData ? <SearchNavbar /> : <Navbar />}
            <div className='fcenter'>
                <fieldset className='fieldsetA'>
                    <legend className='legendA'>
                        <h2>Inquiry Details</h2>
                    </legend>
                    {inquiryDetails ? (
                        <>
                            <div className="inquiry-detail">
                                <p><strong>First Name:</strong> {inquiryDetails[0].first_name}</p>
                                <p><strong>Last Name:</strong> {inquiryDetails[0].last_name}</p>
                                <p><strong>Email:</strong> {inquiryDetails[0].email}</p>
                                <p><strong>Inquiry Type:</strong> {inquiryDetails[0].inquiry_type}</p>
                                {inquiryDetails[0].inquiry_type === 'thesis' && (
                                    <p><strong>Thesis ID:</strong> {inquiryDetails[0].thesis_id}</p>
                                )}
                                {inquiryDetails[0].inquiry_type === 'other' && (
                                    <p><strong>Brief Issue:</strong> {inquiryDetails[0].brief_issue}</p>
                                )}
                                <p><strong>Message:</strong> {inquiryDetails[0].message}</p>
                            </div>

                            <h3>Enter Your Reply</h3>
                            <textarea
                                value={replyMessage}
                                onChange={handleReplyChange}
                                placeholder="Enter your reply here..."
                                className="reply-textarea"
                                required
                            />
                            <br />
                            <button className="send-button" onClick={handleSendReply}>
                                Send Reply
                            </button>
                        </>
                    ) : (
                        <p>Loading inquiry details...</p>
                    )}
                </fieldset>
            </div>
            <Footer/>
            {userData && userData?.role != 'Department Admin'? <ChatComponent/>:null}
        </div>
    );
};

export default AnswerOtherInquiry;
