/* File written by: Chevva, Meghana, Student ID: 1002114458 */
import React from 'react'; // Import React to create the component
import { useNavigate } from 'react-router-dom'; // Hook for navigation between routes
import '../css/AboutUs.css'; // Import custom CSS for the About Us page
import '../css/logo.css'; // Import custom CSS for the logo
import { IoHome } from "react-icons/io5"; // Import home icon from react-icons
import { FaLinkedin, FaGithub, FaInstagram, FaGlobe, FaEnvelope } from "react-icons/fa"; // Import social media icons from react-icons
import Navbar from './NavBar'; // Import Navbar component for page header
import SearchNavbar from './SearchNavBar';
import Footer from './Footer'; // Import Footer component for page footer
import { useEffect, useState } from 'react';
import ChatComponent from './ChatComponent';
// Define the AboutUs component
const AboutUs = () => {
    const [userData, setUserData] = useState(null);
    useEffect(()=>{
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        console.log("data",storedUserData);
        if(storedUserData)
        {
            setUserData(storedUserData);
        }
    },[]);
    // Array of team members with their name and social media links
    const teamMembers = [
        {
            name: 'Meghana Chevva',
            linkedin: 'https://linkedin.com/in/meghana-chevva',
            github: 'https://github.com/meggitt',
            instagram: 'https://instagram.com/meghana_anahgem',
            website: 'https://meghanachevva.com',
            email: 'mailto:ch.meghanah@gmail.com'
        },
        {
            name: 'Venkata Sri Dheeraj Chintapalli',
            linkedin: 'https://www.linkedin.com/in/dheeraj-chintapalli-1b7564267/',
            github: 'https://github.com/dheeraj29081999',
            instagram: 'https://www.instagram.com/dheeraj_2908/?next=%2F',
            website: '',
            email: 'mailto:dheeraj19c@gmail.com'
        },
        {
            name: 'Dharti Chauhan',
            linkedin: 'http://linkedin.com/in/dharti-chauhan-41809b246',
            github: 'https://github.com/dharti-19',
            Instagram: 'https://www.instagram.com/_dharti1912_/',
            website: '',
            email: 'mailto:dharti13294@gmail.com'
        },
        {
            name: 'Navya Sree Chagamreddy',
            linkedin: 'http://linkedin.com/in/navyasreechagamreddy/',
            github: 'https://github.com/NavyaSree1002197805',
            instagram: 'https://www.instagram.com/chagamreddynavyasree?igsh=MW4ybTBseXVnYXplbg==',
            website: '',
            email: 'mailto:nxc7805@mavs.uta.edu'
        },
        {
            name: 'Yugamsinh Chavda',
            linkedin: 'https://www.linkedin.com/in/yugamsinh-chavda/',
            github: 'https://github.com/YugamsinhChavda',
            instagram: 'https://www.instagram.com/yugamsinh_chavda/',
            website: '',
            email: 'mailto:yuchavda@gmail.com'
        },
        {
            name: 'Kaustubh Sharma',
            linkedin: 'www.linkedin.com /in/kaustubhsharma08',
            github: 'https://github.com/Kaustubh-Sharmaaa',
            instagram: 'https://www.instagram.com/kaustubhsharmaaa/',
            website: '',
            email: 'mailto:kxs8514@mavs.uta.edu'
        }
    ];

    // JSX to render the About Us page content
    return (
        <div>
           {userData ? <SearchNavbar /> : <Navbar />}
            <div className='fcenter'> {/* Centralized content container */}
                <fieldset className='fieldsetA'> {/* Styled box for content */}
                    <legend className='legendA'> {/* Title for the fieldset */}
                        <h2>ABOUT US</h2>
                    </legend>
                    <p>
                        Welcome to the Digital Thesis Repository, a centralized platform designed to collect, showcase, and facilitate access to scholarly work, including theses and dissertations. Our mission is to support academic growth by providing a seamless and user-friendly experience for students, researchers, and faculty to store, share, and explore research across a wide range of disciplines.
                        <br /><br />
                        Our repository serves as a hub for peer collaboration and engagement, allowing users to comment, provide feedback, and discuss research topics. By offering submission guidelines and templates, we ensure that the quality and presentation of academic work remains consistent and professional.
                        <br /><br />
                        In addition to enhancing research visibility, we provide statistical insights on the most popular and frequently viewed theses, helping to highlight key trends in various fields of study.
                        <br /><br />

                        <h2>Our History</h2> {/* History section */}

                        The Digital Thesis Repository was established in 2024 by a group of passionate graduate students aiming to create a centralized platform for academic research and collaboration. What started as a small-scale project has evolved into a robust system utilized by students and faculty alike. Over the years, we have continuously improved the platform's features and expanded its reach, making it easier for researchers from all disciplines to store, share, and engage with scholarly work.

                        <h2>Meet The Team</h2> {/* Team section */}
                    </p>
                    
                    {/* Loop through the team members array and render each member's name and social links */}
                    <div className='team-container'>
                        {teamMembers.map((member, index) => (
                            <div className='team-member' key={index}> {/* Each team member block */}
                                <h4>{member.name}</h4> {/* Member's name */}
                                <div className="social-links"> {/* Social links container */}
                                    {member.linkedin && (
                                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                                            <FaLinkedin /> {/* LinkedIn icon */}
                                        </a>
                                    )}
                                    {member.github && (
                                        <a href={member.github} target="_blank" rel="noopener noreferrer">
                                            <FaGithub /> {/* GitHub icon */}
                                        </a>
                                    )}
                                    {member.instagram && (
                                        <a href={member.instagram} target="_blank" rel="noopener noreferrer">
                                            <FaInstagram /> {/* Instagram icon */}
                                        </a>
                                    )}
                                    {member.website && (
                                        <a href={member.website} target="_blank" rel="noopener noreferrer">
                                            <FaGlobe /> {/* Website icon */}
                                        </a>
                                    )}
                                    {member.email && (
                                        <a href={member.email} target="_blank" rel="noopener noreferrer">
                                            <FaEnvelope /> {/* Email icon */}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p>
                        <h2>Who We Are</h2> {/* Who We Are section */}

                        We are a group of graduate students dedicated to making research more accessible and streamlined for academic communities. Our team consists of tech enthusiasts and aspiring researchers who have come together to build this platform with the goal of fostering academic collaboration. Each of us brings our unique skills to the project, from software development to user experience design, ensuring that the platform is not only functional but also user-friendly. And yes, we're all working hard to ace this project while contributing something meaningful to the academic world!
                        <br></br>
                    </p>
                </fieldset>
            </div>
            <Footer /> {/* Renders the footer at the bottom of the page */}
            {userData && userData?.role != 'Department Admin'? <ChatComponent/>:null}
            <br></br>
            <br></br>
        </div>
    );
};

export default AboutUs; // Export the AboutUs component so it can be used in other parts of the app
