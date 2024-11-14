/* File written by: Chevva, Meghana, Student ID: 1002114458 */
import '../css/AboutUs.css'; // Importing CSS for styling the About Us page
import { IoHome } from "react-icons/io5"; // Importing a home icon from react-icons
import {Link} from "react-router-dom";
const Navbar = () => {
    return (
        <div className="navbar"> {/* Main container for the navbar */}
            <div className="right-section"> {/* Right section of the navbar */}
                <Link to="/" className="home-icon"> {/* Link to the home page */}
                    <IoHome /> {/* Home icon */}
                </Link>
            </div>
            <div className="left-section"> {/* Left section of the navbar */}
                <img src="images/lo.png" className="color-changing-image" alt="Logo" /> {/* Logo image */}
                <span className="title">Digital Thesis Repository</span> {/* Title of the application */}
            </div>
        </div>
    );
};

export default Navbar; // Exporting the Navbar component for use in other parts of the application
