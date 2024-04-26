import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

import "./search_style.css";

function SearchResults() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // Function to extract QID from URL
  const extractQID = (url) => {
    return url.split("/").pop(); // Split the URL by "/" and get the last part
  };

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed"); // Log when Enter key is pressed
      const results = await fetchSearchResults(searchValue.toLowerCase());
      setSearchResults(results);
    }
  };

  return (
    <>
      <header>
        <div className="header-bar">
          <img id="bar_logo" 
          src="https://github-production-user-asset-6210df.s3.amazonaws.com/110239708/313003831-cfe28590-0739-4c58-8740-45e27c0a443b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20240426%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240426T123041Z&X-Amz-Expires=300&X-Amz-Signature=517974e24142cccb1dbec1a67a4794ff0c9ccc909d0b8ac02621911a7fa34786&X-Amz-SignedHeaders=host&actor_id=75087023&key_id=0&repo_id=756524338"
          alt="bar_logo"
          onClick={() => window.location.href = '/search'}
          >
          </img>
          <button 
            id="logout-button"
            onClick={logoutUser}
          >
            Log Out
          </button>
        </div>
        <div className="search-bar">
          <input
            id="search"
            type="search"
            placeholder="&#x1F50D; Start typing to search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyPress} // Call handleKeyPress function on key press
          />
        </div>
      </header>
      <main className="container">
        <div className="search-display">
          {/* Display search results here */}
          {searchResults.map((result, index) => (
            <div key={index} className="search-result">
            {/* Wrap the content in a Link component */}
            <Link to={`/result/${extractQID(result.item.value)}`}>
              <button className="result-button">
                <h3>{result.itemLabel.value}</h3>
              </button>
            </Link>
          </div>
          ))}
        </div>
        <div className="posts-container"></div>
      </main>
    </>
  );
} 
export default SearchResults;

export const fetchSearchResults = async (searchString) => {
  try {
    console.log("Search string:", searchString); // Log the search string
    
    // Clear search results if the search string is empty
    if (searchString === "") {
      return [];
    }

    const response = await fetch(`http://127.0.0.1:8000/wiki_search/search/${searchString}`);
    const data = await response.json();
    console.log(data.results.bindings);
    return data.results.bindings;
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
};

export const logoutUser = () => {
  console.log('User logged out.');
  // Redirect to login page
  window.location.href = '/login';
};