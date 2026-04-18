import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // DEFAULT TO LIGHT - Force light theme on first load
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    // Force light theme as default if nothing saved
    if (!savedTheme) {
      localStorage.setItem("theme", "light");
      return "light";
    }
    return savedTheme;
  });

  // resolvedTheme is always the selected theme
  const resolvedTheme = theme;

  // Apply theme instantly to <html>
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
