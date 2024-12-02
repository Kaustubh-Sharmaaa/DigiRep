import React, { useRef, useEffect, useState } from 'react';
import '../css/ViewThesis.css';
import Footer from './Footer';
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import SearchNavbar from './SearchNavBar';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ChatComponent from './ChatComponent';
import { jsPDF } from "jspdf";



var curr_thesis_author = "";
var is_thesis_published = true;

const exportThesisDetails = async (thesis) => {
    if (!thesis) {
        console.error("Invalid thesis or comments data");
        alert("Thesis details are incomplete or corrupted.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/get-comments/${thesis.thesisId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }
        const comments = await response.json();

        // Create a new jsPDF instance
        const doc = new jsPDF();

        // Title of the document
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Thesis Details", 10, 20);

        // Thesis Information
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Title: ${thesis.title || "No Title Available"}`, 10, 30);
        doc.text(`Author: ${thesis.authors || "No Author Available"}`, 10, 40);
        doc.text(`Referenced Advisor: ${thesis.refadvisor} : ${thesis.refAdvisorAcceptance}`, 10, 50)
        doc.text(`Submitted On: ${thesis.submittedDatetime.split('T')[0]}`, 10, 60)
        doc.text(`Publish Satatus: ${thesis.publishStatus}`, 10, 70)
        doc.text(
            `Publish Date: ${thesis.publishDatetime ? thesis.publishDatetime.split('T')[0] : "Not yet published"}`,
            10,
            80
        );

        doc.text(`Number of Likes: ${thesis.likes || 0}`, 10, 90);
        doc.text(`Number of Downloads: ${thesis.downloadsCount || 0}`, 10, 100);
        //Keywords
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Keywords:", 10, 110);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${thesis.thesisKeywords}`, 10, 120)
        //Abstract
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Abstract:", 10, 130);
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.text(`${thesis.abstract}`, 15, 140)
        //Advisors Section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Advisors:", 10, 150);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${thesis.advisor1} : ${thesis.req1ReviewStatus}`, 10, 160)
        doc.text(`${thesis.advisor2} : ${thesis.req2ReviewStatus}`, 10, 170)
        doc.text(`${thesis.advisor3} : ${thesis.req3ReviewStatus}`, 10, 180)
        // Comments Section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Comments:", 10, 190);

        // Dynamically add comments
        let yOffset = 200;
        if (comments.length === 0) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.text('No Comments', 10, yOffset);
        }
        else {
            comments.forEach(comment => {
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${comment.name}:`, 10, yOffset);
                yOffset += 10;
                doc.setFont("helvetica", "italic");
                doc.text(`${comment.commenttext}`, 15, yOffset);
                yOffset += 10;
            }
            );
        }

        // Save the PDF
        doc.save('Thesis_Details.pdf');
    } catch (error) {
        console.error('Error fetching comments:', error);
        alert("Failed to fetch comments for exporting.");
    }
};


const TopThesis = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentThesisId = searchParams.get('query'); // Get the current thesis ID from URL
    const [relatedTheses, setRelatedTheses] = useState([]);

    useEffect(() => {
        const fetchRelatedTheses = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/gettopthesis`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                if (Array.isArray(data)) {
                    // Optionally filter out the current thesis if necessary
                    setRelatedTheses(data.slice(0, 5));
                } else {
                    console.error('Expected an array but got:', data);
                    setRelatedTheses([]);
                }
                console.log("data:", data);
            } catch (error) {
                console.error('Error fetching related theses:', error);
            }
        };

        fetchRelatedTheses();
    }, [currentThesisId]); // Added currentThesisId as a dependency

    const handleRedirect = (id) => {
        navigate(`/viewthesis?query=${id}`);
    };

    return (
        <div className="topthesis">
            <h2 className="sidebarH2">Top Thesis</h2>
            <ul>
                {relatedTheses.length > 0 ? (
                    relatedTheses.map((thesisButton) => (
                        <li key={thesisButton.thesisId}>
                            <button className="sidebar-buttons" onClick={() => handleRedirect(thesisButton.thesisId)}>
                                {thesisButton.title}
                            </button>
                        </li>
                    ))
                ) : (
                    <li>No content available</li>  // Display this when there are no related theses
                )}
            </ul>
        </div>
    );
};


