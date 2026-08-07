import { Fragment, useEffect, useState } from "react";
import { listContainers } from "../api/containers";
import {
  listSchedules,
  createSchedule,
  setScheduleEnabled,
  deleteSchedule,
  listExecutions,
} from "../api/schedules";
import { PlayIcon, StopCircleIcon, RefreshIcon } from "../components/icons";

const CRON_PRESETS = [
  { label: "Every minute (testing)", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at 2:00 AM", value: "0 2 * * *" },
  { label: "Weekly, Sunday 3:00 AM", value: "0 3 * * 0" },
  { label: "Custom…", value: "custom" },
];

const ACTION_STYLES = {
  start: { icon: PlayIcon, colorClass: "text-good bg-good/10" },
  stop: { icon: StopCircleIcon, colorClass: "text-critical bg-critical/10" },
  restart: { icon: RefreshIcon, colorClass: "text-accent bg-accent/10" },
};

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [containers, setContainers] = useState([]);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [executions, setExecutions] = useState({});

  useEffect(() => {
    refresh();
    listContainers().then(setContainers).catch(() => {});
  }, []);

  async function refresh() {
    try {
      setSchedules(await listSchedules());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!executions[id]) {
      const data = await listExecutions(id).catch(() => []);
      setExecutions((prev) => ({ ...prev, [id]: data }));
    }
  }

  async function handleToggleEnabled(schedule) {
    try {
      await setScheduleEnabled(schedule.id, !schedule.enabled);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSchedule(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        Automate container actions on a cron schedule
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-critical/20 bg-critical/10 text-critical px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <ScheduleForm containers={containers} onCreated={refresh} />

      <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-950/50 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <th className="py-3 px-5 font-medium">Name</th>
              <th className="py-3 px-5 font-medium">Container</th>
              <th className="py-3 px-5 font-medium">Action</th>
              <th className="py-3 px-5 font-medium">Cron</th>
              <th className="py-3 px-5 font-medium">Enabled</th>
              <th className="py-3 px-5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => {
              const ActionIcon = ACTION_STYLES[s.action]?.icon;
              return (
                <Fragment key={s.id}>
                  <tr
                    onClick={() => toggleExpand(s.id)}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-5 font-medium">{s.name}</td>
                    <td className="py-3 px-5 text-gray-500 dark:text-gray-400">
                      {s.container_name}
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ACTION_STYLES[s.action]?.colorClass}`}
                      >
                        {ActionIcon && <ActionIcon width={13} height={13} />}
                        {s.action}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {s.cron_expression}
                    </td>
                    <td className="py-3 px-5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleEnabled(s)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${s.enabled ? "bg-accent" : "bg-gray-300 dark:bg-gray-700"}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${s.enabled ? "translate-x-4.5" : "translate-x-0.5"}`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-xs font-medium text-critical hover:bg-critical/10 rounded-md px-2 py-1 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr className="bg-gray-50 dark:bg-gray-950/50">
                      <td colSpan={6} className="px-5 py-4">
                        <ExecutionHistory executions={executions[s.id]} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {schedules.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 px-5 text-center text-gray-400 text-sm">
                  No schedules yet — create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExecutionHistory({ executions }) {
  if (executions === undefined) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }
  if (executions.length === 0) {
    return <p className="text-sm text-gray-400">No executions yet.</p>;
  }
  return (
    <div className="space-y-1.5">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-2">
        Recent executions
      </p>
      {executions.map((e) => (
        <div key={e.id} className="flex items-center gap-3 text-sm">
          <span
            className={`w-1.5 h-1.5 rounded-full ${e.success ? "bg-good" : "bg-critical"}`}
          />
          <span className="text-gray-500 dark:text-gray-400 w-44 shrink-0">
            {new Date(e.ran_at).toLocaleString()}
          </span>
          <span className={e.success ? "text-gray-700 dark:text-gray-300" : "text-critical"}>
            {e.message}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScheduleForm({ containers, onCreated }) {
  const [name, setName] = useState("");
  const [containerId, setContainerId] = useState("");
  const [action, setAction] = useState("restart");
  const [cronPreset, setCronPreset] = useState(CRON_PRESETS[2].value);
  const [customCron, setCustomCron] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const cronExpression = cronPreset === "custom" ? customCron : cronPreset;

  async function handleSubmit(e) {
    e.preventDefault();
    const container = containers.find((c) => c.id === containerId);
    if (!container) {
      setError("pick a container");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createSchedule({
        name,
        cron_expression: cronExpression,
        container_id: container.id,
        container_name: container.name,
        action,
      });
      setName("");
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 flex flex-wrap items-end gap-3"
    >
      <Field label="Name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nightly restart"
          required
          className="border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        />
      </Field>
      <Field label="Container">
        <select
          value={containerId}
          onChange={(e) => setContainerId(e.target.value)}
          required
          className="border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        >
          <option value="">Select…</option>
          {containers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Action">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        >
          <option value="start">start</option>
          <option value="stop">stop</option>
          <option value="restart">restart</option>
        </select>
      </Field>
      <Field label="Schedule">
        <select
          value={cronPreset}
          onChange={(e) => setCronPreset(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        >
          {CRON_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>
      {cronPreset === "custom" && (
        <Field label="Cron expression">
          <input
            value={customCron}
            onChange={(e) => setCustomCron(e.target.value)}
            placeholder="*/15 * * * *"
            required
            className="border border-gray-200 dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 text-sm w-36 font-mono focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </Field>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg px-4 py-2 shadow-sm transition-colors disabled:opacity-50"
      >
        Create schedule
      </button>
      {error && <p className="text-critical text-sm w-full">{error}</p>}
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {children}
    </label>
  );
}
