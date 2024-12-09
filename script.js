const minimizeToTray = () => {
    window.electronAPI.minimizeToTray();
};

const closeWindow = () => {
    window.electronAPI.closeWindow();
};

const tasks = [];
const updateTaskCount = () => {
    const completedCount = tasks.filter(task => task.completed).length;
    document.querySelector('.task-count').textContent = `${completedCount} / ${tasks.length}`;
};

const addTask = () => {
    const taskInput = document.getElementById('new-task-input');
    const taskText = taskInput.value.trim();
    if (taskText) {
        const task = { text: taskText, completed: false };
        tasks.push(task);
        renderTasks();
        taskInput.value = '';
        updateTaskCount();
    }
};

const handleKeyPress = (event) => {
    if (event.key === "Enter") {
        addTask()
    }
}
const toggleTaskCompletion = (index) => {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
    updateTaskCount();
};

const deleteTask = (index) => {
    tasks.splice(index, 1);
    renderTasks();
    updateTaskCount();
};

const renderTasks = () => {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear the task list

    // Sort tasks: incomplete first, then completed
    const sortedTasks = [...tasks].sort((a, b) => a.completed - b.completed);

    sortedTasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('draggable', !task.completed); // Only make incomplete tasks draggable
        taskItem.dataset.index = tasks.indexOf(task);

        // Truncate text to 100 characters with ellipsis
        const truncatedText = task.text.length > 100 ? task.text.slice(0, 50) + '...' : task.text;

        taskItem.innerHTML = `
            <div class="task-circle" onclick="toggleTaskCompletion(${tasks.indexOf(task)})"></div>
            <span class="task-text" title="${task.text}">${truncatedText}</span>
            <button class="delete-task-button" onclick="deleteTask(${tasks.indexOf(task)})">
                <img src="./assets/close.svg" alt="Delete" class="delete-task-image" />
            </button>
        `;

        // Drag and Drop Event Listeners
        if (!task.completed) {
            taskItem.addEventListener('dragstart', (event) => handleDragStart(event, index));
            taskItem.addEventListener('dragover', (event) => handleDragOver(event));
            taskItem.addEventListener('drop', (event) => handleDrop(event, index));
        }

        taskList.appendChild(taskItem);
    });
};


const notifyHeightChange = () => {
    const appElement = document.querySelector('.app');
    if (appElement) {
        const height = appElement.scrollHeight;
        window.electronAPI.adjustHeight(height);
    }
};

// Use MutationObserver to detect changes in content
const observer = new MutationObserver(() => {
    notifyHeightChange();
});

// Observe changes in the `.app` container
const appElement = document.querySelector('.app');
if (appElement) {
    observer.observe(appElement, { childList: true, subtree: true });
}

// Initial notification to set the height
notifyHeightChange();


let inactivityTimer = null; // Timer to track inactivity
let isCursorInside = false; // Tracks if the cursor is inside the app
let isResizing = false; // Tracks if the window is being resized
let draggedIndex = null;
let isInputFocused = false;

// Function to set window opacity
const setWindowOpacity = (opacity) => {
    window.electronAPI.setOpacity(opacity);
};

// Reset inactivity timer
const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);

    // Restore full opacity during activity
    setWindowOpacity(1);

    // If the cursor is not inside, the window is not resizing, and input is not focused, set a timer
    if (!isCursorInside && !isResizing && !isInputFocused) {
        inactivityTimer = setTimeout(() => {
            setWindowOpacity(0.1); // Reduce opacity to 10% after 1 second of inactivity
        }, 1000); // 1 second of inactivity
    }
};


// Mouse enters the app window
document.addEventListener('mouseenter', () => {
    isCursorInside = true;
    setWindowOpacity(1); // Ensure opacity is 100%
    clearTimeout(inactivityTimer); // Cancel any pending opacity change
});

// Mouse leaves the app window
document.addEventListener('mouseleave', () => {
    isCursorInside = false;
    resetInactivityTimer(); // Start the inactivity timer again
});

// Reset timer on user activity (typing, mouse movement, clicking)
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('mousedown', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('touchstart', resetInactivityTimer);

// Listen for the window resize event
window.addEventListener('resize', () => {
    isResizing = true; // Indicate the window is being resized
    setWindowOpacity(1); // Ensure opacity is restored during resizing
    clearTimeout(inactivityTimer); // Clear any pending inactivity timers

    // Stop resizing mode after a short delay
    setTimeout(() => {
        isResizing = false;
        resetInactivityTimer(); // Restart inactivity logic after resizing stops
    }, 500); // Adjust delay as needed
});


const taskInput = document.getElementById('new-task-input');

if (taskInput) {
    // When input is focused, prevent opacity change
    taskInput.addEventListener('focus', () => {
        isInputFocused = true;
        setWindowOpacity(1); // Ensure opacity is restored
        clearTimeout(inactivityTimer); // Cancel any pending opacity change
    });

    // When input loses focus, allow opacity change
    taskInput.addEventListener('blur', () => {
        isInputFocused = false;
        resetInactivityTimer(); // Restart inactivity logic
    });
}

// Initialize the inactivity timer
resetInactivityTimer();


const handleDragStart = (event, index) => {
    draggedIndex = index; // Store the index of the dragged task
    event.target.classList.add('dragging'); // Add a visual cue for dragging
};

const handleDragOver = (event) => {
    event.preventDefault(); // Allow drop by preventing the default action
};

const handleDrop = (event, targetIndex) => {
    event.preventDefault();

    if (draggedIndex !== null && draggedIndex !== targetIndex) {
        // Reorder tasks
        const [draggedTask] = tasks.splice(draggedIndex, 1); // Remove dragged task
        tasks.splice(targetIndex, 0, draggedTask); // Insert dragged task at new position
        renderTasks(); // Re-render the task list
        updateTaskCount(); // Update the task count
    }

    draggedIndex = null; // Reset the dragged index
};
