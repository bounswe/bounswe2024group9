import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faThumbsUp, faCommentDots, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import './PostPreview.css';


const PostPreview = ({ post, currentUser, onClick }) => {
    const {
        id,
        title,
        description,
        user_id,
        upvotes,
        comments_count,
        programmingLanguage,
        codeSnippet,
        tags,
        topic,
        answered,
    } = post;

    const [isUpvoting, setIsUpvoting] = useState(false);
    const [isDownvoting, setIsDownvoting] = useState(false);
    const [animateUpvote, setAnimateUpvote] = useState(false);
    const [animateDownvote, setAnimateDownvote] = useState(false);
    const [upvote , setUpvote] = useState(upvotes);
    const navigate = useNavigate();


    const fetchWikiIdAndName = async (tag) => {
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

    const handleUpvote = async (e) => {
        e.stopPropagation();
        if (isUpvoting) return;
    
        setIsUpvoting(true);
        setAnimateUpvote(true); // Trigger the animation
    
        setTimeout(() => setAnimateUpvote(false), 500); // Reset animation after 500ms
        
        try { 
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upvote_object/question/${post.id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': localStorage.getItem('user_id'),
                },
            });
    
            if (response.ok) {
                setUpvote(upvote + 1);
                const data = await response.json();
            }
        } catch (error) {
            console.error('Error upvoting:', error);
            setUpvote(upvote - 1);
        } finally {
            setIsUpvoting(false);
        }
    };
    
    const handleDownvote = async (e) => {
        e.stopPropagation();
        if (isDownvoting) return;
    
        setIsDownvoting(true);
        setAnimateDownvote(true); // Trigger the animation
    
        setTimeout(() => setAnimateDownvote(false), 500); // Reset animation after 500ms
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}downvote_question/${post.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': currentUser.id,
                },
            });
    
            if (response.ok) {
                const data = await response.json();
            }
        } catch (error) {
            console.error('Error downvoting:', error);
        } finally {
            setIsDownvoting(false);
        }
    };
 
    return (
        <div className="post-card" onClick={onClick}>
            <div className={`status-label ${answered ? 'answered' : 'unanswered'}`}>
                {answered ? 'Answered' : 'Unanswered'}
            </div>

            <h3 className="post-title">{title}</h3>

            <div className="labels-container">
                <div className="language" onClick={(e) => {
                        e.stopPropagation(); // Prevent the click event from propagating to the outer box
                        handleSearchResultClick(
                            { languageLabel: { value: programmingLanguage } },
                            fetchWikiIdAndName,
                            navigate
                        );
                    }
                    }>{programmingLanguage}</div>
                <div className="tags">
                    {tags.map((tag, index) => (
                        <span key={index} className="label">{tag}</span>
                    ))}
                </div>
            </div>

            <p className="post-description">{description}</p>

            <div className="post-footer">
                <div
                    className={`footer-item ${animateUpvote ? 'upvote-animate' : ''}`}
                    onClick={handleUpvote}
                >
                    <FontAwesomeIcon icon={faThumbsUp} size="sm" color="#888" />
                    <span className="footer-text">{upvote} Upvotes</span>
                </div>
                <div
                    className={`footer-item ${animateDownvote ? 'downvote-animate' : ''}`}
                    onClick={handleDownvote}
                >
                    <FontAwesomeIcon icon={faThumbsDown} size="sm" color="#888" />
                    <span className="footer-text">{upvotes} Downvotes</span>
                </div>
                <div className="footer-item">
                    <FontAwesomeIcon icon={faCommentDots} size="sm" color="#888" />
                    <span className="footer-text">{comments_count} Comments</span>
                </div>
            </div>
        </div>
    );
};

export default PostPreview;
