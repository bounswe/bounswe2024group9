import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./hooks/AuthProvider";

function Feed() {
    const auth = useAuth();
    const { user } = auth;
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // State variable for loading status
    const [searched, setSearched] = useState(false); // State variable for search button press status
    const [posts, setPosts] = useState([]); // State for posts
    const searchDisplayRef = useRef(null);

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("User ID:", user.user_id);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/django_app/load_feed_via_id/?user_id=${user.user_id}`); //TODO: Update the API URL
        const data = await response.json();
        console.log(data);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    if (user && user.user_id) {
      fetchPosts();
    }
  }, [user]);

  return (
    <>
      <header>
        <div className="header-bar">
          <img
            id="bar_logo"
            src="/logo.jpg"
            style={{ width: "75px", height: "auto", padding: "5px" }}
            alt="bar_logo"
            onClick={() => (window.location.href = "/feed")}
          />
          <button
            id="logout-button"
            onClick={() => {
              auth.logout();
              window.location.href = '/login';
            }}
          >
            Log Out
          </button>
        </div>
        <div className="search-bar">
          <input
            id="search"
            type="search"
            placeholder="Start typing to search..."
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
      <h1>Feed</h1>
        {searched && (
          <div className="search-display" ref={searchDisplayRef}>
            {isLoading ? (
              <p className="centered-search">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="centered-search">We couldn't find anything.</p>
            ) : (
              searchResults.map((result, index) => (
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
        )}
      </main>
    </>
  );
}

export default Feed;

export const fetchSearchResults = async (searchString) => {
  try {
    console.log("Original search string:", searchString);

    searchString = searchString.replace(/[^a-z0-9]/gi, '');
    
    console.log("Alphanumeric search string:", searchString);
    
    if (searchString === "") {
      return [];
    }
    
    const response = await fetch(`${process.env.REACT_APP_API_URL}/wiki_search/search/${searchString}`); //TODO: Update the API URL
    const data = await response.json();
    console.log(data.results.bindings);
    return data.results.bindings;
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
};
