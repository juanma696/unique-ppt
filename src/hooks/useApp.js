import { useState, useEffect } from "react";
import { DEFAULT_API_CONFIG } from "@/constants";

const STORAGE_KEY = "uniquePpt_api_config";
const THEME_KEY = "uniquePpt_theme";

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return { isDark, toggleTheme };
}

export function useApiConfig() {
  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.text.protocol) parsed.text.protocol = "openai";
      if (!parsed.image.protocol) parsed.image.protocol = "openai_image";
      return parsed;
    }
    return DEFAULT_API_CONFIG;
  });

  const saveConfig = (newConfig) => {
    setApiConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  return { apiConfig, saveConfig };
}

export function usePptLib() {
  const [pptLibReady, setPptLibReady] = useState(false);

  useEffect(() => {
    if (window.PptxGenJS) {
      setPptLibReady(true);
    } else {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
      script.async = true;
      script.onload = () => setPptLibReady(true);
      document.body.appendChild(script);
    }
  }, []);

  return pptLibReady;
}

export function useCooldown() {
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    if (cooldownTime <= 0) return;
    const interval = setInterval(() => setCooldownTime((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldownTime]);

  return { cooldownTime, setCooldownTime };
}

export function useLogs() {
  const [logs, setLogs] = useState([]);

  const addLog = (source, message, type = "info") => {
    setLogs((prev) => [
      ...prev.slice(-4),
      { source, message, type, time: new Date().toLocaleTimeString() },
    ]);
  };

  return { logs, addLog };
}
