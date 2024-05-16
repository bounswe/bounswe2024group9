import React from 'react';
import './card.css';
import map from "./route.png"
import  { useState, useEffect } from 'react';
import { useAuth } from "./hooks/AuthProvider";

const RouteCard = ({ route }) => {
  console.log("ROUTE IS ", route);
  const auth = useAuth();
  const { user } = auth; 
  // console.log("USER IS ", user);
  const duration = Array.isArray(route.duration) ? route.duration : [];
  const durationBetween = Array.isArray(route.duration_between) ? route.duration_between : [];
  const node_ids = route.node_ids.split(',');
  const node_names = route.node_names.split(',');
  // console.log("Node IDS are ", node_ids);
  const photo = route.photos.length > 0 ? route.photos[0] : '/no_image.png';
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(route.likes); // Use local state for like count
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(route.comments);

  const handleComment = async () => {
    try {
      if (comment === '') {
        alert('Please enter a comment');
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/add_comment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.user_id, route_id: route.route_id, comment }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setComment(''); // Clear the input field after successful submission
      } else {
        console.error('Error adding comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/bookmark_route/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.user_id, route_id: route.route_id }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.bookmarked);
      } else {
        console.error('Error bookmarking route');
      }
    } catch (error) {
      console.error('Error bookmarking route:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/like_route/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.user_id, route_id: route.route_id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likes); // Update local like count
      } else {
        console.error('Error liking route');
      }
    } catch (error) {
      console.error('Error liking route:', error);
    }
  };

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/check_following/${route.user_id}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.user_id }),
        });

        const data = await response.json();
        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error('Error checking following status:', error);
      }
    };

    checkFollowingStatus();
  }, [route.user_id, user.user_id]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/check_like/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.user_id, route_id: route.route_id}),
        });

        const data = await response.json();
        setIsLiked(data.isLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/check_bookmark/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.user_id, route_id: route.route_id}),
        });

        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkLikeStatus();
    checkBookmarkStatus();
  }, [route.route_id, user.user_id]);


  const handleFollow = async () => {
    try {
      console.log("USER ID IS ", user.user_id);
      // let button = document.getElementsByClassName('follow-button');
      // console.log("BUTTON IS ", button);
      // button.style.backgroundColor = '#a1bdc8d9';
      const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/follow_user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.user_id, follow_user_id: route.user_id }),
      });

      if (response.ok) {
        // button.style.backgroundColor = '#a1bdffd9';
        setIsFollowing(true);
      } else {
        const error = await response.json();
        console.error('Error following user:', error.message);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/database_search/unfollow_user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.user_id, unfollow_user_id: route.user_id }),
      });

      if (response.ok) {
        setIsFollowing(false);
      } else {
        const error = await response.json();
        console.error('Error unfollowing user:', error.message);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };
  
  return (
    <div>
      <div className="route-card">
        <div className="route-info">

          <div className='left'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <h3 id={route.user_id} style={{ marginRight: '10px' }}>{route.username}</h3>
            {Number(route.user_id) !== Number(user.user_id) && (
              isFollowing ? (
                <button onClick={handleUnfollow} className="follow-button" style={{ padding: '10px', backgroundColor: '#a1bdffd9', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Unfollow</button>
              ) : (
                <button onClick={handleFollow} className="follow-button" style={{ padding: '10px', backgroundColor: '#a1bdfad9', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Follow</button>
              )
            )}
          </div>
            <img src={photo} alt="Route" />
          </div>

          <div className='middle'>
            <h2>{route.title}</h2>
            <p>{route.description}</p>
            <div id='stars'>
              Rating: 
              {[...Array(5)].map((_, i) => (
                <span key={i}>{i < route.rating ? '★' : '☆'}</span>
              ))}
            </div>
            <div id='route'>
              <h4>Route nodes: </h4>
              {node_ids.map((node_id, index) => (
                <span key={node_id}>
                  <a href={`${process.env.REACT_APP_WEB_URL}/wiki_search/results/${node_id.trim()}`}>{node_names[index]}</a>
                  {index < node_ids.length - 1 && ' -> '}
                </span>
              ))}
            </div>   
          </div>
          <div className='right'>
            <img src={map} alt="No Map Available" className="route-map" />
            <div className="actions">
              <div>Liked by {likeCount} others</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div onClick={handleLike}>
                    {isLiked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className='icon' viewBox="0 0 512 512">
                        <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className='icon' viewBox="0 0 512 512">
                        <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/>
                      </svg>
                    )}
                </div>
                <div onClick={() => setShowCommentSection(!showCommentSection)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className='icon' viewBox="0 0 512 512"><path d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z"/></svg>
                </div>
                <div onClick={handleBookmark}>
                  {isBookmarked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className='icon' viewBox="0 0 384 512">
                      <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className='icon' viewBox="0 0 384 512">
                      <path d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z"/>
                    </svg>
                  )}
                </div>            
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCommentSection && (
        <div className="route-card comment-section">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment"
          />
          <button onClick={handleComment} style={{ padding: '10px', backgroundColor: '#a1bdffd9', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Comment</button>
          <div className="comments-list">
            {comments.map((c, index) => (
              <div key={index} className="comment">
                {c}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteCard;
