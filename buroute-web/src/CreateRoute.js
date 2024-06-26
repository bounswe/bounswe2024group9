import React, { useState, useRef, useEffect } from "react";
import NodeBox from "./NodeBox";
import { useAuth } from "./hooks/AuthProvider";
import { fetchSearchResults } from './SearchResults';

import "./CreateRoute.css"

function RouteCreation() {
    const auth = useAuth();
    const { user } = auth; 
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [chain, setChain] = useState([]); 
    const [routeTitle, setRouteTitle] = useState('');
    const [routeDescription, setRouteDescription] = useState('');
    const [routeRating, setRouteRating] = useState('');
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
        if (chain.length === 0) {
            alert('Please add at least one node to the route.');
            return
        }

        console.log(routeRating)
        console.log(isNaN(routeRating))
        console.log(!routeRating)
        if (routeRating < 0 || routeRating > 5 || isNaN(routeRating) || !routeRating){
            alert('Please enter a valid rating between 0 and 5.');
            return
        }

        if (routeTitle.length === 0) {
            alert('Please enter a title for the route.');
            return
        }

        try {

            const postData = {
                title: routeTitle,
                description: routeDescription,
                photos: [],
                rating: routeRating,
                likes: 0,
                comments: [],
                saves: 0,
                node_ids: chain.join(', '),
                node_names: nodeNames.join(', '),
                duration: [],
                duration_between: [],
                mapView: 'Your Map View URL',
                user: user.user_id
            };
            
            
            console.log('Data to be sent:', postData);
        
            const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/create_route/`, {
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
            setChain([]);
            setNodeNames([]);
            window.location.href = '/my_routes';
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
                    className="search-button"
                    onClick={() => {
                        window.location.href = '/feed';
                    }}
                >
                    Feed
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
                    className="create-route-button"
                    onClick={() => {
                        window.location.href = '/my_routes';
                    }}
                >
                    My Routes
                </button>
                <button
                    className="create-route-button"
                    onClick={() => {
                        window.location.href = '/routes';
                    }}
                >
                    Discover Top Routes
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
        <div className="main-container" style={{ height: '85vh', position: 'relative' }}>
            <div className="left" style={{ backgroundColor: '#e0eaFF', height: '80%', float: 'left', width: '30%', marginTop: '1%', marginLeft: '2%' }}>
                <div className="nodeboxes" style={{ backgroundColor: '#e0eaFF', height: '80%', width: '90%', overflowY: 'auto', margin: '3%' }}>
                    {nodeNames.map((nodeId, index) => (
                        <NodeBox key={index} text={nodeId} /> 
                    ))}
                </div>
                <div className="remove-button" onClick={handleRemoveButtonClick}>
                    Remove Last Node
                </div>
            </div>
            <div className="right" style={{ height: '80%', float: 'right', width: '60%', marginTop: '1%', marginRight: '5%', backgroundColor: 'white'}}>
                <div className="top-right" style={{backgroundColor: '#e0eaFF', height: '100%', width: '100%', display: 'flex',flexDirection: 'column'}}>
                    <input
                        type="text"
                        placeholder="Route Title"
                        value={routeTitle}
                        onChange={(e) => setRouteTitle(e.target.value)}
                        style={{ width: '40%', height: 15, marginLeft: '1%', marginTop: '1%' , borderRadius: '24px'}}
                    />
                    <textarea
                        placeholder="Route Description"
                        value={routeDescription}
                        onChange={(e) => setRouteDescription(e.target.value)}
                        style={{ width: '40%', height: 200, marginLeft: '1%', marginTop: '1%', borderRadius: '24px', padding: '10px' }}
                    />
                    <input
                        type="number"
                        min="0"
                        max="5"
                        placeholder="Route Rating"
                        value={routeRating}
                        onChange={(e) => setRouteRating(e.target.value)}
                        style={{ width: '40%', height: 15, marginLeft: '1%', marginTop: '1%' , borderRadius: '24px', padding: '5px'}}
                    />
                    <div style={{display: 'flex', position: 'relative'}}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            style={{ width: '40%', height: 15, marginLeft: '1%', marginTop: '1%' , borderRadius: '24px'}}
                            />
                        <div className="search-button2" onClick={handleSearch}>
                            Search
                        </div>
                        {isLoading ? (
                            <p style={{ marginLeft: '10%', position: 'absolute', top: '100%', left: '0'}}>Loading...</p>
                        ) : searched && searchResults.length === 0 && !clickOutside ? (
                            <p style={{ position: 'absolute', top: '100%', left: '0'}}>No results found.</p>
                        ) : (
                            <div ref={searchResultsRef} style={{ position: 'absolute', top: '100%', cursor:"pointer", left: '15px', zIndex: 1, width: '42%', backgroundColor: ' rgb(161, 189, 250)', overflowY: 'auto', maxHeight: '200px', marginLeft: '10px%',display: searchResults.length > 0 ? 'block' : 'none' }}>
                                {searchResults.map((result, index) => (
                                    <div key={index} style={{border: '1px solid black', paddingLeft: '1%'}}>
                                        <p onClick={() => addToChain(result)}>{result.itemLabel.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>             
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '1%' }}>
                        <div className="add-button" onClick={postRoute} >
                            Post Route
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

}

export default RouteCreation;
