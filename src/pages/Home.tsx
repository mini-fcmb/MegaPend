import { Dispatch, SetStateAction, useEffect } from "react";
import NavBar from "../components/getstarted/NavBar";
import MainContent from "../components/getstarted/maincontent";
import "../index.css";

interface HomeProps {
  theme: "light" | "dark";
  setTheme: Dispatch<SetStateAction<"light" | "dark">>;
}

export default function Home({ theme, setTheme }: HomeProps) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <NavBar theme={theme} setTheme={setTheme} />
      <main className="main-content">
        <MainContent />
      </main>
    </>
  );
}
