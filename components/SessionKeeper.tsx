"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL = 45 * 60 * 1000;

export function SessionKeeper() {
  useEffect(() => {
    let stopped = false;
    async function refresh() {
      if (stopped) return;
      await fetch("/api/auth/refresh", { method: "POST", cache: "no-store" }).catch(() => undefined);
    }
    const timer = window.setInterval(() => void refresh(), REFRESH_INTERVAL);
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const previous = Number(sessionStorage.getItem("wat-session-check") || 0);
      if (Date.now() - previous > REFRESH_INTERVAL) {
        sessionStorage.setItem("wat-session-check", String(Date.now()));
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stopped = true; window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  return null;
}
