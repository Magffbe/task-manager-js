// Select elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

let tasks = [];

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from LocalStorage
function loadTasks() {
  const storedTasks = localStorage.getItem('tasks');
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
    tasks.forEach(task => addTaskToDOM(task));
  }
}

// Render task
function addTaskToDOM(task) {
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = task.text;

  if (task.completed) {
    span.classList.add('completed');
  }

  span.addEventListener('click', () => {
    task.completed = !task.completed;
    span.classList.toggle('completed');
    saveTasks();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';

  deleteBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => t !== task);
    li.remove();
    saveTasks();
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

// Add task (FORM SUBMIT)
taskForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (text === '') return;

  const newTask = {
    text: text,
    completed: false
  };

  tasks.push(newTask);
  addTaskToDOM(newTask);
  saveTasks();

  taskInput.value = '';
});

// Load tasks on page load
loadTasks();
