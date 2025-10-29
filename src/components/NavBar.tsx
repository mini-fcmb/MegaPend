import { Dispatch, SetStateAction, useState } from "react";
import "boxicons/css/boxicons.min.css";
import "../styles/theme.css";
import logo from "../assets/MegaPend logo Design.png";
import { Link } from "react-router-dom";

interface NavBarProps {
  theme?: "light" | "dark"; // optional now
  setTheme?: Dispatch<SetStateAction<"light" | "dark">>; // optional
}

function NavBar({ theme, setTheme }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidePanel = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    if (!theme || !setTheme) return; // don't do anything if props not provided
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const showThemeButton = theme && setTheme;

  return (
    <>
      <header className="navbar">
        <div className="flex items-center gap-3 p-4 logo-container">
          <div className="logo-wrapper">
            <img src={logo} alt="MegaPend Logo" className="megapend-logo" />
          </div>
          <h1 className="megapend-text">MegaPend</h1>
        </div>

        <nav className="nav-desktop">
          <ul>
            <li>
              <Link to={"/"}>Home</Link>
            </li>
            <li>
              <Link to={"/courses"}>Courses</Link>
            </li>
            <li>
              <Link to={"/quiz"}>Quizzes</Link>
            </li>
            <li>
              <Link to={"/dashboard"}>Dashboard</Link>
            </li>
            <li>
              <Link to={"/login"}>Login</Link>
            </li>
          </ul>
        </nav>

        <div className="actions flex items-center gap-4">
          {showThemeButton && (
            <button className="theme-toggle" onClick={toggleTheme}>
              <i
                className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"}`}
              ></i>
            </button>
          )}

          <button className="nav-toggle" onClick={toggleSidePanel}>
            <i className="bx bx-menu"></i>
          </button>
        </div>
      </header>

      <div className={`side-panel ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleSidePanel}>
          <i className="bx bx-x"></i>
        </button>

        <ul className="sidepanel-a">
          <li>
            <Link to={"/"}>Home</Link>
          </li>
          <li>
            <Link to={"/courses"}>Courses</Link>
          </li>
          <li>
            <Link to={"/quiz"}>Quizzes</Link>
          </li>
          <li>
            <Link to={"/dashboard"}>Dashboard</Link>
          </li>
          <li>
            <Link to={"/login"}>Login</Link>
          </li>
        </ul>

        {showThemeButton && (
          <button className="theme-toggle side-theme" onClick={toggleTheme}>
            <i className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"}`}></i>
            <span>{theme === "dark" ? " Light Mode" : " Dark Mode"}</span>
          </button>
        )}
      </div>

      {isOpen && <div className="overlay show" onClick={toggleSidePanel}></div>}
    </>
  );
}

export default NavBar;
