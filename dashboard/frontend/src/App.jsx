import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { me, logout } from "./api/auth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Containers from "./pages/Containers";
import Schedules from "./pages/Schedules";
import Layout from "./components/Layout";

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

  useEffect(() => {
    function handleUnauthorized() {
      setStatus("anon");
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  async function handleLogout() {
    await logout();
    setStatus("anon");
  }

  if (status === "loading") return null;
  if (status === "anon") return <Login onLogin={checkAuth} />;

  return (
    <BrowserRouter>
      <Layout username={username} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/schedules" element={<Schedules />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
