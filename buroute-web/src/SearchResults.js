import React, { useState } from "react";
import "./style.css";

function SearchResults() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setSearchValue(event.target.value.toLowerCase());
      event.target.value = ""; // clear the search bar
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/wiki_search/search/${searchValue}`);
      const data = await response.json();
      console.log(data.results.bindings);
      setSearchResults(data.results.bindings); // Set the search results in state
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <>
      <header>
        <div className="search-bar">
          <form onSubmit={handleSubmit}>
            <input
              id="search"
              type="search"
              placeholder="&#x1F50D; Start typing to search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <input type="submit" style={{ display: 'none' }} />
          </form>
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
