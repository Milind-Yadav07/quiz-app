import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminWelcome: React.FC = () => {
  const navigate = useNavigate();

  const handleResultsClick = () => {
    navigate('/results');
  };

  const handleEditQuestionsClick = () => {
    navigate('/edit');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-12">Welcome Admin ✨</h1>
      <div className="flex space-x-8">
        <div
          onClick={handleResultsClick}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-xl shadow-2xl text-white text-center cursor-pointer transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col justify-center w-64 h-32"
        >
          <h3 className="text-2xl font-bold">Results</h3>
        </div>
        <div
          onClick={handleEditQuestionsClick}
          className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-xl shadow-2xl text-white text-center cursor-pointer transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col justify-center w-64 h-32"
        >
          <h3 className="text-2xl font-bold">Edit Questions</h3>
        </div>
      </div>
    </div>
  );
};

export default AdminWelcome;
