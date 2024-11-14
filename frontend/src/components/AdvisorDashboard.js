import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';

const AdvisorDashboard = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const advisorId = userData ? userData.advisorID : null;
    

    const [thesisRefPending, setThesisRefPending] = useState([]);
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
                &nbsp;
                &nbsp;&nbsp;
                &nbsp;
<div className='buttons'>
                    
                        <button className="button-85" onClick={() => navigate('/pendingRefTheses')}>
                            View all Theses Pending Reference Acceptance
                        </button>
                    &nbsp;&nbsp;
                        <button className="button-85" onClick={() => navigate('/pendingReqTheses')}>
                            View all Theses Pending Review
                        </button>
                        &nbsp;&nbsp;
                        <button className="button-85" onClick={() => navigate('/pendingRefTheses')}>
                            View all Theses Approved Reference Acceptance
                        </button>
                        &nbsp;&nbsp;
                        <button className="button-85" onClick={() => navigate('/pendingRefTheses')}>
                            View all Theses Approved Review
                        </button>
                        &nbsp;
                        &nbsp;
                        <button className="button-85" onClick={() => navigate('/submit-thesis')}>
                            Submit a new thesis
                        </button>
                        </div>
                </div>
                &nbsp;
                        &nbsp;
                        &nbsp;
                        &nbsp;
            </fieldset>
            <br />

            <Footer />
        </div>
    );
}

export default AdvisorDashboard;
