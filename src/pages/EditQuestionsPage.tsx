import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import type { Question } from '../types';

const EditQuestionsPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('frontend');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
            if (data.length > 0 && !selectedCategory) {
                setSelectedCategory(data[0]);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, [selectedCategory]);

    const fetchQuestions = useCallback(async (category: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${category}`);
            if (!response.ok) throw new Error('Failed to fetch questions');
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Failed to load questions:', error);
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (selectedCategory) {
            fetchQuestions(selectedCategory);
        }
    }, [selectedCategory, fetchQuestions]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
    };

    const handleQuestionTextChange = (index: number, text: string) => {
        const newQuestions = [...questions];
        newQuestions[index].text = text;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oKey: string, text: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oKey] = text;
        setQuestions(newQuestions);
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        const token = localStorage.getItem('adminToken');
        if (!token) {
            alert('No admin token found. Please log in again.');
            return;
        }

        try {
            // Save all questions for the current category
            for (const question of questions) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${question.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        text: question.text,
                        options: question.options,
                        answer: question.answer
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Failed to update question ${question.id}`);
                }
            }
            alert('Changes saved successfully!');
            // Refresh questions to show updated data
            await fetchQuestions(selectedCategory);
        } catch (error) {
            console.error('Failed to save changes:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            alert('No admin token found. Please log in again.');
            return;
        }

        const newId = `${selectedCategory}_${Date.now()}`;
        const newQuestion: Question = {
            id: newId,
            text: 'New Question',
            options: { a: 'Option A', b: 'Option B', c: 'Option C', d: 'Option D' },
            answer: 'a'
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: newId,
                    text: newQuestion.text,
                    options: newQuestion.options,
                    answer: newQuestion.answer,
                    category: selectedCategory
                }),
            });

            if (!response.ok) throw new Error('Failed to add question');

            setQuestions([...questions, newQuestion]);
            alert('New question added successfully!');
        } catch (error) {
            console.error('Failed to add question:', error);
            alert('Failed to add question. Please try again.');
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            alert('No admin token found. Please log in again.');
            return;
        }

        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/${questionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete question');

            // Remove the question from the local state
            setQuestions(questions.filter(q => q.id !== questionId));
            alert('Question deleted successfully!');
        } catch (error) {
            console.error('Failed to delete question:', error);
            alert('Failed to delete question. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight">Edit Questions</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">
                        Edit quiz questions and answers.
                    </p>
                </div>

                <div className="mb-8 max-w-md mx-auto">
                    <label htmlFor="category-select" className="block text-sm font-medium text-gray-300 mb-2">Select Category to edit questions:</label>
                    <select
                        id="category-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400">Loading questions...</div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={q.id} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-indigo-400">Question {qIndex + 1}</label>
                                    <button
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition"
                                        disabled={saving}
                                    >
                                        Delete
                                    </button>
                                </div>
                                <textarea
                                    value={q.text}
                                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                                    className="w-full bg-gray-900 p-2 border border-gray-600 rounded-md mb-4"
                                    rows={2}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.keys(q.options).map(oKey => (
                                        <div key={oKey} className="flex items-center">
                                            <span className={`mr-2 font-bold ${q.answer === oKey ? 'text-green-400' : 'text-gray-400'}`}>{oKey.toUpperCase()}:</span>
                                            <input
                                                type="text"
                                                value={q.options[oKey]}
                                                onChange={(e) => handleOptionChange(qIndex, oKey, e.target.value)}
                                                className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={handleAddQuestion}
                        className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition"
                        disabled={saving}
                    >
                        Add Question
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        className="px-6 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 transition"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default EditQuestionsPage;
