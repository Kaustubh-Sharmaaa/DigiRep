import React, { useRef, useEffect, useState } from 'react';
import '../css/ViewThesis.css';
import Footer from './Footer';
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";
import SearchNavbar from './SearchNavBar';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

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
    switch (user.role) {
        case 'Advisor':
            return user.advisorID;
        case 'Student':
            return user.studentID;
        case 'DepartmentAdmin':
            return user.departmentAdminID;
        default:
            return null;
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


    const userData = JSON.parse(sessionStorage.getItem('user'));
    const userId = extractUserId(userData);

    useEffect(() => {
        const fetchThesisData = async () => {
            const response = await fetch(`http://localhost:3001/api/view-thesis/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.thesisKeywords) {
                data.thesisKeywords = data.thesisKeywords.join(', ');
            }
            setThesis(data);

            // Fetch whether the user has liked this thesis
            const likeResponse = await fetch(`http://localhost:3001/api/check-like/${id}/${userId}`);
            if (likeResponse.ok) {
                const likeData = await likeResponse.json();
                setLiked(likeData.liked);
            }
        };

        if (id) {
            fetchThesisData();
        }
    }, [id, userId]);

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
        if (thesis) {
            const newLikedState = !liked;
            setLiked(newLikedState);

            // API to update the database on like or unlike action
            fetch(`http://localhost:3001/api/toggle-like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, thesisId: id, liked: newLikedState }),
            })
                .then(response => response.json())
                .then(() => {
                    setThesis({ ...thesis, likes: newLikedState ? thesis.likes + 1 : thesis.likes - 1 });
                })
                .catch(error => console.error('Error updating like status:', error));
        }
    }

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
                return references.length > 0 ? references.join(', ') : 'No references available';
            case 'Keywords':
                return thesis.thesisKeywords || 'No keywords available';
            default:
                return thesis.abstract || 'No abstract available';
        }
    };

    return (
        <div className="thesis-content">
            {thesis ? (
                <>
                    <h1 className="Thesis-title">{thesis.title}<br /></h1>
                    <div className="meta">
                        <span>Published by: {thesis.authors}</span>
                        <div className='thesis-buttons'>
                            <button onClick={() => handleView(id)}><i class="fa fa-eye"></i>View</button>
                            <button style={{ backgroundColor: liked ? 'rgb(0, 64, 255)' : '' }}
                                onClick={handleLike}>
                                {liked ? <FaThumbsDown color='white' /> : <FaThumbsUp color='white' />}
                                {liked ? ' Unlike' : ' Like'} {thesis.likes}
                            </button>
                            <div className='divider' />
                            <button onClick={() => handleDownload(thesis.thesisId)}>Download</button>
                            {/* <button onClick={() => handleDownload(id)}><FaDownload color='white' /> Download</button> */}
                        </div>
                    </div>
                    <div className="tabs">
                        <button className='thesis-nav-button' onClick={() => setTab('Abstract')}>Abstract</button>
                        <button className='thesis-nav-button' onClick={() => setTab('Author')}>Authors</button>
                        <button className='thesis-nav-button' onClick={() => setTab('Keywords')}>Keywords</button>
                        <button className='thesis-nav-button' onClick={() => setTab('References')}>References</button>
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
    const userId = userData.id; // Assuming the session storage has user 'id' directly

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

    return (
        <div className="comments">
            <h2>Comments</h2>
            <div className="comments-container">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div className="comment" key={comment.id}>
                            <p className='commenter-name'>{comment.name}</p>
                            <p className='comment-text'>{comment.commenttext}</p>
                            {/* <button className='comment-button-like'><FaThumbsUp /> Like</button>
                            <button className='comment-button-report'><TbMessageReport /> Report</button> */}
                        </div>
                    ))
                ) : (
                    <p>No Comments</p>
                )}
            </div>
            <form className="comment-form" onSubmit={handleCommentSubmit}>
                <textarea
                    placeholder="Add a comment..."
                    required
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                ></textarea>
                <button type="submit" className='Comment-submit'>Post Comment</button>
            </form>
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

const ViewThesis = () => (
    <div>
        <SearchNavbar />
        <br></br>
        <div className="thesis-field">
            <Thesis />
        </div>
        <br></br>
        <Footer />
    </div>
);


export default ViewThesis;

