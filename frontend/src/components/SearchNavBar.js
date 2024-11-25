/* File written by: Chevva, Meghana, Student ID: 1002114458 */ 
import React, { useState, useEffect } from "react"; // Importing React and useState hook
import '../css/SearchNavBar.css'; // Importing CSS for styling the navbar
import { Link } from 'react-router-dom'; // Importing Link component for navigation
import { IoHome } from "react-icons/io5"; // Importing home icon from react-icons
import { IoLogOutOutline } from "react-icons/io5"; // Importing logout icon
import { useNavigate } from 'react-router-dom'; // Importing useNavigate hook for programmatic navigation
import { CgProfile } from "react-icons/cg"; // Importing profile icon
import { IoNotificationsCircleOutline } from "react-icons/io5"; // Importing notification icon
import NotificationsIcon from './NotificationsIcon';

const SearchNavbar = () => {
    const [searchTerm, setSearchTerm] = useState(''); // State to hold the search input
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const navigate = useNavigate(); // Hook to programmatically navigate
    const [suggestions, setSuggestions] = useState([]); // Dropdown data
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(null); // Error state
    const userType = userData?.role || ''; // Assuming `role` defines the type of user
   console.log("tyoe:",userType);
    const handleLogout = () => {
        fetch(`http://localhost:3001/api/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Logout successful") {
                    sessionStorage.removeItem('user');
                    alert(`Logged Out!`);
                    navigate('/');
                } else {
                    alert(`Error:${data.message}`);
                }
            })
            .catch(error => {
                console.log("Logout Error:", error);
            });
    };

    // Function to handle input changes in the search bar
    const handleSearch = (e) => {
        setSearchTerm(e.target.value); // Update the searchTerm state with the input value
    };

    // Function to handle key down events, specifically for the Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            navigate(`/searchThesis?query=${searchTerm}`); // Navigate to the search results page
        }
    };

    useEffect(() => {
        if (searchTerm.trim().length > 0) {
            const timeoutId = setTimeout(() => {
                fetchSuggestions(searchTerm);
            }, 300); // Delay to prevent excessive calls
            return () => clearTimeout(timeoutId); // Cleanup debounce
        } else {
            setSuggestions([]);
        }
    }, [searchTerm]);

    const fetchSuggestions = async (term) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/searchThesis/${encodeURIComponent(term)}`);
            if (!response.ok) {
                throw new Error("Failed to fetch suggestions");
            }
            const data = await response.json();
            setSuggestions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item) => {
        setSearchTerm(""); // Clear input field
        setSuggestions([]); // Clear suggestions
        navigate(`/viewthesis?query=${item.thesisId}`);
    };

    return (
        <div className="searchnavbar">
            <div className="left-section">
                <img src="images/lo.png" className="color-changing-image" alt="Logo" />
                <span className="title">Digital Thesis Repository</span>
                &nbsp;&nbsp;

                <input
                    type="text"
                    className='inputsn'
                    placeholder="Search theses by title or author..."
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyDown={handleKeyDown}
                />

                

                {searchTerm && suggestions.length > 0 && (
                    <ul>
                        {suggestions.map((item) => (
                            <li key={item.id} onClick={() => handleSelect(item)}>
                                {item.title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                                submitted by: {item.firstName} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                year: {new Date(item.publishDatetime).getFullYear()}
                            </li>
                        ))}
                    </ul>
                )}
                &nbsp;&nbsp;

                {/* Conditional Links */}
                <Link to="/advance-search">Filter</Link>
                &nbsp;&nbsp;

                {userType === 'Student' && (
                    <Link to="/student-thesis">My Theses</Link>
                )}
                {userType === 'Advisor' && (
                    <Link to="/advisorDashboard">Dashboard</Link>
                )}
                {userType === 'Department Admin' && (
                    <Link to="/departmentAdminDashboard">Dashboard</Link>
                )}
                &nbsp;&nbsp;

                    <Link to="/statistics">View Statistics</Link>
                &nbsp;

                {/* Icons for notifications, profile, and logout */}
                <NotificationsIcon />
                &nbsp;&nbsp;
                <div style={{ position: 'relative' }}>
                    <Link to="/profilePage" className="picons">
                        <CgProfile />
                    </Link>
                </div>
                &nbsp;&nbsp;
                <div style={{ position: 'relative' }}>
                    <Link to="/" className="picons" onClick={handleLogout}>
                        <IoLogOutOutline />
                    </Link>
                </div>
            </div>
        </div>
    );
};



export default SearchNavbar; // Exporting the SearchNavbar component for use in other parts of the application
