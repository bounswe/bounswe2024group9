import React, {useEffect, useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {faThumbsUp, faCommentDots, faThumbsDown, faBookmark} from '@fortawesome/free-solid-svg-icons';
import './PostPreview.css';
import { showNotification } from './NotificationCenter';

// list_questions_according_to_the_user
/*
    {
        'id': q.pk,
        'title': q.title,
        'description': q.details,
        'user_id': q.author.pk,
        'username': q.author.username,
        'upvotes': q.upvotes,
        'comments_count': q.comments.count(),
        'programmingLanguage': q.language,
        'codeSnippet': q.code_snippet,
        'tags': q.tags,
        'answered': q.answered,
        'is_upvoted': user_votes_dict.get(q.pk) == VoteType.UPVOTE.value,
        'is_downvoted': user_votes_dict.get(q.pk) == VoteType.DOWNVOTE.value,
        'is_bookmarked': user.bookmarks.filter(pk=q.pk).exists(),
        'created_at' : q.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'post_type': q.type
    }
    for q in questions
 */
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
        username,
        is_upvoted,
        is_downvoted,
        is_bookmarked,
        post_type,
    } = post;

    const [isUpvoting, setIsUpvoting] = useState(false);
    const [isDownvoting, setIsDownvoting] = useState(false);
    const [animateUpvote, setAnimateUpvote] = useState(false);
    const [animateDownvote, setAnimateDownvote] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isUpvoted, setIsUpvoted] = useState(is_upvoted);
    const [isDownvoted, setIsDownvoted] = useState(is_downvoted);

    const [upvote , setUpvote] = useState(upvotes);
    const navigate = useNavigate();
    console.log("Post:", post);

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
                if (isDownvoted) {
                    setUpvote(upvote + 2);
                    setIsUpvoted(true);
                } if (!isUpvoted) {
                    setUpvote(upvote + 1);
                    setIsUpvoted(true);
                } if (isUpvoted) {
                    setUpvote(upvote - 1);
                    setIsUpvoted(false);
                }
                setIsDownvoted(false);
                const data = await response.json();
                showNotification('Post upvoted successfully!');
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/downvote_object/question/${post.id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': localStorage.getItem('user_id'),
                },
            });
    
            if (response.ok) {
                if (isUpvoted) {
                    setUpvote(upvote - 2);
                    setIsDownvoted(true);
                } if (!isDownvoted) {
                    setUpvote(upvote - 1);
                    setIsDownvoted(true);
                } if (isDownvoted) {
                    setUpvote(upvote + 1);
                    setIsDownvoted(false);
                }
                setIsUpvoted(false);
                const data = await response.json();
                showNotification('Post downvoted successfully!');
            }
        } catch (error) {
            console.error('Error downvoting:', error);
        } finally {
            setIsDownvoting(false);
        }
    };
    useEffect(() => {
        setIsBookmarked(is_bookmarked);
        setIsUpvoted(is_upvoted);
        setIsDownvoted(is_downvoted);
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
                    showNotification('Bookmark removed successfully!');
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
                showNotification('Bookmark added successfully!');
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
            <div className={`status-label ${post_type === 'discussion' ? 'discussion' : answered ? 'answered' : 'unanswered'}`}>
                {post_type === 'discussion' ? 'Discussion' : answered ? 'Answered' : 'Unanswered'}
            </div>

            <h3 className="post-title">{title}</h3>
            <div className="username" onClick={(e) => {
                        e.stopPropagation();}}>@ {username}</div> 

            <div className="labels-container">
                {post_type !== 'discussion' && (<div className="language" onClick={(e) => {
                            e.stopPropagation(); // Prevent the click event from propagating to the outer box
                            handleSearchResultClick(
                                { languageLabel: { value: programmingLanguage } },
                                fetchWikiIdAndName,
                                navigate
                            );
                        }
                        }>{programmingLanguage}</div>
                )}
                <div className="tags">
                    {tags.map((tag, index) => (
                        <span key={index} className="label">{tag}</span>
                    ))}
                </div>
            </div>

            <p className="post-description">{description}</p>

            <div className="post-footer">
                <div className="vote-group">
                    <div
                        className={`footer-item ${animateUpvote ? 'upvote-animate' : ''} ${isUpvoted ? 'upvoted' : ''}`}
                        onClick={handleUpvote}
                    >
                        <FontAwesomeIcon icon={faThumbsUp} size="sm" />
                        <span className="footer-text">Upvote</span>
                    </div>
                    
                    <span className="vote-count">{upvotes}</span>
                    
                    <div
                        className={`footer-item ${animateDownvote ? 'downvote-animate' : ''} ${isDownvoted ? 'downvoted' : ''}`}
                        onClick={handleDownvote}
                    >
                        <FontAwesomeIcon icon={faThumbsDown} size="sm" />
                        <span className="footer-text">Downvote</span>
                    </div>
                </div>

                <div className="footer-item">
                    <FontAwesomeIcon icon={faCommentDots} size="sm" color="#888" />
                    <span className="footer-text">{comments_count} Comments</span>
                </div>

                <div className="footer-book">
                    <button
                        className="bookmark"
                        onClick={(e) => handleBookmark(e)}
                    >
                        <FontAwesomeIcon icon={faBookmark} style={{color: isBookmarked ? 'blue' : '#a9a8a8'}}/>
                        <span className="footer-text">Bookmark</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostPreview;
