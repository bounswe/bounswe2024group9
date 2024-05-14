import React, { useState, useRef, useEffect } from "react";
import NodeBox from "./NodeBox";
import { useAuth } from "./hooks/AuthProvider";
import { fetchSearchResults } from './SearchResults';

import "./CreateRoute.css"

function RouteCreation() {
    const auth = useAuth();
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [chain, setChain] = useState([]); 
    const [routeTitle, setRouteTitle] = useState('');
    const [routeDescription, setRouteDescription] = useState('');
    const [nodeNames, setNodeNames] = useState([]);
    const [clickOutside, setClickOutside] = useState(false);

    const searchResultsRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
                setSearchResults([]);
                setClickOutside(true);
            } else {
                setClickOutside(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchResultsRef]);

    const handleRemoveButtonClick = () => {
        setChain(chain.slice(0, -1));
        setNodeNames(nodeNames.slice(0, -1));
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

    const addToChain = (result) => {
        if (result && result.item && result.item.value) {
            const node_id = result.item.value.split('/').pop();
            setChain([...chain, node_id]);
            setNodeNames([...nodeNames, result.itemLabel.value]);
        } else {
            console.error('Invalid item object:', result);
        }
    };

    const handleAddButtonClick = () => {
        // Code for handling add button click
    };

    return (
        <>
            <header>
                <div className="header-bar">
                    <img
                        id="bar_logo"
                        src="/logo.jpg"
                        style={{ width: "75px", height: "auto", padding: "5px" }}
                        alt="bar_logo"
                        onClick={() => (window.location.href = "/search")}
                    />
                    <button
                        className="search-button"
                        onClick={() => {
                            window.location.href = '/search';
                        }}
                    >
                        Search
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
            </header>
            <div className="main-container" style={{ height: '85vh' }}>
                <div className="left" style={{ backgroundColor: '#e0eaFF', height: '80%', float: 'left', width: '30%', marginTop: '1%', marginLeft: '2%' }}>
                    <div className="nodeboxes" style={{ backgroundColor: '#e0eaFF', height: '80%', width: '90%', overflowY: 'auto', margin: '3%' }}>
                        {nodeNames.map((nodeId, index) => (
                            <NodeBox key={index} text={nodeId} /> 
                        ))}
                    </div>
                    <div className="remove-button" style={{ backgroundColor: '#ff5f5f', height: '10%', marginLeft: '3%', width: '80%', cursor: 'pointer', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={handleRemoveButtonClick}>
                        Remove
                    </div>
                </div>
                <div className="right" style={{ height: '80%', float: 'right', width: '60%', marginTop: '1%', marginRight: '5%', backgroundColor: 'white'}}>
                    <div className="top-right" style={{ backgroundColor: '#e0eaFF', height: '30%', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="Route Title"
                            value={routeTitle}
                            onChange={(e) => setRouteTitle(e.target.value)}
                            style={{ width: '80%', height: '10%', marginLeft: '10%', marginTop: '1%' }}
                        />
                        <textarea
                            placeholder="Route Description"
                            value={routeDescription}
                            onChange={(e) => setRouteDescription(e.target.value)}
                            style={{ width: '80%', height: '10%', marginLeft: '10%', marginTop: '1%' }}
                        ></textarea>                    
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            style={{ width: '60%', height: '10%', marginLeft: '10%', marginTop: '1%'}} 
                        />
                        <div className="add-button" style={{ float: 'right', backgroundColor: '#20B6DE', height: '12%', marginRight: '9%', marginTop: '1%', width: '18%', cursor: 'pointer', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={handleSearch}>
                            Search
                        </div>
                        {isLoading ? (
                            <p style={{ marginLeft: '10%'}}>Loading...</p>
                        ) : searched && searchResults.length === 0 && !clickOutside ? (
                            <p>No results found.</p>
                        ) : (
                            <div ref={searchResultsRef} style={{ marginLeft: '10%', backgroundColor: '#20B6DE', overflowY: 'auto', maxHeight: '200px', display: searchResults.length > 0 ? 'block' : 'none' }}>
                                {searchResults.map((result, index) => (
                                    <div key={index}>
                                        <p onClick={() => addToChain(result)}>{result.itemLabel.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className="add-button" style={{ float: 'right', backgroundColor: '#20B6DE', height: '10%', marginTop: '1%', marginLeft: '10%', width: '20%', cursor: 'pointer', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={handleAddButtonClick}>
                                Add Description
                            </div>
                            <div className="add-button" style={{ float: 'right', backgroundColor: '#20B6DE', height: '10%', marginTop: '1%', width: '20%', cursor: 'pointer', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={handleAddButtonClick}>
                                Export
                            </div>
                            <div className="add-button" style={{ float: 'right', backgroundColor: '#20B6DE', height: '10%', marginTop: '1%', marginRight: '9%', width: '20%', cursor: 'pointer', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={postRoute} >
                                Post Route
                            </div>
                        </div>
                    </div>
                    <div className="bottom-right" style={{ backgroundColor: '#e0eaFF', height: '75%', width: '100%', marginTop: '2%' }}>
                        <div></div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RouteCreation;
