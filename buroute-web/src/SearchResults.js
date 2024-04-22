import React, { useState } from "react";
import "./style.css";

function SearchResults() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const fetchSearchResults = async (searchString) => {
    try {
      console.log("Search string:", searchString); // Log the search string
      
      // Clear search results if the search string is empty
      if (searchString === "") {
        setSearchResults([]);
        return;
      }
  
      const response = await fetch(`http://127.0.0.1:8000/wiki_search/search/${searchString}`);
      const data = await response.json();
      console.log(data.results.bindings);
      setSearchResults(data.results.bindings); // Set the search results in state
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleInputChange = (event) => {
    const searchString = event.target.value.toLowerCase();
    setSearchValue(searchString);
    fetchSearchResults(searchString);
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
            onChange={handleInputChange}
          />
        </div>
      </header>
      <main className="container">
        <div className="search-display">
          {/* Display search results here */}
          {searchResults.map((result, index) => (
            <div key={index}>
              {/* Render individual search result */}
              {/* After connecting these items to their own wikidata pages, parts that will be rendered can chang*/}
              {/* Now, i will just show label and item for the simplicity */}
              <h3>{result.itemLabel.value}</h3>
              <p>{result.item.value}</p>
            </div>
          ))}
        </div>
        <div className="posts-container"></div>
      </main>
    </>
  );
}

export default SearchResults;
