import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';

const StudentsPending = () => {

    const navigate = useNavigate();
    const [studentsPending, setStudentsPending] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const fetchData = () => {
        

        fetch('http://localhost:3001/api/students-pending')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsPending(data) : setStudentsPending([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsPending([]); // fallback to an empty array on error
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
            .catch(error => console.error('Error pending Student:', error));
    };
    

    // Function to handle input changes in the search bar
    const handleSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
    setSearchTerm(term); // Update the searchTerm state with the input value
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
        fetchData();
    }
    };

    // Function to handle key down events, specifically for the Enter key
    const handlePendingStudentsSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm) {
            fetch(`http://localhost:3001/api/students-pending-search/${searchTerm}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsPending(data) : setStudentsPending([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsPending([]); // fallback to an empty array on error
            });
        }
    };

    const handleClearSearch = (e) => {
        setSearchTerm('');
            fetch(`http://localhost:3001/api/students-pending`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setStudentsPending(data) : setStudentsPending([]))
            .catch(error => {
                console.log('Error fetching students:', error);
                setStudentsPending([]); // fallback to an empty array on error
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
                                className='inputsn' // Class for styling the input
                                placeholder="Search Student by name or email" // Placeholder text
                                value={searchTerm} // Controlled input value
                                onChange={handleSearch} // Update state on input change
                                onKeyDown={handlePendingStudentsSearchKeyDown} // Listen for the Enter key
                            />
                            <button onClick={handleClearSearch}>Clear</button>
                            {Array.isArray(studentsPending) && studentsPending.length > 0 ? (
                                studentsPending.map(user => (
                                    <div key={user.id} className="user-card">
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Education:</strong> {user.education}</p>
                                        <button onClick={() => handleApprove(user.id)} className="button-approve">
                                            Approve
                                        </button>

                                    </div>
                                ))
                            ) : (
                                <p>No students pending verification.</p>
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

}

export default StudentsPending;
