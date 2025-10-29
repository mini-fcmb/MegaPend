import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MainContent from "../components/maincontent";
import "../styles/theme.css";

const Home: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <NavBar theme={theme} setTheme={setTheme} />
      <main
        className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <MainContent />
      </main>
    </>
  );
};

export default Home;
