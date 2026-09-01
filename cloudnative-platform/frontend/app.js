// API_URL is injected at container runtime (see nginx env substitution in
// the Dockerfile) so the same image works in dev, staging, and prod.
const API_URL = window.API_URL || 'http://localhost:3000';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const statusIndicator = document.getElementById('status-indicator');

async function fetchTasks() {
  try {
    const res = await fetch(`${API_URL}/api/tasks`);
    const tasks = await res.json();
    renderTasks(tasks);
    statusIndicator.textContent = `Connected · ${tasks.length} task(s)`;
  } catch (err) {
    statusIndicator.textContent = 'Cannot reach API';
  }
}

function renderTasks(tasks) {
  list.innerHTML = '';
  tasks
    .slice()
    .reverse()
    .forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.innerHTML = `
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span>
          <span class="task-status status-${task.status}">${task.status}</span>
          <button class="delete-btn" data-id="${task.id}">×</button>
        </span>
      `;
      list.appendChild(li);
    });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;

  await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  input.value = '';
  fetchTasks();
});

list.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    await fetch(`${API_URL}/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  }
});

fetchTasks();
setInterval(fetchTasks, 2000); // poll so you see the worker move tasks along
