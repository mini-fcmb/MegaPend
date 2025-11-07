// JUST REPLACE YOUR handleNavClick AND navItems MAP WITH THIS:
const handleNavClick = (name: string) => {
  setActiveSection(name);
  setIsMobileOpen(false);
};

// In sidebar nav:
{
  navItems.map((item) => (
    <div
      key={item.name}
      className={`firebase-nav-item ${
        activeSection === item.name ? "active" : ""
      }`}
      onClick={() => handleNavClick(item.name)}
    >
      <i className={`bx ${item.icon}`}></i>
      <span>
        {item.name === "Student List"
          ? "Students"
          : item.name === "Upload Content"
          ? "Upload"
          : item.name === "Announcement"
          ? "Announcements"
          : item.name}
      </span>
    </div>
  ));
}

// In top tabs:
{
  navItems.map((item) => (
    <div
      key={item.name}
      className={`tab ${activeSection === item.name ? "active" : ""}`}
      onClick={() => handleNavClick(item.name)}
    >
      {item.name}
      {activeSection === item.name && <div className="active-underline"></div>}
    </div>
  ));
}
