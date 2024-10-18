import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import Signup from './Signup';
import Login from './Login';
import ForgotPassword from './Forgot';
import Feed from './Feed';
import './App.css';


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
          <Route path="/feed" element={<Feed />} />
        </>
      ) : (
        <Route path="/" element={<Navigate replace to="/login"/>} />
      )}
      <Route path="*" element={<Navigate replace to="/login" state={{ from: 'private' }} />} />
    </Routes>
  );
};


export default App;
