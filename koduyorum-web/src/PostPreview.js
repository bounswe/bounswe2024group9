import React, {useEffect, useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {faThumbsUp, faCommentDots, faThumbsDown, faBookmark} from '@fortawesome/free-solid-svg-icons';
import './PostPreview.css';

// list_questions_according_to_the_user
/*
questions_data = [{
    'id': question._id,
    'title': question.title,
    'description': question.details,
    'user_id': question.author.pk,
    'upvotes': question.upvotes,
    'comments_count': question.comments.count(),
    'programmingLanguage': question.language,
    'codeSnippet': question.code_snippet,
    'tags': question.tags,
    'answered': question.answered,
    'topic': question.topic,
    'author': question.author.username
} for question in personalized_questions]
 */
const PostPreview = ({ post, currentUser, onClick }) => {
    const {
        id,
        title,
        description,
        user_id,
        upvotes,
        downvotes,
        comments_count,
        programmingLanguage,
        codeSnippet,
        tags,
        topic,
        answered,
        author,
        isUpvoted,
        isDownvoted,
        postType,
    } = post;

    const [isUpvoting, setIsUpvoting] = useState(false);
    const [isDownvoting, setIsDownvoting] = useState(false);
    const [animateUpvote, setAnimateUpvote] = useState(false);
    const [animateDownvote, setAnimateDownvote] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
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
        console.log("Upvoting post with ID:", post);
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/downvote_question/${post.id}`, {
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

    const get_bookmark = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/check_bookmark/${post.id}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Add the token here
            'User-ID': localStorage.getItem('user_id')
          }
        }
      );
      const data = await response.json();
      setIsBookmarked(data.is_bookmarked);
    } catch (error) {
      console.error('Error fetching bookmark:', error);
    }
  }
  useEffect(() => {
  get_bookmark();
}, []);


    const handleBookmark = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('authToken');
        if (isBookmarked){
            fetch(`${process.env.REACT_APP_API_URL}/remove_bookmark/${post.id}/`, {
                method: 'DELETE',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Add the token here
                'User-ID': localStorage.getItem('user_id')
        }
            }).then(response => {
                if (response.ok) {
                    setIsBookmarked(false);
                } else {
                    alert("Failed to remove bookmark");
                }
            }
            ).catch(error => {
                console.error("Error removing bookmark:", error);
            }
            );
        } else {
            fetch(`${process.env.REACT_APP_API_URL}/bookmark_question/${post.id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Add the token here
                'User-ID': localStorage.getItem('user_id')
            }
            }).then(response => {
            if (response.ok) {
                setIsBookmarked(true);
            } else {
                alert("Failed to add bookmark");
            }
            }).catch(error => {
            console.error("Error adding bookmark:", error);
            });
        }
    }

 
    return (
        <div className="post-card" onClick={onClick}>
            <div className={`status-label ${postType === 'discussion' ? 'discussion' : answered ? 'answered' : 'unanswered'}`}>
                {postType === 'discussion' ? 'Discussion' : answered ? 'Answered' : 'Unanswered'}
            </div>

            <h3 className="post-title">{title}</h3>
            <div className="username" onClick={(e) => {
                        e.stopPropagation();}}>@ {author}</div> 

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
                    className={`footer-item ${animateUpvote ? 'upvote-animate' : ''} ${isUpvoted ? 'upvoted' : ''}`}
                    onClick={handleUpvote}
                >
                    <FontAwesomeIcon icon={faThumbsUp} size="sm"  />
                    <span className="footer-text">{upvote} Upvotes</span>
                </div>
                <div
                    className={`footer-item ${animateDownvote ? 'downvote-animate' : ''}`}
                    onClick={handleDownvote}
                >
                    <FontAwesomeIcon icon={faThumbsDown} size="sm" />
                    <span className="footer-text">{upvotes} Downvotes</span>
                </div>
                <div className="footer-item">
                    <FontAwesomeIcon icon={faCommentDots} size="sm" color="#888" />
                    <span className="footer-text">{comments_count} Comments</span>
                </div>

                <div className={"footer-book"}>
                    <button
                        className="bookmark"
                        onClick={(e) => handleBookmark(e)}
                    >
                        <FontAwesomeIcon icon={faBookmark} style={{color: isBookmarked ? 'blue' : 'a9a8a8'}}/>
                        <span className="footer-text"> Bookmark </span>
                    </button>

                </div>

            </div>
        </div>
    );
};

export default PostPreview;
