import React, { useState } from "react";
import "./style.css";

function SearchResults() {
  const [searchValue, setSearchValue] = useState("");
  const [query, setQuery] = useState('');

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setSearchValue(event.target.value);
      console.log(searchValue);
      event.target.value = "";  // clear the search bar
    }
  };

  const handleSubmit = async (event) => {
  event.preventDefault();
  const response = await fetch(`http://127.0.0.1:8000/wiki_search/search/${searchValue}`);
  const data = await response.json();
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
          <input type="submit" style={{display: 'none'}} />
        </form>
      </div>
    </header>
    <main className="container">
      <div className="search-display"></div>
      <div className="posts-container"></div>
    </main>
  </>
);
} export default SearchResults;
