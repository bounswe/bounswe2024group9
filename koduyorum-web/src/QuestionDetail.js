import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import * as PropTypes from "prop-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { faThumbsUp, faCommentDots, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import './QuestionDetail.css';

function QuestionDetail(props) {

    const [votes, setVotes] = useState(props.initialVotes);
    const [isOwner] = useState(true);
    //Todo implement ownership logic for enabling buttons

    const [isAnswered] = useState(false);
    //Todo implement logic for answering question

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
      const handleDeleteQuestion = async () => {
        const token = localStorage.getItem('authToken');
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/delete_question/${props.question_id}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'User-ID': localStorage.getItem('user_id'),
              'Authorization': `Bearer ${token}`
            },
          });
    
          if (response.ok) {
            
            const data = await response.json();
            Navigate(`/feed`);
          }
        } catch (error) {
          console.error('Error deleting:', error);
        }
      };
    return (
      <div className="p-4 border border-gray-300 rounded">
        <div className={`status-label ${isAnswered ? 'answered' : 'unanswered'}`}>
                    {isAnswered ? 'Answered' : 'Unanswered'}
                </div>
            <div className="flex flex-wrap gap-2 mt-1">
                
            </div>

               
        {props.language && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2 mt-1">
              <span
                className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded"
              >
                {props.language}
              </span>
  
            </div>
          </div>
        )}
        {props.tags &&(
          <div className="mt-3">
            
            <div className="flex flex-wrap gap-2 mt-1">
              {props.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        {
          <>
            <h3 className="font-semibold text-gray-700">{props.inputType}</h3>
            <SyntaxHighlighter language="javascript" style={docco}>
              {props.code}
            </SyntaxHighlighter>
            <p className="mt-2 text-gray-600">{props.explanation}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600"
                  onClick={handlePostUpvote}
                >
                  Upvote
                </button>
                <span className="text-gray-700 font-semibold">{votes}</span>
                <button
                  className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600"
                  onClick={handlePostDownvote}
                >
                  Downvote
                </button>
                {isOwner && (<>
              <button
                className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded hover:bg-red-600"
                onClick={handleEditQuestion}
              >
                Edit Question
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600"
                onClick={handleDeleteQuestion}
              >
                Delete Question
              </button>
            </>
            )}
              </div>
              <p className="username ">@{props.author}</p>
            </div>
          </>
        }
        
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
    question_id : PropTypes.number,
    comment_id : PropTypes.number,
    author : PropTypes.string,
    answer_of_the_question: PropTypes.bool
  };

  export default QuestionDetail;
  