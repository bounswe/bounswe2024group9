import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [infoData, setInfoData] = useState(null);
  const [questionData, setQuestionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { wiki_id, wiki_name} = useParams(); // Get wiki_id from the URL
  const navigate = useNavigate();

  useEffect(() => {
    if (wiki_id) {
      fetchSearchData([wiki_id, wiki_name]);
    }
  }, [wiki_id]);

  const fetchSearchData = async ([wikiId, wikiName]) => {
    try {
      setLoading(true);
      setError(null);

      const infoResponse = await fetch(`http://127.0.0.1:8000/result/${encodeURIComponent(wikiId)}`);
      const questionResponse = await fetch(`http://127.0.0.1:8000/list_questions/?language=${encodeURIComponent(wikiName)}`);

      if (!infoResponse.ok || !questionResponse.ok) {
        throw new Error('Failed to load data');
      }

      const infoData = await infoResponse.json();
      const questionData = await questionResponse.json();

      setInfoData(infoData || { mainInfo: [], instances: [], wikipedia: {} });
      setQuestionData(questionData || []);
    } catch (err) {
      console.error("Error fetching search data:", err);
      setError("Failed to load search data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="feed-container">
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-left">
          <img
            id="bar_logo"
            src="resources/icon2-transparent.png"
            style={{ width: "75px", height: "auto", padding: "5px" }}
            alt="bar_logo"
            onClick={() => navigate('/feed')}
          />
         <button className="nav-link">Home</button>
         <button className="nav-link">Profile</button>
        </div>
        
        <button 
          className="nav-link"
          onClick={() => navigate('/login')}
        >Log Out</button>
      </div>

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

      {/* Main Content Area */}
      <div className="feed-content">
        {/* Sidebar with tags */}
        <div className="tags-container">
          <h3 className="section-title">Related Tags</h3>
          <ul className="tags-list">
            <li>
              <button className="tag-link">Python</button>
            </li>
            <li>
              <button className="tag-link">JavaScript</button>
            </li>
            <li>
              <button className="tag-link">React</button>
            </li>
            <li>
              <button className="tag-link">Algorithms</button>
            </li>
          </ul>
        </div>

        

        {/* Content Section */}
        <div >
          {activeTab === 'info' ? (
            <div className="info-box">
              <h2 className="language-title">{wiki_name}</h2>
              {infoData.mainInfo.length > 0 && (
                <div>
                  <p><strong>Inception Date:</strong> {new Date(infoData.mainInfo[0].inceptionDate.value).toLocaleDateString() || "N/A"}</p>
                  <p><strong>Website:</strong> <a href={infoData.mainInfo[0].website.value} target="_blank" rel="noopener noreferrer">{infoData.mainInfo[0].website.value}</a></p>
                  <p><strong>Influenced By:</strong> {infoData.mainInfo[0].influencedByLabel.value}</p>
                  <p><strong>Wikipedia Link:</strong> <a href={infoData.mainInfo[0].wikipediaLink.value} target="_blank" rel="noopener noreferrer">{infoData.mainInfo[0].wikipediaLink.value}</a></p>
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
            <div>
              <h2>{questionData.length} Questions</h2>
              {questionData.map((question, index) => (
                <div key={index} className="post-card">
                  <h3>{question.title}</h3>
                  <p>{question.summary}</p>
                  <p><strong>Status:</strong> {question.status}</p>
                  <p><strong>Date:</strong> {question.date}</p>
                </div>
              ))}
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
};

export default SearchResults;
