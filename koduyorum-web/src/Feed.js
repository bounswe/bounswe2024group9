import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, LeftSidebar, RightSidebar } from './PageComponents'; 
import PostPreview from "./PostPreview";
import { LoadingComponent } from "./LoadingPage"; // Importing the LoadingComponent
import "./Feed.css";

function Feed() {
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
    const [loading, setLoading] = useState(true); // Adding a loading state
    const [topContributors, setTopContributors] = useState([]); // Top Contributors state

    const searchDisplayRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                await fetchPosts();
                await fetchQuestionOfTheDay();
                await fetchTopContributors();
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchPosts = async () => {
        const user_id = localStorage.getItem('user_id');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/specific_feed/${user_id}/`, {
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

    const fetchQuestionOfTheDay = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/daily_question/`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setQuestionOfTheDay(data.question);
        } catch (error) {
            console.error('Error fetching Question of the Day:', error.message);
        }
    };

    const fetchTopContributors = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/get_top_five_contributors/`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setTopContributors(data.users || []);
        } catch (error) {
            console.error("Error fetching top contributors:", error.message);
        }
    };


    useEffect(() => {
        const fetchTopContributors = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/get_top_five_contributors/`);
            if (!response.ok) {
              throw new Error('Failed to fetch contributors');
            }
            const data = await response.json();
            setTopContributors(data.users || []);
          } catch (error) {
            console.error('Error fetching contributors:', error);
          }
        };
    
        fetchTopContributors();
      }, []);
      
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

    return (
        <div className="feed-container">
            {loading ? (
                <LoadingComponent /> // Show loading screen while data is being fetched
            ) : (
                <>
                    <Navbar
                        searchQuery={searchQuery}
                        handleSearchQueryChange={(e) => setSearchQuery(e.target.value)}
                        handleSearch={() => setSearched(true)}
                        handleEnter={() => {}}
                        searchResults={searchResults}
                        isLoading={isLoading}
                        searched={searched}
                        handleSearchResultClick={() => {}}
                    />

                    <div className="feed-content">
                        {/* Left Edge - Popular Tags */}
                        <LeftSidebar handleTagClick={(tag) => console.log("Tag clicked:", tag)} />

                        {/* Middle - Posts */}
                        <div className="posts-container">
                            <h2 className="section-title">Question of the Day</h2>
                            {/* Display Question of the Day */}
                            {questionOfTheDay && (
                                <div className="question-of-the-day">
                                    <h3>{questionOfTheDay.title}</h3>
                                    <p>{questionOfTheDay.description}</p>
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
                                        <PostPreview key={post.id} post={post} onClick={() => navigate(`/question/${post.id}`)} />
                                    ))
                                ) : (
                                    <p className="empty-text">No questions found</p>
                                )}
                            </div>
                        </div>

                        {/* Right Edge - Top Contributors */}
                        <RightSidebar topContributors={topContributors} />

                        {/* Floating "Create Question" button */}
                        <button className="floating-button" onClick={() => navigate('/post_question')}>
                            +
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Feed;
