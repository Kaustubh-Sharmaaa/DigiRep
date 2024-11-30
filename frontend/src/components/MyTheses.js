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

    // Pagination states
    const [pendingPage, setPendingPage] = useState(1);
    const [approvedPage, setApprovedPage] = useState(1);
    const [publishedPage, setPublishedPage] = useState(1);
    const [declinedPage, setDeclinedPage] = useState(1);
    const thesesPerPage = 3;

    const keys = Object.keys(userData);
    const userid = userData[keys[1]];

    const [publishedSearchTerm, setPublishedSearchTerm] = useState('');
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [declinedSearchTerm, setDeclinedSearchTerm] = useState('');
    const [approvedSearchTerm, setApprovedSearchTerm] = useState('');

    const fetchData = () => {
        fetch(`http://localhost:3001/api/theses-pending/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesPending(data) : setThesesPending([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesPending([]);
            });

        fetch(`http://localhost:3001/api/theses-approved/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesApproved(data) : setThesesApproved([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesApproved([]);
            });

        fetch(`http://localhost:3001/api/theses-published/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesPublished(data) : setThesesPublished([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesPublished([]);
            });

        fetch(`http://localhost:3001/api/theses-declined/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesDeclined(data) : setThesesDeclined([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesDeclined([]);
            });
    };

    useEffect(() => {
        if (!userData) {
            navigate('/');
        }
        fetchData();
    }, []);

    // Helper function to calculate paginated theses
    const paginate = (theses, currentPage) => {
        const startIndex = (currentPage - 1) * thesesPerPage;
        return theses.slice(startIndex, startIndex + thesesPerPage);
    };

    // Pagination buttons
    const renderPagination = (totalTheses, currentPage, setPage) => {
        const totalPages = Math.ceil(totalTheses / thesesPerPage);
        return totalPages > 1 ? (
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => setPage(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        ) : null;
    };
    //pending theses

    const fetchPendingTheses = () => {
        fetch(`http://localhost:3001/api/theses-pending/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesPending(data) : setThesesPending([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesPending([]);
            });
    };

    const handlePendingThesisSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setPendingSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/student-pending-thesis-search/${userData.studentID}?searchTerm=${encodeURIComponent(term)}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setThesesPending(data) : setThesesPending([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setThesesPending([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchPendingTheses();;
        }
    };
    const handlePendingSearchKeyDown = (e) => {
        if (e.key === 'Enter' && pendingSearchTerm) {
            fetch(`http://localhost:3001/api/student-published-thesis-search/${userData.studentID}?searchTerm=${encodeURIComponent(pendingSearchTerm)}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setThesesPending(data) : setThesesPending([]))
                .catch(error => {
                    console.log('Error fetching theses:', error);
                    setThesesPending([]); // fallback to an empty array on error
                });
        }
    };

    const handlePendingClearSearch = (e) => {
        setPendingSearchTerm('');
        fetch(`http://localhost:3001/api/theses-pending/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesPending(data) : setThesesPending([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesPending([]);
            });

    };

    //published theses
    const fetchPublishedTheses = () => {
        fetch(`http://localhost:3001/api/theses-published/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesPublished(data) : setThesesPublished([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesPublished([]);
            });
    };

    const handlePublishedThesisSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setPublishedSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/student-published-thesis-search/${userData.studentID}?searchTerm=${encodeURIComponent(term)}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setThesesPublished(data) : setThesesPublished([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setThesesPublished([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchPublishedTheses();;
        }
    };
    const handlePublishedSearchKeyDown = (e) => {
        if (e.key === 'Enter' && publishedSearchTerm) {
            fetch(`http://localhost:3001/api/student-published-thesis-search/${userData.studentID}?searchTerm=${encodeURIComponent(publishedSearchTerm)}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setThesesPublished(data) : setThesesPublished([]))
                .catch(error => {
                    console.log('Error fetching theses:', error);
                    setThesesPublished([]); // fallback to an empty array on error
                });
        }
    };

    const handlePublishedClearSearch = (e) => {
        setPublishedSearchTerm('');
        fetch(`http://localhost:3001/api/theses-published/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesPublished(data) : setThesesPublished([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesPublished([]);
            });

    };


    //ready to publish


    const fetchApprovedTheses = () => {
        fetch(`http://localhost:3001/api/theses-approved/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesApproved(data) : setThesesApproved([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesApproved([]);
            });
    };

    const handleApprovedThesisSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setPendingSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/student-approved-thesis-search/${userData.studentID}?searchTerm=${encodeURIComponent(term)}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setThesesApproved(data) : setThesesApproved([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setThesesApproved([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchPendingTheses();;
        }
    };
    const handleApprovedSearchKeyDown = (e) => {
        if (e.key === 'Enter' && approvedSearchTerm) {
            fetch(`http://localhost:3001/api/student-approved-thesis-search/${userData.studentID}?searchTerm=${encodeURIComponent(pendingSearchTerm)}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setThesesApproved(data) : setThesesApproved([]))
                .catch(error => {
                    console.log('Error fetching theses:', error);
                    setThesesApproved([]); // fallback to an empty array on error
                });
        }
    };

    const handleApprovedClearSearch = (e) => {
        setApprovedSearchTerm('');
        fetch(`http://localhost:3001/api/theses-approved/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesApproved(data) : setThesesApproved([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesApproved([]);
            });

    };

    //declined theses
    const fetchDeclinedTheses = () => {
        fetch(`http://localhost:3001/api/theses-declined/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesDeclined(data) : setThesesDeclined([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesDeclined([]);
            });
    };

    const handleDeclinedThesisSearch = (e) => {
        const term = e.target.value; // Store the current value in a variable
        setDeclinedSearchTerm(term); // Update the searchTerm state with the input value
        console.log(term);

        if (term) {
            // If there's a search term, perform the search
            fetch(`http://localhost:3001/api/student-declined-thesis-search/${userData.studentID}?searchTerm=${encodeURIComponent(term)}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setThesesDeclined(data) : setThesesDeclined([]))
                .catch(error => {
                    console.log('Error fetching students:', error);
                    setThesesDeclined([]); // fallback to an empty array on error
                });
        } else {
            // If the search term is empty, call fetchData
            fetchDeclinedTheses();;
        }
    };
    const handleDeclinedSearchKeyDown = (e) => {
        if (e.key === 'Enter' && declinedSearchTerm) {
            fetch(`http://localhost:3001/api/student-declined-thesis-search/${userData.studentID}?searchTerm=${encodeURIComponent(declinedSearchTerm)}`)
                .then(response => response.json())
                .then(data => Array.isArray(data) ? setThesesDeclined(data) : setThesesDeclined([]))
                .catch(error => {
                    console.log('Error fetching theses:', error);
                    setThesesDeclined([]); // fallback to an empty array on error
                });
        }
    };

    const handleDeclinedClearSearch = (e) => {
        setDeclinedSearchTerm('');
        fetch(`http://localhost:3001/api/theses-declined/${userid}`)
            .then(response => response.json())
            .then(data => Array.isArray(data) ? setThesesDeclined(data) : setThesesDeclined([]))
            .catch(error => {
                console.log('Error fetching theses:', error);
                setThesesDeclined([]);
            });

    };
    return (
        <div className="dashboard">
            <SearchNavbar />
            <br />
            <fieldset className='dashboardmt'>
                <div className='MyThesesDashboard'>
                    <h2>My Theses</h2>
                    <br />
                    <div className='input3'>
                        <button className="button-85" onClick={() => navigate('/submit-thesis')}>
                            Submit a new thesis
                        </button>
                    </div>
                    <div className='Verificationn'>
                        {/* Pending Theses */}
                        <div className="statistics-dashboard-content-mt">
                            <section className="thesis-section">
                                <h2>Pending Review Theses</h2>
                                {thesesPending.length>0 && (
                                    <div className="input33">
                                        <input
                                            type="text"
                                            className="inputsnn"
                                            placeholder="Search Thesis by title or abstract"
                                            value={pendingSearchTerm} // Controlled input value
                                            onChange={handlePendingThesisSearch} // Update state on input change
                                            onKeyDown={handlePendingSearchKeyDown} // Handle keypress events
                                        />&nbsp;
                                        <button className="clearbutton2" onClick={handlePendingClearSearch}>
                                            Clear
                                        </button>

                                    </div>

                                )}
                                <br></br>
                                <div className="thesis-row">
                                    {paginate(thesesPending, pendingPage).length > 0 ? (
                                        paginate(thesesPending, pendingPage).map((thesis) => (
                                            <ThesisCard
                                                key={thesis.thesisId}
                                                thesis={thesis}
                                                isTrending={true}
                                            />
                                        ))
                                    ) : (
                                        <p>No content available.</p>
                                    )}
                                </div>
                                {renderPagination(thesesPending.length, pendingPage, setPendingPage)}
                            </section>
                        </div>

                        {/* Approved Theses */}
                        <div className="statistics-dashboard-content-mt">
                            <section className="thesis-section">
                                <h2>Ready to Publish Theses</h2>
                                {thesesApproved.length>0 && (
                                    <div className="input33">
                                        <input
                                            type="text"
                                            className="inputsnn"
                                            placeholder="Search Thesis by title or abstract"
                                            value={approvedSearchTerm} // Controlled input value
                                            onChange={handleApprovedThesisSearch} // Update state on input change
                                            onKeyDown={handleApprovedSearchKeyDown} // Handle keypress events
                                        />&nbsp;
                                        <button className="clearbutton2" onClick={handleApprovedClearSearch}>
                                            Clear
                                        </button>

                                    </div>

                                )}
                                <br></br>
                                <div className="thesis-row">
                                    {paginate(thesesApproved, approvedPage).length > 0 ? (
                                        paginate(thesesApproved, approvedPage).map((thesis) => (
                                            <div key={thesis.thesisId}>
                                                <PublishThesisCard
                                                    thesis={thesis}
                                                    isTrending={true}
                                                    onActionComplete={fetchData}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <p>No content available.</p>
                                    )}
                                </div>
                                {renderPagination(thesesApproved.length, approvedPage, setApprovedPage)}
                            </section>
                        </div>

                        {/* Published Theses */}
                        <div className="statistics-dashboard-content-mt">
                            <section className="thesis-section">
                                <h2>Published Theses</h2>
                                {thesesPublished.length>0 && (
                                    <div className="input33">
                                        <input
                                            type="text"
                                            className="inputsnn"
                                            placeholder="Search Thesis by title or abstract"
                                            value={publishedSearchTerm} // Controlled input value
                                            onChange={handlePublishedThesisSearch} // Update state on input change
                                            onKeyDown={handlePublishedSearchKeyDown} // Handle keypress events
                                        />&nbsp;
                                        <button className="clearbutton2" onClick={handlePublishedClearSearch}>
                                            Clear
                                        </button>

                                    </div>

                                )}
                                <br></br>
                                <div className="thesis-row">
                                    {paginate(thesesPublished, publishedPage).length > 0 ? (
                                        paginate(thesesPublished, publishedPage).map((thesis) => (
                                            <ThesisCard
                                                key={thesis.thesisId}
                                                thesis={thesis}
                                                isTrending={true}
                                            />
                                        ))
                                    ) : (
                                        <p>No content available.</p>
                                    )}
                                </div>
                                {renderPagination(thesesPublished.length, publishedPage, setPublishedPage)}
                            </section>
                        </div>

                        {/* Declined Theses */}
                        <div className="statistics-dashboard-content-mt">
                            <section className="thesis-section">
                                <h2>Declined Theses</h2>
                                {thesesDeclined.length>0 && (
                                    <div className="input33">
                                        <input
                                            type="text"
                                            className="inputsnn"
                                            placeholder="Search Thesis by title or abstract"
                                            value={declinedSearchTerm} // Controlled input value
                                            onChange={handleDeclinedThesisSearch} // Update state on input change
                                            onKeyDown={handleDeclinedSearchKeyDown} // Handle keypress events
                                        />&nbsp;
                                        <button className="clearbutton2" onClick={handleDeclinedClearSearch}>
                                            Clear
                                        </button>

                                    </div>

                                )}
                                <br></br>
                                <div className="thesis-row">
                                    {paginate(thesesDeclined, declinedPage).length > 0 ? (
                                        paginate(thesesDeclined, declinedPage).map((thesis) => (
                                            <ThesisCard
                                                key={thesis.thesisId}
                                                thesis={thesis}
                                                isTrending={true}
                                            />
                                        ))
                                    ) : (
                                        <p>No content available.</p>
                                    )}
                                </div>
                                {renderPagination(thesesDeclined.length, declinedPage, setDeclinedPage)}
                            </section>
                        </div>
                    </div>
                    <br />
                </div>
                <br />
            </fieldset>
            <Footer />
            <ChatComponent />
        </div>
    );
};

export default MyTheses;
