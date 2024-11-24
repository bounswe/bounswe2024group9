import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import * as PropTypes from "prop-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { faThumbsUp, faCommentDots, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import './QuestionDetail.css';

function Comment(props) {

  const [votes, setVotes] = useState(props.initialVotes);
  const isQuestionOwner = localStorage.getItem("username") === props.questionAuthor;
  const isCommentOwner = localStorage.getItem("username") === props.author;
  const [isAnswer, setAnswer] = useState(props.answer_of_the_question);
  const navigate = useNavigate();

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
        navigate(`/question/${props.question_id}`);
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
        //TODO set question as answered as well
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h3 className="font-semibold text-gray-700">Answer {props.number}</h3>
      {isAnswer && (
        <div className={`status-label answered`}>
          Answer
        </div>
      )}

      <p className="text-gray-600">{props.explanation}</p>
      {props.code && (
        <SyntaxHighlighter language="javascript" style={docco}>
          {props.code}
        </SyntaxHighlighter>
      )}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600"
            onClick={handleCommentUpvote}
          >
            Upvote
          </button>
          <span className="text-gray-700 font-semibold">{votes}</span>
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
          {isQuestionOwner && (
            <button
              className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600"
              onClick={toggleAnswer}
            >
              Mark As Answer
            </button>
          )}
        </div>
        <p className="username ">@{props.author}</p>
      </div>
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