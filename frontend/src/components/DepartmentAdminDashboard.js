import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';
import { FaNfcSymbol } from 'react-icons/fa6';

const DepartmentAdminDashboard = () => {
    const navigate = useNavigate();
    const [studentsPending, setStudentsPending] = useState([]);
    const [studentsApproved, setStudentsApproved] = useState([]);
    const [studentsDeclined, setStudentsDeclined] = useState([]);
    const [advisorsPending, setAdvisorsPending] = useState([]);
    const [advisorsApproved, setAdvisorsApproved] = useState([]);
    const [advisorsDeclined, setAdvisorsDeclined] = useState([]);
    const [studentApprovedsearchTerm, setStudentApprovedSearchTerm] = useState('');
    const [studentPendingsearchTerm, setStudentPendingSearchTerm] = useState('');
    const [studentDeclinedsearchTerm, setStudentDeclinedSearchTerm] = useState('');
    const [advisorApprovedsearchTerm, setAdvisorApprovedSearchTerm] = useState('');
    const [advisorPendingsearchTerm, setAdvisorPendingSearchTerm] = useState('');
    const [advisorDeclinedsearchTerm, setAdvisorDeclinedSearchTerm] = useState('');
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

    const fetchStudentsApproved = () => {
        fetch('http://localhost:3001/api/students-approved')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsApproved(data) : setStudentsApproved([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsApproved([]); // fallback to an empty array on error
            });
    };

    const fetchStudentsDeclined = () => {
        fetch('http://localhost:3001/api/students-declined')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsDeclined(data) : setStudentsDeclined([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsDeclined([]); // fallback to an empty array on error
            });
    };

    const fetchStudentsPending = () => {
        fetch('http://localhost:3001/api/students-pending')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsPending(data) : setStudentsPending([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsPending([]); // fallback to an empty array on error
            });
    };

    //here
    const fetchAdvisorsApproved = () => {
        fetch('http://localhost:3001/api/advisors-approved')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsApproved(data) : setAdvisorsApproved([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setAdvisorsApproved([]); // fallback to an empty array on error
            });
    };

    const fetchAdvisorsDeclined = () => {
        fetch('http://localhost:3001/api/advisors-declined')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsDeclined(data) : setAdvisorsDeclined([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setAdvisorsDeclined([]); // fallback to an empty array on error
            });
    };

    const fetchAdvisorsPending = () => {
        fetch('http://localhost:3001/api/advisors-pending')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setAdvisorsPending([]); // fallback to an empty array on error
            });
    };

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

    // Function to handle input changes in the search bar
    const handleStudentsApprovedSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setStudentApprovedSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/students-approved-search/${term}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setStudentsApproved(data) : setStudentsApproved([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setStudentsApproved([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchStudentsApproved();;
        }
    };

    // Function to handle key down events, specifically for the Enter key
    const handleApprovedStudentsSearchKeyDown = (e) => {
        if (e.key === 'Enter' && studentApprovedsearchTerm) {
            fetch(`http://localhost:3001/api/students-approved-search/${studentApprovedsearchTerm}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setStudentsApproved(data) : setStudentsApproved([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setStudentsApproved([]); // fallback to an empty array on error
                });
        }
    };

    const handleStudentsApprovedClearSearch = (e) => {
        setStudentApprovedSearchTerm('');
        fetch(`http://localhost:3001/api/students-approved`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsApproved(data) : setStudentsApproved([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsApproved([]); // fallback to an empty array on error
            });

    };

    // Function to handle input changes in the search bar
    const handleStudentsDeclinedSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setStudentDeclinedSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/students-declined-search/${term}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setStudentsDeclined(data) : setStudentsDeclined([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setStudentsDeclined([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchStudentsDeclined();
        }
    };

    // Function to handle key down events, specifically for the Enter key
    const handleDeclinedStudentsSearchKeyDown = (e) => {
        if (e.key === 'Enter' && studentDeclinedsearchTerm) {
            fetch(`http://localhost:3001/api/students-declined-search/${studentDeclinedsearchTerm}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setStudentsDeclined(data) : setStudentsDeclined([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setStudentsDeclined([]); // fallback to an empty array on error
                });
        }
    };

    const handleStudentsDeclinedClearSearch = (e) => {
        setStudentDeclinedSearchTerm('');
        fetch(`http://localhost:3001/api/students-declined`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsDeclined(data) : setStudentsDeclined([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsDeclined([]); // fallback to an empty array on error
            });

    };

    // Function to handle input changes in the search bar
    const handleStudentsPendingSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setStudentPendingSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/students-pending-search/${term}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setStudentsPending(data) : setStudentsPending([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setStudentsPending([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchStudentsPending();;
        }
    };

    // Function to handle key down events, specifically for the Enter key
    const handlePendingStudentsSearchKeyDown = (e) => {
        if (e.key === 'Enter' && studentPendingsearchTerm) {
            fetch(`http://localhost:3001/api/students-approved-search/${studentPendingsearchTerm}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setStudentsPending(data) : setStudentsPending([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setStudentsPending([]); // fallback to an empty array on error
                });
        }
    };

    const handleStudentsPendingClearSearch = (e) => {
        setStudentPendingSearchTerm('');
        fetch(`http://localhost:3001/api/students-pending`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsPending(data) : setStudentsPending([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsPending([]); // fallback to an empty array on error
            });

    };

    //here
    // Function to handle input changes in the search bar
    const handleAdvisorsApprovedSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setAdvisorApprovedSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/advisors-approved-search/${term}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setAdvisorsApproved(data) : setAdvisorsApproved([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setAdvisorsApproved([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchAdvisorsApproved();;
        }
    };

    // Function to handle key down events, specifically for the Enter key
    const handleApprovedAdvisorsSearchKeyDown = (e) => {
        if (e.key === 'Enter' && studentApprovedsearchTerm) {
            fetch(`http://localhost:3001/api/advisors-approved-search/${studentApprovedsearchTerm}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setAdvisorsApproved(data) : setAdvisorsApproved([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setAdvisorsApproved([]); // fallback to an empty array on error
                });
        }
    };

    const handleAdvisorsApprovedClearSearch = (e) => {
        setAdvisorApprovedSearchTerm('');
        fetch(`http://localhost:3001/api/advisors-approved`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsApproved(data) : setAdvisorsApproved([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsApproved([]); // fallback to an empty array on error
            });

    };

    // Function to handle input changes in the search bar
    const handleAdvisorsDeclinedSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setAdvisorDeclinedSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/advisors-declined-search/${term}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setAdvisorsDeclined(data) : setAdvisorsDeclined([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setAdvisorsDeclined([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchAdvisorsDeclined();
        }
    };

    // Function to handle key down events, specifically for the Enter key
    const handleDeclinedAdvisorsSearchKeyDown = (e) => {
        if (e.key === 'Enter' && advisorDeclinedsearchTerm) {
            fetch(`http://localhost:3001/api/advisors-declined-search/${advisorDeclinedsearchTerm}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setAdvisorsDeclined(data) : setAdvisorsDeclined([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setAdvisorsDeclined([]); // fallback to an empty array on error
                });
        }
    };

    const handleAdvisorsDeclinedClearSearch = (e) => {
        setAdvisorDeclinedSearchTerm('');
        fetch(`http://localhost:3001/api/advisors-declined`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsDeclined(data) : setAdvisorsDeclined([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setAdvisorsDeclined([]); // fallback to an empty array on error
            });

    };

    // Function to handle input changes in the search bar
    const handleAdvisorsPendingSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setAdvisorPendingSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/advisors-pending-search/${advisorPendingsearchTerm}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setAdvisorsPending([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchAdvisorsPending();;
        }
    };

    // Function to handle key down events, specifically for the Enter key
    const handlePendingAdvisorsSearchKeyDown = (e) => {
        if (e.key === 'Enter' && advisorPendingsearchTerm) {
            fetch(`http://localhost:3001/api/advisors-pending-search/${advisorPendingsearchTerm}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setAdvisorsPending([]); // fallback to an empty array on error
                });
        }
    };

    const handleAdvisorsPendingClearSearch = (e) => {
        setAdvisorPendingSearchTerm('');
        fetch(`http://localhost:3001/api/advisors-pending-search/${advisorPendingsearchTerm}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setAdvisorsPending([]); // fallback to an empty array on error
            });

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
                            <input
                                type="text"
                                className='inputsnn' // Class for styling the input
                                placeholder="Search Student by name or email" // Placeholder text
                                value={studentPendingsearchTerm} // Controlled input value
                                onChange={handleStudentsPendingSearch} // Update state on input change
                                onKeyDown={handlePendingStudentsSearchKeyDown} // Listen for the Enter key
                            /><button onClick={handleStudentsPendingClearSearch}>Clear</button>
                            {Array.isArray(studentsPending) && studentsPending.length > 0 ? (
                                studentsPending.slice(0, 3).map(user => (
                                    <div key={user.id} className="user-card">
                                        <div>
                                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                            <p><strong>Email:</strong> {user.email}</p>
                                            <p><strong>Education:</strong> {user.education}</p>
                                        </div>
                                        <div>
                                            <button onClick={() => handleApprove(user.id)} className="button-approve">
                                                Approve
                                            </button>
                                            <button onClick={() => handleDecline(user.id)} className="button-decline">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No students pending verification.</p>
                            )}
                            <br></br>
                            {studentsPending.length > 3 && (
                                <a href='/studentsPending'>View All Pending Students</a>
                            )}
                            <br></br>
                            <br></br>
                        </div>
                        <div className='blocksDashboard'>
                            <h3>Declined Verification</h3>
                            <input
                                type="text"
                                className='inputsnn' // Class for styling the input
                                placeholder="Search Student by name or email" // Placeholder text
                                value={studentDeclinedsearchTerm} // Controlled input value
                                onChange={handleStudentsDeclinedSearch} // Update state on input change
                                onKeyDown={handleDeclinedStudentsSearchKeyDown} // Listen for the Enter key
                            /><button onClick={handleStudentsDeclinedClearSearch}>Clear</button>
                            {Array.isArray(studentsDeclined) && studentsDeclined.length > 0 ? (
                                studentsDeclined.slice(0, 3).map(user => (
                                    <div key={user.id} className="user-card">
                                        <div>
                                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                            <p><strong>Email:</strong> {user.email}</p>
                                            <p><strong>Education:</strong> {user.education}</p>
                                        </div>
                                        <div>
                                            <button onClick={() => handlePending(user.id)} className="button-approve">
                                                Pending
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="button-approve">
                                                Delete
                                            </button>
                                        </div>

                                    </div>
                                ))
                            ) : (
                                <p>No students declined verification.</p>
                            )}
                            <br></br>
                            {studentsDeclined.length > 3 && (
                                <a href='/studentsDeclined'>View All Declined Students</a>
                            )}
                            <br></br>
                            <br></br>
                        </div>
                        <div className='blocksDashboard'>
                            <h3>Approved Verification</h3>
                            <input
                                type="text"
                                className='inputsnn' // Class for styling the input
                                placeholder="Search Student by name or email" // Placeholder text
                                value={studentApprovedsearchTerm} // Controlled input value
                                onChange={handleStudentsApprovedSearch} // Update state on input change
                                onKeyDown={handleApprovedStudentsSearchKeyDown} // Listen for the Enter key
                            />
                            <button onClick={handleStudentsApprovedClearSearch}>Clear</button>
                            {Array.isArray(studentsApproved) && studentsApproved.length > 0 ? (
                                studentsApproved.slice(0, 3).map(user => (
                                    <div key={user.id} className="user-card">
                                        <div>
                                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                            <p><strong>Email:</strong> {user.email}</p>
                                            <p><strong>Education:</strong> {user.education}</p>
                                        </div>
                                        <div>
                                            <button onClick={() => handlePending(user.id)} className="button-approve">
                                                Pending
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No students approved verification.</p>
                            )}

                            {studentsApproved.length > 3 && (
                                <a href='/studentsApproved'>View All Approved Students</a>
                            )}
                            &nbsp;
                        </div>
                    </div>
                    <h2>Advisors Accounts</h2>
                    <div className='Verification'>

                        <div className='blocksDashboard'>
                            <h3>Pending Verification</h3>
                            <input
                                type="text"
                                className='inputsnn' // Class for styling the input
                                placeholder="Search Advisor by name or email" // Placeholder text
                                value={advisorPendingsearchTerm} // Controlled input value
                                onChange={handleAdvisorsPendingSearch} // Update state on input change
                                onKeyDown={handlePendingAdvisorsSearchKeyDown} // Listen for the Enter key
                            /><button onClick={handleAdvisorsPendingClearSearch}>Clear</button>
                            {Array.isArray(advisorsPending) && advisorsPending.length > 0 ? (
                                advisorsPending.map(user => (
                                    <div key={user.id} className="user-card">
                                        <div>
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Education:</strong> {user.education}</p>
                                        </div>
                                        <div>
                                        <button onClick={() => handleAdvisorApprove(user.id)} className="button-approve">
                                            Approve
                                        </button>
                                        <button onClick={() => handleAdvisorDecline(user.id)} className="button-decline">
                                            Decline
                                        </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No advisors pending verification.</p>
                            )}

                            <br></br>
                            {advisorsPending.length > 3 && (
                                <a href='/advisorsPending'>View All Pending Advisors</a>
                            )}
                            <br></br>
                            <br></br>
                        </div>
                        <div className='blocksDashboard'>
                            <h3>Declined Verification</h3>
                            <input
                                type="text"
                                className='inputsnn' // Class for styling the input
                                placeholder="Search Advisor by name or email" // Placeholder text
                                value={advisorDeclinedsearchTerm} // Controlled input value
                                onChange={handleAdvisorsDeclinedSearch} // Update state on input change
                                onKeyDown={handleDeclinedAdvisorsSearchKeyDown} // Listen for the Enter key
                            /><button onClick={handleAdvisorsDeclinedClearSearch}>Clear</button>
                            {Array.isArray(advisorsDeclined) && advisorsDeclined.length > 0 ? (
                                advisorsDeclined.map(user => (
                                    <div key={user.id} className="user-card">
                                        <div>
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Education:</strong> {user.education}</p>
                                        </div>
                                        <div>
                                        <button onClick={() => handleAdvisorPending(user.id)} className="button-approve">
                                            Pending
                                        </button>
                                        <button onClick={() => handleAdvisorDelete(user.id)} className="button-decline">
                                            Delete
                                        </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No advisors declined verification.</p>
                            )}

                            <br></br>
                            {advisorsDeclined.length > 3 && (
                                <a href='/advisorsDeclined'>View All Declined Advisors</a>
                            )}
                            <br></br>
                            <br></br>
                        </div>
                        <div className='blocksDashboard'>
                            <h3>Approved Verification</h3>
                            <input
                                type="text"
                                className='inputsnn' // Class for styling the input
                                placeholder="Search Advisor by name or email" // Placeholder text
                                value={advisorApprovedsearchTerm} // Controlled input value
                                onChange={handleAdvisorsApprovedSearch} // Update state on input change
                                onKeyDown={handleApprovedAdvisorsSearchKeyDown} // Listen for the Enter key
                            /><button onClick={handleAdvisorsApprovedClearSearch}>Clear</button>
                            {Array.isArray(advisorsApproved) && advisorsApproved.length > 0 ? (
                                advisorsApproved.map(user => (
                                    <div key={user.id} className="user-card">
                                        <div>
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Education:</strong> {user.education}</p>
                                        </div>
                                        <div>
                                        <button onClick={() => handleAdvisorPending(user.id)} className="button-approve">
                                            Pending
                                        </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No advisors approved verification.</p>
                            )}

                            <br></br>
                            {advisorsApproved.length > 3 && (
                                <a href='/advisorsApproved'>View All Approved Advisors</a>
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
