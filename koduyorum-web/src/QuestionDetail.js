import React, { useState, useRef, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import * as PropTypes from "prop-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faCommentDots, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import './QuestionDetail.css';
import './PostPreview.css'
import EditQuestion from "./EditQuestion";
import { showNotification } from "./NotificationCenter";
import NotificationCenter from "./NotificationCenter";

function QuestionDetail(props) {
  const [votes, setVotes] = useState(props.upvotes);
  const isOwner = localStorage.getItem("username") === props.author;
  const isDiscussion = "discussion" === props.postType;
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
  const fetchWikiIdAndName = async (tag) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/search/${tag}`,
              {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                  },
              }

        );
         if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Assuming the API returns an array of results and the first one is the most relevant
        return [data.results.bindings[0]?.language?.value.split('/').pop(), data.results.bindings[0]?.languageLabel?.value]; // returns [wikiId, wikiName]
    } catch (error) {
        console.error("Error fetching wiki ID:", error);
        return null;
    }
  };
  const handleSearchResultClick = async (result) => {
    const wikiIdName = await fetchWikiIdAndName(result.languageLabel.value);
    const wikiId = wikiIdName[0];
    const wikiName = wikiIdName[1];
    console.log("Wiki ID and Name:", wikiId, wikiName);
    if (wikiId) {
        console.log("Navigating to:", `/result/${wikiId}/${encodeURIComponent(wikiName)}`);
        navigate(`/result/${wikiId}/${encodeURIComponent(wikiName)}`);
    } else {
        console.error("No wiki ID found for search result:", result);
    }
};
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
        <div className={`status-indicator ${isDiscussion ? 'discussion': isAnswered ? 'answered' : 'unanswered'}`}>
            <span className="status-text">{isDiscussion ? 'Discussion': isAnswered ? 'Answered' : 'Unanswered'}</span>
        </div>        
        <h1 className="question-title">{props.title}</h1>
    
        {props.language && (
            <div className="question-language" >
                <button className="language" onClick={(e) => {
                e.stopPropagation(); // Prevent the click event from propagating to the outer box
                handleSearchResultClick(
                    { languageLabel: { value: props.language } },
                );
            }
            }>{props.language} </button>
            </div>
        )}
    
        {props.tags && (
            <div className="question-tags">
                {props.tags.map((tag, index) => (
                    <button key={index} className="label"onClick={(e) => {
                        e.stopPropagation(); // Prevent the click event from propagating to the outer box
                        handleSearchResultClick(
                            { languageLabel: { value: tag } },
                        );
                    }
                    }>{tag}</button>
                ))}
            </div>
        )}
    
        <h3 className="question-input-type">{isDiscussion ? '' : props.inputType+":"}</h3>
        <div className="mt-2 text-gray-600" onMouseUp={(e) => props.onTextSelection(e, 'question')}>
                        {props.addAnnotations(props.explanation, props.annotations_detail)}
                    </div>
                    {props.code &&
                        <pre className="code-block" onMouseUp={(e) => props.onCodeSelection(e, 'question_code')}>
                            {props.addAnnotations(props.code, props.annotations_code)}
                        </pre>
                    }
    
        <div className="question-footer">   
            <h3 className="question-footer-title">Votes: {votes}</h3>
            <div className="footer-item" onClick={handlePostUpvote}>
                <button className="vote-button bg-green-500"> Upvote </button>
            </div>
            <div className="footer-item" onClick={handlePostDownvote}>
                <button className="vote-button bg-red-500">  Downvote       </button>
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
    answer_of_the_question: PropTypes.bool,
    onTextSelection: PropTypes.func.isRequired,
    onCodeSelection: PropTypes.func.isRequired,
    addAnnotations: PropTypes.func.isRequired,
    annotations_detail: PropTypes.array,
    annotations_code: PropTypes.array,

};

export default QuestionDetail;
