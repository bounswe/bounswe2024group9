import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./hooks/AuthProvider";
import "./Feed.css";

function Feed() {
    const auth = useAuth();
    const { user } = auth;
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // State variable for loading status
    const [searched, setSearched] = useState(false); // State variable for search button press status
    const [posts, setPosts] = useState([]); // State for posts
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [language, setLanguage] = useState("all");
    const searchDisplayRef = useRef(null);

    // Function to extract QID from URL
    const extractQID = (url) => {
      return url.split("/").pop(); // Split the URL by "/" and get the last part
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

    const filteredPosts = posts.filter((post) => 
        (filter === "all" || post.status === filter) &&
        (language === "all" || post.language === language) &&
        (post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.preview.toLowerCase().includes(searchQuery.toLowerCase()))
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

    useEffect(() => {
        // const fetchPosts = async () => {
        //   try {
        //     console.log("User ID:", user.user_id);
        //     const response = await fetch(`${process.env.REACT_APP_API_URL}/django_app/load_feed_via_id/?user_id=${user.user_id}`); //TODO: Update the API URL
        //     const data = await response.json();
        //     console.log(data);
        //     setPosts(data);
        //   } catch (error) {
        //     console.error("Error fetching posts:", error);
        //   }
        // };

        // if (user && user.user_id) {
        //   fetchPosts();
        // }

        setPosts([
            {
                id: 1,
                title: "How to implement quicksort in Python?",
                language: "Python",
                labels: ["algorithms", "sorting"],
                status: "unanswered",
                createdAt: "2024-03-01",
                popularity: 10,
                preview:
                  "I am trying to implement quicksort in Python. I’ve read about partitioning arrays, but I am not sure how to handle recursive calls efficiently. Should I use a helper function or can I do this all in one function? Also, what’s the best way to handle edge cases?",
            },
            {
                id: 2,
                title: "Best practices for React hooks",
                language: "JavaScript",
                labels: ["react", "frontend"],
                status: "answered",
                createdAt: "2024-03-02",
                popularity: 15,
                preview:
                  "Hooks are a powerful feature in React, but sometimes they lead to unexpected behavior. What are the best practices for using React hooks? Specifically, how can I avoid issues related to stale closures and unnecessary re-renders in functional components?",
            },
            {
                id: 3,
                title: "Understanding recursion in C++",
                language: "C++",
                labels: ["recursion", "fundamentals"],
                status: "answered",
                createdAt: "2024-03-03",
                popularity: 12,
                preview:
                  "Recursion can be tricky to understand. In C++, when should I use recursion vs iteration? I often find myself confused about the performance implications of recursion.",
            },
          ]);

        }, [user]);

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
            auth.logout();
            window.location.href = '/login';
          }}>Log Out</button>
      </div>

      <div className="feed-content">
        {/* Left Edge - Popular Tags */}
        <div className="tags-container">
          <h3 className="section-title">Popular Tags</h3>
          <ul className="tags-list">
            <li><a href="/search/javascript" className="tag-link">JavaScript</a></li>
            <li><a href="/search/python" className="tag-link">Python</a></li>
            <li><a href="/search/react" className="tag-link">React</a></li>
            <li><a href="/search/algorithms" className="tag-link">Algorithms</a></li>
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

          <div className="posts-list">
            {sortedPosts.map((post) => (
              <div key={post.id} className="post-card">
                <h2 className="post-title">{post.title}</h2>
                <p className="post-preview">{truncateText(post.preview, 100)}</p>
                <div className="post-labels">
                  {post.labels.map((label) => (
                    <span key={label} className="post-label">{label}</span>
                  ))}
                </div>
                <div className="post-meta">
                  Language: {post.language} | Status: {post.status}
                </div>
              </div>
            ))}
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
                    <Link to={`/result/${extractQID(result.item.value)}`}>
                      <button className="result-button">
                        <h3>{result.itemLabel.value}</h3>
                      </button>
                    </Link>
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


export const fetchSearchResults = async (searchString) => {
    try {
        console.log("Original search string:", searchString);

        searchString = searchString.replace(/[^a-z0-9]/gi, '');
        
        console.log("Alphanumeric search string:", searchString);
        
        if (searchString === "") {
            return [];
        }
      
        const response = await fetch(`${process.env.REACT_APP_API_URL}/django_app/wikipedia/${searchString}`); //TODO: Update the API URL
        const data = await response.json();
        console.log(data.results.bindings);
        return data.results.bindings;
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
};
