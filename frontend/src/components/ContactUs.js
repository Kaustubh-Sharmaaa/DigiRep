// /* File written by: Chevva,Meghana, Student ID: 1002114458 */

// // Import necessary libraries and components
// import React, { useState } from 'react'; // Importing React and useState for managing component state
// import { Link, useNavigate } from 'react-router-dom'; // Importing Link for navigation, useNavigate for programmatic navigation
// import '../css/ContactUs.css'; // Importing custom CSS for Contact Us page styling
// import { IoHome } from "react-icons/io5"; // Importing an icon from the react-icons library (home icon)
// import Navbar from './NavBar'; // Importing the Navbar component
// import Footer from './Footer'; // Importing the Footer component

// // Function to handle form submission
// const handleFormSubmit = (e) => {
//     e.preventDefault(); // Prevents the default form submission behavior (page reload)
//     // You can add logic here to handle the form data, like sending it to a server or API.
// };

// // The main ContactUs component
// const ContactUs = () => {
//     return (
//         <div>
//             {/* Rendering the Navbar component */}
//             <Navbar />

//             {/* Main content of the Contact Us page */}
//             <div className='fcenter'>
//                 {/* Fieldset to group form elements with a legend */}
//                 <fieldset className='fieldsetAC'>
//                     <legend className='legendA'>
//                         <h2>Contact Us</h2> {/* Title of the section */}
//                     </legend>

//                     {/* Contact form starts here */}
//                     <form action="#" className="formM" id="form1" onSubmit={handleFormSubmit}>
//                         {/* Div container for name inputs (first and last name) */}
//                         <div className='names'>
//                             <input type='text' name="firstName" placeholder='First Name' className="input22" required /> {/* Input for first name, required field */}
//                             &nbsp; {/* Adds space between first and last name inputs */}
//                             <input type='text' name="lastName" placeholder='Last Name' className="input22" required /> {/* Input for last name, required field */}
//                         </div>
//                         <br />

//                         {/* Input for email address */}
//                         <input type="email" name="email" placeholder="Email" className="input" required /> {/* Email input field with built-in validation */}
//                         <br />

//                         {/* Dropdown select menu for inquiry type */}
//                         <select className="input" defaultValue="" aria-label="Inquiry Type" required>
//                             <option value="" disabled>Select Inquiry Type</option> {/* Default option that can't be selected */}
//                             <option value="general">General Inquiry</option> {/* Option for general inquiries */}
//                             <option value="technical">Technical Issue</option> {/* Option for technical issues */}
//                             <option value="other">Other</option> {/* Option for other inquiries */}
//                         </select>
//                         <br />

//                         {/* Optional input field for Thesis ID */}
//                         <input type="text" name="thesisId" placeholder="Thesis ID (optional)" className="input" /> {/* Optional field for thesis ID */}
//                         <br />

//                         {/* Text area for user's message */}
//                         <textarea name="comment" className="input6" placeholder="Enter your message here..." required></textarea> {/* Required text area for message */}
//                         <br />

//                         {/* Submit button for the form */}
//                         <div className='input3'>
//                             <button className="button-85" type="submit">Submit Inquiry</button> {/* Submit button with custom styling */}
//                         </div>
//                         <br />
//                     </form>
//                 </fieldset>
//             </div>

//             <br></br>

//             {/* Rendering the Footer component */}
//             <Footer />
//             <br />
//             <br />
//         </div>
//     );
// };

// // Exporting the ContactUs component so it can be used in other parts of the application
// export default ContactUs;


/* File written by: Chevva,Meghana, Student ID: 1002114458 */

// Import necessary libraries and components
import React, { useState } from 'react'; // Importing React and useState for managing component state
import { Link, useNavigate } from 'react-router-dom'; // Importing Link for navigation, useNavigate for programmatic navigation
import '../css/ContactUs.css'; // Importing custom CSS for Contact Us page styling
import { IoHome } from "react-icons/io5"; // Importing an icon from the react-icons library (home icon)
import Navbar from './NavBar'; // Importing the Navbar component
import Footer from './Footer'; // Importing the Footer component

const ContactUs = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        inquiryType: '',
        thesisId: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:3001/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Your inquiry has been submitted successfully.');
                // Reset form data to initial state after successful submission
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    inquiryType: '',
                    thesisId: '',
                    message: ''
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };


    return (
        <div>
            <Navbar />
            <div className='fcenter'>
                <fieldset className='fieldsetAC'>
                    <legend className='legendA'>
                        <h2>Contact Us</h2>
                    </legend>
                    <form className="formM" onSubmit={handleFormSubmit}>
                        <div className='names'>
                            <input
                                type='text'
                                name="firstName"
                                placeholder='First Name'
                                className="input22"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            &nbsp;
                            <input
                                type='text'
                                name="lastName"
                                placeholder='Last Name'
                                className="input22"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                        <br />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="input"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <br />
                        <select
                            className="input"
                            name="inquiryType"
                            required
                            value={formData.inquiryType}
                            onChange={handleChange}
                        >
                            <option value="" disabled>Select Inquiry Type</option>
                            <option value="general">General Inquiry</option>
                            <option value="technical">Technical Issue</option>
                            <option value="other">Other</option>
                        </select>
                        <br />
                        <input
                            type="text"
                            name="thesisId"
                            placeholder="Thesis ID (optional)"
                            className="input"
                            value={formData.thesisId}
                            onChange={handleChange}
                        />
                        <br />
                        <textarea
                            name="message"
                            className="input6"
                            placeholder="Enter your message here..."
                            required
                            value={formData.message}
                            onChange={handleChange}
                        />
                        <br />
                        <div className='input3'>
                            <button className="button-85" type="submit">Submit Inquiry</button>
                        </div>
                        <br />
                    </form>
                </fieldset>
            </div>
            <Footer />
        </div>
    );
};

export default ContactUs;
