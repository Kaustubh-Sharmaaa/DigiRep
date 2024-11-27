import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import SearchNavbar from "./SearchNavBar";
import '../css/DepartmentAdminDashboard.css';
import ThesisCard from './ThesisCard';
import PublishThesisCard from './PublishThesisCard';
import ChatComponent from './ChatComponent';
const MyTheses = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const [thesesPending, setThesesPending] = useState([]);
    const [thesesApproved, setThesesApproved] = useState([]);
    const [thesesPublished, setThesesPublished] = useState([]);
    const [thesesDeclined, setThesesDeclined] = useState([]);
    const keys = Object.keys(userData);
    const userid = userData[keys[1]];
    console.log(userid);

    const fetchData = () => {
        fetch(`http://localhost:3001/api/theses-pending/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesPending(data) : setThesesPending([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesPending([]); // fallback to an empty array on error
            });

        fetch(`http://localhost:3001/api/theses-approved/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesApproved(data) : setThesesApproved([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesApproved([]); // fallback to an empty array on error
            });
            fetch(`http://localhost:3001/api/theses-published/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesPublished(data) : setThesesPublished([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesPublished([]); // fallback to an empty array on error
            });
            fetch(`http://localhost:3001/api/theses-declined/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesDeclined(data) : setThesesDeclined([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesDeclined([]); // fallback to an empty array on error
            });
    };

    

    useEffect(() => {
        if (!userData) {
            navigate('/');
        }
        fetchData();
    }, []);

    return (
        <div className="dashboard">
            <SearchNavbar />
            <br />
            <fieldset className='dashboardmt'>
                <div className='MyThesesDashboard'>
                    <h2>My Theses</h2>
                    <div className='Verification'>
                        <main className="statistics-dashboard-content">
                            <section className="thesis-section">
                                <h2>Pending Review Theses</h2>
                                <div className="thesis-row">
                                    {thesesPending.length > 0 ? (
                                        thesesPending.map((thesis) => (
                                            <ThesisCard
                                                key={thesis.thesisId} // Ensure the key is unique
                                                thesis={thesis}
                                                isTrending={true}
                                            />
                                        ))
                                    ) : (
                                        <p>No content available.</p> // Display when no theses are found
                                    )}
                                </div>
                            </section>
                        </main>
                        <main className="statistics-dashboard-content">
                            <section className="thesis-section">
                                <h2>Ready to Publish Theses</h2>
                                <div className="thesis-row">
                                    {thesesApproved.length > 0 ? (
                                        thesesApproved.map((thesis) => (
                                            <div key={thesis.thesisId}>
                                                <PublishThesisCard
                                                    thesis={thesis}
                                                    isTrending={true}
                                                    onActionComplete={fetchData}
                                                />
                                                
                                            </div>
                                        ))
                                    ) : (
                                        <p>No content available.</p> // Display when no theses are found
                                    )}
                                </div>
                            </section>
                        </main>
                        <main className="statistics-dashboard-content">
                            <section className="thesis-section">
                                <h2>Published Theses</h2>
                                <div className="thesis-row">
                                    {thesesPublished.length > 0 ? (
                                        thesesPublished.map((thesis) => (
                                            <ThesisCard
                                                key={thesis.thesisId} // Ensure the key is unique
                                                thesis={thesis}
                                                isTrending={true}
                                            />
                                        ))
                                    ) : (
                                        <p>No content available.</p> // Display when no theses are found
                                    )}
                                </div>
                            </section>
                        </main>
                        <main className="statistics-dashboard-content">
                            <section className="thesis-section">
                                <h2>Declined Theses</h2>
                                <div className="thesis-row">
                                    {thesesDeclined.length > 0 ? (
                                        thesesDeclined.map((thesis) => (
                                            <ThesisCard
                                                key={thesis.thesisId} // Ensure the key is unique
                                                thesis={thesis}
                                                isTrending={true}
                                            />
                                        ))
                                    ) : (
                                        <p>No content available.</p> // Display when no theses are found
                                    )}
                                </div>
                            </section>
                        </main>
                    </div>
                    <br />
                    
                </div>
                
                    <br></br>
            </fieldset>
            <br></br>
            <div className='input3'>
                        <button className="button-85" onClick={() => navigate('/submit-thesis')}>
                            Submit a new thesis
                        </button>
                    </div>
            <br />
            <Footer />
            <ChatComponent/>
        </div>
    );
}

export default MyTheses;
