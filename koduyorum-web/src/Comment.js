import React, { useState, useRef, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import * as PropTypes from "prop-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { faThumbsUp, faCommentDots, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import './QuestionDetail.css';
import EditComment from "./EditComment"

function Comment({ onClick, ...props }) {

  const [votes, setVotes] = useState(props.initialVotes);
  const isQuestionOwner = localStorage.getItem("username") === props.questionAuthor;
  const isCommentOwner = localStorage.getItem("username") === props.author;
  const [isAnswer, setAnswer] = useState(props.answer_of_the_question);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [commentOutput, setCommentOutput] = useState([]);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  
  const openPopup = () => setIsPopupVisible(true);
  const closePopup = () => setIsPopupVisible(false);
  const popupRef = useRef(null);

  const redirectToProfile = () => navigate(`/profile/${props.author}`);
  
  // Vote handlers
  const handleCommentUpvote = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/upvote_object/comment/${props.comment_id}/`, {
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

  const handleCommentDownvote = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/downvote_object/comment/${props.comment_id}/`, {
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
  const handleEditComment = async () => {
    openPopup();
  };
  const handleDeleteComment = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/delete_comment/${props.comment_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': localStorage.getItem('user_id'),
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {

        const data = await response.json();
        props.fetchComments();
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const toggleAnswer = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/mark_comment_as_answer/${props.comment_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': localStorage.getItem('user_id'),
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {

        const data = await response.json();
        setAnswer(true);
        props.fetchComments();
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };
  const run_code = async (type, id) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/run_code/${String(type)}/${id}/`, {  // Call your backend API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the token here
        },
        body: JSON.stringify({ source_code: props.code, language_id: props.languageId }),  // Send code and language ID as JSON
      });
      const data = await response.json();  // Parse the JSON response
      
      
        setCommentOutput(data.output);
      
    } catch (error) {
      
        setCommentOutput(["Error: Could not execute the code."]);
      
    } finally {
      setLoading(false); // Turn off loading state after the request completes
    }
  }
  return (
    <div className="question-post-card"
      onClick={onClick}>
      {isAnswer && (
        <div className={`question-status-label answered`}>
          Answer
        </div>
      )}
      <h3 className="font-semibold text-gray-700">Answer {props.number}</h3>
      <p className="text-gray-600">{props.explanation}</p>
      {props.code && (
        <SyntaxHighlighter language="javascript" style={docco}>
          {props.code}
        </SyntaxHighlighter>
      )}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700"> Votes: {votes} </h3>
          <button
            className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600"
            onClick={handleCommentUpvote}
          >
            Upvote
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600"
            onClick={handleCommentDownvote}
          >
           Downvote
          </button>
          {isCommentOwner && (<>
            <button
              className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded hover:bg-yellow-600"
              onClick={handleEditComment}
            >
              Edit Comment
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600"
              onClick={handleDeleteComment}
            >
              Delete Comment
            </button>
          </>
          )}
          {(isQuestionOwner && !isAnswer) && (
            <button
              className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600"
              onClick={toggleAnswer}
            >
              Mark As Answer
            </button>
          )}
        </div>
        <p className="question-username" onClick={redirectToProfile}>@{props.author}</p>
      </div>
      {props.code && (
        <button
          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-800"
        onClick={() => run_code('comment', props.comment_id)}
        >
          Run Code
        </button>
      )}
      {props.code && (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="w-full p-4 bg-gray-200 text-gray-800 whitespace-pre-wrap">
          {loading ? "Waiting for output..." : (
            commentOutput.length > 0 ? commentOutput.map((line, index) => (
              <div key={index}>{line}</div>
            )) : "No output yet."
          )}
        </pre>
      </div>
      )}
      {isPopupVisible && (
        <div className="popup" >
          <div className="popup-content" ref={popupRef}>
            <EditComment
              comment_id={props.comment_id}
              language={props.language}
              codeSnippet={props.code}
              details={props.explanation}
              fetchComments={props.fetchComments}
              closePopup={closePopup}
            />
          </div>
        </div>
      )}
    </div>

  );
}

Comment.propTypes = {
  language: PropTypes.string,
  code: PropTypes.string,
  explanation: PropTypes.string,
  number: PropTypes.number,
  initialVotes: PropTypes.number,
  comment_id: PropTypes.number,
  author: PropTypes.string,
  answer_of_the_question: PropTypes.bool,
};
export default Comment;