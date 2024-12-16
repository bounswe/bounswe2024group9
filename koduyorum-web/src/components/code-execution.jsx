import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as PropTypes from "prop-types";
import { Separator } from "./ui/seperator";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Navbar, LeftSidebar, RightSidebar } from '../PageComponents';
import { LoadingComponent } from '../LoadingPage';
import PostComment from "../PostComment";
import QuestionDetail from "../QuestionDetail";
import "../QuestionDetail.css";
import Comment from "../Comment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import CreateAnnotation from "../CreateAnnotation";
import {showNotification} from "../NotificationCenter";

export default function CodeExecution() {
  const { question_id } = useParams(); // Extract the questionId from the URL
  const [questionData, setQuestionData] = useState("");
  const [commentData, setCommentData] = useState("");
  const [isAnswered, setAnswered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);

  const [code, setCode] = useState(""); // State to store the user input (code)
  const [questionOutput, setQuestionOutput] = useState([]); // For question output
  const [commentOutput, setCommentOutput] = useState([]); // For comment outputs (keyed by comment ID)
  const [isloading, setIsLoading] = useState(true); // State to manage opening page
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [error, setError] = useState(null);
  const [languageId, setLanguageId] = useState(""); // State to store selected language ID
  const [languages, setLanguages] = useState({}); // State to store languages
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [startIndex, setStartIndex] = useState(null);
  const [endIndex, setEndIndex] = useState(null);
  const [annotationId, setAnnotationId] = useState(null);
  const [annotationType, setAnnotationType] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupRef = useRef(null);
  const [annotationData, setAnnotationData] = useState([]);
  const [comment_annotations, setCommentAnnotations] = useState([]);


  const openPopup = () => setIsPopupVisible(true);
  const closePopup = () => setIsPopupVisible(false);

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get_question/${question_id}/`, {
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
      let upvoted_by = data.question.upvoted_by;
      const user_id = localStorage.getItem('user_id');
      // get username from id using get_user_profile_by_id
      // if upvoted_by includes username set isUpvoted to true
      const response2 = await fetch(`${process.env.REACT_APP_API_URL}/get_user_profile_by_id/${user_id}/`);
      const data2 = await response2.json();
      const username = data2.user.username;
      if (upvoted_by.includes(username)) {
        setIsUpvoted(true);
      }
      let downvoted_by = data.question.downvoted_by;
      if (downvoted_by.includes(username)) {
        setIsDownvoted(true);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/question/${question_id}/comments/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Add the token here
        }
      });
      const data = await response.json();
      setCommentData(data.comments);
      setAnswered(data.comments.some(c => c.answer_of_the_question));
      setCommentAnnotations(data.comments.map(comment => comment.annotations));
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
      setQuestionOutput(data.output); // Update the question output

    } catch (error) {
        setQuestionOutput(["Error: Could not execute the code."]);
    } finally {
      setLoading(false); // Turn off loading state after the request completes
    }
  }

  const get_bookmark = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/check_bookmark/${question_id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Add the token here
          'User-ID': localStorage.getItem('user_id')
        }
      });
      const data = await response.json();
      setIsBookmarked(data.is_bookmarked);
    } catch (error) {
      console.error('Error fetching bookmark:', error);
    }
  }

  const fetchLanguages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get_api_languages/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Add the token here
        }
      }); // Adjust this URL if needed
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

  useEffect(() => {
    fetchInitialData();
  }, []);

const addAnnotations = (text, annotations, detail_length) => {
  const loggedInUserId = localStorage.getItem('user_id');
  if (!text || text.length === 0) {
    return null;
  }
  let annotatedText = [];
  let lastIndex = 0;

  // Sort annotations by starting point to avoid misplacement
  const sortedAnnotations = annotations.sort(
    (a, b) => a.annotation_starting_point - b.annotation_starting_point
  );

  sortedAnnotations.forEach((annotation) => {
    let {
      annotation_starting_point,
      annotation_ending_point,
      text: annotationText,
      annotation_id: annotationId,
      author_id: author_id,
      author_name: author_name,
    } = annotation;

    // Adjust the offsets for code annotations
    if (detail_length > 0) {
      annotation_starting_point -= detail_length;
      annotation_ending_point -= detail_length;
    }

    if (lastIndex < annotation_starting_point) {
      annotatedText.push(text.slice(lastIndex, annotation_starting_point));
    }

    // Add annotated text with a tooltip
    annotatedText.push(
      <div className="annotation-container" key={`${annotation_starting_point}-${annotationId}`}>
        <span className="annotation">
          <em>{text.slice(annotation_starting_point, annotation_ending_point)}</em>
          <div className="annotation-tooltip">
            {annotationText}
            <div className="annotation-tooltip-author">
              <br/>
              <em>by {author_name}</em>
            </div>
            {Number(author_id) === Number(loggedInUserId) ? (
              <>
                <br/>
                <button
                  className="edit-icon"
                  onClick={() =>
                    handleEditAnnotation(
                      annotationId,
                      annotation_starting_point,
                      annotation_ending_point
                    )
                  }
                >
                  ✏️
                </button>
                <button
                  className="delete-icon"
                  onClick={() => handleDeleteAnnotation(annotationId)}
                >
                  🗑️
                </button>
              </>
            ) : null}
          </div>
        </span>
      </div>
    );

    // Update the lastIndex to the end of the annotation
    lastIndex = annotation_ending_point;
  });

  // Add the remaining text after the last annotation
  if (lastIndex < text.length) {
    annotatedText.push(text.slice(lastIndex));
  }

  return annotatedText;
};
const handleEditAnnotation = async (annotationId, startOffset, endOffset) => {
  // Fetch the annotation to get its text
  const annotationToEdit = annotationData.find((annotation) => annotation.annotation_id === annotationId);
  if (annotationToEdit) {
      console.log("Editing annotation:", annotationToEdit);
      setSelectedText(annotationToEdit.text); // Set selected text from the annotation
      setStartIndex(startOffset);
      setEndIndex(endOffset);
      setModalVisible(true);
      setAnnotationId(annotationId);
  } else {
      console.error("Annotation not found for editing.");
  }
};


const handleDeleteAnnotation = async (annotationId) => {
  try {
    const userId = localStorage.getItem('user_id');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/delete_annotation/${annotationId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': userId,
      },
    });

    if (response.ok) {
      // Update the state to remove the deleted annotation
      setAnnotationData((prevAnnotations) =>
        prevAnnotations.filter((annotation) => annotation.annotation_id !== annotationId)
      );
      // alert('Annotation deleted successfully.');
      showNotification('Annotation deleted successfully.');
      // Optional: Trigger a re-fetch of annotations or update state to reflect the deletion
    } else {
      const errorData = await response.json();
      console.error('Error deleting annotation:', errorData);
      showNotification('Failed to delete annotation.');
      // alert('Failed to delete annotation.');
    }
  } catch (error) {
    console.error('Error during annotation deletion:', error);
    showNotification('An unexpected error occurred.');
    // alert('An unexpected error occurred.');
  }
};


const handleTextSelection = (e, type, id) => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    let plainText;
    let startOffset = 0;
    let endOffset;

    console.log(type);
    // Determine the appropriate plainText based on the type
       if (type === 'question_details') {
         type = 'question';
         plainText = questionData.details;
    } else if (type === 'question_code') {
         type = 'question';
         startOffset = questionData.details.length;
         plainText = questionData.code_snippet;
    } else if (type === 'comment_details') {
         type = 'comment';
      const comment = commentData.find(comment => comment.comment_id === id);
      plainText = comment ? comment.details : '';
    } else if (type === 'comment_code') {
         type = 'comment';
         const comment = commentData.find(comment => comment.comment_id === id);
         startOffset = comment ? comment.details.length : 0;
      plainText = comment ? comment.code_snippet : '';
    } else {
      console.error("Invalid type parameter.");
      return;
    }

    // Ensure plainText is defined before proceeding
    if (!plainText) {
      console.error("plainText is undefined.");
      return;
    }

    startOffset += plainText.indexOf(selectedText);
    endOffset = startOffset + selectedText.length;

    if (startOffset === -1)  {
      console.error("Error calculating offsets. Selection might span across multiple elements or annotations.");
      return;
    }

    setSelectedText(selectedText);
    setStartIndex(startOffset);
    setEndIndex(endOffset);
    setAnnotationType(type);
    setLanguageId(id);

    setModalVisible(true);
  } else {
    console.log('No text selected.');
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    setLoading(true); // Set loading state while fetching the output

    if (!code) {
      setLoading(false);
      setCommentOutput(["Error: No code to execute."]); // Handle errors
      return;
    }
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
      setCommentOutput(data.output);  // Set the output from backend
    } catch (error) {
      setCommentOutput("Error: Could not execute the code."); // Handle errors
    } finally {
      setLoading(false); // Turn off loading state after the request completes
    }
  };

  function post_bookmark(id) {
    const token = localStorage.getItem('authToken');
    if (isBookmarked) {
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
      }).catch(error => {
        console.error("Error removing bookmark:", error);
      });
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

 
  return (<div>

    {isloading ? (
      <LoadingComponent /> // Show loading screen while data is being fetched
    ) : (

      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />
        <div className="container mx-auto p-4 max-w-4xl">
          

          <div className="space-y-6">
  return (
    <div>
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
              <CreateAnnotation
                visible={modalVisible}
                selectedText={selectedText}
                startIndex={startIndex}
                endIndex={endIndex}
                annotation_type={annotationType}
                language_id={languageId}
                annotationId={annotationId}
                onClose={() => setModalVisible(false)}
              />
              <QuestionDetail
                inputType="Question"
                explanation={questionData.details}
                code={questionData.code_snippet}
                author={questionData.author}
                language={questionData.language}
                tags={questionData.tags}
                upvotes={questionData.upvote_count}
                downvotes={questionData.downvoted_by.length}
                question_id={question_id}
                isAnswered={isAnswered}
                title={questionData.title}
                isUpvoted={isUpvoted}
                isDownvoted={isDownvoted}
                fetchQuestion={fetchQuestion}
            />
            
                <div className="flex gap-4 mt-4">
                {questionData.code_snippet && ( <button
                    className="run-button"
                    onClick={() => run_code('question', questionData.id)}
                  >
                    Run Code
                  </button> )}
                  <button
                    className="comment-button"
                    onClick={() => openPopup()}
                  >
                    Comment
                  </button>
                  <button
                  className="bookmark-button flex items-center bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                  onClick={() => post_bookmark(questionData.id)}

                >
                  <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                  Bookmark
                </button>
                </div>
              
                
            {questionData.code_snippet &&  (<div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Output:</h2>
                <pre className="w-full p-4 bg-gray-200 text-gray-800 whitespace-pre-wrap">
                    {loading ? "Waiting for output..." : (
                      questionOutput.length > 0 ? questionOutput.map((line, index) => (
                  <div key={index}>{line}</div>
                  )) : "No output yet."
                )}
                </pre>
              </div>)}
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
                      initialDownvotes={comment.downvoted_by.length}
                      language = {comment.language_id}
                      comment_id={comment.comment_id}
                      answer_of_the_question={comment.answer_of_the_question}
                      fetchComments={fetchComments}
                    />
                    
                  </React.Fragment>
                ))
              ) : (
                <p className="text-gray-600">No comments available.</p>
              )}
          

                {isPopupVisible && (
                  <div className="popup">
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
            <Separator className="my-8 bg-gray-300"/>

            <div className="code-execution-box">
              <h2 className="code-execution-title">Try Your Own Code</h2>
              <form onSubmit={handleSubmit}>
                <label className="code-execution-label">Select Language:</label>
                <select
                  value={languageId}
                  onChange={(e) => setLanguageId(e.target.value)}
                  className="code-execution-select"
                >
                  <option value="">Select a language</option>
                  {Object.entries(languages).map(([name, id]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>

                <label className="code-execution-label">Enter your code:</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows="10"
                  className="code-editor"
                ></textarea>

                <SyntaxHighlighter language="javascript" style={docco} className="syntax-highlight-box">
                  {code}
                </SyntaxHighlighter>

                <button
                  type="submit"
                  className="run-button"
                  disabled={loading || !languageId}
                >
                  {loading ? "Executing..." : "Execute Code"}
                </button>
              </form>

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}