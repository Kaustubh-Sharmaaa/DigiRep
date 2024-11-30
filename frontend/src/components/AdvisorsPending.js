import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';
const AdvisorsPending = () => {

    const navigate = useNavigate();
    const [advisorsPending, setAdvisorsPending] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const fetchData = () => {
        

        fetch('http://localhost:3001/api/advisors-pending')
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
            .catch(error => {
                console.log('Error fetching advisors:', error);
                setAdvisorsPending([]); // fallback to an empty array on error
            });
        

    }
    useEffect(() => {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        if (!userData) {
            navigate('/');
        }
        if (userData && userData.role == "Advisor") {
            navigate('/advisorDashboard')
        }
        fetchData();
    }, []);

    const handleApprove = (userId) => {
        fetch(`http://localhost:3001/api/approve-advisor/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(() => {
                fetchData();
            })
            .catch(error => console.error('Error pending Advisor:', error));
    };
    

    // Function to handle input changes in the search bar
    const handleSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
    setSearchTerm(term); // Update the searchTerm state with the input value
    console.log(term);

    if (term) {
        // If there's a search term, perform the search
        fetch(`http://localhost:3001/api/advisors-pending-search/${term}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
            .catch(error => {
                console.log('Error fetching advisors:', error);
                setAdvisorsPending([]); // fallback to an empty array on error
            });
    } else {
        // If the search term is empty, call fetchData
        fetchData();
    }
    };

    // Function to handle key down events, specifically for the Enter key
    const handlePendingAdvisorsSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm) {
            fetch(`http://localhost:3001/api/advisors-pending-search/${searchTerm}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
            .catch(error => {
                console.log('Error fetching advisors:', error);
                setAdvisorsPending([]); // fallback to an empty array on error
            });
        }
    };

    const handleClearSearch = (e) => {
        setSearchTerm('');
            fetch(`http://localhost:3001/api/advisors-pending`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setAdvisorsPending(data) : setAdvisorsPending([]))
            .catch(error => {
                console.log('Error fetching advisors:', error);
                setAdvisorsPending([]); // fallback to an empty array on error
            });
        
    };

    return (
        <div className="dashboard">
            <SearchNavbar />
            <br />

            <fieldset className='dashboardfs'>
                <div className='VerificationDashboard'>
                    <h2>Pending Verification Advisors Accounts</h2>
                    <div className='VerificationA'>
                        <div className='blocksDashboardd'>
                            
                            <input
                                type="text"
                                className='inputsn' // Class for styling the input
                                placeholder="Search Advisor by name or email" // Placeholder text
                                value={searchTerm} // Controlled input value
                                onChange={handleSearch} // Update state on input change
                                onKeyDown={handlePendingAdvisorsSearchKeyDown} // Listen for the Enter key
                            />
                            <button onClick={handleClearSearch}>Clear</button>
                            {Array.isArray(advisorsPending) && advisorsPending.length > 0 ? (
                                advisorsPending.map((user,index) => (
                                    <div key={user.id} className="updates-card">
                                        <p>{index+1}</p>
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Education:</strong> {user.education}</p>
                                        <button onClick={() => handleApprove(user.id)} className="approvebutton2">
                                            Approve
                                        </button>

                                    </div>
                                ))
                            ) : (
                                <p>No advisors pending verification.</p>
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

export default AdvisorsPending;
