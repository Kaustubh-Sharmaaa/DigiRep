// src/components/CommentModal.js
import React, { useState } from 'react';
import '../css/CommentModal.css';

const CommentModal = ({ isOpen, onClose, onSubmit, actionType }) => {
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        // Confirmation dialog
        const actionMessage = actionType === 'approve' ? 'approve' : 'decline';
        const confirmation = window.confirm(`Are you sure you want to ${actionMessage} this thesis?`);

        if (!confirmation) {
            // If the user cancels, do nothing
            return;
        }

        onSubmit(comment); // Pass the comment to the parent component
        setComment(''); // Clear the comment field after submission
        onClose(); // Close the modal
    };

    const handleCancel = () => {
        setComment(''); // Clear the comment field on cancel
        onClose(); // Close the modal
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{actionType === 'approve' ? 'Approve Thesis' : 'Decline Thesis'}</h2>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your comments here..."
                />
                <div>
                    <button onClick={handleSubmit}>{actionType === 'approve' ? 'Approve' : 'Decline'}</button>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;