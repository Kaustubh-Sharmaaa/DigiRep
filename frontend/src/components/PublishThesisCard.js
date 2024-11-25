import React, { useRef, useEffect, useState } from 'react';
import '../css/Statistics.css';
import { useNavigate } from 'react-router-dom';
 
function PublishThesisCard({ thesis, isTrending, onActionComplete }) {
    const { thesisId, title, authors, firstName, lastName, submittedDatetime, abstract, publishedDateTime } = thesis;
    const navigate = useNavigate();
    const [showAbstract, setShowAbstract] = useState(false);
   console.log("thesis",thesis);
    const handleViewClick = () => {
        navigate(`/viewthesis?query=${thesisId}`);
    };
 
    const toggleAbstract = () => {
        setShowAbstract(!showAbstract);
    };
    const handlePublish = (thesisId) => {
        const confirmPublish = window.confirm("Are you sure you want to publish this thesis?");
        if (confirmPublish) {
            fetch(`http://localhost:3001/api/publish-thesis/${thesisId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message == "thesis published successfully") {
                        if (onActionComplete) {
                            onActionComplete();
                        }
                        alert("Thesis published successfully!");
                       
                       
                    } else {
                        alert("Failed to publish thesis. Please try again.");
                    }
                })
                .catch(error => {
                    console.log("Error publishing thesis:", error);
                    alert("An error occurred. Please try again.");
                });
        }
    };
 
    const titleRef = useRef(null);
 
    useEffect(() => {
        if (titleRef.current) {
            const currentFontSize = window.getComputedStyle(titleRef.current, null).getPropertyValue('font-size');
            let newSize = parseInt(currentFontSize);
            while (titleRef.current.scrollWidth > titleRef.current.offsetWidth && newSize > 8) {
                newSize--;
                titleRef.current.style.fontSize = `${newSize}px`;
            }
        }
    }, [title]);
 
    return (
        <div className="thesis-card">
            <div ref={titleRef} className="thesis-card-title"><strong>{title}</strong></div>
            {showAbstract ? (
                <div>
                    <p><strong>Abstract:</strong></p>
                    <p>{abstract}</p>
                </div>
            ) : (
                <div>
                    <p>{isTrending
                            ? `Submitted by: ${firstName || "Unknown"} ${lastName || "Unknown"}`
                            : `Authors: ${authors}`}</p>
                   
                    <p><strong>Submitted Date: </strong>{submittedDatetime}</p>
                </div>
            )}
            <div className="thesis-actions">
            <button className="view-btn" onClick={() => handlePublish(thesisId)}>Publish</button>
                <button className="preview-btn" onClick={toggleAbstract}>
                    {showAbstract ? "Back" : "Preview"}
                </button>
                <button className="view-btn" onClick={handleViewClick}>View</button>
            </div>
        </div>
    );
}
export default PublishThesisCard;