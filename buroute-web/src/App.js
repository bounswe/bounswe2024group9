import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import SearchResults from './SearchResults';
import SearchDetails from './SearchDetails';
import Signup from './Signup';
import Login from './Login';

const App = () => {
  return (
    <Router>
      <AuthProvider> {/* Move AuthProvider here */}
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  console.log("User state:", user);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      {user ? (
        <>
          <Route path="/search" element={<SearchResults />} />
          <Route path="/result/:qid" element={<SearchDetails />} />
        </>
      ) : (
        <Route path="/" element={<Navigate replace to="/login" state={{ from: 'private' }} />} />
      )}
      <Route path="*" element={<Navigate replace to="/login" state={{ from: 'private' }} />} />
    </Routes>
  );
};

export default App;
