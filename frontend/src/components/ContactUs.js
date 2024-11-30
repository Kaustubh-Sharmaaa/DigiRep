import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/ContactUs.css';
import Navbar from './NavBar';
import Footer from './Footer';
import SearchNavbar from './SearchNavBar';
import ChatComponent from './ChatComponent';
const ContactUs = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        console.log("data", storedUserData);
        if (storedUserData) {
            setUserData(storedUserData);
            setFormData(prevState => ({
                ...prevState,
                firstName: storedUserData.firstName,
                lastName: storedUserData.lastName,
                email: storedUserData.email
            }));
        }
    }, []);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        inquiryType: '',
        thesisId: '',
        briefIssue: '',
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
                    firstName: userData ? userData.firstName : '',
                    lastName: userData ? userData.lastName : '',
                    email: userData ? userData.email : '',
                    inquiryType: '',
                    thesisId: '',
                    briefIssue: '',
                    message: ''
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <div>
            {userData ? <SearchNavbar /> : <Navbar />}
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
                                readOnly={!!userData}
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
                                readOnly={!!userData}
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
                            readOnly={!!userData}
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
                            <option value="technical">Account Related Issue</option>
                            <option value="thesis">Thesis Related Inquiry</option>
                            <option value="other">Other</option>
                        </select>
                        <br />
                        {formData.inquiryType === 'thesis' && (
                            <input
                                type="text"
                                name="thesisId"
                                placeholder="Thesis ID (required)"
                                className="input"
                                required
                                value={formData.thesisId}
                                onChange={handleChange}
                            />
                        )}
                        {formData.inquiryType === 'other' && (
                            <input
                                type="text"
                                name="briefIssue"
                                placeholder="Brief issue description (required)"
                                className="input"
                                required
                                value={formData.briefIssue}
                                onChange={handleChange}
                            />
                        )}
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
                        <br></br>
                        <p>You can either fill the form above or email us at <a href='mailto:digithesrepo2@gmail.com'>digithesrepo2@gmail.com</a></p>
                        <br />
                    </form>
                </fieldset>
            </div>
            <Footer />
            {userData && userData?.role != 'Department Admin'? <ChatComponent/>:null}

        </div>
    );
};

export default ContactUs;
