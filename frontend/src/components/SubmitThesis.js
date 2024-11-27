import '../css/submitThesis.css';
import SearchNavBar from "./SearchNavBar";
import '../css/logo.css';
import { IoCloudUpload } from "react-icons/io5";
import { FaDownload } from "react-icons/fa6";
import Footer from './Footer';
import Select from 'react-select';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SubmitThesis = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const [values, setValues] = useState([]);
    const [inputValue, setInputValue] = useState([]);

    useEffect(() => {

        if (!userData) {
            navigate('/');
        }
        console.log("ud", userData);
    }, [navigate]);

    // State for fetched advisor options
    const [advisorOptions, setAdvisorOptions] = useState([]);
    const [thesesOptions, setThesesOptions] = useState([]);
    const [refadvisor, setRefAdvisor] = useState();
    const [reqadvisor, setReqAdvisor] = useState([]);
    const [refthesis, setRefThesis] = useState([]);
    const [advisor, setAdvisor] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [publishedThesis,setpublishedThesis] = useState([]);

    // Fetch advisor data from the backend
    useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/advisors-approved'); // Adjust the endpoint URL as needed
                if (response.ok) {
                    const data = await response.json();
                    console.log("AD data", data);
                    // Map data to Select options format { value: 'id', label: 'name' }
                    const advisorOptions = data.map(advisor => ({
                        value: advisor.advisorID, // Assuming each advisor has an ID

                        label: advisor.firstName + ' ' + advisor.lastName + ' (' + advisor.email + ')'// Assuming each advisor has a name
                    }));
                    setAdvisorOptions(advisorOptions);
                } else {
                    console.error('Failed to fetch advisors:', response.status);
                }
            } catch (error) {
                console.error('Error fetching advisors:', error);
            }
        };
        const fetchTheses = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/theses-approved'); // Adjust the endpoint URL as needed
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    // Map data to Select options format { value: 'id', label: 'name' }
                    const thesesOptions = data.map(thesis => ({
                        value: thesis.thesisId, // Assuming each advisor has an ID
                        label: thesis.Title// Assuming each advisor has a name
                    }));
                    setThesesOptions(thesesOptions);
                } else {
                    console.error('Failed to fetch theses:', response.status);
                }
            } catch (error) {
                console.error('Error fetching theses:', error);
            }
        };
        fetchAdvisors();
        fetchTheses();
    }, []);


    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Collect form data
        const title = document.getElementById("title").value;
        const abstract = document.getElementById("abstract").value;

        // Validation checks
        if (!title || !abstract) {
            alert("Please fill in all required fields.");
            return;
        }

        // Check if one referenced advisor is selected and at least 3 requested advisors are selected
        if (!refadvisor) {
            alert("Please select one referenced advisor.");
            return;
        }

        if (reqadvisor.length < 3) {
            alert("Please select at least three requested advisors.");
            return;
        }
        if (reqadvisor.length > 3) {
            alert("Please select three requested advisors.");
            return;
        }

        // Prepare the data to be sent in the request
        const formData = {
            title,
            abstract,
            thesisKeywords: values,
            studentId: userData.studentID,
            refadvisorIds: refadvisor, // List of advisors chosen for "Review Requested From"
            requestedAdvisorIds: reqadvisor, // List of referenced advisors
            referencedThesisIds: refthesis, // List of referenced theses
            fileName: uploadedFile, // Uploaded file name
        };
        console.log("Fdata:", refadvisor);
        try {
            const response = await fetch('http://localhost:3001/api/submit-thesis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Send data as JSON
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Thesis submitted successfully:', data);
                console.log("upfile", typeof (uploadedFile));
                console.log("thesisID:",data.thesisId);
                if (uploadedFile) {
                    const fileInput = document.getElementById('file-input'); // File input element
                    const fileFormData = new FormData();
                    fileFormData.append('file', fileInput.files[0],`${data.thesisId}.pdf`); 
                    console.log('ffdata', fileFormData);
                    const currentDateTime = new Date().toISOString().replace(/[-:.]/g, '');
                    const uniqueFileName = `${userData.studentID}-${uploadedFile.name}-${currentDateTime}`;

                    const fileUploadResponse = await fetch('http://localhost:3001/api/upload-file', {
                        method: 'POST',
                        body: fileFormData,
                    });

                    if (fileUploadResponse.ok) {
                        const fileUploadData = await fileUploadResponse.json();
                        console.log('Feile uploaded successfully:', fileUploadData);
                        alert("Thesis and file submitted successfully!");
                    } else {
                        console.error('Failed to upload file:', fileUploadResponse.status);
                        alert("Error uploading file, please try again later.");
                    }
                }

            } else {
                console.log('Failed to submit thesis:', response);
                alert("Error submitting thesis, please try again later.");
            }


            //send notification
            // const userData = JSON.parse(sessionStorage.getItem('user'));
            const advIds = [formData.refadvisorIds, ...formData.requestedAdvisorIds]
            for(let i = 0; i < advIds.length; i++)
            {
                fetch(`http://localhost:3001/api/sendNotifications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId :  advIds[i],
                        message: `${userData.firstName} ${userData.lastName} has requested thesis ${formData.title}`
                    }),
                });
            }

            document.getElementById("title").value = "";
            document.getElementById("abstract").value = "";
            setRefAdvisor(null);
            setValues([]);
            setReqAdvisor([]);
            setRefThesis([]);
            setUploadedFile(null);
            document.getElementById("file-input").value = null;
            
        } catch (error) {
            console.error('Error:', error);
            alert("Error submitting thesis, please try again later.");
            document.getElementById("title").value = "";
            document.getElementById("abstract").value = "";
            setRefAdvisor(null);
            setValues([]);
            setReqAdvisor([]);
            setRefThesis([]);
            setUploadedFile(null);
            document.getElementById("file-input").value = null;
        }
    };


    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: '30px',
            padding: '1%',
            border: 'none',
            backgroundColor: '#2b2b2b',
            boxShadow: 'inset 4px 4px 5px rgb(65, 65, 65)',
            color: 'white',
            lineHeight: '150%',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#131313',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#2b2b2b' : state.isFocused ? '#3f3f3f' : '#131313',
            color: state.isSelected ? 'white' : 'white',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white',
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#2b2b2b',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: 'white',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: 'white',
            ':hover': {
                backgroundColor: '#ff6347',
                color: 'white',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#c9d1d9',
            textAlign: 'left',
            paddingLeft: '10px',
        }),
    };

    const handleAddValue = () => {
        if (typeof inputValue === 'string') {
            const trimmedValue = inputValue.trim();
            if (trimmedValue && !values.includes(trimmedValue) && values.length<10 && trimmedValue.length!=0) {
            setValues([...values, trimmedValue]);
            setInputValue([]);
            }
            
            console.log("inputValue: ",inputValue)
            console.log("values: ",values)
        }
        
      };

    

    const handleRemoveValue = (index) => {
        setValues(values.filter((_, i) => i !== index));
      };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddValue();
        }
      };

    const handleRefSelectChange = (selectedOptions) => {
        console.log("seloptions:", selectedOptions);
        setRefAdvisor(selectedOptions ? selectedOptions.value : null);
    };
    const handleReqSelectChange = (selectedOptions) => {
        if (selectedOptions.length > 3) {
            // Prevent user from selecting more than 3
            selectedOptions = selectedOptions.slice(0, 3);
            alert('You can not select more than 3 advisors for review');
          }
          
          // Update state with the selected options
        setReqAdvisor(selectedOptions ? selectedOptions.map(option => option.value) : []);
    };
    const handleThesisSelectChange = (selectedOptions) => {
        setRefThesis(selectedOptions ? selectedOptions.map(option => option.value) : []);
        // fetch('http://localhost:3001/api/searchThesis/getTitle/:', {
        //     method: 'GET',
        //     headers: { 'Content-Type': 'application/json' },
        // })
        //     .then(response => console.log(response.json()))
    };

    const handleAdvisorSelectChange = (selectedOptions) => {
        setAdvisor(selectedOptions ? selectedOptions.map(option => option.value) : []);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/template.docx';
        link.setAttribute('download', 'ThesisTemplate.docx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleGuidelinesDownload = () => {
        const link = document.createElement('a');
        link.href = '/Guidelines.pdf';
        link.setAttribute('download', 'Guidelines.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile(file.name);
        }
    };

    return (
        <div>
            <SearchNavBar />

            <div className="fcenter">
                <fieldset className='fieldset'>
                    <legend className='legendA'>
                        <h2>Submit Thesis</h2>
                    </legend>
                    <form action="#" className="submitform" id="forms" onSubmit={handleFormSubmit}>
                        <div className="containerB">
                        <button className="button-template" onClick={handleGuidelinesDownload}>
                                <FaDownload />  &nbsp; Download Guidelines
                            </button> <br />
                            
                            <input type="text" className="text-input" id="title" placeholder="Enter Thesis Title here" required />
                            <br />
                            <textarea id="abstract" placeholder="Enter Abstract here"></textarea>
                            <br />

                            <div className="keyword-container">
                                {values.map((value, index) => (
                                    <div key={index} className="keyword">
                                        <span>{value}</span>
                                        <button className="remove-keyword" onClick={() => handleRemoveValue(index)}>
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    className="keyword-input"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type Keywords and press Enter..."
                                />
                            </div>
                            

                            <br />

                            {/* Multi-select for referenced advisors */}
                            <Select
                                styles={customStyles}
                                options={advisorOptions} // Use the fetched options here
                                isMulti={false}
                                onChange={handleRefSelectChange}
                                placeholder="Select Referenced Advisor"
                                value={advisorOptions.find(option => option.value === refadvisor) ? [{ label: advisorOptions.find(option => option.value === refadvisor).label, value: refadvisor }] : []}
                            />
                            <br />

                            {/* Multi-select for referenced theses */}
                          {/*  <Select
                                styles={customStyles}
                                options={thesesOptions}
                                isMulti
                                onChange={handleThesisSelectChange}
                                placeholder="Select Referenced Thesis"
                                value={[ ]}
                            />
                            <br />*/}

                            <button className="button-template" onClick={handleDownload}>
                                <FaDownload />  &nbsp; Download Template
                            </button>
                            <br />

                            <Select
                                styles={customStyles}
                                options={advisorOptions} // Use fetched advisor options
                                isMulti
                                onChange={handleReqSelectChange}
                                placeholder="Review Requested From"
                                value={advisorOptions.filter(option => reqadvisor.includes(option.value))}
                                
                            />
                            <br />

                            <label htmlFor="file-upload" className="button-template">
                                <IoCloudUpload /> &nbsp; Upload File (.pdf)
                                <input type="file" name="file" id="file-input" onChange={handleFileChange} accept=".pdf" required />
                            </label>
                            {uploadedFile && (
                                <div className="uploaded-file">
                                    <span>{uploadedFile}</span>
                                </div>
                            )}
                            <br />

                            <div className='input3'>
                                <button className="button-85">
                                    Submit Thesis
                                    <form></form>
                                </button>
                            </div>
                        </div>
                    </form>
                </fieldset>
            </div>
            <Footer />
        </div>
    );
}

export default SubmitThesis;
