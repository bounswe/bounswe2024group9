import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSearchResults } from './SearchResults';
import { useAuth } from "./hooks/AuthProvider"

import "./detail_style.css";

function SearchDetails() {
  const auth = useAuth(); 
  const { qid } = useParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showNearby, setShowNearby] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const isMounted = useRef(true); 

  const extractQID = (url) => {
    return url.split("/").pop();
  };

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      console.log("Enter key pressed");
      const results = await fetchSearchResults(searchValue.toLowerCase());
      setSearchResults(results);
    }
  };

  useEffect(() => {
    return () => {
      isMounted.current = false; 
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for QID:", qid);
        const response = await fetch(`http://127.0.0.1:8000/wiki_search/results/${qid}`);
        console.log("Response:", response);
        const data = await response.json();
        if (isMounted.current) {
          setItemDetails(data);
        }
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

  const getSafeValue = (obj, defaultValue = 'Not Available') => {
    if (obj && obj.value !== undefined) {
      return obj.value;
    }
    return defaultValue;
  };

  const result = results?.results?.bindings?.[0];

  return (
    <>
        <header>
        <div className="header-bar"
        style={{height: 'auto'}} >
          <img id="bar_logo" 
          src="/logo.jpg"
          alt="bar_logo"
          style={{ width: '75px', height: 'auto' }} 
          onClick={() => window.location.href = '/search'}
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
            placeholder="&#x1F50D; Start typing to search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyPress}
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
