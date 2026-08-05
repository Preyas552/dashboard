import { useEffect, useState } from "react";
import {
  listContainers,
  startContainer,
  stopContainer,
  restartContainer,
} from "../api/containers";

const STATUS_COLORS = {
  running: "text-green-600",
  exited: "text-gray-400",
};

export default function Containers() {
  const [containers, setContainers] = useState([]);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  async function refresh() {
    try {
      setContainers(await listContainers());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAction(action, id) {
    setPendingId(id);
    try {
      await action(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Containers</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Image</th>
            <th className="py-2">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {containers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td className="py-2 text-sm text-gray-500">{c.image}</td>
              <td className={`py-2 ${STATUS_COLORS[c.status] || ""}`}>
                {c.status}
              </td>
              <td className="py-2 space-x-2">
                <button
                  disabled={pendingId === c.id}
                  onClick={() => handleAction(startContainer, c.id)}
                  className="px-2 py-1 text-sm bg-green-100 rounded disabled:opacity-50"
                >
                  Start
                </button>
                <button
                  disabled={pendingId === c.id}
                  onClick={() => handleAction(stopContainer, c.id)}
                  className="px-2 py-1 text-sm bg-red-100 rounded disabled:opacity-50"
                >
                  Stop
                </button>
                <button
                  disabled={pendingId === c.id}
                  onClick={() => handleAction(restartContainer, c.id)}
                  className="px-2 py-1 text-sm bg-yellow-100 rounded disabled:opacity-50"
                >
                  Restart
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
