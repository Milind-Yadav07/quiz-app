const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Supabase connected

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/api/results', async (req, res) => {
  try {
    // Transform camelCase keys to snake_case to match table schema
    const resultData = {
      name: req.body.name,
      roll_number: req.body.rollNumber,
      quiz_title: req.body.quizTitle,
      answers: req.body.answers,
      score: req.body.score,
      total_questions: req.body.totalQuestions,
      timestamp: req.body.timestamp,
    };

    const { data, error } = await supabase
      .from('user_results')
      .insert([resultData]);
    if (error) throw error;
    res.status(201).json({ message: 'Result saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving result', error });
  }
});

app.get('/api/results', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_results')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;

    // Transform snake_case keys to camelCase to match frontend expectations
    const transformedData = data.map(result => ({
      id: result.id,
      name: result.name,
      rollNumber: result.roll_number,
      quizTitle: result.quiz_title,
      answers: result.answers,
      score: result.score,
      totalQuestions: result.total_questions,
      timestamp: result.timestamp,
    }));

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error });
  }
});

app.delete('/api/results/:id', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('user_results')
      .delete()
      .eq('id', parseInt(req.params.id));
    if (error) throw error;
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting result', error });
  }
});

app.delete('/api/results', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('user_results')
      .delete()
      .neq('id', 0); // Delete all records where id is not 0 (effectively deletes all)
    if (error) throw error;
    res.json({ message: 'All results deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all results', error });
  }
});

// Get all unique categories
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('category')
      .order('category');
    if (error) throw error;
    const categories = [...new Set(data.map(item => item.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

// Question CRUD routes
app.get('/api/questions/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category', category)
      .order('id');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

app.put('/api/questions/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, answer } = req.body;
    const { data, error } = await supabaseAdmin
      .from('questions')
      .update({ text, options, answer })
      .eq('id', id)
      .select();
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating question', error });
  }
});

app.post('/api/questions', verifyAdmin, async (req, res) => {
  try {
    const { id, text, options, answer, category } = req.body;
    const { data, error } = await supabaseAdmin
      .from('questions')
      .insert([{ id, text, options, answer, category }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error });
  }
});

app.delete('/api/questions/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error });
  }
});

// Admin login route
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
