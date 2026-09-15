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
  return storedTasks ? JSON.parse(storedTasks):[];
  }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }

    function updateTask(id, newText) {
      const task = tasks.find(t => t.id === id);
      if(task && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
      }
      render();
    }

    function starEditing(li, task, span){
      //Evita abrir dos inputs si ya estas editando
      if (li.querySelector('.edit-input')) return;

      const input = document.createElement('input');
      input.type = 'text';
      input.value = task.text;
      input.classList.add('edit-input');

      //Reemplazamos el span con el input
      span.replaceWith(input);
      input.focus();
      input.select();

      let saved = false;

      function saveEdit() {
        if (saved) return;
        saved = true;
        updateTask(task.id, input.value);
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') render();
      });

      input.addEventListener('blur', saveEdit);
    }
  }


// Render task
function render(){
  taskList.innerHTML='';

  tasks.forEach(task =>{
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });
}

//Crea y retorna el <li> de una tarea
function createTaskElement(task){
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = task.text;
  span.addEventListener('click', () => toggleTask(task.id));
  const editBtn = document.createElement('button');
  editBtn.textContent = '✎';
  editBtn.addEventListener('click', () => startEditing(li, task, span));

  if (task.completed) span.classList.add('completed');

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '❌';
  deleteBtn.addEventListener('click',() => deleteTask(task.id));

  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li; 
}

// Add task (FORM SUBMIT)
taskForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (text === '') return;

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  render();

  taskInput.value = '';
});

// Load tasks on page load
tasks = loadTasks();
render();
