import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./hooks/AuthProvider";
import RouteCard from "./RouteCard";

import "./search_style.css";

function AllRoutes() {
  const auth = useAuth();
  const { user } = auth;
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // State variable for loading status
  const [searched, setSearched] = useState(false); // State variable for search button press status
  const [routes, setRoutes] = useState([]); // State for routes
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
    const fetchRoutes = async () => {
      try {
        console.log("User ID:", user.user_id);
        const response = await fetch(`http://localhost:8000/database_search/routes/`);
        const data = await response.json();
        console.log(data);
        setRoutes(data);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    if (user && user.user_id) {
      fetchRoutes();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDisplayRef.current && !searchDisplayRef.current.contains(event.target)) {
        setSearched(false);
      }
    };

    if (searched) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searched]);

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
            className="create-route-button"
            onClick={() => {
                window.location.href = '/feed';
            }}
            >
            Feed
          </button>
          <button
            className="create-route-button"
            onClick={() => {
              window.location.href = '/create_route';
            }}
          >
            Create Route
          </button>
          <button
          className="create-route-button"
          onClick={() => {
            window.location.href = '/bookmarks';
          }}
        >
          Bookmarks
        </button>
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
      <h1>Top Routes</h1>
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
        <div className="routes-container">
          {routes.map((route, index) => (
            <RouteCard key={index} route={route} />
          ))}
        </div>
      </main>
    </>
  );
}

export default AllRoutes;

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
