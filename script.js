// Select elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskDueDate = document.getElementById('task-due-date');
const taskList = document.getElementById('task-list');
const validCategories = ['Work', 'Personal', 'Study'];

let tasks = [];
let currentFilter = 'all';

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function normalizeTask(task) {
  // Check that the task is an object
  if (!task || typeof task !== 'object' || Array.isArray(task)) {
    return null;
  }

  // Validate task description
  if (typeof task.text !== 'string' || task.text.trim() === '') {
    return null;
  }

  // Validate task ID
  const id = task.id;

  if (
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  // Validate category
  const category = validCategories.includes(task.category)
    ? task.category
    : 'Personal';

  // Validate completion status
  const completed = typeof task.completed === 'boolean'
    ? task.completed
    : false;

  // Validate due date
  let dueDate = '';

  if (typeof task.dueDate === 'string' && task.dueDate !== '') {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const parsedDate = new Date(`${task.dueDate}T00:00:00`);

    if (
      datePattern.test(task.dueDate) &&
      !Number.isNaN(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === task.dueDate
    ) {
      dueDate = task.dueDate;
    }
  }

  return {
    id,
    text: task.text.trim(),
    completed,
    category,
    dueDate
  };
}

// Load tasks from LocalStorage

function loadTasks() {
  const storedTasks = localStorage.getItem('tasks');

  if (!storedTasks) {
    return [];
  }

  try {
    const parsedTasks = JSON.parse(storedTasks);

    if (!Array.isArray(parsedTasks)) {
      console.warn('Invalid task data. Resetting storage.');
      localStorage.removeItem('tasks');
      return [];
    }

    const normalizedTasks = [];
    const usedIds = new Set();
    let discardedTasks = 0;
    let duplicatedIds = 0;

    parsedTasks.forEach(task => {
      const normalizedTask = normalizeTask(task);

      if (!normalizedTask) {
        discardedTasks++;
        return;
      }

      // Generate a new ID if a duplicate is found
      if (usedIds.has(normalizedTask.id)) {
        let newId = Date.now();

        while (usedIds.has(newId)) {
          newId++;
        }

        normalizedTask.id = newId;
        duplicatedIds++;
      }

      usedIds.add(normalizedTask.id);
      normalizedTasks.push(normalizedTask);
    });

    // Save the normalized data
    localStorage.setItem('tasks', JSON.stringify(normalizedTasks));

    if (discardedTasks > 0) {
      console.warn(`${discardedTasks} invalid task(s) were discarded.`);
    }

    if (duplicatedIds > 0) {
      console.warn(`${duplicatedIds} duplicate ID(s) were corrected.`);
    }

    return normalizedTasks;

  } catch (error) {
    console.error('Error loading tasks:', error);
    localStorage.removeItem('tasks');
    return [];
  }
}

// Update an existing task

function updateTask(id, newText, newCategory, newDueDate) {
  const task = tasks.find(t => t.id === id);

  if (!task) return false;

  const text = newText.trim();

  if (text === '') {
    alert('Please enter a task description.');
    return false;
  }

  if (!validCategories.includes(newCategory)) {
    alert('Please select a valid category.');
    return false;
  }

  if (newDueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${newDueDate}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      alert('Please enter a valid due date.');
      return false;
    }

    const existingDueDate = task.dueDate || '';

    if (selectedDate < today && newDueDate !== existingDueDate) {
      alert('The due date cannot be in the past.');
      return false;
    }
  }

  task.text = text;
  task.category = newCategory;
  task.dueDate = newDueDate;

  saveTasks();
  render();

  return true;
}

// Delete an existing task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  render();
}

// Toggle task completion status
function toggleTask(id) {
  const task = tasks.find(task => task.id === id);

  if (!task) return;

  task.completed = !task.completed;

  saveTasks();
  render();
}

function startEditing(li, task, span) {
  // Prevent opening multiple edit forms
  if (li.querySelector('.edit-form')) return;

  const form = document.createElement('form');
  form.classList.add('edit-form');

  // Task description
  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = task.text;
  textInput.required = true;

  // Category selector
  const categorySelect = document.createElement('select');

  validCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  categorySelect.value = task.category;

  // Due date
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = task.dueDate || '';

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.textContent = 'Save';

  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';

  // Add controls to the form
  form.appendChild(textInput);
  form.appendChild(categorySelect);
  form.appendChild(dateInput);
  form.appendChild(saveBtn);
  form.appendChild(cancelBtn);

  // Replace task text with the edit form
  span.replaceWith(form);

  textInput.focus();
  textInput.select();

// Save edited task
form.addEventListener('submit', (event) => {
  event.preventDefault();

  updateTask(
    task.id,
    textInput.value,
    categorySelect.value,
    dateInput.value
  );
});

  // Cancel editing
  cancelBtn.addEventListener('click', () => {
    render();
  });
}

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

const filterButtons = document.querySelectorAll('#task-filters button');

function updateFilterButtons() {
  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === currentFilter;

    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive);
  });
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    updateFilterButtons();
    render();
  });
});

updateFilterButtons();

// Render task

function render() {
  taskList.innerHTML = '';

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.classList.add('empty-message');

    if (currentFilter === 'active') {
      emptyMessage.textContent = "No active tasks. You're all caught up!";
    } else if (currentFilter === 'completed') {
      emptyMessage.textContent = 'No completed tasks yet.';
    } else {
      emptyMessage.textContent = 'No tasks yet. Add your first task!';
    }

    taskList.appendChild(emptyMessage);
    return;
  }

  filteredTasks.forEach(task => {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });
}

// Create and return a task list item
function createTaskElement(task) {
  const li = document.createElement('li');

  // Task text
  const span = document.createElement('span');
  span.textContent = task.text;
  span.addEventListener('click', () => toggleTask(task.id));

  if (task.completed) {
    span.classList.add('completed');
  }

  // Task category
  const category = document.createElement('span');
  category.textContent = task.category;
  category.classList.add('task-category');
  category.classList.add(`category-${task.category.toLowerCase()}`);

  // Due date (only if one exists)
  const dueDate = document.createElement('span');

  if (task.dueDate) {
    dueDate.textContent = `Due: ${task.dueDate}`;
    dueDate.classList.add('task-due-date');
  }

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.textContent = '✎';
  editBtn.classList.add('edit-btn');
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.addEventListener('click', () => startEditing(li, task, span));

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  // Add elements to the list item
  li.appendChild(span);
  li.appendChild(category);

  if (task.dueDate) {
    li.appendChild(dueDate);
  }

  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

// Add task (FORM SUBMIT)
taskForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();
  const category = taskCategory.value;
  const dueDate = taskDueDate.value;

  // Validate task description
  if (text === '') {
    alert('Please enter a task description.');
    return;
  }

  // Validate category
  if (!validCategories.includes(category)) {
    alert('Please select a valid category.');
    return;
  }

  // Validate due date
  if (dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${dueDate}T00:00:00`);

    if (selectedDate < today) {
      alert('The due date cannot be in the past.');
      return;
    }
  }

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    category: category,
    dueDate: dueDate
  };

  tasks.push(newTask);
  saveTasks();
  render();

  taskInput.value = '';
  taskCategory.value = '';
  taskDueDate.value = '';
});


// Load tasks on page load
tasks = loadTasks();
render();
