import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./hooks/AuthProvider"

import "./search_style.css";

function SearchResults() {
  const auth = useAuth(); 
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // State variable for loading status
  const [searched, setSearched] = useState(false); // State variable for search button press status

  // Function to extract QID from URL
  const extractQID = (url) => {
    return url.split("/").pop(); // Split the URL by "/" and get the last part
  };

  const handleSearch = async () => {
    if (!searchValue) {
      return;
    }
    
    setIsLoading(true); 
    setSearched(true); 
    const results = await fetchSearchResults(searchValue.toLowerCase());
    setSearchResults(results);
    setIsLoading(false); 
  };

  return (
    <>
      <header>
        <div className="header-bar">
          <img
            id="bar_logo"
            src="/logo.jpg"
            style={{ width: "75px", height: "auto" , padding: "5px"}}
            alt="bar_logo"
            onClick={() => (window.location.href = "/search")}
          />
          <button className="create-route-button"
            onClick={() => {
              window.location.href = '/create_route';
            }}>
            Create Route
          </button>
          <button id="logout-button"
            onClick={() => {
              auth.logout();
              window.location.href = '/login';
            }}>
            Log Out
          </button>
        </div>
        <div className="search-bar">
          <input
            id="search"
            type="search"
            placeholder=" Start typing to search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch();
              }
            }}         
            />
            <button onClick={handleSearch} className="search_button">&#x1F50D;</button>
          </div>
      </header>
      <main className="container">
        <div className="search-display">
          {isLoading ? (
            <p className="centered-search">Searching...</p> // Display this while the search is in progress
          ) : searched && searchResults.length === 0 ? (
            <p className="centered-search">We couldn't find anything.</p> // Display this when the search button has been pressed and no results are found
          ) : (
            searchResults.map((result, index) => ( // Display the resuylts
              <div key={index} className="search-result">
                <Link to={`/result/${extractQID(result.item.value)}`}>
                  <button className="result-button">
                    <h3>{result.itemLabel.value}</h3>
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
        <div className="posts-container"></div>
      </main>
    </>
  );
}

export default SearchResults;

export const fetchSearchResults = async (searchString) => {
  try {
    console.log("Original search string:", searchString);

    searchString = searchString.replace(/[^a-z0-9]/gi, '');
    
    console.log("Alphanumeric search string:", searchString);
    
    if (searchString === "") {
      return [];
    }
    
    const response = await fetch(`http://localhost:8000/wiki_search/search/${searchString}`);
    const data = await response.json();
    console.log(data.results.bindings);
    return data.results.bindings;
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
};
