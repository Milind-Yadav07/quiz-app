import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface Category {
  id: string;
  title: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        const categoryTitles: { [key: string]: string } = {
          frontend: 'Frontend',
          fullstack: 'Fullstack',
          python: 'Python',
          java: 'Java'
        };
        const formattedCategories = data.map((category: string) => ({
          id: category,
          title: categoryTitles[category] || category.charAt(0).toUpperCase() + category.slice(1)
        }));
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const cardColors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-teal-600',
    'from-yellow-500 to-orange-600'
  ];

  const handleQuizSelect = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Quiz Dashboard
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">
              Select a category to start the quiz.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((quiz, index) => (
              <div
                key={quiz.id}
                onClick={() => handleQuizSelect(quiz.id)}
                className={`bg-gradient-to-br ${cardColors[index % cardColors.length]} p-8 rounded-xl shadow-2xl text-white text-center cursor-pointer transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col justify-center`}
              >
                <h3 className="text-2xl font-bold">{quiz.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
