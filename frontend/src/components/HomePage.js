import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/AboutUs.css';
import '../css/logo.css';
import HomeNavbar from './HomeNavBar';
import SearchNavbar from './SearchNavBar';
import ThesisCard from './ThesisCard';
import Footer from './Footer';
const HomePage = () => {
    const [userData, setUserData] = useState(null);
    const [latestUpdates, setLatestUpdates] = useState([]);
    const [likedTheses, setLikedTheses] = useState([]);
    const [downloadedtheses, setDownloadedTheses] = useState([]);
    const navigate = useNavigate();

    // Fetch user data on initial render
    useEffect(() => {
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        if (storedUserData) {
            setUserData(storedUserData);
        }
    }, []);

    // Fetch data for latest updates and liked theses
    const fetchData = () => {
        // Fetch latest updates
        fetch('http://localhost:3001/api/getlatestupdates')
            .then((response) => response.json())
            .then((data) => setLatestUpdates(Array.isArray(data) ? data : []))
            .catch((error) => {
                console.error('Error fetching latest updates:', error);
                setLatestUpdates([]);
            });

        // Fetch top liked theses
        fetch('http://localhost:3001/api/gettopthesis')
            .then((response) => response.json())
            .then((data) => setLikedTheses(Array.isArray(data) ? data : []))
            .catch((error) => {
                console.error('Error fetching top theses:', error);
                setLikedTheses([]);
            });

        fetch('http://localhost:3001/api/gettopdownloadeddetails')
            .then((response) => response.json())
            .then((data) => setDownloadedTheses(Array.isArray(data) ? data : []))
            .catch((error) => {
                console.error('Error fetching top theses:', error);
                setDownloadedTheses([]);
            });


    };

    // Fetch data on mount and set interval for polling
    useEffect(() => {
        fetchData(); // Initial data fetch

        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []); // Empty dependency array ensures it runs once

    // Format timestamp
    const formatSentAt = (sentAt) => {
        const date = new Date(sentAt);
        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Optional: Use 24-hour format
        });
    };

    // Navigate to thesis view
    const handleViewThesis = (id) => {
        navigate(`/viewthesis?query=${id}`);
    };

    return (
        <div>
            {userData ? <SearchNavbar /> : <HomeNavbar />}
            <div className="fcenter">
                <br></br>
                <fieldset className="fieldsetH">
                    <div className="thesis-card-container">
                        <h2>Introduction to Digital Thesis Repository System</h2>
                        <p>
                            The Digital Thesis Repository System is an innovative platform designed to streamline the management, storage, and sharing of academic theses and dissertations. As academic research continues to grow in volume and complexity, the need for a centralized, accessible system to store and retrieve scholarly work has never been more critical. Our system provides a secure, efficient, and user-friendly interface for students, faculty, and researchers to upload, view, and collaborate on academic documents, ensuring that valuable research is easily accessible to the academic community.
                        </p>
                        <p>
                            This platform is built to support not only the submission and retrieval of theses but also to foster engagement and collaboration through features like commenting, feedback, and research discussions. It helps to ensure that high-quality academic work is shared with a wider audience, making it possible for others to benefit from and build upon existing research. Additionally, our system includes advanced search functionalities, allowing users to quickly find documents based on specific keywords, authors, or fields of study.
                        </p>
                        <p>
                            By offering a robust infrastructure for academic work, the Digital Thesis Repository System also tracks engagement metrics such as the most viewed, downloaded, and liked theses, providing valuable insights to researchers and institutions alike. This encourages a data-driven approach to academic research, promoting visibility and recognition for outstanding contributions.
                        </p>
                        <p>
                            The goal of this system is to create a seamless experience for all users involved, from students submitting their work to researchers exploring the latest developments in their field. Our commitment is to provide a platform that supports academic growth, fosters collaboration, and ensures that knowledge is shared for the advancement of all.
                        </p>
                    </div>
                    <h2>Featured Theses</h2>
                    <div className="featured-theses">
                        <div>
                            <h3>Top Liked Thesis</h3>
                            {Array.isArray(likedTheses) && likedTheses.length > 0 ? (
                                likedTheses.slice(0, 1).map((thesis) => (
                                    <div key={thesis.thesisId} className="thesis-card-container">
                                        <ThesisCard key={thesis.thesisId} thesis={thesis} isTrending={true} />
                                        <p>{thesis.likesCount} likes</p>
                                    </div>
                                ))
                            ) : (
                                <p>No featured theses.</p>
                            )}

                        </div>

                        <div>
                            <h3>Top Downloaded Thesis</h3>
                            {Array.isArray(downloadedtheses) && downloadedtheses.length > 0 ? (
                                downloadedtheses.slice(0, 1).map((thesis) => (
                                    <div key={thesis.thesisId} className="thesis-card-container">
                                        <ThesisCard key={thesis.thesisId} thesis={thesis} isTrending={true} />
                                        <p>{thesis.downloadsCount} downloads</p>
                                    </div>
                                ))
                            ) : (
                                <p>No featured theses.</p>
                            )}

                        </div>
                    </div>
                    <br></br>
                    <h2>Latest Updates</h2>
                    {Array.isArray(latestUpdates) && latestUpdates.length > 0 ? (
                        latestUpdates.slice(0, 5).map((update, index) => (
                            <div
                                key={update.id}
                                className="updates-card"
                                onClick={() => handleViewThesis(update.thesisId)}
                            >
                                <p>{index + 1}</p>
                                <p>{update.updateMessage}</p>
                                <p className="time">{formatSentAt(update.updateAt)}</p>
                            </div>
                        ))
                    ) : (
                        <p>No latest updates.</p>
                    )}
                    <div>
                        <br></br>
                        <p className='thesis-card-container'>New Here? <Link to='/RegisterLogin'>Sign Up Now</Link></p>
                        <p className='thesis-card-container'>Have a question? <Link to='/contactus'>Contact Us</Link></p>
                    </div>
                </fieldset>
                <br></br>
                {userData ? <Footer /> : null}
            </div>
            <br />
            <br />
        </div>
    );
};

export default HomePage;
