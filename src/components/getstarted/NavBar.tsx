import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "boxicons/css/boxicons.min.css";
import "./styles/theme.css";
import logo from "../../assets/MegaPend Logo Design.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavBarProps {
  theme?: "light" | "dark";
  setTheme?: Dispatch<SetStateAction<"light" | "dark">>;
}

function NavBar({ theme, setTheme }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme && setTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, [setTheme]);

  // ✅ Update document class + persist theme whenever it changes
  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleSidePanel = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    if (!theme || !setTheme) return;
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const showThemeButton = theme && setTheme;

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

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
              <a
                href="#hero"
                onClick={handleHomeClick}
                className="hover:text-blue-600"
              >
                Home
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-blue-600">
                Features
              </a>
            </li>
            <li>
              <a href="#testimonials" className="hover:text-blue-600">
                Testimonials
              </a>
            </li>
            <li>
              <a href="#cta" className="hover:text-blue-600">
                Join Us
              </a>
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
            <a
              href="#hero"
              onClick={handleHomeClick}
              className="hover:text-blue-600"
            >
              Home
            </a>
          </li>
          <li>
            <a href="#features" className="hover:text-blue-600">
              Features
            </a>
          </li>
          <li>
            <a href="#testimonials" className="hover:text-blue-600">
              Testimonials
            </a>
          </li>
          <li>
            <a href="#cta" className="hover:text-blue-600">
              Join Us
            </a>
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
