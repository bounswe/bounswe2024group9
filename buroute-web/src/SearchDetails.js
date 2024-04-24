import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSearchResults } from './SearchResults';
import { Link } from "react-router-dom"; // Import Link from react-router-dom

import "./detail_style.css";

function SearchDetails() {

  const { qid } = useParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for QID:", qid);
        const response = await fetch(`http://127.0.0.1:8000/wiki_search/results/${qid}`);
        console.log("Response:", response);
        const data = await response.json();
        setItemDetails(data);
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    };

    fetchData();
  }, [qid]);

  if (!itemDetails) {
    return <div>Loading...</div>;
  }

  const { results, nearby, period } = itemDetails;


  const result = results.results.bindings[0];
  console.log("Result:", result);

  // Function to safely access nested properties
  const getSafeValue = (obj, defaultValue = 'Not Available') => {
      if (obj && obj.value !== undefined) {
          return obj.value;
      }
      return defaultValue;
  };
  if (searchResults.length > 0) {
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
                  <p>{extractQID(result.item.value)}</p>
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
  return (
    <div>
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
      <div className="page-container">
        <div className="card">
            <img src={result.image.value} alt={result.itemLabel.value}  />
        </div>
        <div className="card-content">
            <h2 className="card-title">{getSafeValue(result.itemLabel)}</h2>
            <p className="card-text">{getSafeValue(result.description)}</p>
            <div className="info-row">
                <div className="info-block">
                <p>Latitude: {getSafeValue(result.latitude)}</p>
                </div>
                <div className="info-block">
                <p>Longitude: {getSafeValue(result.longitude)}</p>
                </div>
            </div>
            
            <div className="info-row">
                <div className="info-block">
                <p>Style: {getSafeValue(result.styleLabel)}</p>
                </div>
                <div className="info-block">
                <p>Inception: {getSafeValue(result.inceptionYear)}</p>
                </div>
            </div>
            <a href={getSafeValue(result.article, '#')} className="card-link">Read more on Wikipedia</a>
            <div className="dropdowns-container">
            <div className="dropdown">
              <label htmlFor="nearby-locations">Nearby Locations</label>
              <select id="nearby-locations">
                {nearby.results.bindings.length > 0 ? (
                  nearby.results.bindings.map((location, index) => (
                    <option key={index} value={location.item.value}>
                      {location.itemLabel.value}
                    </option>
                  ))
                ) : (
                  <option>No nearby locations available</option>
                )}
              </select>
            </div>
            <div className="dropdown">
              <label htmlFor="similar-period-locations">Similar Period Locations</label>
              <select id="similar-period-locations">
                {period.results && period.results.bindings.length > 0 ? (
                  period.results.bindings.map((location, index) => (
                    <option key={index} value={location.item.value}>
                      {location.itemLabel.value} - {location.inceptionYear.value}
                    </option>
                  ))
                ) : (
                  <option>No similar period locations available</option>
                )}
              </select>
            </div>
          </div>          
        </div>
        </div>
    </div>
    
  );
}

export default SearchDetails;
