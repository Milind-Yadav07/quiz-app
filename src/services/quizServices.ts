import axios from 'axios';
import type { UserResult, Question } from '../types';

const API_BASE_URL = (import.meta.env?.REACT_APP_API_URL as string) || 'http://localhost:5000/api';

export const saveResult = async (result: UserResult): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/results`, result);
  } catch (error) {
    console.error("Failed to save result to server", error);
    throw error;
  }
};

export const getResults = async (): Promise<UserResult[]> => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_BASE_URL}/results`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to retrieve results from server", error);
    return [];
  }
};

export const deleteResult = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('adminToken');
    await axios.delete(`${API_BASE_URL}/results/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Failed to delete result from server", error);
    throw error;
  }
};

export const deleteAllResults = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('adminToken');
    await axios.delete(`${API_BASE_URL}/results`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Failed to delete all results from server", error);
    throw error;
  }
};

// Question-related API functions
export const getQuestions = async (category: string): Promise<Question[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/questions/${category}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch questions", error);
    return [];
  }
};

export const updateQuestion = async (id: string, questionData: Partial<Question>): Promise<Question> => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_BASE_URL}/questions/${id}`, questionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update question", error);
    throw error;
  }
};

export const createQuestion = async (questionData: Question & { category: string }): Promise<Question> => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_BASE_URL}/questions`, questionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create question", error);
    throw error;
  }
};

export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('adminToken');
    await axios.delete(`${API_BASE_URL}/questions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Failed to delete question", error);
    throw error;
  }
};
