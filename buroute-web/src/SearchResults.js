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