import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import Signup from './Signup';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Feed from './Feed';
import './App.css';
import SearchResults from './SearchResults';
import CodeExecution from './components/code-execution';
import SurveyPage from './SurveyPage';
import PostQuestion from './PostQuestion';
import AuthWrapper from './AuthWrapper';
import Profile from './Profile';
import ResetPassword from './ResetPassword';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/feed" element={<AuthWrapper><Feed /></AuthWrapper>} />
        <Route path="/question" element={<AuthWrapper><CodeExecution /></AuthWrapper>} />
        <Route path="/result/:wiki_id/:wiki_name" element={<AuthWrapper><SearchResults /></AuthWrapper>} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/post_question" element={<AuthWrapper><PostQuestion /></AuthWrapper>} />
        <Route path="/profile/:username" element={<AuthWrapper><Profile /></AuthWrapper>} />
        <Route path="/reset_password/:uid/:token" element={<ResetPassword /> }/>
      </Routes>
    </Router>
  );
};

// const AppRoutes = () => {
//   const { user, loading } = useAuth();
//   console.log("User state:", user);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" />} />
//       <Route path="/signup" element={<Signup />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/forgot" element={<ForgotPassword />} />
//       <Route path="/feed" element={<Feed />} /> 
//       <Route path="/question" element={<CodeExecution />} />
//       <Route path="/result/:wiki_id" element={<SearchResults />} />
//       {user ? (
//         <>
//           {/* <Route path="/feed" element={<Feed />} /> */}
//         </>
//       ) : (
//         <Route path="/" element={<Navigate replace to="/login"/>} />
//       )}
//       {/* <Route path="*" element={<Navigate replace to="/login" state={{ from: 'private' }} />} /> */} 
//       {/* login olmadan feede erişememeyi sağlayan kod, sonra commentten çıkarılacak */}
//     </Routes>
//   );
// };


export default App;
