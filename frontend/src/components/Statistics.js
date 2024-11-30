import React, { useRef, useEffect, useState } from 'react';
import Navbar from './NavBar';
import Footer from './Footer';
import '../css/Statistics.css';
import { useLocation } from 'react-router-dom';
import ThesisCard from './ThesisCard';
import SearchNavbar from './SearchNavBar';
import ChatComponent from './ChatComponent';

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

function PaginatedTheses({ theses }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(theses.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTheses = theses.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div>
            <div className="thesis-row">
                {currentTheses.map((thesis) => (
                    <ThesisCard key={thesis.thesisId} thesis={thesis} isTrending={true} />
                ))}
            </div>
            <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

function ThesisList({ category, endpoint }) {
    const [theses, setTheses] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('query')?.toLowerCase() || '';

    useEffect(() => {
        fetch(endpoint)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const filteredData = data.filter(
                    (thesis) =>
                        thesis.title.toLowerCase().includes(searchTerm) ||
                        (thesis.authors && thesis.authors.toLowerCase().includes(searchTerm)) ||
                        (thesis.keywords && thesis.keywords.toLowerCase().includes(searchTerm))
                );
                setTheses(filteredData);
            })
            .catch((error) => {
                console.error('Error:', error);
                setTheses([]);
            });
    }, [endpoint, searchTerm]);

    return (
        <div className="statistics-dashboard">
            <main className="statistics-dashboard-content">
                <section className="thesis-section">
                    <h2>{category}</h2>
                    {theses.length > 0 ? (
                        <PaginatedTheses theses={theses} />
                    ) : (
                        <p>No content available.</p>
                    )}
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
            <br />
            <CategoryBlock onSelectCategory={handleSelectCategory} />
            {selectedCategory === 'Most Recent' && (
                <ThesisList
                    category="Most Recent"
                    endpoint="http://localhost:3001/api/getmostrecentdetails"
                />
            )}
            {selectedCategory === 'Most Liked' && (
                <ThesisList
                    category="Most Liked"
                    endpoint="http://localhost:3001/api/gettopthesisdetails"
                />
            )}
            {selectedCategory === 'Most Downloads' && (
                <ThesisList
                    category="Most Downloads"
                    endpoint="http://localhost:3001/api/gettopdownloadeddetails"
                />
            )}
            <Footer />
            {userData && userData?.role !== 'Department Admin' ? <ChatComponent /> : null}
        </div>
    );
};

export default Statistics;
