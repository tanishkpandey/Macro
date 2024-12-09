import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: '' });

    useEffect(() => {
        window.electronAPI.getTasks().then(setTasks);
    }, []);

    const addTask = async () => {
        const updatedTasks = await window.electronAPI.storeTask({ ...newTask, id: Date.now() });
        setTasks(updatedTasks);
        setNewTask({ title: '', description: '', dueDate: '', priority: '' });
    };

    const deleteTask = async (id) => {
        const updatedTasks = await window.electronAPI.deleteTask(id);
        setTasks(updatedTasks);
    };

    return (
        <div>
            <h1>Task Manager</h1>
            <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
                type="text"
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
            <button onClick={addTask}>Add Task</button>

            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        {task.title} - {task.priority}
                        <button onClick={() => deleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

createRoot(document.getElementById('root')).render(<App />);
