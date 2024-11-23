/* File written by: Chagamreddy Navyasree, Student ID: 1002197805 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/RegisterLogin.css'; 
import '../css/Statistics.css'; 

const ProfilePage = () => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const [formData, setFormData] = useState(userData || {});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdate = () => {
        // Update logic can be added here (e.g., API call to update user data)
        sessionStorage.setItem('user', JSON.stringify(formData));
        fetch(`http://localhost:3001/api/updateProfile`,{
            method:'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(formData),
        })
        .then(response =>response.json())
        .then(data=>{
           if(data.message == "update successful")
           {
            alert(`Updated`);
            
           }
           else
           {
            alert(`Error:${data.message}`);
           }
        })
        .catch(error => {
            console.log("Update Error:",error);
        })
    };

    const handleBack = () => {
        navigate(-1); // Navigates to the previous page
    };

    return (
        <div  style={{ margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '500px', backgroundColor: '#050505' }}>
            <h2 style={{ color: 'white' }}>Profile Details</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <tbody>
                    {Object.keys(formData).map((key) => {
                        if(key == 'id' || key=='password') return;
                        
                        // Only make firstName, lastName, and education editable
                        if (key === 'firstName' || key === 'lastName' || key === 'education') {
                            return (
                                <tr key={key}>
                                    <td style={{ fontWeight: 'bold', padding: '8px', borderBottom: '1px solid #ddd' }}>
                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                                    </td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                        {key === 'education' ? (
                                            <select
                                                className="inputR"
                                                name={key}
                                                value={formData[key]}
                                                onChange={handleChange}
                                                style={{ width: '100%', padding: '4px' }}
                                            >
                                                <option value="" disabled>Level of Education</option>
                                                <option value="Bachelor's">Bachelor's</option>
                                                <option value="Master's">Master's</option>
                                                <option value="PhD">PhD</option>
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                name={key}
                                                value={formData[key]}
                                                onChange={handleChange}
                                                style={{ width: '100%', padding: '4px' }}
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        } 
                        else if(key.includes("ID"))
                        {
                            return (
                                <tr key={key}>
                                    <td style={{ fontWeight: 'bold', padding: '8px', borderBottom: '1px solid #ddd' }}>
                                        Member Id:
                                    </td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                        <span>{formData[key]}</span>
                                    </td>
                                </tr>
                            );
                        }

                        else if(key.includes("CreatedAt"))
                            {
                                return (
                                    <tr key={key}>
                                        <td style={{ fontWeight: 'bold', padding: '8px', borderBottom: '1px solid #ddd' }}>
                                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                                        </td>
                                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                            <span>{new Date(formData[key]).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                );
                            }
                        
                        else {
                            return (
                                <tr key={key}>
                                    <td style={{ fontWeight: 'bold', padding: '8px', borderBottom: '1px solid #ddd' }}>
                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                                    </td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                        <span>{formData[key]}</span>
                                    </td>
                                </tr>
                            );
                        }
                    })}
                </tbody>
            </table>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={handleUpdate} className='preview-btn'>
                    Update
                </button>
                <button onClick={handleBack} className='preview-btn'>
                    Back
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
