import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';
import '../css/PendingRefTheses.css';
import ChatComponent from './ChatComponent';
const ApprovedRefTheses = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const advisorId = userData ? userData.advisorID : null;
    const [thesisRefApproved, setThesisRefApproved] = useState([]);

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
        fetch(`http://localhost:3001/api/download/${id}`, {
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
        fetch('http://localhost:3001/api/approved-ref-theses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ advisorId }),
        })
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesisRefApproved(data) : setThesisRefApproved([]))
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



    return (
        <div className="dashboard">
            <SearchNavbar />
            <br />

            <fieldset className='dashboardfs'>
                <div className='VerificationDashboard'>
                    <h2>Thesis Approved Reference Verification</h2>
                    <div className='PendingRefTheses'>
                        {Array.isArray(thesisRefApproved) && thesisRefApproved.length > 0 ? (
                            thesisRefApproved.map(thesis => (
                                <div key={thesis.id} className="thesis-card">
                                    <div>
                                        &nbsp;
                                        <p><strong>Title:</strong> {thesis.title}</p>
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

                                        {/* &nbsp;
                                        <button onClick={() => handleApprove(thesis.thesisId, thesis.studentId)}>Approve</button>
                                        &nbsp;
                                        <button onClick={() => handleDecline(thesis.thesisId, thesis.studentId)}>Decline</button> */}
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
            {userData && userData?.role != 'Department Admin'? <ChatComponent/>:null}
        </div>
    );
}

export default ApprovedRefTheses;
