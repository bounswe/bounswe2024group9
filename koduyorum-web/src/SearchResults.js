import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './SearchResults.css'; // assuming you have some basic styles here

const SearchResults = () => {
  const [activeTab, setActiveTab] = useState('info'); // To switch between Info and Questions
  const [infoData, setInfoData] = useState(null); // For Wikidata information
  const [questionData, setQuestionData] = useState([]); // For related questions
  const [loading, setLoading] = useState(true); // To show loading state
  const [error, setError] = useState(null); // For error handling
  const location = useLocation(); // To capture search query from the URL
  const navigate = useNavigate(); // To navigate to other pages

  // Extracting the search keyword from the query string (e.g., /searchresults?query=JavaScript)
  const searchParams = new URLSearchParams(location.search);
  const searchString = searchParams.get('query');

  // Fetch Wikidata info and questions when the component mounts
  useEffect(() => {
    if (searchString) {
      fetchSearchData(searchString);
    }
  }, [searchString]);

  // Function to fetch both Info and Questions data
  const fetchSearchData = async (keyword) => {
    try {
      setLoading(true);
      // Making two API requests in parallel
      const [infoResponse, questionResponse] = await Promise.all([
        axios.get(`/django_app/wikidata_query/${keyword}`), // Fetching Wikidata info
        axios.get(`/django_app/questions/${keyword}`), // Fetching related questions
      ]);

      // Setting the responses in state
      setInfoData(infoResponse.data);
      setQuestionData(questionResponse.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching search data:", err);
      setError("Failed to load search data.");
      setLoading(false);
    }
  };

  // Function to handle tab switch between Info and Questions
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  // Function to handle tag click (redirecting to new search for that tag)
  const handleTagClick = (tag) => {
    navigate(`/searchresults?query=${tag}`);
  };

  // If data is still loading, show a loading spinner
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If an error occurred, show the error message
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="search-results-container">
      <nav className="navbar">
        {/* Your Navbar here, just like the one in Feed */}
        <div className="navbar-left">
          <a href="/feed" className="nav-link">Home</a>
          <a href="/profile" className="nav-link">Profile</a>
          <a href="/logout" className="nav-link">Logout</a>
        </div>
      </nav>

      <div className="tabs">
        <button
          onClick={() => handleTabSwitch('info')}
          className={activeTab === 'info' ? 'active' : ''}
        >
          Info
        </button>
        <button
          onClick={() => handleTabSwitch('questions')}
          className={activeTab === 'questions' ? 'active' : ''}
        >
          Questions
        </button>
      </div>

      {/* Display Wikidata info if "Info" tab is selected */}
      {activeTab === 'info' && (
        <div className="info-section">
          <h2>{infoData.label} (Wikidata Info)</h2>
          <p><strong>Description:</strong> {infoData.description}</p>
          <p><strong>Publication Date:</strong> {infoData.publicationDate}</p>
          <p><strong>Inception Date:</strong> {infoData.inceptionDate}</p>
          <p><strong>Website:</strong> <a href={infoData.website} target="_blank" rel="noopener noreferrer">{infoData.website}</a></p>
          <div className="related-instances">
            <h3>Related Instances</h3>
            <ul>
              {infoData.relatedInstances.map((instance, index) => (
                <li key={index} onClick={() => handleTagClick(instance.label)}>
                  {instance.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Display Questions if "Questions" tab is selected */}
      {activeTab === 'questions' && (
        <div className="questions-section">
          <h2>Questions related to "{searchString}"</h2>
          <ul>
            {questionData.map((question, index) => (
              <li key={index}>
                <div className="question-card">
                  <h3>{question.title}</h3>
                  <p>{question.description}</p>
                  <button onClick={() => window.location.href = "/code-execution"}>Go to Code Execution</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
