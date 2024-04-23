import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Wiki Search App</h1>
      <p>To start searching, click on the Search link below.</p>
      <Link to="/search" style={{ marginRight: '10px' }}>Search</Link>
      <Link to="/result/Q12506">Sample Result Page (ID:Q12506)</Link>
    </div>
  );
}

export default Home;
