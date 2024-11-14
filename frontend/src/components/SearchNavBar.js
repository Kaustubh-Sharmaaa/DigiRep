/* File written by: Chevva, Meghana, Student ID: 1002114458 */ 
import React, { useState } from "react"; // Importing React and useState hook
import '../css/SearchNavBar.css'; // Importing CSS for styling the navbar
import { Link } from 'react-router-dom'; // Importing Link component for navigation
import { IoHome } from "react-icons/io5"; // Importing home icon from react-icons
import { IoLogOutOutline } from "react-icons/io5"; // Importing logout icon
import { useNavigate } from 'react-router-dom'; // Importing useNavigate hook for programmatic navigation
import { CgProfile } from "react-icons/cg"; // Importing profile icon
import { IoNotificationsCircleOutline } from "react-icons/io5"; // Importing notification icon

const SearchNavbar = () => {
    const [searchTerm, setSearchTerm] = useState(''); // State to hold the search input
    const navigate = useNavigate(); // Hook to programmatically navigate
    const handleLogout = () => {
        fetch(`http://localhost:3001/api/logout`,{
            method:'POST',
            headers: {'Content-Type':'application/json'},
        })
        .then(response =>response.json())
        .then(data=>{
           if(data.message == "Logout successful")
           {
            sessionStorage.removeItem('user');
            alert(`Logged Out!`);
            navigate('/');
           }
           else
           {
            alert(`Error:${data.message}`);
           }
        })
        .catch(error => {
            console.log("Logout Error:",error);
        })
    }
    // Function to handle input changes in the search bar
    const handleSearch = (e) => {
        setSearchTerm(e.target.value); // Update the searchTerm state with the input value
    };

    // Function to handle key down events, specifically for the Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Redirect to the search page with the search term as a query parameter
            navigate(`/search?query=${searchTerm}`); // Navigate to the search results page
        }
    };

    return (
        <div className="searchnavbar"> {/* Main navbar container */}
            <div className="left-section"> {/* Left section for logo and search input */}
                <img src="images/lo.png" className="color-changing-image" alt="Logo" /> {/* Logo */}
                <span className="title">Digital Thesis Repository</span> {/* Title of the application */}
                &nbsp;&nbsp; {/* Space between elements */}
                
                { /*
                <input type="text" className='inputsn' placeholder="Type to search" /> 
                Uncommented code, possibly for future use
                */}

                <input
                    type="text"
                    className='inputsn' // Class for styling the input
                    placeholder="Search theses by title or author..." // Placeholder text
                    value={searchTerm} // Controlled input value
                    onChange={handleSearch} // Update state on input change
                    onKeyDown={handleKeyDown} // Listen for the Enter key
                />
                &nbsp;&nbsp; {/* Space between elements */}

                {/* Navigation links */}
                <Link to="/student-thesis">My Theses</Link> {/* Link to student's theses */}
                &nbsp;&nbsp; {/* Space between elements */}
                <Link to="/statistics">View Statistics</Link> {/* Link to view statistics */}
                &nbsp;&nbsp; {/* Space between elements */}

                {/* Icons for notifications, profile, and logout */}
                <Link to="#" className="picons">
                    <IoNotificationsCircleOutline /> {/* Notification icon */}
                </Link>
                &nbsp;&nbsp; {/* Space between elements */}
                <Link to="#" className="picons">
                    <CgProfile /> {/* Profile icon */}
                </Link>
                &nbsp;&nbsp; {/* Space between elements */}
                <Link to="/" className="picons" onClick={handleLogout}>
                    <IoLogOutOutline /> {/* Logout icon */}
                </Link>
            </div>
        </div>
    );
};

export default SearchNavbar; // Exporting the SearchNavbar component for use in other parts of the application
