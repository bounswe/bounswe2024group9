import React, { useState, useRef, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import * as PropTypes from "prop-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { faThumbsUp, faCommentDots, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import './QuestionDetail.css';
import EditQuestion from "./EditQuestion";
import { showNotification } from "./NotificationCenter";
import NotificationCenter from "./NotificationCenter";

function QuestionDetail(props) {
  const [votes, setVotes] = useState(props.initialVotes);
  const isOwner = localStorage.getItem("username") === props.author;
  const [author] = useState(props.author);
  const navigate = useNavigate();

  const [isAnswered, setAnswered] = useState(props.isAnswered);

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const openPopup = () => setIsPopupVisible(true);
  const closePopup = () => setIsPopupVisible(false);
  const popupRef = useRef(null);

  const redirectToProfile = () => navigate(`/profile/${author}`);

  useEffect(() => {
    const handleClickOutside = event => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupVisible(false);
      }
    };

    if (isPopupVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupVisible]);

    // Vote handlers
    const handlePostUpvote = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upvote_object/question/${props.question_id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': localStorage.getItem('user_id'),
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {

                const data = await response.json();
                setVotes(data.success);
            }
        } catch (error) {
            console.error('Error upvoting:', error);
        }
    };
    const handlePostDownvote = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/downvote_object/question/${props.question_id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': localStorage.getItem('user_id'),
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {

                const data = await response.json();
                setVotes(data.success);
            }
        } catch (error) {
            console.error('Error downvoting:', error);
        }
    };
    const handleEditQuestion = async () => {
        openPopup();
    };
    const handleDeleteQuestion = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/delete_question/${props.question_id}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': localStorage.getItem('user_id'),
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {

                const data = await response.json();
                navigate(`/feed`);
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    useEffect(() => {
        setAnswered(props.isAnswered);
    }, [props.isAnswered]);
    
    return (
        <div className="question-post-card">
        <div className={`status-indicator ${isAnswered ? 'answered' : 'unanswered'}`}>
            <span className="status-text">{isAnswered ? 'Answered' : 'Unanswered'}</span>
        </div>        
        <h1 className="question-title">{props.title}</h1>
    
        {props.language && (
            <div className="question-language">
                <span className="language">{props.language}</span>
            </div>
        )}
    
        {props.tags && (
            <div className="question-tags">
                {props.tags.map((tag, index) => (
                    <span key={index} className="label">{tag}</span>
                ))}
            </div>
        )}
    
        <h3 className="question-input-type">{props.inputType}:</h3>
        <p className="question-description">{props.explanation}</p>
    
        <SyntaxHighlighter language="javascript" style={docco}>
            {props.code}
        </SyntaxHighlighter>
    
        <div className="question-footer">
            
            <div className="footer-item" onClick={handlePostUpvote}>
                <button className="vote-button">Upvote</button>
                <span className="footer-text">{votes} Upvotes</span>
            </div>
            <div className="footer-item" onClick={handlePostDownvote}>
                <button className="vote-button">Downvote</button>
            </div>
            {isOwner && (
                <div className="owner-actions">
                    <button onClick={handleEditQuestion} className="edit-button">Edit</button>
                    <button onClick={handleDeleteQuestion} className="delete-button">Delete</button>
                </div>
            )}
            <button className="question-username" onClick={redirectToProfile}>@{props.author}</button>
        </div>
    </div>
    );
}

QuestionDetail.propTypes = {
    code: PropTypes.string,
    language: PropTypes.string,
    inputType: PropTypes.string.isRequired,
    explanation: PropTypes.string,
    number: PropTypes.number,
    initialVotes: PropTypes.number,
    comment_id: PropTypes.number,
    author: PropTypes.string,
    answer_of_the_question: PropTypes.bool
};

export default QuestionDetail;
