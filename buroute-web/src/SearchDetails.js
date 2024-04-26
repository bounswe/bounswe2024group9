import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSearchResults, logoutUser } from './SearchResults';

import "./detail_style.css";

function SearchDetails() {

  const { qid } = useParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showNearby, setShowNearby] = useState(false); // State to track visibility of nearby dropdown
  const [showSimilar, setShowSimilar] = useState(false); // State to track visibility of similar period dropdown

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

  // Function to safely access nested properties
  const getSafeValue = (obj, defaultValue = 'Not Available') => {
    if (obj && obj.value !== undefined) {
      return obj.value;
    }
    return defaultValue;
  };

  const result = results?.results?.bindings?.[0]; // Safe access to results

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
        {searchResults.length > 0 ? (
          <div className="search-display">
            {searchResults.map((result, index) => (
              <div key={index} className="search-result">
                <Link to={`/result/${extractQID(result.item.value)}`} onClick={() => setTimeout(() => window.location.reload(), 100)}>
                  <button className="result-button">
                    <h3>{result.itemLabel.value}</h3>
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="page-container">
            <div className="card">
              <img src={result?.image?.value} alt={result?.itemLabel?.value} />
            </div>
            <div className="card-content">
              <h2 className="card-title">{getSafeValue(result?.itemLabel)}</h2>
              <p className="card-text">{getSafeValue(result?.description)}</p>
              <div className="info-row">
                <div className="info-block">
                  <p>Latitude: {getSafeValue(result?.latitude)}</p>
                </div>
                <div className="info-block">
                  <p>Longitude: {getSafeValue(result?.longitude)}</p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-block">
                  <p>Style: {getSafeValue(result?.styleLabel)}</p>
                </div>
                <div className="info-block">
                  <p>Inception: {getSafeValue(result?.inceptionYear)}</p>
                </div>
              </div>
              <a href={getSafeValue(result?.article, '#')} className="card-link">Read more on Wikipedia</a>
              <div className="dropdowns-container">
                <div className="dropdown">
                  <div className="dropdown-button" onClick={() => setShowNearby(!showNearby)}>
                    <button className="dropdown-toggle">Nearby Locations</button>
                  </div>
                  {showNearby && (
                    <div className="dropdown-content">
                      {nearby?.results?.bindings?.length > 0 ? (
                        nearby.results.bindings.map((location, index) => (
                          <Link key={index} to={`/result/${extractQID(location.item.value)}`} onClick={() => setTimeout(() => window.location.reload(), 100)}>
                            <div className="dropdown-item">{location.itemLabel.value}</div>
                          </Link>
                        ))
                      ) : (
                        <div className="dropdown-item">No nearby locations available</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="dropdown">
                  <div className="dropdown-button" onClick={() => setShowSimilar(!showSimilar)}>
                    <button className="dropdown-toggle">Similar Period Locations</button>
                  </div>
                  {showSimilar && (
                    <div className="dropdown-content">
                      {period?.results?.bindings?.length > 0 ? (
                        period.results.bindings.map((location, index) => (
                          <Link key={index} to={`/result/${extractQID(location.item.value)}`} onClick={() => setTimeout(() => window.location.reload(), 100)}>
                            <div className="dropdown-item">{location.itemLabel.value} - {location.inceptionYear.value}</div>
                          </Link>
                        ))
                      ) : (
                        <div className="dropdown-item">No similar period locations available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default SearchDetails;
