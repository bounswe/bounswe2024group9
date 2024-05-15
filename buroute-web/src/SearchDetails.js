import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSearchResults } from './SearchResults';
import { useAuth } from "./hooks/AuthProvider"
import StaticRoute from './components/StaticRoute/staticRoute';
import RouteCard from "./RouteCard"; 

import "./detail_style.css";
import './card.css';

function SearchDetails() {
  const auth = useAuth(); 
  const { qid } = useParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showNearby, setShowNearby] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [searched, setSearched] = useState(false); // State variable for search button press status
  const [isLoading, setIsLoading] = useState(false); // State variable for loading status
  const isMounted = useRef(true); 
  const searchDisplayRef = useRef(null); 
  const [routes, setRoutes] = useState([]); // State for routes

  const extractQID = (url) => {
    return url.split("/").pop();
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
    return () => {
      isMounted.current = false; 
    };
  }, []);

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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for QID:", qid);
        const response = await fetch(`http://localhost:8000/wiki_search/results/${qid}`);
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

  useEffect(() => {
      const fetchRoutes = async () => {
          try {
              const response = await fetch(`http://localhost:8000/database_search/routes/by_qid/${qid}/.`);
              const data = await response.json();
              console.log(data);

              setRoutes(data); // Directly setting the array of route objects
          } catch (error) {
              console.error("Error fetching routes:", error);
          }
      };

      fetchRoutes();
  }, []);


  if (!itemDetails) {
    return <div className="centered">Searching...</div>;
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
        <div className="header-bar" style={{ height: 'auto' }}>
          <img
            id="bar_logo"
            src="/logo.jpg"
            alt="bar_logo"
            style={{ width: '75px', height: 'auto', padding: "5px" }}
            onClick={() => window.location.href = '/feed'}
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
        {/* Main content always rendered */}
        <div className="item-details">
          <div className="page-container">
            <div className="card">
              {result?.image?.value ? (
                <img
                  src={result?.image?.value}
                  alt={result?.itemLabel?.value}
                />
              ) : (
                <img
                  src="/no_image.png"
                  alt="No Wikidata Pic Found"
                />
              )}
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
          <div className="routes-container">
            {routes.map((route, index) => (
              <RouteCard key={index} route={route} />
            ))}
          </div>
        </div>
        
        {/* Search results overlay */}
        {searched && (
          <div className="search-display" ref={searchDisplayRef}>
            {isLoading ? (
              <p className="centered-search">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="centered-search">We couldn't find anything.</p>
            ) : (
              searchResults.map((result, index) => (
                <div key={index} className="search-result">
                  <Link to={`/result/${extractQID(result.item.value)}`} onClick={() => setTimeout(() => window.location.reload(), 100)}>
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

export default SearchDetails;
