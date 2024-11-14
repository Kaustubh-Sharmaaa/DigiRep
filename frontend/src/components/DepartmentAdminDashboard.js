import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';

const DepartmentAdminDashboard = () => {
    const navigate = useNavigate();
    const [studentsPending, setStudentsPending] = useState([]);
    const [studentsApproved, setStudentsApproved] = useState([]);
    const [studentsDeclined, setStudentsDeclined] = useState([]);
    const [advisorsPending, setAdvisorsPending] = useState([]);
    const [advisorsApproved, setAdvisorsApproved] = useState([]);
    const [advisorsDeclined, setAdvisorsDeclined] = useState([]);
    const fetchData = () => {
        fetch('http://localhost:3001/api/students-pending')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsPending(data) : setStudentsPending([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsPending([]); // fallback to an empty array on error
            });

        fetch('http://localhost:3001/api/students-approved')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsApproved(data) : setStudentsApproved([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsApproved([]); // fallback to an empty array on error
            });
        fetch('http://localhost:3001/api/students-declined')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsDeclined(data) : setStudentsDeclined([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsDeclined([]); // fallback to an empty array on error
            });

        fetch('http://localhost:3001/api/advisors-pending')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
            .catch(error => {
                console.error('Error fetching advisors:', error);
                setAdvisorsPending([]); // fallback to an empty array on error
            });
        fetch('http://localhost:3001/api/advisors-approved')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsApproved(data) : setAdvisorsApproved([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setAdvisorsApproved([]); // fallback to an empty array on error
            });
        fetch('http://localhost:3001/api/advisors-declined')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsDeclined(data) : setAdvisorsDeclined([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setAdvisorsDeclined([]); // fallback to an empty array on error
            });

    }
    useEffect(() => {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        if (!userData) {
            navigate('/');
        }
        if (userData && userData.role == "Student") {
            navigate('/studentDashboard')
        }
        fetchData();
    }, []);

    const handleApprove = (userId) => {
        fetch(`http://localhost:3001/api/approve-student/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(() => {
                fetchData();
            })
            .catch(error => console.error('Error approving user:', error));
    };

    const handleDecline = (userId) => {
        fetch(`http://localhost:3001/api/decline-student/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(() => {
                fetchData();
            })
            .catch(error => console.error('Error declining Student:', error));
    };
    const handlePending = (userId) => {
        fetch(`http://localhost:3001/api/pending-student/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(() => {
                fetchData();
            })
            .catch(error => console.error('Error pending Student:', error));
    };
    const handleDelete = (userId) => {
        const isConfirmed = window.confirm('Are you sure? This action cannot be undone.');

        if (isConfirmed) {
            fetch(`http://localhost:3001/api/delete-student/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
                .then(response => response.json())
                .then(() => {
                    fetchData();
                })
                .catch(error => console.error('Error pending Student:', error));
        } else {
            console.log('Delete action was cancelled.');
        }

    };

    const handleAdvisorApprove = (userId) => {
        fetch(`http://localhost:3001/api/approve-advisor/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(() => {
                fetchData();
            })
            .catch(error => console.error('Error approving user:', error));
    };


    const handleAdvisorDecline = (userId) => {
        fetch(`http://localhost:3001/api/decline-advisor/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(() => {
                fetchData();
            })
            .catch(error => console.error('Error declining Student:', error));
    };
    const handleAdvisorPending = (userId) => {
        fetch(`http://localhost:3001/api/pending-advisor/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(() => {
                fetchData();
            })
            .catch(error => console.error('Error pending Student:', error));
    };

    const handleAdvisorDelete = (userId) => {
        const isConfirmed = window.confirm('Are you sure? This action cannot be undone.');

        if (isConfirmed) {
            fetch(`http://localhost:3001/api/delete-advisor/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
                .then(response => response.json())
                .then(() => {
                    fetchData();
                })
                .catch(error => console.error('Error pending Student:', error));
        } else {
            console.log('Delete action was cancelled.');
        }

    };


    return (
        <div className="dashboard">
            <SearchNavbar />
            <br />

            <fieldset className='dashboardfs'>
                <div className='VerificationDashboard'>
                    <h2>Students Accounts</h2>
                    <div className='Verification'>
                        <div className='blocksDashboard'>
                            <h3>Pending Verification</h3>
                            {Array.isArray(studentsPending) && studentsPending.length > 0 ? (
                                studentsPending.map(user => (
                                    <div key={user.id} className="user-card">
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Education:</strong> {user.education}</p>
                                        <button onClick={() => handleApprove(user.id)} className="button-approve">
                                            Approve
                                        </button>
                                        <button onClick={() => handleDecline(user.id)} className="button-decline">
                                            Decline
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No students pending verification.</p>
                            )}
                        </div>
                        <div className='blocksDashboard'>
                            <h3>Declined Verification</h3>
                            {Array.isArray(studentsDeclined) && studentsDeclined.length > 0 ? (
                                studentsDeclined.map(user => (
                                    <div key={user.id} className="user-card">
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Education:</strong> {user.education}</p>
                                        <button onClick={() => handlePending(user.id)} className="button-approve">
                                            Pending
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="button-approve">
                                            Delete
                                        </button>

                                    </div>
                                ))
                            ) : (
                                <p>No students declined verification.</p>
                            )}
                        </div>
                        <div className='blocksDashboard'>
                            <h3>Approved Verification</h3>
                            {Array.isArray(studentsApproved) && studentsApproved.length > 0 ? (
                                studentsApproved.map(user => (
                                    <div key={user.id} className="user-card">
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Education:</strong> {user.education}</p>
                                        <button onClick={() => handlePending(user.id)} className="button-approve">
                                            Pending
                                        </button>

                                    </div>
                                ))
                            ) : (
                                <p>No students approved verification.</p>
                            )}
                        </div>
                    </div>
                    <h2>Advisors Accounts</h2>
                    <div className='Verification'>

                        <div className='blocksDashboard'>
                            <h3>Pending Verification</h3>
                            {Array.isArray(advisorsPending) && advisorsPending.length > 0 ? (
                                advisorsPending.map(user => (
                                    <div key={user.id} className="user-card">
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <button onClick={() => handleAdvisorApprove(user.id)} className="button-approve">
                                            Approve
                                        </button>
                                        <button onClick={() => handleAdvisorDecline(user.id)} className="button-decline">
                                            Decline
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No advisors pending verification.</p>
                            )}
                        </div>
                        <div className='blocksDashboard'>
                            <h3>Declined Verification</h3>
                            {Array.isArray(advisorsDeclined) && advisorsDeclined.length > 0 ? (
                                advisorsDeclined.map(user => (
                                    <div key={user.id} className="user-card">
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <button onClick={() => handleAdvisorPending(user.id)} className="button-approve">
                                            Pending
                                        </button>
                                        <button onClick={() => handleAdvisorDelete(user.id)} className="button-decline">
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No advisors pending verification.</p>
                            )}
                        </div>
                        <div className='blocksDashboard'>
                            <h3>Approved Verification</h3>
                            {Array.isArray(advisorsApproved) && advisorsApproved.length > 0 ? (
                                advisorsApproved.map(user => (
                                    <div key={user.id} className="user-card">
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <button onClick={() => handleAdvisorPending(user.id)} className="button-approve">
                                            Pending
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No advisors pending verification.</p>
                            )}
                        </div>
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

export default DepartmentAdminDashboard;
