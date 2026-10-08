"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initial theme loading - runs once on mount
  useEffect(() => {
    setMounted(true);
    
    // Load theme from localStorage on mount
    const stored = localStorage.getItem("tinylytics-theme") as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setThemeState(stored);
    }

    // Apply initial theme immediately
    const resolveTheme = (t: Theme): "light" | "dark" => {
      if (t === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return t;
    };

    const initialTheme = stored && ["light", "dark", "system"].includes(stored) ? stored : "system";
    const initialResolved = resolveTheme(initialTheme);
    setResolvedTheme(initialResolved);

    if (initialResolved === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Function to resolve the actual theme based on system preference
    const resolveTheme = (t: Theme): "light" | "dark" => {
      if (t === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return t;
    };

    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    // Update DOM - add appropriate class and remove the other
    if (resolved === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", resolved === "dark" ? "#121210" : "#f4f2eb");
    }

    // Listen to system preference changes if theme is "system"
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        if (newResolved === "dark") {
          root.classList.add("dark");
          root.classList.remove("light");
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
        }
        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
          meta.setAttribute("content", newResolved === "dark" ? "#121210" : "#f4f2eb");
        }
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("tinylytics-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
