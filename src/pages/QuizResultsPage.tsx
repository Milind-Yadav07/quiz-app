import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { UserResult } from '../types';

interface Question {
    id: string;
    text: string;
    options: { [key: string]: string };
    answer: string;
}

const QuizResultsPage: React.FC = () => {
    const location = useLocation();
    const result = location.state?.result as UserResult;
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = useCallback(async () => {
        if (!result) return;

        try {
            // Extract category from quizTitle (assuming format like "Java Basics" -> "java")
            const category = result.quizTitle.toLowerCase().split(' ')[0];
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
    }, [result]);

    useEffect(() => {
        if (result) {
            fetchQuestions();
        }
    }, [result, fetchQuestions]);

    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-3xl font-bold text-red-500 mb-4">No result found!</h1>
                <p className="text-gray-400 mb-8">Please complete a quiz to see your results.</p>
                <Link to="/" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const { name, rollNumber, totalQuestions, answers, quizTitle, score } = result;
    const wrongAnswers = answers.filter(a => !a.isCorrect);
    const correctAnswers = answers.filter(a => a.isCorrect);
    const skippedCount = totalQuestions - answers.length;
    const incorrectCount = wrongAnswers.length;
    const correctCount = correctAnswers.length;

    // Function to get question number
    const getQuestionNumber = (questionId: string) => {
        const index = questions.findIndex(q => q.id === questionId);
        return index !== -1 ? index + 1 : '?';
    };

    // Compute skipped questions
    const skippedQuestions = questions.filter(q => !answers.some(a => a.questionId === q.id));

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading results...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-indigo-400">Test Completed, {name}!</h1>
                    <p className="mt-2 text-lg text-gray-300">Roll Number: {rollNumber}</p>
                    <p className="mt-1 text-lg text-gray-300">Score: {score}/{totalQuestions}</p>
                    <p className="mt-2 text-lg text-gray-300">Here's your performance for the {quizTitle}</p>
                </div>

                <div className="mt-10 flex flex-col md:flex-row justify-around text-center gap-8">
                    <div className="p-6 bg-green-900/50 rounded-lg border border-green-500">
                        <p className="text-5xl font-bold text-green-400">{correctCount}</p>
                        <p className="text-lg text-gray-300">Correct</p>
                    </div>
                     <div className="p-6 bg-red-900/50 rounded-lg border border-red-500">
                        <p className="text-5xl font-bold text-red-400">{incorrectCount}</p>
                        <p className="text-lg text-gray-300">Incorrect</p>
                    </div>
                     <div className="p-6 bg-yellow-900/50 rounded-lg border border-yellow-500">
                        <p className="text-5xl font-bold text-yellow-400">{skippedCount}</p>
                        <p className="text-lg text-gray-300">Skipped</p>
                    </div>
                </div>

                <div className="mt-12">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-green-400">Correct Answers ({correctAnswers.length})</h3>
                            <ul className="space-y-2">
                                {correctAnswers.map((answer, index) => (
                                    <li key={index} className="bg-gray-700 p-3 rounded-md text-sm">
                                        Question-{getQuestionNumber(answer.questionId)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h3 className="text-2xl font-semibold mb-4 text-red-400">Incorrect Answers ({wrongAnswers.length})</h3>
                            <ul className="space-y-2">
                                {wrongAnswers.map((answer, index) => (
                                    <li key={index} className="bg-gray-700 p-3 rounded-md text-sm">
                                        Question-{getQuestionNumber(answer.questionId)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Skipped Questions ({skippedQuestions.length})</h3>
                            <ul className="space-y-2">
                                {skippedQuestions.map((question, index) => (
                                    <li key={index} className="bg-gray-700 p-3 rounded-md text-sm">
                                        Question-{getQuestionNumber(question.id)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                     </div>
                </div>

                <div className="mt-12 text-center">
                     <Link to="/" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsPage;
