import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';

const ThesesInquiries = () => {
    const navigate = useNavigate();
    const [inquiriesPending, setInquiriesPending] = useState([]);
    const [inquiriesAnswered, setInquiriesAnswered] = useState([]);
    
    const fetchData = () => {
        fetch('http://localhost:3001/api/theses-inquiries-pending')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setInquiriesPending(data) : setInquiriesPending([]))
            .catch(error => {
                console.log('Error fetching pending inquiries:', error);
                setInquiriesPending([]); // fallback to an empty array on error
            });
        fetch('http://localhost:3001/api/theses-inquiries-answered')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setInquiriesAnswered(data) : setInquiriesAnswered([]))
            .catch(error => {
                console.log('Error fetching answered inquiries:', error);
                setInquiriesAnswered([]); // fallback to an empty array on error
            });
    };

    useEffect(() => {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        if (!userData) {
            navigate('/');
        }
        if (userData && userData.role === "Student") {
            navigate('/studentDashboard');
        }
        fetchData();
    }, []);

    // Redirect to the inquiry detail page
    const handleInquiryClick = (id) => {
        navigate(`/thesisinquirydetail/${id}`);
    };

    return (
        <div className="dashboard">
            <SearchNavbar />
            <br />

            <fieldset className='dashboardfs'>
                <div className='VerificationDashboard'>
                    <h2>Inquiries</h2>
                    <div className='Verification'>
                        <div className='blocksDashboard'>
                            <h3>Pending Inquiries</h3>
                            {Array.isArray(inquiriesPending) && inquiriesPending.length > 0 ? (
                                inquiriesPending.map(inquiry => (
                                    <div
                                        key={inquiry.id}
                                        className="user-card clickable-card"
                                        onClick={() => handleInquiryClick(inquiry.id)} // Navigate to InquiryDetail
                                    >
                                        <p><strong>ID:</strong> {inquiry.id}</p>
                                        <p><strong>Submitted by:</strong> {inquiry.email}</p>
                                        <p><strong>Type:</strong> {inquiry.inquiry_type}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No pending inquiries.</p>
                            )}
                        </div>
                    
                        <div className='blocksDashboard'>
                            <h3>Past Inquiries</h3>
                            {Array.isArray(inquiriesAnswered) && inquiriesAnswered.length > 0 ? (
                                inquiriesAnswered.map(inquiry => (
                                    <div
                                        key={inquiry.id}
                                        className="user-card clickable-card"
                                        onClick={() => handleInquiryClick(inquiry.id)} // Navigate to InquiryDetail
                                    >
                                        <p><strong>ID:</strong> {inquiry.id}</p>
                                        <p><strong>Submitted by:</strong> {inquiry.email}</p>
                                        <p><strong>Type:</strong> {inquiry.inquiry_type}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No past inquiries.</p>
                            )}
                        </div>
                    </div>
                    <br /><br /><br />
                </div>
            </fieldset>
            <br />

            <Footer />
        </div>
    );
};

export default ThesesInquiries;
