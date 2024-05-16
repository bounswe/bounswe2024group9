import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import SearchResults from './SearchResults';
import SearchDetails from './SearchDetails';
import Signup from './Signup';
import Login from './Login';
import ForgotPassword from './Forgot';
import CreateRoute from './CreateRoute';
import Bookmarks from './Bookmarks';
import AllRoutes from './Routes';
import MyRoutes from './MyRoutes';

const App = () => {
  return (
    <Router>
      <AuthProvider> 
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
      <Route path="/forgot" element={<ForgotPassword />} />
      {user ? (
        <>
          <Route path="/feed" element={<SearchResults />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/routes" element={<AllRoutes />} />
          <Route path="/my_routes" element={<MyRoutes />} />
          <Route path="/result/:qid" element={<SearchDetails />} />
          <Route path="/create_route" element={<CreateRoute />} /> {/* Add route for CreateRoute */}
        </>
      ) : (
        <Route path="/" element={<Navigate replace to="/login"/>} />
      )}
      <Route path="*" element={<Navigate replace to="/login" state={{ from: 'private' }} />} />
    </Routes>
  );
};

export default App;
