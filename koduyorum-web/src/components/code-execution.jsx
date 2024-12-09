import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as PropTypes from "prop-types";
import { Separator } from "./ui/seperator";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import language from "react-syntax-highlighter/dist/esm/languages/hljs/1c";
import { Navbar, LeftSidebar, RightSidebar } from '../PageComponents';
import { LoadingComponent } from '../LoadingPage';
import PostComment from "../PostComment";
import QuestionDetail from "../QuestionDetail";
import Comment from "../Comment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';

export default function CodeExecution() {

  const { question_id } = useParams(); // Extract the questionId from the URL
  const [questionData, setQuestionData] = useState("");
  const [commentData, setCommentData] = useState("");
  const [isAnswered, setAnswered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [code, setCode] = useState(""); // State to store the user input (code)
const [output, setOutput] = useState([]); // State to store the backend's response (output)
  const [isloading, setIsLoading] = useState(true); // State to manage opening page

  const [loading, setLoading] = useState(false); // State to manage loading state
  const [error, setError] = useState(null);
  const [languageId, setLanguageId] = useState(""); // State to store selected language ID
  const [languages, setLanguages] = useState({}); // State to store languages

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const openPopup = () => setIsPopupVisible(true);
  const closePopup = () => setIsPopupVisible(false);
  const popupRef = useRef(null);
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

  const fetchQuestion = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get_question/${question_id}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Add the token here
          }
        });
      const data = await response.json();
      setQuestionData(data.question);
      setLanguageId(data.question.language_id);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/question/${question_id}/comments/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Add the token here
          }
        });
      const data = await response.json();
      setCommentData(data.comments);
      setAnswered(data.comments.some(c => c.answer_of_the_question));
      setLoading(false);


    } catch (err) {
      setError(err.message);
      setLoading(false);
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
        body: JSON.stringify({ source_code: code, language_id: languageId }),  // Send code and language ID as JSON
      });
      const data = await response.json();  // Parse the JSON response
      setOutput(data.output);  // Set the output from backend

    } catch (error) {
      setOutput("Error: Could not execute the code."); // Handle errors
    } finally {
      setLoading(false); // Turn off loading state after the request completes
    }
  }

  const get_bookmark = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/check_bookmark/${question_id}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Add the token here
            'User-ID': localStorage.getItem('user_id')
          }
        }
      );
      const data = await response.json();
      setIsBookmarked(data.is_bookmarked);
    } catch (error) {
      console.error('Error fetching bookmark:', error);
    }
  }


  const fetchLanguages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get_api_languages/`,
        {
          method: 'GET',

          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Add the token here
          }
        }
      ); // Adjust this URL if needed
      const data = await response.json();
      setLanguages(data.languages); // Access the 'languages' key from the response
    } catch (error) {

      console.error('Error fetching languages:', error);
    }
  };
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      await fetchQuestion();
      await fetchComments();
      await fetchLanguages();
      await get_bookmark();
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  }
  // Fetch languages from the backend
  useEffect(() => {

    fetchInitialData();

  }, []);


  // Functions to open and close the popup


  // Function to handle form submission and send the code to the backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    setLoading(true); // Set loading state while fetching the output

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/code_execute/`, {  // Call your backend API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add the token here
        },
        body: JSON.stringify({ source_code: code, language_id: languageId }),  // Send code and language ID as JSON
      });
      const data = await response.json();  // Parse the JSON response
      setOutput(data.output);  // Set the output from backend

    } catch (error) {
      setOutput("Error: Could not execute the code."); // Handle errors
    } finally {
      setLoading(false); // Turn off loading state after the request completes
    }
  };


  function post_bookmark(id) {
    const token = localStorage.getItem('authToken');
    if (isBookmarked){
        fetch(`${process.env.REACT_APP_API_URL}/remove_bookmark/${id}/`, {
            method: 'DELETE',
            headers: {
            'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,  // Add the token here
            'User-ID': localStorage.getItem('user_id')
    }
        }).then(response => {
            if (response.ok) {
                alert("Bookmark removed successfully");
                setIsBookmarked(false);
            } else {
                alert("Failed to remove bookmark");
            }
        }
        ).catch(error => {
            console.error("Error removing bookmark:", error);
        }
        );
    } else {
    fetch(`${process.env.REACT_APP_API_URL}/bookmark_question/${id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // Add the token here
        'User-ID': localStorage.getItem('user_id')
      }
    }).then(response => {
      if (response.ok) {
        alert("Bookmark added successfully");
      } else {
        alert("Failed to add bookmark");
      }
    }).catch(error => {
      console.error("Error adding bookmark:", error);
  });
    }
    setIsBookmarked(!isBookmarked);
    }

  // TODO Now there is only one output box, we need to create a separate output box for each code execution

  // TODO Need to check if the comment and the question has code_snippet, if there is not there shouldnt be a run code button
  return (<div>

    {isloading ? (
      <LoadingComponent /> // Show loading screen while data is being fetched
    ) : (

      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />
        <div className="container mx-auto p-4 max-w-4xl">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            {questionData.title}
          </h1>

          <div className="space-y-6">

            <QuestionDetail
                inputType="Question"
                explanation={questionData.details}
                code={questionData.code_snippet}
                author={questionData.author}
                language={questionData.language}
                tags={questionData.tags}
                initialVotes={questionData.upvote_count}
                question_id={question_id}
                isAnswered={isAnswered}
                title={questionData.title}
                fetchQuestion={fetchQuestion}

            />
            {questionData.code_snippet && (
                <button
                    className="bg-blue-600 text-white px-4 py-2 mt-4"
                    onClick={() => run_code('question', questionData.id)}
                >
                  Run Code
                </button>
            )}
            <button
                className="bg-green-600 text-white px-4 py-2 mt-4"
                onClick={() => post_bookmark(questionData.id)}
            >
            <FontAwesomeIcon icon={faBookmark} style={{ color: isBookmarked ? 'blue' : 'white' }} />
            </button>

          </div>

          <Separator className="my-8 bg-gray-300"/>

          <div className="container mx-auto p-4 max-w-4xl">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Answers</h2>
              {commentData.length > 0 ? (
                commentData.map((comment, index) => (
                  <React.Fragment key={index}>
                    <Comment
                      question_id={question_id}
                      number={index + 1}
                      explanation={comment.details}
                      code={comment.code_snippet}
                      author={comment.user}
                      questionAuthor={questionData.author}
                      initialVotes={comment.upvotes}
                      language = {comment.language_id}
                      comment_id={comment.comment_id}
                      answer_of_the_question={comment.answer_of_the_question}
                      fetchComments={fetchComments}
                    />
                    {comment.code_snippet && (
                      <button
                        className="bg-blue-600 text-white px-4 py-2 mt-4"
                        onClick={() => run_code('comment', comment.comment_id)}
                      >
                        Run Code
                      </button>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <p className="text-gray-600">No comments available.</p>
              )}
              <button className="floating-button" onClick={() => openPopup()}>
                +
              </button>
                {isPopupVisible && (
                  <div className="popup" >
                    <div className="popup-content" ref={popupRef}>
                      <PostComment
                        question_id={question_id}
                        fetchComments={fetchComments}
                        closePopup={closePopup}
                      />
                    </div>
                  </div>
                )}
            </div>

            <div className="my-8">
              <h2 className="text-xl font-semibold text-gray-800">Try Your Own Code</h2>
              <form onSubmit={handleSubmit}>
                <label className="block mb-2">Select Language:</label>
                <select
                  value={languageId}
                  onChange={(e) => setLanguageId(e.target.value)}
                  className="w-full p-2 mb-4 bg-gray-200 text-gray-800"
                >
                  <option value="">Select a language</option>
                  {Object.entries(languages).map(([name, id]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>

                <label className="block mb-2">Enter your code:</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows="10"
                  className="w-full p-2 mb-4 bg-gray-200 text-gray-800"
                ></textarea>

                <SyntaxHighlighter language="javascript" style={docco}>
                  {code}
                </SyntaxHighlighter>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2"
                  disabled={loading || !languageId}
                >
                  {loading ? "Executing..." : "Execute Code"}
                </button>
              </form>
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Output:</h2>
                <pre className="w-full p-4 bg-gray-200 text-gray-800 whitespace-pre-wrap">
                    {loading ? "Waiting for output..." : (
                      output.length > 0 ? output.map((line, index) => (
                  <div key={index}>{line}</div>
                  )) : "No output yet."
                )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

    )}
  </div>
  );
}