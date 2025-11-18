import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminWelcome from './pages/AdminWelcome';
import ResultsPage from './pages/ResultsPage';
import EditQuestionsPage from './pages/EditQuestionsPage';
import QuizPage from './pages/QuizPage';
import QuizResultsPage from './pages/QuizResultsPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-welcome" element={<AdminWelcome />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/edit" element={<EditQuestionsPage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/summary" element={<QuizResultsPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
