import React, { useEffect, useRef, useState } from "react";
/*import {
  Zap,
  Search,
  MessageCircle,
  Mic,
  Image,
  Folder,
  Clock,
  Lock,
  Volume2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";*/
import "./chatbot.css";

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}> = ({ icon, label, active }) => {
  return (
    <a className={`nav-item ${active ? "active" : ""}`} href="#" title={label}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-text">{label}</span>
    </a>
  );
};

export default function App(): JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if (
        (isMac && e.metaKey && e.key.toLowerCase() === "k") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        // open sidebar if mobile
        if (window.innerWidth <= 768) setMobileOpen(true);
        // focus search
        setTimeout(() => searchRef.current?.focus(), 60);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggle = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((s) => !s);
    } else {
      setCollapsed((s) => !s);
    }
  };

  return (
    <div
      className={`app-root ${collapsed ? "sidebar-collapsed" : ""} ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "open" : ""
        }`}
        aria-expanded={!collapsed}
      >
        <div className="sidebar-content">
          <div className="sidebar-top">
            <div className="brand">
              <div className="brand-icon" aria-hidden>
                <Zap size={22} />
              </div>
              <div className="brand-text">Grok</div>
            </div>

            <div className="search-wrapper">
              <Search className="search-icon" size={16} />
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Search Ctrl+K"
                aria-label="Search"
                onFocus={() => {
                  if (window.innerWidth <= 768) setMobileOpen(true);
                }}
              />
            </div>
          </div>

          <nav className="nav">
            <SidebarItem
              icon={<MessageCircle size={18} />}
              label="Chat"
              active
            />
            <SidebarItem icon={<Mic size={18} />} label="Voice" />
            <SidebarItem icon={<Image size={18} />} label="Imagine" />
            <SidebarItem icon={<Folder size={18} />} label="Projects" />
            <SidebarItem icon={<Clock size={18} />} label="History" />
          </nav>

          <div className="history-list" role="list">
            <div className="history-heading">Today</div>
            <div className="history-row">React TypeScript UI Design</div>
            <div className="history-row">React TypeScript Chatbot UI</div>
            <div className="history-row">Building Teacher's Dashboard</div>

            <div className="history-heading">Yesterday</div>
            <div className="history-row">Synchronize Navbar and Sidebar</div>
            <div className="history-row">Casual coding chat, UI tweaks</div>
          </div>

          <div className="upgrade">
            <div className="upgrade-text">
              <strong>SuperGrok</strong>
              <div className="upgrade-sub">Unlock extended capabilities</div>
            </div>
            <button className="upgrade-btn">Upgrade</button>
          </div>
        </div>

        <button
          className={`sidebar-toggle ${collapsed ? "t-collapsed" : ""}`}
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      <div
        className={`backdrop ${mobileOpen ? "visible" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      <main className="main">
        <div className="panel">
          <div className="private-badge">
            <Lock size={14} /> <span>Private</span>
          </div>

          <div className="center-area">
            <div className="logo-circle">
              <Zap size={48} />
            </div>
            <h1 className="title">Grok</h1>

            <div className="prompt-row">
              <input
                className="prompt-input"
                placeholder="What do you want to know?"
                aria-label="Ask Grok"
              />
              <div className="prompt-controls">
                <button className="mode-btn">
                  Auto <MoreHorizontal size={14} />
                </button>
                <button className="mic-btn" title="Voice">
                  <Volume2 size={16} />
                </button>
              </div>
            </div>

            <div className="actions">
              <button className="pill">
                <Search size={14} /> DeepSearch
              </button>
              <button className="pill">
                <Image size={14} /> Create Image
              </button>
              <button className="pill">
                <MoreHorizontal size={14} /> Try Projects
              </button>
              <button className="pill voice">
                <Volume2 size={14} /> Voice
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
