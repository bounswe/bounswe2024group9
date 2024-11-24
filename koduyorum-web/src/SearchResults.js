import React, { useState, useEffect, useRef  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, LeftSidebar, RightSidebar } from './PageComponents'; 
import { LoadingComponent }  from './LoadingPage'
import { fetchWikiIdAndName } from './Feed'; 
import './SearchResults.css';
import CreateAnnotation from './CreateAnnotation';
import './Annotation.css'

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [startIndex, setStartIndex] = useState(null);
  const [endIndex, setEndIndex] = useState(null);
  const [annotationData, setAnnotationData] = useState([]);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });


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
      const annotationResponse = await fetch(`${process.env.REACT_APP_API_URL}/get_annotations_by_language_id/${wikiId.slice(1)}/`);

      if (!infoResponse.ok || !questionResponse.ok) {
        throw new Error('Failed to load data');
      }

      const infoData = await infoResponse.json();
      const questionData = await questionResponse.json();      
      const annotationData = await annotationResponse.json();
      const questionsArray = questionData.questions;
      setInfoData(infoData || { mainInfo: [], instances: [], wikipedia: {} });
      setQuestionData(questionsArray || []);
      setAnnotationData(annotationData.data || []);
    } catch (err) {
      console.error("Error fetching search data:", err);
      setError("Failed to load search data.");
    } finally {
      setLoading(false);
    }
  };

  const addAnnotations = (text, annotations) => {
    let annotatedText = [];
    let lastIndex = 0;
  
    annotations.forEach((annotation) => {
      const { annotation_starting_point, annotation_ending_point, text: annotationText } = annotation;
  
      // Add text before the annotation
      if (lastIndex < annotation_starting_point) {
        annotatedText.push(text.slice(lastIndex, annotation_starting_point));
      }
  
      // Add annotated text with tooltip
      annotatedText.push(
        <span className="annotation" key={annotation_starting_point}>
          <em>{text.slice(annotation_starting_point, annotation_ending_point)}</em>
          <div className="annotation-tooltip">
            {annotationText}  {/* This will show the annotation text */}
          </div>
        </span>
      );
  
      // Update the lastIndex to the end of the annotation
      lastIndex = annotation_ending_point;
    });
  
    // Add the remaining text after the last annotation
    if (lastIndex < text.length) {
      annotatedText.push(text.slice(lastIndex));
    }
  
    return annotatedText;
  };  

  const handleTextSelection = (e) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0); // Get the selected range
  
      const startOffset = range.startOffset; // Start of the selection in the container
      const endOffset = range.endOffset; // End of the selection in the container
  
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      setSelectedText(selection.toString());
      setStartIndex(startOffset);
      setEndIndex(endOffset);
      setModalVisible(true);
      setModalPosition({ top: mouseY, left: mouseX });
    } else {
      console.log('No text selected.');
    }
  };

  const renderAnnotatedText = (textData) => {
    const { text, annotation, start, end } = textData;
  
    // Split the text into parts (before annotation, annotation, and after annotation)
    const beforeAnnotation = text.slice(0, start);
    const annotatedPart = text.slice(start, end);
    const afterAnnotation = text.slice(end);
  
    // Return JSX elements with annotations applied
    return (
      <>
        {beforeAnnotation}
        <span className="annotation" title={annotation}>
          <em>{annotatedPart}</em>
        </span>
        {afterAnnotation}
      </>
    );
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
            <div>
              <CreateAnnotation
                visible={modalVisible}
                selectedText={selectedText}
                startIndex={startIndex}
                endIndex={endIndex}
                language_id={wiki_id}
                onClose={() => setModalVisible(false)}
              />
            <div className="info-box" onMouseUp={(e) => handleTextSelection(e)}>
              
              <h2 className="language-title">{wiki_name}</h2>
              {infoData.mainInfo.length > 0 && (
                <div>
                  {infoData?.mainInfo?.[0]?.inceptionDate?.value && (
                    <p>
                      <strong>Inception Date:</strong> {new Date(infoData.mainInfo[0].inceptionDate.value).toLocaleDateString()}
                    </p>
                  )}
                  {infoData?.mainInfo?.[0]?.website?.value && (
                    <p>
                      <strong>Website:</strong>{' '}
                      <a href={infoData.mainInfo[0].website.value} target="_blank" rel="noopener noreferrer">
                        {infoData.mainInfo[0].website.value}
                      </a>
                    </p>
                  )}
                  {infoData?.mainInfo?.[0]?.influencedByLabel?.value && (
                    <p>
                      <strong>Influenced By:</strong> {infoData.mainInfo[0].influencedByLabel.value}
                    </p>
                  )}
                  {infoData?.mainInfo?.[0]?.wikipediaLink?.value && (
                    <p>
                      <strong>Wikipedia Link:</strong>{' '}
                      <a href={infoData.mainInfo[0].wikipediaLink.value} target="_blank" rel="noopener noreferrer">
                        {infoData.mainInfo[0].wikipediaLink.value}
                      </a>
                    </p>
                  )}
                </div>
              )}
              {infoData.instances.length > 0 && (
                <div>
                  <br></br>
                  <h3><strong>Related Instances</strong></h3>
                  <ul className="related-instances">
                    {infoData.instances.map((instance, index) => (
                      <li key={index}>
                        <strong>{instance.instanceLabel}:</strong>
                        <ul>
                          {instance.relatedLanguages.map((lang, i) => (
                            <li key={i}>
                              <button
                                className="related-instance-link"
                                onClick={() => handleRelatedInstanceClick(lang, navigate)}
                              >
                                {lang.relatedLanguageLabel}
                              </button>
                            </li>
                          ))}
                          <br></br>
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {infoData.wikipedia && (
                <div>
                {addAnnotations(infoData.wikipedia.info, annotationData)}
                </div>
              )}
            </div>
            </div>) : (
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
        <RightSidebar />
      </div>
    </div>
    
    )}
  </div>
  );
};

export default SearchResults;
export const handleRelatedInstanceClick = async (instance, navigate) => {
  const wikiIdAndName = await fetchWikiIdAndName(instance.relatedLanguageLabel);
  const wikiId = wikiIdAndName[0];
  const wikiName = wikiIdAndName[1];
  if (wikiId) {
    navigate(`/result/${wikiId}/${encodeURIComponent(wikiName)}`);
  } else {
    console.error("No wiki ID found for related instance:", instance);
  }
};