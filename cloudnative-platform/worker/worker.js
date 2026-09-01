const http = require('http');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3000;
const POLL_INTERVAL_MS = process.env.POLL_INTERVAL_MS || 3000;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path,
        method,
        headers: data
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
          : {},
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => resolve(chunks ? JSON.parse(chunks) : null));
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function processPendingTasks() {
  try {
    const tasks = await request('GET', '/api/tasks');
    const pending = tasks.filter((t) => t.status === 'pending');

    for (const task of pending) {
      console.log(`Processing task #${task.id}: "${task.title}"`);
      await request('PATCH', `/api/tasks/${task.id}`, { status: 'processing' });

      // Simulate work (this is where a real job - image resize, email send,
      // report generation - would happen)
      await new Promise((r) => setTimeout(r, 2000));

      await request('PATCH', `/api/tasks/${task.id}`, { status: 'done' });
      console.log(`Completed task #${task.id}`);
    }
  } catch (err) {
    console.error('Worker error (API may not be ready yet):', err.message);
  }
}

console.log(`Worker started. Polling ${API_HOST}:${API_PORT} every ${POLL_INTERVAL_MS}ms`);
setInterval(processPendingTasks, POLL_INTERVAL_MS);
