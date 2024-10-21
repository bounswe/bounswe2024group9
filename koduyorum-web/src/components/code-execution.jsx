import React, { useState, useEffect } from 'react';
import * as PropTypes from "prop-types";
import { Separator } from "./ui/seperator";



export default function CodeExecution() {
  const [code, setCode] = useState('');        // State to store the user input (code)
  const [output, setOutput] = useState('');     // State to store the backend's response (output)
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [languageId, setLanguageId] = useState(''); // State to store selected language ID
  const [languages, setLanguages] = useState({}); // State to store languages

  // Fetch languages from the backend
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/get_api_languages/'); // Adjust this URL if needed
        const data = await response.json();
        setLanguages(data.languages); // Access the 'languages' key from the response
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };

    fetchLanguages();
  }, []);

  // Function to handle form submission and send the code to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload on form submit
    setLoading(true);    // Set loading state while fetching the output

    try {
      const response = await fetch('http://127.0.0.1:8000/code_execute/', {  // Call your backend API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source_code: code, language_id: languageId }),  // Send code and language ID as JSON
      });

      const data = await response.json();  // Parse the JSON response
      setOutput(data.stdout);  // Set the output from backend
    } catch (error) {
      setOutput('Error: Could not execute the code.');  // Handle errors
    } finally {
      setLoading(false);  // Turn off loading state after the request completes
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">
          Second Greatest and Second Lowest Number
        </h1>

        {/* Dynamic code execution section */}
        <div className="my-8">
          <h2 className="text-xl font-semibold text-gray-200">Try Your Own Code</h2>

          <form onSubmit={handleSubmit}>
            <label className="block mb-2">Select Language:</label>
            <select
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)} // Update the language ID state as user selects
              className="w-full p-2 mb-4 bg-gray-800 text-gray-200"
            >
              <option value="">Select a language</option>
              {Object.entries(languages).map(([name, id]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            <label className="block mb-2">Enter your code:</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}  // Update the code state as user types
              rows="10"
              className="w-full p-2 mb-4 bg-gray-800 text-gray-200"
            ></textarea>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2"
              disabled={loading || !languageId} // Disable if loading or no language is selected
            >
              {loading ? 'Executing...' : 'Execute Code'}
            </button>
          </form>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Output:</h2>
            <pre className="w-full p-4 bg-gray-800 text-gray-200 whitespace-pre-wrap">
              {loading ? 'Waiting for output...' : output || 'No output yet.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