const FromAuthor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentThesisId = searchParams.get('query'); // Get the current thesis ID from URL
    const [thesis, setThesis] = useState(null);
    const [relatedTheses, setRelatedTheses] = useState([]);

    useEffect(() => {
        const fetchThesisData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/view-thesis/${currentThesisId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setThesis(data);
            } catch (error) {
                console.error('Error fetching thesis data:', error);
            }
        };

        if (currentThesisId) {
            fetchThesisData();
        }
    }, [currentThesisId]);

    console.log(thesis);
    if (thesis) {
        curr_thesis_author = thesis.studentId;
        console.log("current thesis author: ", curr_thesis_author);
    }

    useEffect(() => {
        if (thesis && thesis.studentId) {
            const fetchRelatedTheses = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/getauthorthesis/${thesis.studentId}`);
                    if (!response.ok) throw new Error('Failed to fetch');
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        const filteredTheses = data.filter(item => item.thesisId !== currentThesisId); // Filter out the current thesis
                        setRelatedTheses(filteredTheses.slice(0, 5));
                    } else {
                        console.error('Expected an array but got:', data);
                        setRelatedTheses([]);
                    }
                } catch (error) {
                    console.error('Error fetching related theses:', error);
                }
            };

            fetchRelatedTheses();
        }
    }, [thesis, currentThesisId]); // Include currentThesisId in dependencies for completeness

    if (relatedTheses.length === 0) {
        return null;
    }

    const handleRedirect = (id) => {
        navigate(`/viewthesis?query=${id}`);
    };

    return (
        <div className="fromauthor">
            <h2 className="sidebarH2">Other Works by Author</h2>
            <ul>
                {relatedTheses.map((thesisButton) => (
                    <li key={thesisButton.thesisId}>
                        <button className="sidebar-buttons" onClick={() => handleRedirect(thesisButton.thesisId)}>
                            {thesisButton.title}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};



const Sidebar = () => (
    <aside className="sidebar">
        <TopThesis />
        <FromAuthor />
    </aside>
);

function extractUserId(user) {
    if (!user) {
        return (null);
    }
    else {
        switch (user.role) {
            case 'Advisor':
                return (user.advisorID);
            case 'Student':
                return (user.studentID);
            case 'DepartmentAdmin':
                return (user.departmentAdminID);
            default:
                return null;
        }
    }
}

function ThesisContent() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('query');
    const [thesis, setThesis] = useState(null);
    const [tab, setTab] = useState('Abstract');
    const [liked, setLiked] = useState(false); // To track whether the thesis has been liked
    const [references, setReferences] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');

    const userData = JSON.parse(sessionStorage.getItem('user'));
    const userId = extractUserId(userData);

    useEffect(() => {
        const fetchThesisData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/view-thesis/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.thesisKeywords) {
                    data.thesisKeywords = data.thesisKeywords.join(', ');
                }
                setThesis(data);
                if (data.publishStatus != 'APPROVED') {
                    is_thesis_published = false;
                }  // Set thesis data
            } catch (error) {
                console.error("Error fetching thesis data:", error);
            }
        };

        if (id) {
            fetchThesisData();
        }
    }, [id]);  // Dependency only on id
    useEffect(() => {
        const fetchAdvisorsAndCheckLike = async () => {
            // Fetch advisors if thesis data is available and contains advisor IDs
            if (thesis && (thesis.adv1 || thesis.adv2 || thesis.adv3)) {
                const advisorIds = [thesis.adv1, thesis.adv2, thesis.adv3].filter(Boolean);
                fetchAdvisors(advisorIds);
            }

            if (userId) {
                try {
                    const likeResponse = await fetch(`http://localhost:3001/api/check-like/${id}/${userId}`);
                    if (likeResponse.ok) {
                        const likeData = await likeResponse.json();
                        setLiked(likeData.liked);
                    }
                } catch (error) {
                    console.error('Error checking like status:', error);
                }
            }
        };

        fetchAdvisorsAndCheckLike();
    }, [thesis, userId]);

    useEffect(() => {
        if (thesis && thesis.refThesisID && thesis.refThesisID.length > 0) {
            const fetchReferences = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/get-references/${thesis.refThesisID.join(',')}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch references: ${response.statusText}`);
                    }
                    const refs = await response.json();
                    setReferences(refs.map(ref => ref.title)); // Assuming the API returns an array of objects with a title property
                } catch (error) {
                    console.error("Error fetching references:", error);
                    setReferences(['Error fetching references']);
                }
            };
            fetchReferences();
        } else {
            setReferences([]); // Clear references if there are none
        }
    }, [thesis]); // Dependency on thesis object


    function handleLike() {
        if (!userId) {
            alert("Cannot like without signing in.");
            return;
        }
        const newLikedState = !liked;
        setLiked(newLikedState);

        // Toggle the liked status on the server
        fetch(`http://localhost:3001/api/toggle-like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, thesisId: id, liked: newLikedState }),
        })
            .then(response => response.json())
            .then(() => {
                setThesis(prevThesis => ({
                    ...prevThesis,
                    likes: newLikedState ? prevThesis.likes + 1 : prevThesis.likes - 1
                }));
            })
            .catch(error => console.error('Error updating like status:', error));
    }


    const fetchAdvisors = async (advisorIds) => {
        try {
            const uniqueIds = [...new Set(advisorIds.filter(id => id))]; // Remove duplicates and null/undefined values
            const promises = uniqueIds.map(id =>
                fetch(`http://localhost:3001/api/getadvisor/${id}`).then(res => res.json())
            );
            const advisorsData = await Promise.all(promises);

            // Safely handle advisor data and associate reviewStatus
            const updatedAdvisors = advisorsData.map((advisor, index) => {
                const reviewStatusKey = `req${index + 1}ReviewStatus`; // Dynamically access the review status
                return {
                    ...advisor,
                    reviewStatus: thesis && thesis[reviewStatusKey] !== undefined
                        ? thesis[reviewStatusKey]
                        : 'cant find' // Set a default value if the status is not available
                };
            });

            setAdvisors(updatedAdvisors);
            console.log("ADVISOR DATA: ", updatedAdvisors);
            console.log(thesis['req1ReviewStatus'])
        } catch (error) {
            console.error('Error fetching advisors:', error);
        }
    };




    const renderAdvisors = () => {
        return advisors.map(advisor => (<div> {advisor.firstName} {advisor.lastName}: {advisor.reviewStatus} </div>))
    };


    const handleDownload = (id) => {
        fetch(`http://localhost:3001/api/download/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch file with status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error("Error downloading file:", error);
            });
    };

    const handleView = (id) => {
        fetch(`http://localhost:3001/api/viewfile/${id}`, {
            method: 'GET',
        })
            .then(response => {
                if (response.ok) {
                    return response.blob(); // Convert response to a blob
                }
                throw new Error('File not found');
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank'); // Open PDF in a new tab
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error("Error opening file:", error);
                alert("Error opening file. Please check the console for more details.");
            });
    };

    const getContent = () => {
        if (!thesis) {
            return 'Error! Try again!';
        }

        switch (tab) {
            case 'Abstract':
                return thesis.abstract || 'No abstract available';
            case 'Author':
                return thesis.authors || 'No authors available';
            case 'References':
                return (
                    <div>
                        <b>Referenced Advisor:</b>
                        <p>{thesis.refadvisor}: {thesis.refAdvisorAcceptance}</p>
                        <b>Reviewed By:</b>
                        <p>{renderAdvisors()}</p>
                    </div>
                );





            case 'Keywords':
                return thesis.thesisKeywords || 'No keywords available';
            default:
                return thesis.abstract || 'No abstract available';
        }
    };

    const handleExportDetails = () => {
        if (!thesis) {
            alert("Thesis details are incomplete.");
            return;
        }
        console.log("thesis data being passed: ", thesis);
        exportThesisDetails(thesis);
    };

    return (
        <div className="thesis-content">
            {thesis ? (
                <>
                    <h1 className="Thesis-title">{thesis.title}<br /></h1>
                    <div className="meta">
                        <span>
                            {thesis.publishStatus === 'APPROVED' ?
                                `Published by: ${thesis.authors} on ${thesis.publishDatetime.split('T')[0]}` :
                                `Submitted by: ${thesis.authors} on ${thesis.submittedDatetime.split('T')[0]}`
                            }
                        </span>
                        <div className='thesis-buttons'>
                            <button onClick={() => handleView(id)}><i class="fa fa-eye"></i>View</button>
                            <button
                                onClick={() => handleLike()}
                                style={{ backgroundColor: liked ? 'rgb(0, 64, 255)' : '' }}
                            >
                                {liked ? <FaThumbsDown color='white' /> : <FaThumbsUp color='white' />}
                                {liked ? ' Unlike' : ' Like'} {thesis?.likes ?? 0}
                            </button>


                            <div className='divider' />
                            <button onClick={() => handleDownload(thesis.thesisId)}><FaDownload />Download</button>
                            <button onClick={() => handleExportDetails()}>Export Details</button>
                        </div>
                    </div>
                    <div className="tabs">
                        <button className='thesis-nav-button' onClick={() => setTab('Abstract')}>Abstract</button>
                        <button className='thesis-nav-button' onClick={() => setTab('Author')}>Authors</button>
                        <button className='thesis-nav-button' onClick={() => setTab('Keywords')}>Keywords</button>
                        <button className='thesis-nav-button' onClick={() => setTab('References')}>Details</button>
                    </div>
                    <div><br></br>
                    </div>
                    <div className="Thesis-text">
                        {getContent()}
                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}


const Comments = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentThesisId = searchParams.get('query'); // Get the current thesis ID from URL
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState(''); // State to hold the comment text
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const userId = extractUserId(userData);

    console.log("user ID is : ", userId);
    // Fetch comments for the thesis
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/get-comments/${currentThesisId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }
                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        if (currentThesisId) {
            fetchComments();
        }
    }, [currentThesisId]);

    // Handle form submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) {
            alert("Please write a comment before submitting.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/post-comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    name: userData.firstName + ' ' + userData.lastName, // Assuming user's name is stored in session
                    thesisId: currentThesisId,
                    commenttext: commentText
                })
            });

            if (response.ok) {
                const newComment = await response.json();
                setComments([...comments, newComment]); // Update comments list without refetching
                setCommentText(''); // Clear the textarea
            } else {
                throw new Error('Failed to post comment');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Error posting comment');
        }
    };

    // Handle comment deletion
    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/delete-comment/${commentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setComments(comments.filter(comment => comment.id !== commentId)); // Remove comment from list
            } else {
                throw new Error('Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Error deleting comment');
        }
    };

    return (
        <div className="comments">
            <h2>Comments</h2>
            <div className="comments-container">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div className="comment" key={comment.id}>
                            <p className='commenter-name'>{comment.name}</p>
                            <p className='comment-text'>{comment.commenttext}</p>
                            {((comment.userId === userId) || (curr_thesis_author === userId)) && (
                                <button className='comment-button-report' onClick={() => handleDeleteComment(comment.id)}><FaTrashAlt /> Delete</button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No Comments</p>
                )}
            </div>

            {userId && is_thesis_published ? (
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <textarea
                        placeholder="Add a comment..."
                        required
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                    ></textarea>
                    <button type="submit" className='Comment-submit'>Post Comment</button>
                </form>
            ) : (
                !is_thesis_published ? (<p>Comments are disabled. Please wait for the thesis to be published.</p>) : (
                    <p>Comments are disabled. Please <a href="RegisterLogin">log in</a> to post comments.</p>)
            )}

        </div>
    );
};



const Thesis = () => (
    <div className="Thesis-container">
        <Sidebar />
        <ThesisContent />
        <Comments />
    </div>
);

const ViewThesis = () => {
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const storedUserData = JSON.parse(sessionStorage.getItem('user'));
        if (storedUserData) {
            setUserData(storedUserData);
        }
    }, []);
    return (
        <div>
            <SearchNavbar />
            <br></br>
            <div className="thesis-field">
                <Thesis />
            </div>
            <br></br>
            <Footer />
            {userData && userData?.role != 'Department Admin' ? <ChatComponent /> : null}
        </div>
    )
};


export default ViewThesis;