import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import './PostPreview.css';

const PostPreview = ({ post, currentUser, onPress }) => {
    const {
        post_id,
        title,
        description,
        user_id,
        likes: initialLikes,
        comments: initialComments,
        programmingLanguage,
        topic,
        answered,
    } = post;

    const [likes, setLikes] = useState(initialLikes);
    const [comments, setComments] = useState(initialComments);

    return (
        <div className="post-card" onClick={() => onPress(post)}>
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
                <div className="footer-item">
                    <FontAwesomeIcon icon={faThumbsUp} size="sm" color="#888" />
                    <span className="footer-text">{likes} Likes</span>
                </div>
                <div className="footer-item">
                    <FontAwesomeIcon icon={faCommentDots} size="sm" color="#888" />
                    <span className="footer-text">{comments} Comments</span>
                </div>
            </div>
        </div>
    );
};

export default PostPreview;
