import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listContainers } from "../api/containers";
import { BoxIcon, PlayIcon, StopCircleIcon, ArrowRightIcon } from "../components/icons";

export default function Home() {
  const [containers, setContainers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listContainers()
      .then(setContainers)
      .catch((err) => setError(err.message));
  }, []);

  const total = containers?.length ?? null;
  const running = containers?.filter((c) => c.status === "running").length ?? null;
  const stopped = total !== null ? total - running : null;

  return (
    <div className="px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        Live status of the containers on this host
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-critical/20 bg-critical/10 text-critical px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <StatTile
          label="Total containers"
          value={total}
          icon={<BoxIcon width={18} height={18} />}
          iconClass="bg-accent/10 text-accent"
        />
        <StatTile
          label="Running"
          value={running}
          icon={<PlayIcon width={18} height={18} />}
          iconClass="bg-good/10 text-good"
          valueClass="text-good"
        />
        <StatTile
          label="Stopped"
          value={stopped}
          icon={<StopCircleIcon width={18} height={18} />}
          iconClass="bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        />
      </div>

      <Link
        to="/containers"
        className="inline-flex items-center gap-1.5 mt-8 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
      >
        Manage containers
        <ArrowRightIcon width={15} height={15} />
      </Link>
    </div>
  );
}

function StatTile({ label, value, icon, iconClass, valueClass = "" }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconClass}`}>
          {icon}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className={`text-3xl font-semibold mt-3 ${valueClass}`}>
        {value === null ? <span className="text-gray-300 dark:text-gray-700">–</span> : value}
      </div>
    </div>
  );
}
