import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, LeftSidebar, RightSidebar } from "./PageComponents";
import PostPreview from "./PostPreview";
import { LoadingComponent } from "./LoadingPage"; // Importing the LoadingComponent
import "./Feed.css";
import NotificationCenter from './NotificationCenter';

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
  const [questionOfTheDay, setQuestionOfTheDay] = useState(null);
  const [loading, setLoading] = useState(true); // Adding a loading state
  const [topContributors, setTopContributors] = useState([]); // Top Contributors state
  const [topTags, setTopTags] = useState([]); // Top Tags state
  const hasFetchedData = useRef(false);
  const searchDisplayRef = useRef(null);
  const navigate = useNavigate();

  // Navbar Functions
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
    if (
      searchDisplayRef.current &&
      !searchDisplayRef.current.contains(event.target)
    ) {
      setSearched(false);
    }
  };

  const handleSearchResultClick = async (result) => {
    const wikiIdName = await fetchWikiIdAndName(result.languageLabel.value);
    const wikiId = wikiIdName[0];
    const wikiName = wikiIdName[1];
    console.log("Wiki ID and Name:", wikiId, wikiName);
    if (wikiId) {
      console.log(
        "Navigating to:",
        `/result/${wikiId}/${encodeURIComponent(wikiName)}`
      );
      setSearched(false);
      setSearchQuery("");
      setSearchResults([]);
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

  const fetchInitialData = useCallback(async () => {
    const user_id = localStorage.getItem("user_id");
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/fetch_feed_at_once/${user_id}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data.personalized_questions);
      setQuestionOfTheDay(data.question_of_the_day);
      setTopContributors(data.top_contributors);
      setTopTags(data.top_tags);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedData.current) {
      fetchInitialData();
      hasFetchedData.current = true;
    }
  }, []);


  const fetchSearchResults = async (query) => {
    try {
      query = query.replace(/[^a-z0-9]/gi, "");

      if (query === "") {
        return [];
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/search/${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("authToken"),
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.results.bindings);
      return data.results.bindings;
    } catch (error) {
      console.error("Error fetching search results:", error);
      setError(
        "Failed to load search results. Please check your network or server configuration."
      );
      return [];
    }
  };

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

  const sortedPosts = posts.sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sort === "popular") {
      return b.upvotes - a.upvotes;
    }
    return 0;
  });

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // Render
  return (
    <div className="feed-container">
      {loading ? (
        <LoadingComponent /> // Show loading screen while data is being fetched
      ) : (
        <>
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
          <NotificationCenter />

          <div className="feed-content">
            {/* Left Edge - Popular Tags */}
            <LeftSidebar handleTagClick={handleTagClick} setPosts={setPosts} language={''} top_tags={topTags}/>

            {/* Middle - Posts */}
            <div className="posts-container">
              <h2 className="section-title">Question of the Day</h2>
              {/* Display Question of the Day */}
              {questionOfTheDay && (
                <div className="question-of-the-day">
                  <h3>{questionOfTheDay.title}</h3>
                  <p>{truncateText(questionOfTheDay.description, 100)}</p>
                  <button
                    onClick={() => navigate(`/question/${questionOfTheDay.id}`)}
                  >
                    View More
                  </button>
                </div>
              )}
              <h2 className="section-title">Questions</h2>
              <h5>Sort according to:</h5>
              <div className="sorters">
                <select
                  className="filter-dropdown"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              <div className="questions-list">
                {sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => (
                    <PostPreview
                      key={post.id}
                      post={post}
                      onClick={() => navigate(`/question/${post.id}`)}
                    />
                  ))
                ) : (
                  <p className="empty-text">No questions found</p>
                )}
              </div>
            </div>

            {/* Right Edge - Top Contributors */}
            <RightSidebar topContributors={topContributors} />

            {/* Floating "Create Question" button */}
            <button
              className="floating-button"
              onClick={() => navigate("/post_question")}
            >
              +
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Feed;

export const fetchWikiIdAndName = async (tag) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/search/${tag}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    // Assuming the API returns an array of results and the first one is the most relevant
    return [
      data.results.bindings[0]?.language?.value.split("/").pop(),
      data.results.bindings[0]?.languageLabel?.value,
    ]; // returns [wikiId, wikiName]
  } catch (error) {
    console.error("Error fetching wiki ID:", error);
    return null;
  }
};
