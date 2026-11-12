(() => {
  // =========================================
  // MODO CLARO / ESCURO
  // =========================================

const toggle =
  document.getElementById("theme-toggle");


// Recupera o tema salvo
const savedTheme =
  localStorage.getItem("theme");


// Aplica o tema salvo
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
}


// Atualiza o botão
function updateThemeButton() {

  if (!toggle) {
    return;
  }

  if (
    document.body.classList.contains("dark-mode")
  ) {

    toggle.textContent = "☀️";

    toggle.setAttribute(
      "aria-label",
      "Ativar modo claro"
    );

    toggle.setAttribute(
      "title",
      "Ativar modo claro"
    );

  } else {

    toggle.textContent = "🌙";

    toggle.setAttribute(
      "aria-label",
      "Ativar modo escuro"
    );

    toggle.setAttribute(
      "title",
      "Ativar modo escuro"
    );
  }
}


// Clique no botão
if (toggle) {

  toggle.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "dark-mode"
      );

      const isDark =
        document.body.classList.contains(
          "dark-mode"
        );


      if (isDark) {

        localStorage.setItem(
          "theme",
          "dark"
        );

      } else {

        localStorage.setItem(
          "theme",
          "light"
        );

      }


      updateThemeButton();

    }
  );

}


  // Inicializa o botão
  updateThemeButton();
})();