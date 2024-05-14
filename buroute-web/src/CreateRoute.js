import React, { useState } from 'react';
import { fetchSearchResults } from './SearchResults';

const CreateRoute = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [chain, setChain] = useState([]); // State variable for the chain of nodes
  const [routeTitle, setRouteTitle] = useState('');
  const [routeDescription, setRouteDescription] = useState('');

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

  const addToChain = (result) => {
    if (result && result.item && result.item.value) {
      // If result is an object with item property, extract Q part from item.value and add it to the chain
      console.log('Adding item to chain:', result.item);
      const node_id = result.item.value.split('/').pop();
      setChain([...chain, node_id]);
    } else {
      // Handle invalid result object or other cases
      console.error('Invalid item object:', result);
    }
  };
  

  const postRoute = async () => {
    try {
      const postData = {
        title: routeTitle,
        description: routeDescription,
        photos: [],
        rating: 0,
        likes: 0,
        comments: [],
        saves: 0,
        node_ids: chain.join(', '),
        duration: [],
        duration_between: [],
        mapView: 'Your Map View URL',
      };
  
      console.log('Data to be sent:', postData);
  
      const response = await fetch('http://127.0.0.1:8000/database_search/create_route/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      console.log('Response:', response);
      const data = await response.json();
      console.log('Route posted:', data);
      // Optionally, reset state after posting route
      setChain([]);
    } catch (error) {
      console.error('Error posting route:', error);
    }
  };
  
  
  return (
    <div>
      {/* Route Title */}
      <input
        type="text"
        placeholder="Route Title"
        value={routeTitle}
        onChange={(e) => setRouteTitle(e.target.value)}
      />
      
      {/* Route Description */}
      <textarea
        placeholder="Route Description"
        value={routeDescription}
        onChange={(e) => setRouteDescription(e.target.value)}
      ></textarea>

      {/* Search bar */}
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      
      {/* Display search results */}
      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : searched && searchResults.length === 0 ? (
          <p>No results found.</p>
        ) : (
          searchResults.map((result, index) => (
            <div key={index}>
              {/* Render clickable search results */}
              <p onClick={() => addToChain(result)}>{result.itemLabel.value}</p>
            </div>
          ))
        )}
      </div>
      
      {/* Display chain */}
      <div>
        <h3>Chain:</h3>
        <ul>
          {chain.map((node, index) => (
            <li key={index}>{node}</li>
          ))}
        </ul>
      </div>
      
      {/* Add Route button */}
      <button onClick={postRoute}>Post Route</button>
    </div>
  );
};

export default CreateRoute;