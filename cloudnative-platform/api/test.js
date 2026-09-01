// Minimal smoke test with zero dependencies - good enough to give the
// CI pipeline something real to run in the "test" stage.
const http = require('http');
const { spawn } = require('child_process');

const PORT = 3999;
const server = spawn('node', ['server.js'], {
  env: { ...process.env, PORT },
  stdio: 'inherit',
});

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
    }).on('error', reject);
  });
}

async function run() {
  await new Promise((r) => setTimeout(r, 500)); // let the server boot

  const health = await get('/health');
  if (health.status !== 200 || health.body.status !== 'ok') {
    throw new Error('health check failed');
  }
  console.log('✓ health check passed');

  const tasks = await get('/api/tasks');
  if (tasks.status !== 200 || !Array.isArray(tasks.body)) {
    throw new Error('GET /api/tasks did not return an array');
  }
  console.log('✓ task list endpoint passed');

  console.log('\nAll tests passed.');
  server.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('✗ test failed:', err.message);
  server.kill();
  process.exit(1);
});
