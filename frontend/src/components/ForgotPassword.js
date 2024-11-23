import React, { useState } from 'react'; // Importing React and useState for managing state
import '../css/ForgotPassword.css'; // Importing custom CSS for styling the Forgot Password page
import Navbar from './NavBar'; // Importing the Navbar component for navigation
import Footer from './Footer'; // Importing the Footer component

const ForgotPassword = () => {
    // State to store form inputs
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [error, setError] = useState('');

    // Handle form submission for sending OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setOtpSent(true);
                setError('');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            setError('Failed to send OTP');
        }
    };

    // Handle form submission for verifying OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, newPassword })
            });

            if (response.ok) {
                setOtpVerified(true);
                setError('');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to verify OTP');
            }
        } catch (error) {
            setError('Failed to verify OTP');
        }
    };
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, newPassword })
            });

            if (response.ok) {
                alert('Password reset successful!'); // Notify user
                setError('');
                setOtpVerified(false); // Reset state
                setOtpSent(false); // Reset state
                setEmail('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to reset password');
            }
        } catch (error) {
            setError('Failed to reset password');
        }
    };

    return (
        <div>
            <Navbar /> {/* Rendering the Navbar */}
            <div className='fcenter'> {/* Centering the form */}
                <fieldset className='fieldsetA'> {/* Fieldset for styling */}
                    <legend className='legendA'> {/* Legend for the fieldset */}
                        <h2>Password Change</h2> {/* Heading for the password change section */}
                    </legend>
                    <form action="#" className="formM" id="form1">
                        {/* Email Input */}
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="inputFp"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <br />

                        {/* Send OTP Button */}
                        {!otpSent ? (
                            <div className='input3'>
                                <button className="button-85" onClick={handleSendOtp}>Send One Time Password</button>
                            </div>
                        ) : (
                            <p>OTP sent! Please check your email.</p>
                        )}
                        <br />

                        {/* OTP Input */}
                        {otpSent && !otpVerified && (
                            <>
                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="One Time Password"
                                    className="inputFp"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <br />

                                {/* Verify OTP Button */}
                                <div className='input3'>
                                    <button className="button-85" onClick={handleVerifyOtp}>Verify One Time Password</button>
                                </div>
                                <br />
                            </>
                        )}

                        {/* New Password and Confirm Password Inputs */}
                        {otpVerified && (
                            <>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="New Password"
                                    className="inputFp"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <br />
                                <input
                                    type="password"
                                    name="cPassword"
                                    placeholder="Re-enter New Password"
                                    className="inputFp"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <br />

                                <div className='input3'>
                                    <button className="button-85" onClick={handleResetPassword}>Reset Password</button>
                                </div>

                                <br />
                            </>
                        )}

                        {/* Error Handling */}
                        {error && <p className="error-message">{error}</p>}
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
