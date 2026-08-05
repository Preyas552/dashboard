import { useEffect, useState } from "react";
import {
  listContainers,
  startContainer,
  stopContainer,
  restartContainer,
} from "../api/containers";
import { PlayIcon, StopCircleIcon, RefreshIcon } from "../components/icons";

const STATUS_STYLES = {
  running: { dot: "bg-good", text: "text-good", bg: "bg-good/10" },
  exited: { dot: "bg-gray-400", text: "text-gray-500 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
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
    <div className="px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Containers</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        {containers.length} container{containers.length === 1 ? "" : "s"} on this host
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-critical/20 bg-critical/10 text-critical px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-950/50 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <th className="py-3 px-5 font-medium">Name</th>
              <th className="py-3 px-5 font-medium">Image</th>
              <th className="py-3 px-5 font-medium">Status</th>
              <th className="py-3 px-5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {containers.map((c) => {
              const style = STATUS_STYLES[c.status] ?? STATUS_STYLES.exited;
              const busy = pendingId === c.id;
              return (
                <tr
                  key={c.id}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors"
                >
                  <td className="py-3 px-5 font-medium">{c.name}</td>
                  <td className="py-3 px-5 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {c.image}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex gap-1.5">
                      <ActionButton
                        label="Start"
                        icon={<PlayIcon width={13} height={13} />}
                        colorClass="text-good hover:bg-good/10"
                        disabled={busy}
                        onClick={() => handleAction(startContainer, c.id)}
                      />
                      <ActionButton
                        label="Stop"
                        icon={<StopCircleIcon width={13} height={13} />}
                        colorClass="text-critical hover:bg-critical/10"
                        disabled={busy}
                        onClick={() => handleAction(stopContainer, c.id)}
                      />
                      <ActionButton
                        label="Restart"
                        icon={<RefreshIcon width={13} height={13} />}
                        colorClass="text-accent hover:bg-accent/10"
                        disabled={busy}
                        onClick={() => handleAction(restartContainer, c.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButton({ label, icon, colorClass, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${colorClass}`}
    >
      {icon}
      {label}
    </button>
  );
}
