import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("growmass_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    } catch (e) {
      console.error("Failed to read theme from localStorage", e);
    }
    return "dark"; // default to cyber-dark theme
  });

  useEffect(() => {
    try {
      localStorage.setItem("growmass_theme", theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }

    // Apply data-theme attribute to root html element
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDarkMode = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
