import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faCommentDots, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import './PostPreview.css';


const PostPreview = ({ post, currentUser, onClick }) => {
    const {
        id,
        title,
        description,
        user_id,
        upvotes,
        comments_count,
        programmingLanguage,
        codeSnippet,
        tags,
        topic,
        answered,
    } = post;

    const [isUpvoting, setIsUpvoting] = useState(false);
    const [isDownvoting, setIsDownvoting] = useState(false);
    const [animateUpvote, setAnimateUpvote] = useState(false);
    const [animateDownvote, setAnimateDownvote] = useState(false);


    const handleUpvote = async (e) => {
        e.stopPropagation();
        if (isUpvoting) return;
    
        setIsUpvoting(true);
        setAnimateUpvote(true); // Trigger the animation
    
        setTimeout(() => setAnimateUpvote(false), 500); // Reset animation after 500ms
        // TODO: delete
        console.log("Upvoting post:", post);
        try { 
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upvote_object/question/${post.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': localStorage.getItem('user_id'),
                },
            });
    
            if (response.ok) {
                const data = await response.json();
            }
        } catch (error) {
            console.error('Error upvoting:', error);
        } finally {
            setIsUpvoting(false);
        }
    };
    
    const handleDownvote = async (e) => {
        e.stopPropagation();
        if (isDownvoting) return;
    
        setIsDownvoting(true);
        setAnimateDownvote(true); // Trigger the animation
    
        setTimeout(() => setAnimateDownvote(false), 500); // Reset animation after 500ms
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}downvote_question/${post.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': currentUser.id,
                },
            });
    
            if (response.ok) {
                const data = await response.json();
            }
        } catch (error) {
            console.error('Error downvoting:', error);
        } finally {
            setIsDownvoting(false);
        }
    };
 
    return (
        <div className="post-card" onClick={onClick}>
            <div className={`status-label ${answered ? 'answered' : 'unanswered'}`}>
                {answered ? 'Answered' : 'Unanswered'}
            </div>

            <h3 className="post-title">{title}</h3>

            <div className="labels-container">
                <span className="label">{programmingLanguage}</span>
                <span className="label">{topic}</span>
            </div>

            <p className="post-description">{description}</p>

            <div className="post-footer">
                <div
                    className={`footer-item ${animateUpvote ? 'upvote-animate' : ''}`}
                    onClick={handleUpvote}
                >
                    <FontAwesomeIcon icon={faThumbsUp} size="sm" color="#888" />
                    <span className="footer-text">{upvotes} Upvotes</span>
                </div>
                <div
                    className={`footer-item ${animateDownvote ? 'downvote-animate' : ''}`}
                    onClick={handleDownvote}
                >
                    <FontAwesomeIcon icon={faThumbsDown} size="sm" color="#888" />
                    <span className="footer-text">{upvotes} Downvotes</span>
                </div>
                <div className="footer-item">
                    <FontAwesomeIcon icon={faCommentDots} size="sm" color="#888" />
                    <span className="footer-text">{comments_count} Comments</span>
                </div>
            </div>
        </div>
    );
};

export default PostPreview;
