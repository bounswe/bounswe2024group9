// ContentContainer.js

import React from 'react';
import StarRate from './star';
import './staticRoute.css'; // Import CSS file for styling
import kizKulesi from './kizKulesi.jpg';
import userImage from './userImage.png';
import likeIcon from './like.png';
import heart from './heart1.png';
import comment from './comment.png';
import save from './save-instagram.png';
import route from './route.PNG';


export default function staticRoute() {
  return (
    <div className="centered-div">
      <div className='left'>
        <div className='top-left-corner'>
            <img src={userImage} alt="userImage" style={{ width: '5%', height: '5%', borderRadius: '50%'}}/>
            
            {/* Add a space between the image and the username */}
          <span style={{ marginLeft: '10px' }}>
            <b>Group9_User1</b>
          </span>
        </div>

        <img src={kizKulesi} alt="kiz kulesi" style={{ width: '80%', height: '70%', borderRadius: '10%', marginTop: '4%' }}/>
        
      </div>
      <div className='mid'>
        <b>An Amazing Route In Besiktas</b>
        <br/><br/>

        Had an incredible day strolling through magnificent streets of Besiktas...
        <br/><br/>

        Budget: 150 tl
        Duration: 2 hours
        <br/><br/>

        <StarRate />
      </div>
      <div className='right'>
        <div className='top-right-corner'>
            <img src={route} alt="kiz kulesi" style={{ width: '100%', height: '100%'}}/>
        </div>
        <div style={{paddingBottom: 4, paddingTop: 4}}>
            <img src={likeIcon} alt='likeIcon' style={{ height: '17px', marginRight: '5px' }} />
            <span>Liked by user2, user3 and 100 others</span>
        </div>
        <div className='buttom-right-corner'>
            <div className='brc-left'>
                <img src={heart} alt='likeIcon' style={{ height: '17px', marginRight: '5px' }} />
                <img src={comment} alt='likeIcon' style={{ height: '17px', marginRight: '5px' }} />
            </div>
            <div className='brc-right'>
                <img src={save} alt='likeIcon' style={{ height: '17px', marginRight: '5px' }} />
            </div>
        </div>
      </div>
    </div>
  );
}

