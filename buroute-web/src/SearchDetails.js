import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import "./detail_style.css";

function SearchDetails() {
  const { qid } = useParams();
  const [itemDetails, setItemDetails] = useState(null);

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

  return (
    <div>
      <div className="page-container">
        <div className="card">
            <img src={results.results.bindings[0].image.value} alt={results.results.bindings[0].itemLabel.value}  />
        </div>
        <div className="card-content">
            <h2 className="card-title">{results.results.bindings[0].itemLabel.value}</h2>
            <p className="card-text">{results.results.bindings[0].description.value}</p>
            <div className="info-row">
                <div className="info-block">
                <p>Latitude: {results.results.bindings[0].latitude.value}</p>
                </div>
                <div className="info-block">
                <p>Longitude: {results.results.bindings[0].longitude.value}</p>
                </div>
            </div>
            
            <div className="info-row">
                <div className="info-block">
                <p>Style: {results.results.bindings[0].styleLabel.value}</p>
                </div>
                <div className="info-block">
                <p>Inception: {results.results.bindings[0].inceptionYear.value}</p>
                </div>
            </div>
            <a href={results.results.bindings[0].article.value} className="card-link">Read more on Wikipedia</a>
            <div className="dropdowns-container">
            <div className="dropdown">
              <label htmlFor="nearby-locations">Nearby Locations</label>
              <select id="nearby-locations">
                {nearby.results.bindings.map((location, index) => (
                  <option key={index} value={location.item.value}>
                    {location.itemLabel.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="dropdown">
              <label htmlFor="similar-period-locations">Similar Period Locations</label>
              <select id="similar-period-locations">
                {period.results.bindings.map((location, index) => (
                  <option key={index} value={location.item.value}>
                    {location.itemLabel.value} - {location.inceptionYear.value}
                  </option>
                ))}
              </select>
            </div>
          </div>          
        </div>
        </div>
    </div>
    
  );
}

export default SearchDetails;
