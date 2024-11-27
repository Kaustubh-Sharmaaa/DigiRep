import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';
import '../css/PendingRefTheses.css';
import CommentModal from './CommentModal';
import ChatComponent from './ChatComponent';
const PendingRefTheses = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const advisorId = userData ? userData.advisorID : null;
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [selectedThesisId, setSelectedThesisId] = useState(null); // Store selected thesis ID
    const [selectedStudentId, setSelectedStudentId] = useState(null); // Store selected student ID
    const [actionType, setActionType] = useState(''); // Store action type (approve or decline)
    const [thesisRefPending, setThesisRefPending] = useState([]);

    const handleDownload = (id) => {
        fetch(`http://localhost:3001/api/download/${id}`, {
            method: 'GET',
        })
            .then(response => {
                if (response.ok) {
                    return response.blob(); // Convert response to a blob
                }
                throw new Error('File not found');
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${id}.pdf`; // Set the download filename
                link.click();
                window.URL.revokeObjectURL(url); // Clean up the URL object
            })
            .catch(error => {
                console.error("Error downloading file:", error);
            });
    };

    const handleView = (id) => {
        fetch(`http://localhost:3001/api/viewfile/${id}`, {
            method: 'GET',
        })
            .then(response => {
                if (response.ok) {
                    return response.blob();
                }
                throw new Error('File not found');
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank'); // Open PDF in a new tab
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error("Error viewing file:", error);
            });
    };
    const fetchData = () => {
        fetch('http://localhost:3001/api/pending-ref-theses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ advisorId }),
        })
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesisRefPending(data) : setThesisRefPending([]))
            .catch(error => {
                console.error("Error getting referenced thesis:", error);
            });



    }
    useEffect(() => {
        console.log("Data", userData);
        if (!userData) {
            navigate('/');
        }
        if (userData && userData.role == "Student") {
            navigate('/studentDashboard')
        }

        if (userData && userData.role == "Department Admin") {
            navigate('/departmentAdminDashboard')
        }
        fetchData();
    }, []);

    const handleApprove = (thesisId, studentId) => {
        setSelectedThesisId(thesisId);
        setSelectedStudentId(studentId);
        setActionType('approve');
        setIsModalOpen(true);
    };

    const handleDecline = (thesisId, studentId) => {
        setSelectedThesisId(thesisId);
        setSelectedStudentId(studentId);
        setActionType('decline');
        setIsModalOpen(true);
    };

    const handleModalSubmit = (comment) => {
        const date = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS

        const thesisReference = {
            studentId: selectedStudentId,
            thesisId: selectedThesisId,
            advisorId: advisorId,
            date: date,
            comment: comment,
        };


        //send notification
        const userData = JSON.parse(sessionStorage.getItem('user'));
        fetch(`http://localhost:3001/api/sendNotifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: thesisReference.studentId,
                message: `${userData.firstName} ${userData.lastName} has ${actionType}d thesis ${thesisReference.thesisId} with comments: "${thesisReference.comment}"`
            }),
        });


        const apiEndpoint = actionType === 'approve' ? '/api/thesis-reference-acceptance' : '/api/thesis-reference-decline';

        fetch(`http://localhost:3001${apiEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(thesisReference),
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                setThesisRefPending(prevTheses => prevTheses.filter(thesis => thesis.thesisId !== selectedThesisId));
            })
            .catch(error => {
                alert('Error: ' + (error.message || 'An unexpected error occurred.'));
            });

        // Clear the selected IDs and close the modal
        setSelectedThesisId(null);
        setSelectedStudentId(null);
        setIsModalOpen(false);
        setActionType('');
    };




    return (
        <div className="dashboard">
            <SearchNavbar />
            <br />

            <fieldset className='dashboardfs'>
                <div className='VerificationDashboard'>
                    <h2>Thesis Pending Reference Verification</h2>
                    <div className='PendingRefTheses'>
                        {Array.isArray(thesisRefPending) && thesisRefPending.length > 0 ? (
                            thesisRefPending.map(thesis => (
                                <div key={thesis.id} className="thesis-card">
                                    <div>
                                        &nbsp;
                                        <p><strong>{thesis.title}</strong> </p>
                                        <p><strong>Abstract:</strong> {thesis.abstract}</p>
                                        <p><strong>Submitted by:</strong> {thesis.studentId}</p>
                                        <button onClick={() => handleView(thesis.thesisId)} className='viewpdf'>
                                            View PDF
                                        </button>
                                        <button onClick={() => handleDownload(thesis.thesisId)} className='downloadpdf'>
                                            Download PDF
                                        </button>
                                        &nbsp;
                                    </div>
                                    <div >

                                        &nbsp;
                                        <button onClick={() => handleApprove(thesis.thesisId, thesis.studentId)} className='approvebutton'>Approve</button>
                                        &nbsp;
                                        <button onClick={() => handleDecline(thesis.thesisId, thesis.studentId)} className='declinebutton'>Decline</button>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <p>No Theses Reference pending approval.</p>
                        )}
                    </div>
                    <br /><br /><br />

                    
                </div>
            </fieldset>
            <br />

            <Footer />
            <CommentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                actionType={actionType} // Pass the action type to the modal
            />
            <ChatComponent/>
        </div>
    );
}

export default PendingRefTheses;
