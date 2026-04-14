import React, { useState, useEffect } from "react";
import { ListTodo, Sun, CloudRain, Trash2 } from "lucide-react";
import { getMockWeatherForDate } from "./weather";
import "./panelStyles.css";

export default function TodoPanel({ defaultLocation }) {
  const STORAGE_KEY = "todoList_v1";

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tasks, setTasks] = useState([]);
  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setTasks(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setTasks((prev) => [
      {
        id: Date.now().toString(),
        title: title.trim(),
        date,
        done: false,
      },
      ...prev,
    ]);

    setTitle("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const toggleDone = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const removeTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="todo-panel-card animate-fade-in">
      <div className="todo-panel-header">
        <div>
          <h2 className="todo-panel-title">
            <ListTodo className="w-4 h-4" />
            WON Checklist
          </h2>
          <p className="todo-panel-subtitle">Track tasks with the weather for your current location.</p>
        </div>

        <div className="todo-panel-meta">
          <span className="todo-panel-chip">
            {completedTasks}/{tasks.length || 0} complete
          </span>
          <span className="todo-panel-location">
            Location: <strong>{defaultLocation}</strong>
          </span>
        </div>
      </div>

      <div className="todo-progress">
        <div className="todo-progress-bar">
          <div className="todo-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="todo-progress-label">{progress}% finished</span>
      </div>

      <form onSubmit={addTask} className="todo-form">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a checklist item..."
          className="todo-input todo-input-title"
          rows={2}
        />

        <div className="todo-form-actions">
          <input
            type="date"
            className="todo-input todo-input-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button type="submit" className="todo-add-btn">
            Add
          </button>
        </div>
      </form>

      <div className="todo-list">
        {tasks.length === 0 ? (
          <p className="todo-empty-state">
            No tasks yet. Add one!
          </p>
        ) : (
          tasks.map((task) => {
            const w = getMockWeatherForDate(task.date);
            const checkboxId = `todo-checkbox-${task.id}`;
            return (
              <div
                key={task.id}
                className={`todo-item ${task.done ? "is-complete" : ""}`}
              >
                <div className="todo-item-main">
                  <div className="checkbox-wrapper-12 todo-checkbox-wrap">
                    <div className="cbx">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleDone(task.id)}
                      />
                      <label htmlFor={checkboxId} />
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12.5l4 4L19 7.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="todo-item-copy">
                    <p className={`todo-item-title ${task.done ? "is-complete" : ""}`}>
                      {task.title}
                    </p>

                    <div className="todo-item-details">
                      <span>{new Date(task.date).toLocaleDateString()}</span>
                      <span className="todo-dot">•</span>
                      <span className="todo-weather-badge">
                        {w.icon === "sun" && <Sun className="w-4 h-4 text-amber-500" />}
                        {w.icon === "cloud" && <Cloud className="w-4 h-4 text-slate-400" />}
                        {w.icon === "rain" && <CloudRain className="w-4 h-4 text-blue-500" />}
                        {w.temp}° {w.label}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="todo-delete-btn"
                  aria-label={`Delete task ${task.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}