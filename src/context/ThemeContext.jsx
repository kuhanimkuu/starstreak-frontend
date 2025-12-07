import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // DEFAULT TO LIGHT
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // resolvedTheme is always the selected theme
  const resolvedTheme = theme;

  // Apply theme instantly to <html>
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
