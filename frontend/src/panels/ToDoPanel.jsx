import React, { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Trash2 } from "lucide-react";
import { getMockWeatherForDate } from "./weather";
import "./panelStyles.css";

export default function TodoPanel({ defaultLocation }) {
  const STORAGE_KEY = "todoList_v1";

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tasks, setTasks] = useState([]);

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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Cloud className="w-4 h-4 text-slate-500" />
          WON To-Do List
        </h2>
        <span className="text-xs text-slate-500">
          Location: <strong>{defaultLocation}</strong>
        </span>
      </div>

      <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          className="col-span-2 px-3 py-2 border border-slate-200 rounded-lg"
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="px-3 py-2 border border-slate-200 rounded-lg"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
        {tasks.length === 0 ? (
          <p className="text-center text-slate-400 py-8">
            No tasks yet. Add one!
          </p>
        ) : (
          tasks.map((task) => {
            const w = getMockWeatherForDate(task.date);
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition ${
                  task.done
                    ? "bg-slate-50 border-slate-100 opacity-80"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task.id)}
                    className="mt-1"
                  />

                  <div>
                    <p
                      className={`font-medium ${
                        task.done ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {task.title}
                    </p>

                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      {new Date(task.date).toLocaleDateString()} •
                      <span className="flex items-center gap-1">
                        {w.icon === "sun" && (
                          <Sun className="w-4 h-4 text-amber-500" />
                        )}
                        {w.icon === "cloud" && (
                          <Cloud className="w-4 h-4 text-slate-400" />
                        )}
                        {w.icon === "rain" && (
                          <CloudRain className="w-4 h-4 text-blue-500" />
                        )}
                        {w.temp}° • {w.label}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeTask(task.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
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