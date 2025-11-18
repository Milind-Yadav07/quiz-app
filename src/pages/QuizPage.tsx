import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Question, Answer, AnswerStateType } from '../types';
import { AnswerState } from '../types';

import { saveResult, getQuestions } from '../services/quizServices';

const getInitialAnswers = (questions: Question[]) => {
    return questions.reduce((acc, q) => {
        acc[q.id] = null;
        return acc;
    }, {} as Record<string, Answer | null>);
};

const QuizPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, Answer | null>>({});
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!quizId) {
                navigate('/');
                return;
            }
            try {
                const fetchedQuestions = await getQuestions(quizId);
                if (fetchedQuestions.length === 0) {
                    navigate('/');
                    return;
                }
                setQuestions(fetchedQuestions);
                setQuizTitle(`${quizId.charAt(0).toUpperCase() + quizId.slice(1)} Developer Test`);
                setAnswers(getInitialAnswers(fetchedQuestions));
            } catch (error) {
                console.error('Error fetching questions:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [quizId, navigate]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading quiz...</div>;
    }

    if (questions.length === 0) {
        return <div className="flex items-center justify-center h-screen">Quiz not found.</div>;
    }
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    const handleOptionSelect = (optionKey: string) => {
        if (currentAnswer) return;

        const isCorrect = currentQuestion.answer === optionKey;
        setAnswers({
            ...answers,
            [currentQuestion.id]: {
                questionId: currentQuestion.id,
                selectedOption: optionKey,
                isCorrect,
            },
        });
    };

    const getAnswerState = (questionId: string): AnswerStateType => {
        const answer = answers[questionId];
        if (!answer) return AnswerState.UNANSWERED;
        return answer.isCorrect ? AnswerState.CORRECT : AnswerState.WRONG;
    };

    const getSkippedState = (questionId: string, index: number): AnswerStateType => {
        const answer = answers[questionId];
        if (currentQuestionIndex > index && !answer) {
            return AnswerState.SKIPPED;
        }
        return getAnswerState(questionId);
    }
    
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!name || !rollNumber) {
            alert('Please fill in your name and roll number before submitting.');
            return;
        }

        const answeredQuestions = Object.values(answers).filter(a => a !== null) as Answer[];
        const score = answeredQuestions.filter(a => a.isCorrect).length;

        const result = {
            name,
            rollNumber,
            quizTitle,
            answers: answeredQuestions,
            score,
            totalQuestions: questions.length,
            timestamp: Date.now(),
        };

        try {
            await saveResult(result);
            navigate('/summary', { state: { result } });
        } catch (error) {
            console.error('Error saving result:', error);
            alert('Failed to submit quiz. Please try again.');
        }
    };
    
    const isFormFilled = name.trim() !== '' && rollNumber.trim() !== '';

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
                {/* Main Quiz Area */}
                <div className="flex-grow bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold text-indigo-400">{quizTitle}</h1>
                        <p className="text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-lg mb-6 flex-grow">
                        <p className="text-xl font-semibold mb-6">{currentQuestion.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(currentQuestion.options).map(([key, value]) => {
                                 const isSelected = currentAnswer?.selectedOption === key;
                                 let buttonClass = "bg-gray-700 hover:bg-indigo-600";
                                 if(isSelected) {
                                    buttonClass = "bg-indigo-600";
                                 }

                                // FIX: `value` from Object.entries can be inferred as `unknown` which is not a valid ReactNode.
                                // Explicitly cast to a string to allow rendering.
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleOptionSelect(key)}
                                        disabled={!!currentAnswer}
                                        className={`w-full p-4 rounded-lg text-left transition-colors duration-200 disabled:cursor-not-allowed ${buttonClass}`}
                                    >
                                        <span className="font-bold mr-2">{key.toUpperCase()}.</span> {String(value)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                        <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="px-6 py-2 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button onClick={() => setShowConfirmDialog(true)} disabled={!isFormFilled} className="px-6 py-2 bg-green-600 rounded-md hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed">Submit Test</button>
                        ) : (
                            <button onClick={handleNext} className="px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500">Next</button>
                        )}
                    </div>
                </div>

                {/* Side Panel */}
                <div className="lg:w-80 flex-shrink-0 space-y-6">
                     <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Your Details</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"/>
                            <input type="text" placeholder="Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Question Navigator</h2>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q: Question, index: number) => {
                                const state = getSkippedState(q.id, index);
                                let colorClass = 'bg-gray-600 hover:bg-gray-500';
                                if (state === AnswerState.CORRECT || state === AnswerState.WRONG) colorClass = 'bg-indigo-600';
                                if (state === AnswerState.SKIPPED) colorClass = 'bg-yellow-500';
                                if (index === currentQuestionIndex) colorClass += ' ring-2 ring-offset-2 ring-offset-gray-800 ring-indigo-500';

                                return (
                                    <button key={q.id} onClick={() => setCurrentQuestionIndex(index)} className={`w-10 h-10 flex items-center justify-center rounded-md font-bold transition-colors ${colorClass}`}>
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <div>
                {showConfirmDialog ? (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                            <p className="text-lg mb-4 text-white">Are you sure you want to submit?</p>
                            <div className="flex justify-end space-x-4">
                                <button onClick={() => setShowConfirmDialog(false)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500">No</button>
                                <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500">Yes</button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default QuizPage;