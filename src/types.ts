export interface Question {
  id: string;
  text: string;
  options: { [key: string]: string };
  answer: string;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
}

export interface UserResult {
  id?: number;
  name: string;
  rollNumber: string;
  quizTitle: string;
  answers: Answer[];
  score: number;
  totalQuestions: number;
  timestamp: number;
}

export type QuizData = {
  [key: string]: {
    title: string;
    questions: Question[];
  };
};

export const AnswerState = {
  UNANSWERED: 0,
  CORRECT: 1,
  WRONG: 2,
  SKIPPED: 3,
} as const;

export type AnswerStateType = typeof AnswerState[keyof typeof AnswerState];
