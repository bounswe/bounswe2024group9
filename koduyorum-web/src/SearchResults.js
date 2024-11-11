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

  const handleTabSwitch = (tab) => setActiveTab(tab);

  const handleTagClick = (tag) => navigate(`/result/${tag}`);

  if (loading) return <div className="loading">Loading...</div>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="search-results-container">
      <nav className="navbar">
        <div className="navbar-left">
          <a href="/feed" className="nav-link">Home</a>
          <a href="/profile" className="nav-link">Profile</a>
          <a href="/logout" className="nav-link">Logout</a>
        </div>
      </nav>

      <div className="tabs">
        <button
          onClick={() => handleTabSwitch('info')}
          className={activeTab === 'info' ? 'active' : ''}
        >
          Info
        </button>
        <button
          onClick={() => handleTabSwitch('questions')}
          className={activeTab === 'questions' ? 'active' : ''}
        >
          Questions
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && infoData && (
        <div className="info-section">
          <h2>{infoData.mainInfo[0]?.languageLabel.value || 'No Information Available'} (Wikidata Info)</h2>
          {infoData.mainInfo.length > 0 ? (
            <>
              <p><strong>Publication Date:</strong> {new Date(infoData.mainInfo[0].publicationDate.value).toLocaleDateString()}</p>
              <p>
                <strong>Website:</strong> 
                <a href={infoData.mainInfo[0].website.value} target="_blank" rel="noopener noreferrer">
                  {infoData.mainInfo[0].website.value}
                </a>
              </p>
              <p>
                <strong>Wikipedia:</strong> 
                <a href={infoData.mainInfo[0].wikipediaLink.value} target="_blank" rel="noopener noreferrer">
                  {infoData.mainInfo[0].wikipediaLink.value}
                </a>
              </p>
              <div className="related-instances">
                <h3>Related Instances</h3>
                {infoData.instances.map((instance, index) => (
                  <div key={index} className="instance">
                    <p><strong>{instance.instanceLabel}</strong></p>
                    <ul>
                      {instance.relatedLanguages.map((related, idx) => (
                        <li key={idx} onClick={() => handleTagClick(related.relatedLanguageLabel)}>
                          {related.relatedLanguageLabel}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No information available for this topic.</p>
          )}
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="questions-section">
          <h2>Questions related to "{wiki_id}"</h2>
          <ul>
            {questionData.length > 0 ? (
              questionData.map((question, index) => (
                <li key={index}>
                  <div className="question-card">
                    <h3>{question.title}</h3>
                    <p>{question.description}</p>
                    <button onClick={() => navigate(`/code-execution/${question.id}`)}>
                      Go to Code Execution
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p>No questions found for this topic.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
