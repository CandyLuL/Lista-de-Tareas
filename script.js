document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const tasksCountSpan = document.getElementById('tasks-count');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    // Estado de las tareas
    let tasks = []; // Array para almacenar las tareas: [{ id: 1, text: "Tarea 1", completed: false }]
    let currentFilter = 'all'; // all, pending, completed

    // --- Funciones de Gestión de Tareas ---

    // 1. Cargar tareas desde localStorage
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    }

    // 2. Guardar tareas en localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // 3. Renderizar (dibujar) las tareas en la UI
    function renderTasks() {
        taskList.innerHTML = ''; // Limpiar lista actual
        let pendingTasksCount = 0;

        tasks.forEach(task => {
            if (currentFilter === 'pending' && task.completed) return;
            if (currentFilter === 'completed' && !task.completed) return;

            const listItem = document.createElement('li');
            listItem.classList.add('task-item');
            if (task.completed) {
                listItem.classList.add('completed');
            }
            listItem.dataset.id = task.id; // Almacenar el ID de la tarea en el DOM

            listItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn" aria-label="Editar tarea">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="delete-btn" aria-label="Eliminar tarea">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            `;
            taskList.appendChild(listItem);

            if (!task.completed) {
                pendingTasksCount++;
            }
        });

        updateTasksCount(pendingTasksCount);
    }

    // 4. Añadir una nueva tarea
    function addTask() {
        const taskText = newTaskInput.value.trim();
        if (taskText === '') {
            alert('Por favor, ingresa una tarea.');
            return;
        }

        const newTask = {
            id: Date.now(), // ID único basado en el timestamp
            text: taskText,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        newTaskInput.value = ''; // Limpiar input
        renderTasks(); // Volver a renderizar la lista
    }

    // 5. Marcar/Desmarcar tarea como completada
    function toggleTaskCompleted(id) {
        const taskIndex = tasks.findIndex(task => task.id == id);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
        }
    }

    // 6. Editar una tarea
    function editTask(id, currentTextElement) {
        const taskIndex = tasks.findIndex(task => task.id == id);
        if (taskIndex !== -1) {
            const newText = prompt('Editar tarea:', tasks[taskIndex].text);
            if (newText !== null && newText.trim() !== '') {
                tasks[taskIndex].text = newText.trim();
                saveTasks();
                renderTasks(); // O simplemente actualizar el texto del elemento actual
            }
        }
    }

    // 7. Eliminar una tarea
    function deleteTask(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            tasks = tasks.filter(task => task.id != id);
            saveTasks();
            renderTasks();
        }
    }

    // 8. Limpiar tareas completadas
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    // 9. Actualizar el contador de tareas pendientes
    function updateTasksCount(count) {
        tasksCountSpan.textContent = `${count} ${count === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
    }

    // --- Event Listeners ---

    // Añadir tarea al hacer clic o presionar Enter
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Manejar clics en la lista de tareas (delegación de eventos)
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const listItem = target.closest('.task-item'); // Obtiene el <li> más cercano

        if (!listItem) return; // Si el clic no fue dentro de un item de tarea

        const taskId = listItem.dataset.id;

        if (target.classList.contains('task-checkbox')) {
            toggleTaskCompleted(taskId);
        } else if (target.closest('.edit-btn')) {
            editTask(taskId, listItem.querySelector('.task-text'));
        } else if (target.closest('.delete-btn')) {
            deleteTask(taskId);
        }
    });

    // Filtros de tareas
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(fBtn => fBtn.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks(); // Volver a renderizar con el nuevo filtro
        });
    });

    // Limpiar completadas
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // --- Inicialización ---
    loadTasks(); // Cargar tareas al inicio
    renderTasks(); // Renderizar las tareas cargadas
});
