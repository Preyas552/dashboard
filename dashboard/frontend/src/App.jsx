import { useEffect, useState } from "react";
import { me, logout } from "./api/auth";
import Login from "./pages/Login";
import Containers from "./pages/Containers";

export default function App() {
  const [status, setStatus] = useState("loading"); // loading | authed | anon
  const [username, setUsername] = useState(null);

  async function checkAuth() {
    try {
      const data = await me();
      setUsername(data.username);
      setStatus("authed");
    } catch {
      setStatus("anon");
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function handleLogout() {
    await logout();
    setStatus("anon");
  }

  if (status === "loading") return null;
  if (status === "anon") return <Login onLogin={checkAuth} />;

  return (
    <div>
      <div className="flex justify-end items-center gap-3 max-w-4xl mx-auto pt-4 px-6 text-sm text-gray-500">
        <span>{username}</span>
        <button onClick={handleLogout} className="underline">
          Log out
        </button>
      </div>
      <Containers />
    </div>
  );
}
