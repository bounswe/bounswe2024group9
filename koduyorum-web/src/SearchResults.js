import React, { useState, useEffect, useRef  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, LeftSidebar, RightSidebar } from './PageComponents'; 
import { LoadingComponent }  from './LoadingPage'
import { fetchWikiIdAndName } from './Feed'; 
import './SearchResults.css';
import CreateAnnotation from './CreateAnnotation';
import './Annotation.css'
import PostPreview from "./PostPreview";
import { showNotification } from './NotificationCenter';
import NotificationCenter from './NotificationCenter';

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
  const [languageId, setLanguageId] = useState(null);
  const [annotationId, setAnnotationId] = useState(null);
  const [topContributors, setTopContributors] = useState([]); // Top Contributors state
  const [originalText, setOriginalText] = useState(null);
  const [topTags, setTopTags] = useState([]); // Top Tags state

  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const { wiki_id, wiki_name} = useParams(); // Get wiki_id from the URL
  const navigate = useNavigate();
  const [language, setLanguage] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    language: wiki_name == "" ? "all" : wiki_name,
    tags: [],
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (wiki_id) {
      fetchSearchData([wiki_id, wiki_name]);
    }
    setLanguage(wiki_name);
    
    setFilters(prev => ({
      ...prev,
      language: wiki_name || 'all'
    }));
  }, [wiki_id, wiki_name]);

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


  const handleApplyFilters = async (page_number = 1) => {
    if (filters.endDate && filters.startDate && filters.endDate < filters.startDate) {
      showNotification('End date cannot be before start date');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get_questions_according_to_filter/${page_number}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': localStorage.getItem('user_id'),
        },
        body: JSON.stringify({
          status: filters.status,
          language: filters.language,
          tags: filters.tags,
          date_range: {
            start_date: filters.startDate,
            end_date: filters.endDate
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Filtered questions:', data);
        setQuestionData(data.questions);
        setPageCount(data.total_pages)
        setCurrentPage(page_number)
      }
    } catch (error) {
      console.error('Error fetching filtered questions:', error);
    }
  };

  

  const handleSearchResultClick = async (result) => {
      const wikiIdName = await fetchWikiIdAndName(result.languageLabel.value);
      const wikiId = wikiIdName[0];
      const wikiName = wikiIdName[1];
      // console.log("Wiki ID and Name:", wikiId, wikiName);
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


      const userId = localStorage.getItem('user_id');
      const infoQuestionAnnotationResponse = await fetch(`${process.env.REACT_APP_API_URL}/fetch_search_results_at_once/${encodeURIComponent(wikiId)}/${encodeURIComponent(wikiName)}/${(1)}`, {
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId,
        },
      }); 
      // Feth all data and questions' first page. Because it is default and the user can go to other pages, if there are more than one page.


      if (!infoQuestionAnnotationResponse.ok) {
        throw new Error('Failed to load data');
      }

      const infoQuestionAnnotationData = await infoQuestionAnnotationResponse.json();
      const infoData = infoQuestionAnnotationData.information;
      const questionData = infoQuestionAnnotationData.questions;      
      const annotationData = infoQuestionAnnotationData.annotations;
      const topContributors = infoQuestionAnnotationData.top_contributors; // Top Contributors data
      const topTags = infoQuestionAnnotationData.top_tags; // Top Tags data
      setOriginalText(infoData.wikipedia.info);


      setInfoData(infoData || { mainInfo: [], instances: [], wikipedia: {} });
      setQuestionData(questionData || []);
      setAnnotationData(annotationData || []);
      setTopContributors(topContributors || []);
      setTopTags(topTags || []);
    } catch (err) {
      console.error("Error fetching search data:", err);
      setError("Failed to load search data.");
    } finally {
      setLoading(false);
    }
  };

  const addAnnotations = (text, annotations) => {
    const loggedInUserId = localStorage.getItem('user_id'); 
      if (!text || text.length === 0) {
      return null;
    }
    let annotatedText = [];
    let lastIndex = 0;
  
    // Sort annotations by starting point to avoid misplacement
    const sortedAnnotations = annotations.sort(
      (a, b) => a.annotation_starting_point - b.annotation_starting_point
    );
  
    sortedAnnotations.forEach((annotation) => {
      const {
        annotation_starting_point,
        annotation_ending_point,
        text: annotationText,
        annotation_id: annotationId,
        author_id: author_id, 
        author_name: author_name, 
      } = annotation;
  
      console.log("Processing annotation:", annotation);
  
      if (lastIndex < annotation_starting_point) {
        annotatedText.push(text.slice(lastIndex, annotation_starting_point));
      }
  
      // Add annotated text with a tooltip
      annotatedText.push(
        <div className="annotation-container" key={annotation_starting_point}>
          <span className="annotation">
            <em>{text.slice(annotation_starting_point, annotation_ending_point)}</em>
            <div className="annotation-tooltip">
              {annotationText} {/* Show the annotation text */}
              <div className="annotation-tooltip-author">
                <br/>
              <em>by {author_name}</em>
            </div>
              {Number(author_id) === Number(loggedInUserId) ? (
                <>
                <br/>
                  <button
                    className="edit-icon"
                    onClick={() =>
                      handleEditAnnotation(
                        annotationId,
                        annotation_starting_point,
                        annotation_ending_point
                      )
                    }
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-icon"
                    onClick={() => handleDeleteAnnotation(annotationId)}
                  >
                    🗑️
                  </button>
                </>
              ):null}
            </div>
          </span>
        </div>
      );
  
      // Update the lastIndex to the end of the annotation
      lastIndex = annotation_ending_point;
    });
  
    // Add the remaining text after the last annotation
    if (lastIndex < text.length) {
      annotatedText.push(text.slice(lastIndex));
    }
    console.log("Final annotated text:", annotatedText);
    return annotatedText;
  };

  
  const handleEditAnnotation = async (annotationId, startOffset, endOffset) => {
    // Fetch the annotation to get its text
    const annotationToEdit = annotationData.find((annotation) => annotation.annotation_id === annotationId);
    if (annotationToEdit) {
        console.log("Editing annotation:", annotationToEdit);
        setSelectedText(annotationToEdit.text); // Set selected text from the annotation
        setStartIndex(startOffset);
        setEndIndex(endOffset);
        setModalVisible(true);
        setAnnotationId(annotationId);
    } else {
        console.error("Annotation not found for editing.");
    }
  };


  const handleDeleteAnnotation = async (annotationId) => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/delete_annotation/${annotationId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId,
        },
      });

      if (response.ok) {
        // Update the state to remove the deleted annotation
        setAnnotationData((prevAnnotations) =>
          prevAnnotations.filter((annotation) => annotation.annotation_id !== annotationId)
        );
        // alert('Annotation deleted successfully.');
        showNotification('Annotation deleted successfully.');
        // Optional: Trigger a re-fetch of annotations or update state to reflect the deletion
      } else {
        const errorData = await response.json();
        console.error('Error deleting annotation:', errorData);
        showNotification('Failed to delete annotation.');
        // alert('Failed to delete annotation.');
      }
    } catch (error) {
      console.error('Error during annotation deletion:', error);
      showNotification('An unexpected error occurred.');
      // alert('An unexpected error occurred.');
    }
  };
  

  const handleTextSelection = (e) => {
    const selection = window.getSelection();
  
    if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      const plainText = originalText; // Use the original full text
      const startOffset = plainText.indexOf(selectedText);
      const endOffset = startOffset + selectedText.length;
  
      if (startOffset === -1 || endOffset > plainText.length) {
        console.error("Error calculating offsets. Selection might span across multiple elements or annotations.");
        return;
      }
  
      setSelectedText(selectedText);
      setStartIndex(startOffset);
      setEndIndex(endOffset);
  
      const mouseX = e.clientX;
      const mouseY = e.clientY;
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
          <NotificationCenter />
          <div className="feed-content">
              <LeftSidebar 
                handleTagClick={handleTagClick} 
                language={wiki_name} 
                top_tags={topTags}
                filters={filters}
                setFilters={setFilters}
                handleApplyFilters={handleApplyFilters}
              />
            <div className="info-container">
 
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
                    annotation_type={"wiki"}
                    language_qid={wiki_id}
                    annotationId={annotationId}
                    onClose={() => setModalVisible(false)}
                  />
                  <div className="info-box" onMouseUp={(e) => handleTextSelection(e)}>
                      <h2 style={{paddingBottom: '0.5rem', borderBottom: '1px solid #ccc'}} className="language-title">
                        {wiki_name}
                      </h2>
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
                          <br />
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
                                  <br />
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
                  </div>
              ) : (
                <div className="questions-list">
                  <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #ccc', fontSize: '1.5rem' }}>
                    {questionData.length} Questions
                  </h2>
                  {questionData.length > 0 ? (
                    <>
                      {questionData.map((question) => (
                        <PostPreview 
                          key={question.id} 
                          post={question} 
                          onClick={() => navigate(`/question/${question.id}`)} 
                        />
                      ))}
                    <div className="pagination-controls flex justify-center gap-2 mt-4 mb-8">
                      <button 
                        onClick={async () => {
                          const prevPage = Math.max(currentPage - 1, 1);
                          
                          try {
                            handleApplyFilters(prevPage)
                          } catch (error) {
                            console.error('Error fetching previous page:', error);
                          }
                        }}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                        
                        <span className="flex items-center px-3">
                          Page {currentPage} of {pageCount}
                        </span>
                        
                        <button 
                          onClick={async () => {
                            const nextPage = Math.min(currentPage + 1, pageCount);
                            try {
                              handleApplyFilters(nextPage)
                            } catch (error) {
                              console.error('Error fetching next page:', error);
                            }
                          }}
                          disabled={currentPage === pageCount}
                          className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                          Next
                      </button>
                    </div>
                    </>
                  ) : (
                    <p>No questions found</p>
                  )}
                </div>
              )}
            </div>
            <RightSidebar topContributors={topContributors} />
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