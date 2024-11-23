import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as PropTypes from "prop-types";
import { Separator } from "./ui/seperator";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import language from "react-syntax-highlighter/dist/esm/languages/hljs/1c";
import PostComment from "../PostComment";


function InputBlock(props) {

  const [votes, setVotes] = useState(props.initialVotes);

  // Vote handlers

  const handlePostUpvote = () => setVotes(votes + 1);
  const handlePostDownvote = () => setVotes(votes - 1);
  const handleCommentUpvote = () => setVotes(votes + 1);
  const handleCommentDownvote = () => setVotes(votes - 1);

  return (
    <div className="p-4 border border-gray-300 rounded">

      {props.language && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-500">Language:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span
              className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded"
            >
              {props.language}
            </span>

          </div>
        </div>
      )}
      {props.tags && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-500">Tags:</p>
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
      {props.inputType === "Question" && (
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
            </div>
          </div>
        </>
      )}


      {props.inputType === "Answer" && (
        <>
          <h3 className="font-semibold text-gray-700">Answer {props.number}</h3>
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
            </div>
          </div>
        </>
      )}


      <p className="text-sm text-blue-300 text-right ">By {props.author}</p>
    </div>
  );
}

InputBlock.propTypes = {
  code: PropTypes.string,
  inputType: PropTypes.string.isRequired,
  explanation: PropTypes.string,
  number: PropTypes.number,
  initialVotes: PropTypes.number
};

export default function CodeExecution() {

  const { question_id } = useParams(); // Extract the questionId from the URL
  const [questionData, setQuestionData] = useState("");
  const [commentData, setCommentData] = useState("");


  const [code, setCode] = useState(""); // State to store the user input (code)
const [output, setOutput] = useState([]); // State to store the backend's response (output)
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [error, setError] = useState(null);
  const [languageId, setLanguageId] = useState(""); // State to store selected language ID
  const [languages, setLanguages] = useState({}); // State to store languages

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
  // Fetch languages from the backend
  useEffect(() => {
    fetchQuestion();
    fetchComments();
    fetchLanguages();
  }, []);

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


  // TODO Now there is only one output box, we need to create a separate output box for each code execution
  // TODO Need to check if the comment and the question has code_snippet, if there is not there shouldnt be a run code button
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          {questionData.title}
        </h1>

        <div className="space-y-6">

          {questionData.upvote_count && (<InputBlock
            inputType="Question"
            explanation={questionData.details}
            code={questionData.code_snippet}
            author={questionData.author}
            language={questionData.language}
            tags={questionData.tags}
            initialVotes={questionData.upvote_count}

          />)}
          {questionData.code_snippet && (
            <button
              className="bg-blue-600 text-white px-4 py-2 mt-4"
              onClick={() => run_code('question', questionData.id)}
            >
              Run Code
            </button>
          )}
        </div>

        <Separator className="my-8 bg-gray-300" />

        <div className="container mx-auto p-4 max-w-4xl">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            {questionData.title}
          </h1>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Answers</h2>
            {commentData.length > 0 ? (
              commentData.map((comment, index) => (
                <React.Fragment key={index}>
                  <InputBlock
                    inputType="Answer"
                    number={index + 1}
                    explanation={comment.details}
                    code={comment.code_snippet}
                    author={comment.user}
                    initialVotes={comment.upvotes}
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
            <button className="floating-button" onClick={() => {}}>
              +
            </button>
            <PostComment
             question_id = {question_id} 
             />
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
  );
}