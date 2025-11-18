import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getResults, deleteResult, deleteAllResults } from '../services/quizServices';
import type { UserResult } from '../types';

const ResultsPage: React.FC = () => {
    const [results, setResults] = useState<UserResult[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const storedResults = await getResults();
                setResults(storedResults);
            } catch (error) {
                console.error('Error fetching results:', error);
            }
        };
        fetchResults();
    }, []);

    const handleDelete = async (index: number) => {
        try {
            const resultToDelete = results[index];
            await deleteResult(String(resultToDelete.id!));
            const updatedResults = await getResults();
            setResults(updatedResults);
        } catch (error) {
            console.error('Error deleting result:', error);
        }
    };

    const handleDeleteAll = () => {
        setShowConfirmModal(true);
    };

    const confirmDeleteAll = async () => {
        try {
            await deleteAllResults();
            setResults([]);
        } catch (error) {
            console.error('Error deleting all results:', error);
        } finally {
            setShowConfirmModal(false);
        }
    };

    const cancelDeleteAll = () => {
        setShowConfirmModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight">Candidate Results</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">
                        Review the submitted test scores from all candidates.
                    </p>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleDeleteAll}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                    >
                        Delete All Results
                    </button>
                </div>

                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">Confirm Deletion</h2>
                            <p className="text-gray-300 mb-6">Are you sure you want to delete all results? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={cancelDeleteAll}
                                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                                >
                                    No
                                </button>
                                <button
                                    onClick={confirmDeleteAll}
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Candidate Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Roll Number</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quiz Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            No results have been submitted yet.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((result, index) => (
                                        <tr key={index} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{result.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{result.rollNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{result.quizTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                <span className="font-bold text-indigo-400">{result.score}</span> / {result.totalQuestions}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                <button
                                                    onClick={() => handleDelete(index)}
                                                    className="text-red-400 hover:text-red-300 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResultsPage;