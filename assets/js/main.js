
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  const btnTheme = document.querySelector("[data-ic='theme']");
  const btnFontPlus = document.querySelector("[data-ic='font-plus']");
  const btnFontMinus = document.querySelector("[data-ic='font-minus']");
  const btnContrast = document.querySelector("[data-ic='contrast']");
  const btnNarrator = document.querySelector("[data-ic='narrator']");
  const btnLanguage = document.querySelector("[data-ic='language']");

  const baseFontSize = 16;
  let fontScale = 1;

  function updateFontSize() {
    const newSize = baseFontSize * fontScale;
    document.documentElement.style.fontSize = newSize + "px";
  }

  if (btnTheme) {
    btnTheme.addEventListener("click", () => {
      body.classList.toggle("light-mode");
    });
  }

  if (btnFontPlus) {
    btnFontPlus.addEventListener("click", () => {
      fontScale = Math.min(fontScale + 0.1, 1.4);
      updateFontSize();
    });
  }

  if (btnFontMinus) {
    btnFontMinus.addEventListener("click", () => {
      fontScale = Math.max(fontScale - 0.1, 0.8);
      updateFontSize();
    });
  }

  if (btnContrast) {
    btnContrast.addEventListener("click", () => {
      body.classList.toggle("high-contrast");
    });
  }

  if (btnNarrator) {
    btnNarrator.addEventListener("click", () => {
      if (!("speechSynthesis" in window)) {
        alert("Tu navegador no soporta lectura en voz alta.");
        return;
      }
      const selection = window.getSelection();
      let text = selection && selection.toString().trim();
      if (!text) {
        const main = document.querySelector("main") || document.body;
        text = main.innerText;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-CL";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  if (btnLanguage) {
    btnLanguage.addEventListener("click", () => {
      alert("Selector de idiomas listo para integrar i18n (ES · EN · Mapudungun).");
    });
  }

  // Global search
  const searchInputs = document.querySelectorAll("[data-search]");
  searchInputs.forEach(input => {
    const selector = input.getAttribute("data-search");
    const targets = document.querySelectorAll(selector);
    input.addEventListener("input", () => {
      const term = input.value.toLowerCase();
      targets.forEach(t => {
        const text = t.innerText.toLowerCase();
        t.style.display = term && !text.includes(term) ? "none" : "";
      });
    });
  });

  // Lab de proyectos: manejo de formulario y CSV
  const form = document.getElementById("lab-form");
  const tableBody = document.getElementById("lab-body");
  const btnExport = document.getElementById("lab-export");
  const stateLabels = ["Secuencia", "Modelo 3D", "Malla limpia", "STL listo", "XR/VR"];

  if (form && tableBody && btnExport) {
    const proyectos = [];

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const nombre = data.get("nombre")?.toString().trim();
      const nivel = data.get("nivel")?.toString().trim();
      const objetivo = data.get("objetivo")?.toString().trim();
      const herramientas = data.getAll("herramientas").join(" · ") || "";

      const estados = stateLabels.map((label, i) => {
        const key = "estado" + (i+1);
        return data.get(key) ? "✓" : "";
      });

      if (!nombre) {
        alert("Escribe al menos el nombre de la proteína o proyecto.");
        return;
      }

      const row = document.createElement("tr");
      const index = proyectos.length + 1;
      const cells = [
        index,
        nombre,
        nivel,
        objetivo,
        herramientas,
        ...estados
      ];
      cells.forEach(text => {
        const td = document.createElement("td");
        td.textContent = text;
        row.appendChild(td);
      });
      tableBody.appendChild(row);

      proyectos.push({
        index,
        nombre,
        nivel,
        objetivo,
        herramientas,
        estados
      });

      form.reset();
    });

    btnExport.addEventListener("click", () => {
      if (!proyectos.length) {
        alert("Primero agrega al menos un proyecto al laboratorio.");
        return;
      }
      const header = [
        "N°","Proteína / proyecto","Nivel","Objetivo didáctico",
        "Herramientas","Secuencia","Modelo 3D","Malla limpia","STL listo","XR/VR"
      ];
      const rows = proyectos.map(p => [
        p.index,
        p.nombre,
        p.nivel,
        p.objetivo,
        p.herramientas,
        ...p.estados
      ]);

      const csv = [header, ...rows]
        .map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth()+1).padStart(2,"0");
      const d = String(now.getDate()).padStart(2,"0");
      a.href = url;
      a.download = `lab_proyectos_proteinas_${y}${m}${d}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
});
