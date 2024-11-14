import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';
import '../css/PendingRefTheses.css'
const PendingRefTheses = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const advisorId = userData ? userData.advisorID : null;
    
    
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
        fetch('http://localhost:3001/api/pending-ref-theses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({advisorId}),
        })
        .then(response => response.json())
        .then(data => Array.isArray(data) ? setThesisRefPending(data) : setThesisRefPending([]))
        .catch(error => {
            console.error("Error getting referenced thesis:", error);
        });

       

    }
    useEffect(() => {
        console.log("Data",userData);
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
                    <h2>Thesis Pending Reference Verification</h2>
                    <div className='PendingRefTheses'>
                            {Array.isArray(thesisRefPending) && thesisRefPending.length > 0 ? (
                                thesisRefPending.map(thesis => (
                                    <div key={thesis.id} className="thesis-card">
                                        <div>
                                            &nbsp;
                                        <p><strong>Title:</strong> {thesis.title}</p>
                                        <p><strong>Abstract:</strong> {thesis.abstract}</p>
                                        <p><strong>Submitted by:</strong> {thesis.studentId}</p>
                                        <button onClick={() => handleView(thesis.thesisId)}>
                                            View PDF
                                        </button>
                                        <button onClick={() => handleDownload(thesis.thesisId)}>
                                            Download PDF
                                        </button>
                                        &nbsp;
                                        </div>
                                        <div >
                                        
                                        &nbsp;
                                            <button>Approve</button>
                                            &nbsp;
                                            <button>Decline</button>
                                            </div>
                                        
                                    </div>
                                ))
                            ) : (
                                <p>No Theses Reference pending approval.</p>
                            )}
                            </div>
                    <br /><br /><br />

                    <div className='input3'>
                        <button className="button-85" onClick={() => navigate('/submit-thesis')}>
                            Submit a new thesis
                        </button>
                    </div>
                </div>
            </fieldset>
            <br />

            <Footer />
        </div>
    );
}

export default PendingRefTheses;
