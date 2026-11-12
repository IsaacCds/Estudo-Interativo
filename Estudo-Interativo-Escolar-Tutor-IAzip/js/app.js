(() => {
  const toggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  if (!toggle) {
    return;
  }

  const updateThemeButton = () => {
    const isDark = document.body.classList.contains("dark-mode");
    toggle.textContent = isDark ? "☀️" : "🌙";
    toggle.setAttribute(
      "aria-label",
      isDark ? "Ativar modo claro" : "Ativar modo escuro",
    );
    toggle.setAttribute(
      "title",
      isDark ? "Ativar modo claro" : "Ativar modo escuro",
    );
  };

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light",
    );
    updateThemeButton();
  });

  updateThemeButton();
})();