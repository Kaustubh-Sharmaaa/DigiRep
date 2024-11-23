/* File written by: Chevva, Meghana, Student ID: 1002114458 */
import React, { useRef, useEffect, useState } from 'react'; // Importing React and hooks
import { Link, useNavigate } from 'react-router-dom'; // Importing Link for navigation and useNavigate for programmatic navigation
import '../css/RegisterLogin.css'; // Importing CSS for styling the register/login component
import Footer from './Footer'
const RegisterLogin = () => {
    // State hooks to manage form inputs and login panel state
    const [isLoginPanelActive, setIsLoginPanelActive] = useState(true);
    const [email, setEmail] = useState('');
    const [lemail, setlEmail] = useState('');
    const [lpassword, setPassword] = useState('');
    const [rpassword, setrPassword] = useState('');
    const [rcpassword, setrcPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [education, setEducation] = useState('');

    // Refs to manage the active classes for the panels
    const or = useRef(null);
    const ol = useRef(null);
    const rf = useRef(null);
    const lf = useRef(null);

    const navigate = useNavigate(); // Using the useNavigate hook

    // Effect to toggle between login and signup panels
    useEffect(() => {
        if (isLoginPanelActive) {
            ol.current.classList.add('active');
            lf.current.classList.add('active');
            or.current.classList.remove('active');
            rf.current.classList.remove('active');
        } else {
            ol.current.classList.remove('active');
            lf.current.classList.remove('active');
            or.current.classList.add('active');
            rf.current.classList.add('active');
        }
    }, [isLoginPanelActive]);

    // Handlers to switch between sign-in and sign-up forms
    const handleSignIn = () => {
        setIsLoginPanelActive(true);
    };

    const handleSignUp = () => {

        
        setIsLoginPanelActive(false);

        
    };



    // Handler for login form submission
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        // Login flow
        fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lemail, lpassword }),
        })
        .then(response => response.json())
        .then(data => {
            if (typeof data === 'object' && data !== null) {
                
                sessionStorage.setItem('user', JSON.stringify(data));
                if(data.isVerified=="APPROVED"){
                    alert(`Logged in as ${data.firstName}!`);
                if(data.role == "Student"){
                navigate('/StudentDashboard', { state: { user: data } })
                }
                
                if(data.role=="Advisor")
                    {
                        navigate('/advisorDashboard', { state: { user: data } })
                    }
            }
            else{
                if(data.role=="Department Admin")
                    {
                        navigate('/departmentAdminDashboard', { state: { user: data } })
                    }
               else 
               if (data.role =="Visitor"){
                navigate('/VisitorDashboard', { state: { user: data } })
               }
               else{alert('Please wait until someone approves your profile');
               }
              setPassword('');
            }
                
            } else {
                setPassword('');
                alert("Login failed: " + data);
                console.log(data);
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
        });
    };

    // Handler for signup form submission
    const handleSignUpSubmit = (e) => {
        e.preventDefault();

        //send notification
        // const userData = JSON.parse(sessionStorage.getItem('user'));
        for(let i = 0; i < 5; i++)
            {
                fetch(`http://localhost:3001/api/sendNotifications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId :  "da"+ i,
                        message: `${firstName} ${lastName} user is waiting for approval`
                    }),
                });
            }


        fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                rpassword,
                role,
                education
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data === "Success") {
                    alert(`Registered as ${firstName} ${lastName} with role: ${role} and education: ${education}`);
                    setIsLoginPanelActive(true);
                } else {
                    alert("Registration failed: " + data);
                    console.log(data);
                    setIsLoginPanelActive(false);
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setrPassword('');
                    setrcPassword('');
                    setRole('');
                    setEducation('');
                }

            })
            .catch(error => {
                console.error("Error during registration:", error);
                setFirstName('');
                setLastName('');
                setEmail('');
                setrPassword('');
                setrcPassword('');
                setRole('');
                setEducation('');
            });
        // Resetting input fields after submission

    };

    return (
        <div className='container'>
            {/* Overlay for the sign-in option */}
            <div className="overlayRight" ref={or}>
                <h1 className='Titlen'>Digital Thesis Repository System</h1>
                <p className='text'>Already a member?</p>
                <br></br>
                <button className="button-85" id="signIn" onClick={handleSignIn}>
                    Login Now
                </button>
                <br></br>
            </div>

            {/* Sign-in form */}
            <div className="SignInForm" ref={lf}>
                <form action="#" className="form" id="form2" onSubmit={handleLoginSubmit}>
                    <fieldset className='fieldsetR'>
                        <legend className='legend'><h1>Login</h1></legend>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="inputR"
                            value={lemail}
                            onChange={(e) => setlEmail(e.target.value)}
                            required
                        />
                        <br></br>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="inputR"
                            value={lpassword}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <p className='fp'>
                            <Link to='/forgotPassword' className='linkfp'>Forgot your password?</Link>
                        </p>
                        <br></br>
                        <div className='input3'>
                            <button type="submit" className="button-85">Sign In</button>
                        </div>
                    </fieldset>
                </form>
                <Footer />
            </div>

            {/* Sign-up form */}
            <div className="SignUpForm" ref={rf}>
                <form action="#" className="form" id="form1" onSubmit={handleSignUpSubmit}>
                    <fieldset className='fieldsetR'>
                        <legend className='legend'><h1>Register</h1></legend>
                        <div className='names'>
                            <input
                                type='text'
                                name="firstName"
                                placeholder='First Name'
                                className="inputR"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                            &nbsp;
                            <input
                                type='text'
                                name="lastName"
                                placeholder='Last Name'
                                className="inputR"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <br></br>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="inputR"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <br></br>
                        <input
                            type="password"
                            name="password"
                            value={rpassword}
                            onChange={(e) => setrPassword(e.target.value)}
                            placeholder="Password"
                            className="inputR"
                            required
                        />
                        <br></br>
                        <input
                            type="password"
                            name="cPassword"
                            value={rcpassword}
                            onChange={(e) => setrcPassword(e.target.value)}
                            placeholder="Confirm Password"
                            className="inputR"
                            required
                        />
                        <br />
                        <select
                            className="inputR"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Role type</option>
                            <option value="Student">Student</option>
                            <option value="Advisor">Advisor</option>
                            <option value="Department Admin">Department Admin</option>
                            <option value="Visitor">Visitor</option>
                        </select>
                        <br></br>
                        <select
                            className="inputR"
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            required
                        >
                            <option value="" disabled>Level of Education</option>
                            <option value="Bachelor's">Bachelor's</option>
                            <option value="Master's">Master's</option>
                            <option value="PhD">PhD</option>
                        </select>
                        <br></br>
                        <div className='input3'>
                            <button type="submit" className="button-85">Sign Up</button>
                        </div>
                        <br />
                    </fieldset>
                </form>
                <Footer />
            </div>

            {/* Overlay for the sign-up option */}
            <div className="overlayLeft" ref={ol}>
                <h1 className='Titlen'>Digital Thesis Repository System</h1>
                <p className='text'>Don't have an account?</p>
                <br></br>
                <button className="button-85" id="signUp" onClick={handleSignUp}>
                    Register Here
                </button>
                <br></br>
            </div>
        </div>
    );
};

export default RegisterLogin;
