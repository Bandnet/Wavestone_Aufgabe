import { useCallback, useEffect, useState } from 'react';
import * as api from './api';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [minPriority, setMinPriority] = useState('');
  const [sort, setSort] = useState('priority');
  const [order, setOrder] = useState('desc');

  const loadTasks = useCallback(async () => {
    setLoading(true);

    try {
    const data = await api.listTasks({
      status,
      minPriority,
      sort,
      order,
    });

    setTasks(Array.isArray(data) ? data : []);
    setError(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [status, minPriority, sort, order]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(task) {
    try {
      await api.createTask(task);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(task) {
    try {
      await api.updateTask(task.id, {
        status: task.status === 'done' ? 'open' : 'done',
      });

      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(task) {
    try {
      await api.deleteTask(task.id);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <h1>Task Tracker</h1>
      <TaskForm onCreate={handleCreate} />
      <section className="filters" aria-label="Task filter and sorting">
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Alle</option>
            <option value="open">Offen</option>
            <option value="done">Erledigt</option>
          </select>
        </label>

        <label>
          Mindestpriorität
          <select
            value={minPriority}
            onChange={(event) => setMinPriority(event.target.value)}
          >
            <option value="">Alle</option>
            {Array.from({ length: 10 }, (_, index) => index + 1).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sortieren nach
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="priority">Priorität</option>
            <option value="dueDate">Fälligkeitsdatum</option>
            <option value="createdAt">Erstellungsdatum</option>
          </select>
        </label>

        <label>
          Reihenfolge
          <select value={order} onChange={(event) => setOrder(event.target.value)}>
            <option value="desc">Absteigend</option>
            <option value="asc">Aufsteigend</option>
          </select>
        </label>
      </section>
      {error && <p className="error">⚠ {error}</p>}
      {loading ? <p>Loading…</p> : <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />}
    </main>
  );
}
