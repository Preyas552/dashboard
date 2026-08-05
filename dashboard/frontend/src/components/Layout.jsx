import { Link, useLocation } from "react-router-dom";
import { BoxIcon, LogOutIcon } from "./icons";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/containers", label: "Containers" },
];

export default function Layout({ username, onLogout, children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white">
                <BoxIcon className="w-4.5 h-4.5" width={18} height={18} />
              </span>
              <span className="font-semibold tracking-tight">Homelab</span>
            </div>
            <div className="flex gap-1">
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors " +
                      (active
                        ? "bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-900")
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200">
                {username?.[0]?.toUpperCase()}
              </span>
              {username}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-critical dark:text-gray-400 dark:hover:text-critical-dark transition-colors"
            >
              <LogOutIcon width={15} height={15} />
              Log out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
