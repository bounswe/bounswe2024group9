import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/AuthProvider";
import PostPreview from "./PostPreview";
import "./Feed.css";

function Feed() {
    // const auth = useAuth();
    // const { user } = auth;
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [language, setLanguage] = useState("all");
    const [error, setError] = useState(null);
    const [infoData, setInfoData] = useState(null);
    const [activeTab, setActiveTab] = useState("info");
    const searchDisplayRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const searchString = searchParams.get('query');

    const getQID = async (url) => {
        return url.split("/").pop();
    }

    const handleSearch = async () => {
        if (!searchQuery) {
            return;
        }
        setIsLoading(true);
        setSearched(true);
        const results = await fetchSearchResults(searchQuery.toLowerCase());
        setSearchResults(results);
        setIsLoading(false);
    };

    const handleClickOutside = (event) => {
        if (searchDisplayRef.current && !searchDisplayRef.current.contains(event.target)) {
            setSearched(false);
        }
    };

    const filteredPosts = posts.filter((post) => 
        (filter === "all" || post.status === filter) &&
        (language === "all" || post.language === language) &&
        (
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            post.preview?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    
    

    const sortedPosts = filteredPosts.sort((a, b) => {
        if (sort === "newest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sort === "popularity") {
            return b.popularity - a.popularity;
        }
        return 0;
    });

    const truncateText = (text, length) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    const fetchWikiIdAndName = async (string) => {
      try {
          const response = await fetch(`http://127.0.0.1:8000/search/${encodeURIComponent(string)}`);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const data = await response.json();
          // Assuming the API returns an array of results and the first one is the most relevant
          return [data.results.bindings[0]?.language?.value.split('/').pop(), data.results.bindings[0]?.languageLabel?.value]; // returns [wikiId, wikiName]
      } catch (error) {
          console.error("Error fetching wiki ID:", error);
          return null;
      }
    };

  

    const handleTagClick = async (tag) => {
        const wikiIdAndName = await fetchWikiIdAndName(tag);
        const wikiId = wikiIdAndName[0];
        const wikiName = wikiIdAndName[1];
        if (wikiId) {
            navigate(`/result/${wikiId}/${encodeURIComponent(wikiName)}`);
        } else {
            console.error("No wiki ID found for tag:", tag);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/random_questions/');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setPosts(data.questions);
        } catch (error) {
            console.error('Error fetching posts:', error.message);
            setError('Failed to load posts. Please check your network or server configuration.');
        }
    };

    const fetchSearchResults = async (query) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/search/${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.results.bindings;
        } catch (error) {
            console.error('Error fetching search results:', error.message);
            setError('Failed to load search results. Please check your network or server configuration.');
            return [];
        }
    }
    
    const handleSearchResultClick = async (result) => {
        const wikiIdName = await fetchWikiIdAndName(result.languageLabel.value);
        const wikiId = wikiIdName[0];
        const wikiName = wikiIdName[1];
        if (wikiId) {
            navigate(`/result/${wikiId}/${encodeURIComponent(wikiName)}`);
        } else {
            console.error("No wiki ID found for search result:", result);
        }
    };
  
    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
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
        <div className="feed-container">
            <div className="navbar">
                <div className="navbar-left">
                    <img
                        id="bar_logo"
                        src="resources/icon2-transparent.png"
                        style={{ width: "75px", height: "auto", padding: "5px" }}
                        alt="bar_logo"
                        onClick={() => (window.location.href = "/feed")}
                    />
                    <button className="nav-link">Home</button>
                    <button className="nav-link">Profile</button>
                </div>
                <input
                    type="search"
                    className="search-input"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                />
                <button className="search-button" onClick={handleSearch}>Search</button>
                <button 
                    className="nav-link"
                    onClick={() => {
                        // auth.logout();
                        window.location.href = '/login';
                    }}>Log Out</button>
            </div>

            <div className="feed-content">
                {/* Left Edge - Popular Tags */}
                <div className="tags-container">
                    <h3 className="section-title">Popular Tags</h3>
                    <ul className="tags-list">
                        <li>
                            <button onClick={() => handleTagClick('javascript')} className="tag-link">JavaScript</button>
                        </li>
                        <li>
                            <button onClick={() => handleTagClick('python')} className="tag-link">Python</button>
                        </li>
                        <li>
                            <button onClick={() => handleTagClick('react')} className="tag-link">React</button>
                        </li>
                        <li>
                            <button onClick={() => handleTagClick('algorithms')} className="tag-link">Algorithms</button>
                        </li>
                    </ul>
                </div>

                {/* Middle - Posts */}
                <div className="posts-container">
                    <div className="filters">
                        <select className="filter-dropdown" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Posts</option>
                            <option value="answered">Answered</option>
                            <option value="unanswered">Unanswered</option>
                        </select>
                        <select className="filter-dropdown" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="all">All Languages</option>
                            <option value="Python">Python</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="C++">C++</option>
                        </select>
                        <select className="filter-dropdown" value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="newest">Newest</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>

                    <div className="questions-list">
                        {sortedPosts.length > 0 ? (
                            sortedPosts.map((post) => (
                                <PostPreview key={post.id} post={post} onClick={() => navigate(`/question`)} />
                            ))
                        ) : (
                            <p className="empty-text">No questions found</p>
                        )}
                    </div>

                    {searched && (
                        <div className="search-display" ref={searchDisplayRef}>
                            {isLoading ? (
                                <p className="centered-search">Searching...</p>
                            ) : searchResults.length === 0 ? (
                                <p className="centered-search">We couldn't find anything.</p>
                            ) : (
                              searchResults.map((result, index) => (
                                <div key={index} className="search-result">
                                    <button
                                        className="result-button"
                                        onClick={() => handleSearchResultClick(result)}
                                    >
                                        <h3>{result.languageLabel.value}</h3>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Right Edge - Top Contributors */}
            <div className="contributors-container">
                <h3 className="section-title">Top Contributors</h3>
                <ul className="contributors-list">
                    <li>John Doe</li>
                    <li>Jane Smith</li>
                    <li>Bob Johnson</li>
                </ul>
            </div>
        </div>
    </div>
);
}

export default Feed;

