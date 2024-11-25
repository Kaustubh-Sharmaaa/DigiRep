import React, { useRef, useEffect, useState } from 'react';
import Navbar from './NavBar';
import Footer from './Footer';
import '../css/Statistics.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ThesisCard from './ThesisCard';
import SearchNavbar from './SearchNavBar';
import ChatComponent from './ChatComponent';
import Chat from './Chat';

function CategoryBlock({ onSelectCategory }) {
    
    return (
        <fieldset className='dashboardfs'>
            <div className='VerificationDashboard'>
                &nbsp;
                &nbsp;&nbsp;
                &nbsp;
                <div className='buttons'>

                    <button className="button-85" onClick={() => onSelectCategory('Most Recent')}>
                        Most Recent
                    </button>
                    &nbsp;&nbsp;
                    <button className="button-85" onClick={() => onSelectCategory('Most Liked')}>
                        Most Liked
                    </button>
                    &nbsp;&nbsp;
                    <button className="button-85" onClick={() => onSelectCategory('Most Downloads')}>
                        Most Downloads
                    </button>
                    &nbsp;&nbsp;

                </div>
            </div>
        </fieldset>
    );
}

function MostRecent() {
    const [theses, setTheses] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query')?.toLowerCase() || '';

    useEffect(() => {
        fetch('http://localhost:3001/api/getmostrecentdetails')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Assuming the backend returns an array of theses
                const filteredData = data.filter(thesis =>
                    thesis.title.toLowerCase().includes(searchTerm) ||
                    (thesis.authors && thesis.authors.toLowerCase().includes(searchTerm)) ||
                    (thesis.keywords && thesis.keywords.toLowerCase().includes(searchTerm))
                ).slice(0, 4); // Limit to top 4 most recent theses, adjust as needed
                setTheses(filteredData);
            })
            .catch(error => {
                console.error('Error:', error);
                setTheses([]); // Ensure the state is set to an empty array on error
            });
    }, [searchTerm]);

    return (
        <div className="statistics-dashboard">
            <main className="statistics-dashboard-content">
                <section className="thesis-section">
                    <h2>The Most Recent</h2>
                    <div className="thesis-row">
                        {theses.length > 0 ? (
                            theses.map((thesis) => (
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
    );
}

function MostDownloaded() {
    const [theses, setTheses] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query')?.toLowerCase() || '';

    useEffect(() => {
        fetch('http://localhost:3001/api/gettopdownloadeddetails')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Assuming the backend returns an array of theses
                const filteredData = data.filter(thesis =>
                    thesis.title.toLowerCase().includes(searchTerm) ||
                    (thesis.authors && thesis.authors.toLowerCase().includes(searchTerm)) ||
                    (thesis.keywords && thesis.keywords.toLowerCase().includes(searchTerm))
                ).slice(0, 4); // Limit to top 4 most recent theses, adjust as needed
                setTheses(filteredData);
            })
            .catch(error => {
                console.error('Error:', error);
                setTheses([]); // Ensure the state is set to an empty array on error
            });
    }, [searchTerm]);

    return (
        <div className="statistics-dashboard">
            <main className="statistics-dashboard-content">
                <section className="thesis-section">
                    <h2>The Most Downloaded</h2>
                    <div className="thesis-row">
                        {theses.length > 0 ? (
                            theses.map((thesis) => (
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
    );
}

function MostLiked() {
    const [theses, setTheses] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query')?.toLowerCase() || '';

    useEffect(() => {
        fetch('http://localhost:3001/api/gettopthesisdetails')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Assuming the backend returns an array of theses
                const filteredData = data.filter(thesis =>
                    thesis.title.toLowerCase().includes(searchTerm) ||
                    (thesis.authors && thesis.authors.toLowerCase().includes(searchTerm)) ||
                    (thesis.keywords && thesis.keywords.toLowerCase().includes(searchTerm))
                ).slice(0, 5); // Limit to top 4 most recent theses, adjust as needed
                setTheses(filteredData);
            })
            .catch(error => {
                console.error('Error:', error);
                setTheses([]); // Ensure the state is set to an empty array on error
            });
    }, [searchTerm]);

    return (
        <div className="statistics-dashboard">
            <main className="statistics-dashboard-content">
                <section className="thesis-section">
                    <h2>The Most Liked</h2>
                    <div className="thesis-row">
                        {theses.length > 0 ? (
                            theses.map((thesis) => (
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
    );
}

const Statistics = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        if (storedUserData) {
            setUserData(storedUserData);
        }
    }, []);
    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
    };
   
    return (
        <div className="FullPage">
            <SearchNavbar />
            <br></br>
            <CategoryBlock onSelectCategory={handleSelectCategory} />
            {selectedCategory === 'Most Recent' && <MostRecent />}
            {selectedCategory === 'Most Liked' && <MostLiked />}
            {selectedCategory === 'Most Downloads' && <MostDownloaded />}
            <Footer />
            {userData && userData?.role != 'Department Admin'? <ChatComponent/>:null}
        </div>
    );
};




export default Statistics;
