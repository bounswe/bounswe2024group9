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
    <div className="search-results-container">
        <h1>Results for "{wiki_name}"</h1>

        {/* Displaying main information */}
        {infoData.mainInfo.length > 0 && (
            <div>
                <h2>{infoData.mainInfo[0]?.languageLabel?.value || "No title available"}</h2>
                <p><strong>Publication Date:</strong> {infoData.mainInfo[0]?.publicationDate?.value || "N/A"}</p>
                <p><strong>Website:</strong> 
                    <a href={infoData.mainInfo[0]?.website?.value} target="_blank" rel="noopener noreferrer">
                        {infoData.mainInfo[0]?.website?.value || "N/A"}
                    </a>
                </p>
            </div>
        )}

        {/* Displaying related instances */}
        {infoData.instances.length > 0 && (
            <div>
                <h3>Related Instances</h3>
                <ul>
                    {infoData.instances.map((instance, index) => (
                        <li key={index}>
                            <strong>{instance.instanceLabel}</strong>:
                            {instance.relatedLanguages.map((lang, i) => (
                                <span key={i}> {lang.relatedLanguageLabel}</span>
                            ))}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);
}

export default SearchResults;
