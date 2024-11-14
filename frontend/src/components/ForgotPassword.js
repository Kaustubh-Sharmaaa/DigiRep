/* File written by: Chevva, Meghana, Student ID: 1002114458 */
import React from 'react'; // Importing React
import '../css/ForgotPassword.css'; // Importing custom CSS for styling the Forgot Password page
import Navbar from './NavBar'; // Importing the Navbar component for navigation
import Footer from './Footer'; // Importing the Footer component

// Function to handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault(); // Preventing default form submission behavior
};

const ForgotPassword = () => {
    return (
        <div>
            <Navbar /> {/* Rendering the Navbar */}
            <div className='fcenter'> {/* Centering the form */}
                <fieldset className='fieldsetA'> {/* Fieldset for styling */}
                    <legend className='legendA'> {/* Legend for the fieldset */}
                        <h2>Password Change</h2> {/* Heading for the password change section */}
                    </legend>
                    <form action="#" className="formM" id="form1" onSubmit={handleFormSubmit}> {/* Form for password reset */}
                        <input type="email" name="email" placeholder="Email" className="inputFp" required /> {/* Email input */}
                        <br />
                        <div className='input3'>
                            <button className="button-85">Send One Time Password</button> {/* Button to send OTP */}
                        </div>
                        <br />
                        <input type="password" name="otp" placeholder="One Time Password" className="inputFp" required /> {/* OTP input */}
                        <br />
                        <div className='input3'>
                            <button className="button-85">Verify One Time Password</button> {/* Button to verify OTP */}
                        </div>
                        <br />
                        <input type="password" name="password" placeholder="New Password" className="inputFp" required /> {/* New password input */}
                        <br />
                        <input type="password" name="cPassword" placeholder="Re-enter New Password" className="inputFp" required /> {/* Confirm password input */}
                        <br />
                        <div className='input3'>
                            <button className="button-85">Reset Password</button> {/* Button to reset password */}
                        </div>
                        <br />
                    </form>
                </fieldset>
            </div>
            <br />
            <Footer /> {/* Rendering the Footer */}
            <br />
            <br />
        </div>
    );
};

export default ForgotPassword; // Exporting the ForgotPassword component for use in other parts of the application
