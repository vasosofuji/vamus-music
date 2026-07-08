'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

const defaultTheme = { bg: '#000000', surface: '#121212', primary: '#1ed760', text: '#ffffff' };

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  const timeoutRef = useRef(null);

  // Load from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('vamus-theme-colors');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setTheme(parsedTheme);
        applyTheme(parsedTheme);
      } catch (e) {
        applyTheme(defaultTheme);
      }
    } else {
      applyTheme(defaultTheme);
    }
  }, []);

  const applyTheme = (colors) => {
    document.documentElement.style.setProperty('--bg-color', colors.bg);
    document.documentElement.style.setProperty('--surface-color', colors.surface);
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--text-primary', colors.text);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem('vamus-theme-colors', JSON.stringify(newTheme));
    }, 500);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, defaultTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
