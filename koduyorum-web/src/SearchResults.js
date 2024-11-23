import React, { useState, useEffect, useRef  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, LeftSidebar, RightSidebar } from './PageComponents'; 
import { LoadingComponent }  from './LoadingPage'
import './SearchResults.css';
import PostPreview from "./PostPreview";

const SearchResults = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [infoData, setInfoData] = useState(null);
  const [questionData, setQuestionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const searchDisplayRef = useRef(null);

  const { wiki_id, wiki_name} = useParams(); // Get wiki_id from the URL
  const navigate = useNavigate();

  useEffect(() => {
    if (wiki_id) {
      fetchSearchData([wiki_id, wiki_name]);
    }
  }, [wiki_id]);

  	// ------  NAVBAR FUNCTIONS ------ (copied from Feed.js)
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


const fetchWikiIdAndName = async (string) => {
  try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/search/${encodeURIComponent(string)}`);
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/random_questions/`);
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

  const fetchSearchData = async ([wikiId, wikiName]) => {
    try {
      setLoading(true);
      setError(null);

      const infoResponse = await fetch(`${process.env.REACT_APP_API_URL}/result/${encodeURIComponent(wikiId)}`);
      const questionResponse = await fetch(`${process.env.REACT_APP_API_URL}/list_questions_by_language/${encodeURIComponent(wikiName)}/1`);

      if (!infoResponse.ok || !questionResponse.ok) {
        throw new Error('Failed to load data');
      }

      const infoData = await infoResponse.json();
      const questionData = await questionResponse.json();      
      const questionsArray = questionData.questions;
      setInfoData(infoData || { mainInfo: [], instances: [], wikipedia: {} });
      setQuestionData(questionsArray || []);
    } catch (err) {
      console.error("Error fetching search data:", err);
      setError("Failed to load search data.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="feed">
    {loading ? (
      <LoadingComponent />
    ) : error ? (
      <div className="error">{error}</div>
    ) : (
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


      

      {/* Main Content Area */}
      <div className="feed-content">
        {/* Sidebar with tags */}
        <LeftSidebar handleTagClick={handleTagClick} />

        

        {/* Content Section */}
        <div className='info-container'>
          {/* Tab Navigation */}
      <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'info' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button
            className={`tab-button ${activeTab === 'questions' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Questions
          </button>
      </div>
          {activeTab === 'info' ? (
            <div className="info-box">
              <h2  style={{paddingBottom: '0.5rem', borderBottom: '1px solid #ccc' }}className="language-title">{wiki_name}</h2>
              {infoData.mainInfo.length > 0 && (
                <div>
                  <p><strong>Inception Date:</strong> {new Date(infoData?.mainInfo?.[0]?.inceptionDate?.value).toLocaleDateString() || "N/A"}</p>
                  <p><strong>Website:</strong> {infoData?.mainInfo?.[0]?.website?.value ? (
                    <a href={infoData.mainInfo[0].website.value} target="_blank" rel="noopener noreferrer">{infoData.mainInfo[0].website.value}</a>
                  ) : "N/A"}</p>
                  <p><strong>Influenced By:</strong> {infoData?.mainInfo?.[0]?.influencedByLabel?.value ?? "N/A"}</p>
                  <p><strong>Wikipedia Link:</strong> {infoData?.mainInfo?.[0]?.wikipediaLink?.value ? (
                    <a href={infoData.mainInfo[0].wikipediaLink.value} target="_blank" rel="noopener noreferrer">{infoData.mainInfo[0].wikipediaLink.value}</a>
                  ) : "N/A"}</p>
                </div>
              )}
              {infoData.instances.length > 0 && (
                <div>
                  <h3>Related Instances</h3>
                  <ul className="related-instances">
                    {infoData.instances.map((instance, index) => (
                      <li key={index}>
                        <strong>{instance.instanceLabel}:</strong>
                        <ul>
                          {instance.relatedLanguages.map((lang, i) => (
                            <li key={i}>{lang.relatedLanguageLabel}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {infoData.wikipedia && (
                <div>
                  <p>{infoData.wikipedia.info}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="questions-list">
              <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #ccc', fontSize: '1.5rem' }}>{questionData.length} Questions</h2>
              {questionData.length > 0 ? (
                questionData.map((question) => (
                  <PostPreview key={question.id} post={question} onClick={() => navigate(`/question/${question.id}`)} />
                ))
              ) : (
                <p>No questions found</p>
              )}
            </div>
          )}
        </div>
         {/* Right Edge - Top Contributors */}
        <RightSidebar />
      </div>
    </div>
    )}
  </div>
  );
};

export default SearchResults;
