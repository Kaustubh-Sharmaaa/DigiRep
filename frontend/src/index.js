import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import RegisterLogin from './components/RegisterLogin';
import StudentDashboard from './components/StudentDashboard';
import AboutUs from './components/AboutUs'; // Component for the About Us page
import ContactUs from './components/ContactUs'; // Component for the Contact Us page
import ForgotPassword from './components/ForgotPassword'; // Component for password recovery
import Faq from './components/Faq'; // Component for Frequently Asked Questions
import DepartmentAdminDashboard from './components/DepartmentAdminDashboard';
import SubmitThesis from './components/SubmitThesis';
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Imports for routing

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Defining the route for the home page */}
        <Route path="/aboutUs" element={<AboutUs />} /> {/* About Us page */}
        <Route path="/contactUs" element={<ContactUs />} /> {/* Contact Us page */}
        <Route path="/forgotPassword" element={<ForgotPassword />} /> {/* Password recovery page */}
        <Route path="/Faq" element={<Faq />} /> {/* FAQ page */}
        <Route path="/departmentAdminDashboard" element={<DepartmentAdminDashboard />} /> {/* FAQ page */}
        <Route path="/" element={<RegisterLogin />} />  {/* User Registration/Login component */}
        <Route path="/studentDashboard" element={<StudentDashboard />} />  {/* User Registration/Login component */}
        <Route path="/submit-thesis" element={ <SubmitThesis/>}/>
       </Routes>
       </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
