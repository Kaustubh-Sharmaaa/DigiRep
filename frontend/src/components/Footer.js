/*File written by: Chevva,Meghana, Student ID: 1002114458*/ 
import '../css/Footer.css'; // Import the CSS file for styling the footer
import React from 'react'; // Import React, which is necessary for creating the component
import { Link } from 'react-router-dom'; // Import 'Link' from 'react-router-dom' for internal navigation

// Define the Footer component
const Footer = () => {
    return (
        <div className="footer"> {/* The main container for the footer */}
            <div className='inputF'> {/* A div to hold the navigation links */}
                {/* Using 'Link' components for navigation without page reload */}
                <Link to='/aboutUs' class="linkfp">About Us</Link> {/* Link to About Us page */}
                <Link to='/contactUs' class="linkfp">Contact Us</Link> {/* Link to Contact Us page */}
                <Link to='/faq' class="linkfp">FAQs</Link> {/* Link to FAQs page */}
            </div>
            {/* Display a copyright notice */}
            <p>&copy; All Rights Reserved 2024</p>
        </div>
    );
};

// Export the Footer component so it can be imported and used in other files
export default Footer;
