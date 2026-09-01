const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory store. Swap for Postgres/DynamoDB when you get to the
// "add a real database" stretch goal.
let tasks = [];
let nextId = 1;

// Health check - used by k8s liveness/readiness probes later
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// List all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Create a task
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = {
    id: nextId++,
    title: title.trim(),
    status: 'pending', // pending -> processing -> done (worker moves this along)
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

// Update a task's status (used by the worker)
app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: 'task not found' });
  if (req.body.status) task.status = req.body.status;
  res.json(task);
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  if (tasks.length === before) return res.status(404).json({ error: 'task not found' });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Task API listening on port ${PORT}`);
});
