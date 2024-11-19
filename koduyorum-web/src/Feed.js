import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/AuthProvider";
import { Navbar, LeftSidebar, RightSidebar } from './PageComponents'; 
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
    const [questionOfTheDay, setQuestionOfTheDay] = useState(null);
    const searchDisplayRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const searchString = searchParams.get('query');

    const getQID = async (url) => {
        return url.split("/").pop();
    }

	// ------  NAVBAR FUNCTIONS ------
    const handleEnter = () => {
        if (searchResults.length > 0) {
            const topResult = searchResults[0];
            handleSearchResultClick(topResult);
        }
    };
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

	const handleSearchResultClick = async (result) => {
        const wikiIdName = await fetchWikiIdAndName(result.languageLabel.value);
        const wikiId = wikiIdName[0];
        const wikiName = wikiIdName[1];
        console.log("Wiki ID and Name:", wikiId, wikiName);
        if (wikiId) {
            console.log("Navigating to:", `/result/${wikiId}/${encodeURIComponent(wikiName)}`);
            navigate(`/result/${wikiId}/${encodeURIComponent(wikiName)}`);
        } else {
            console.error("No wiki ID found for search result:", result);
        }
    };

	const handleSearchQueryChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query) {
            setIsLoading(true);
            const results = await fetchSearchResults(query);
            setSearchResults(results);
            setSearched(true);
            setIsLoading(false);
        } else {
            setSearchResults([]);
            setSearched(false);
        }
    };
	// --------------------------------

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
            return new Date(b.created_at) - new Date(a.created_at);
        } else if (sort === "popularity") {
            return b.upvotes - a.upvotes;
        }
        return 0;
    });

    const truncateText = (text, length) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
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
        const user_id = localStorage.getItem('user_id');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/specific_feed/${user_id}/`,{
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                  },
                });
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/search/${encodeURIComponent(query)}`);
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

    const fetchQuestionOfTheDay = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/daily_question/`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setQuestionOfTheDay(data.question); // Set the question data to state
        } catch (error) {
            console.error('Error fetching Question of the Day:', error.message);
        }
    };
  
    useEffect(() => {
        fetchPosts();
        fetchQuestionOfTheDay();
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
            <Navbar
			searchQuery={searchQuery}
			handleSearchQueryChange={handleSearchQueryChange}
			handleSearch={handleSearch}
			handleEnter={handleEnter}
			searchResults={searchResults}
			isLoading={isLoading}
			searched={searched}
			handleSearchResultClick={handleSearchResultClick}
		/>

            <div className="feed-content">
                {/* Left Edge - Popular Tags */}
                <LeftSidebar handleTagClick={handleTagClick} />

                {/* Middle - Posts */}
                <div className="posts-container">
                    <h2 className="section-title">Question of the Day</h2>
                    {/* Display Question of the Day */}
                    {questionOfTheDay && (
                        <div className="question-of-the-day">
                            <h2>Question of the Day</h2>
                            <h3>{questionOfTheDay.title}</h3>
                            <p>{truncateText(questionOfTheDay.description, 100)}</p>
                            <button onClick={() => navigate(`/question/${questionOfTheDay.id}`)}>View More</button>
                        </div>
                    )}
                    <h2 className="section-title">Questions</h2>
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

                    {/* {searched && (
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
                )} */}
            </div>

            {/* Right Edge - Top Contributors */}
            <RightSidebar />
            {/* Floating "Create Question" button */}
            <button className="floating-button" onClick={() => navigate('/post_question')}>
                    +
                </button>
        </div>
    </div>
);
}

export default Feed;

export const fetchSearchResults = async (searchString) => {
try {
    console.log("Original search string:", searchString);

    searchString = searchString.replace(/[^a-z0-9]/gi, '');

    console.log("Alphanumeric search string:", searchString);

    if (searchString === "") {
        return [];
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/django_app/search/${searchString}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
            },
        }
    );
    const data = await response.json();
    console.log(data.results.bindings);
    return data.results.bindings;
} catch (error) {
    console.error("Error fetching search results:", error);
    return []; // Return an empty array in case of error
}
};

export const fetchWikiIdAndName = async (tag) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/search/${tag}`,
              {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                  },
              }

        );
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