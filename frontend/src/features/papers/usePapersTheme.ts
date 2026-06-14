import { useEffect, useState } from "react";

const storageKey = "jagger-papers-theme";

export function usePapersTheme() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = window.localStorage.getItem(storageKey);
    return storedTheme === "light" ? "light" : "dark";
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark"))
  };
}
