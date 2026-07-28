(() => {
  "use strict";

  const STORAGE_KEY = "wallabee-dressing-v1";

  const DEFAULT_STATE = {
    pairs: [
      { id: "p1", name: "Paire 01", color: "#C08A3E" },
      { id: "p2", name: "Paire 02", color: "#5C3A26" },
      { id: "p3", name: "Paire 03", color: "#7C8A64" },
      { id: "p4", name: "Paire 04", color: "#33241C" }
    ],
    entries: []
  };

  let state = loadState();
  let editingEntryId = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      if (!parsed.pairs || !parsed.entries) throw new Error("shape");
      return parsed;
    } catch (e) {
      return structuredClone(DEFAULT_STATE);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(d);
  }

  function relativeLabel(iso) {
    const d = new Date(iso + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.round((now - d) / 86400000);
    if (diffDays === 0) return "aujourd'hui";
    if (diffDays === 1) return "hier";
    if (diffDays > 1) return `il y a ${diffDays} jours`;
    return formatDate(iso);
  }

  function entriesForPair(pairId) {
    return state.entries
      .filter((e) => e.pairId === pairId)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt));
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // ---------- routing ----------

  function parseRoute() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash.startsWith("pair/")) {
      const id = hash.slice(5);
      if (state.pairs.some((p) => p.id === id)) return { view: "detail", pairId: id };
    }
    return { view: "dashboard" };
  }

  function render() {
    const route = parseRoute();
    document.getElementById("view-dashboard").hidden = route.view !== "dashboard";
    document.getElementById("view-detail").hidden = route.view !== "detail";
    renderGlobalStats();
    if (route.view === "dashboard") {
      renderDashboard();
    } else {
      renderDetail(route.pairId);
    }
  }

  window.addEventListener("hashchange", render);

  // ---------- dashboard ----------

  function renderGlobalStats() {
    const total = state.entries.length;
    const el = document.getElementById("global-stats");
    if (total === 0) {
      el.textContent = "0 tenue consignée";
      return;
    }
    const last = [...state.entries].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const pairName = state.pairs.find((p) => p.id === last.pairId)?.name ?? "";
    el.textContent = `${total} tenue${total > 1 ? "s" : ""} consignée${total > 1 ? "s" : ""}\ndernière note : ${pairName}, ${relativeLabel(last.date)}`;
  }

  function renderDashboard() {
    const grid = document.getElementById("card-grid");
    grid.innerHTML = "";
    state.pairs.forEach((pair, i) => {
      const entries = entriesForPair(pair.id);
      const last = entries[0];
      const card = document.createElement("button");
      card.type = "button";
      card.className = "pair-card";
      card.style.setProperty("--card-accent", pair.color);
      card.setAttribute("aria-label", `Ouvrir la fiche de ${pair.name}`);
      card.innerHTML = `
        <div class="card-top">
          <span class="card-swatch"></span>
          <span class="card-fiche-no">Fiche ${String(i + 1).padStart(2, "0")}</span>
        </div>
        <h3 class="card-name">${escapeHTML(pair.name)}</h3>
        <p class="card-meta">${entries.length} tenue${entries.length > 1 ? "s" : ""} consignée${entries.length > 1 ? "s" : ""}</p>
        <div class="card-last">
          ${
            last
              ? `<span class="label">dernière fois &middot; ${relativeLabel(last.date)}</span>${escapeHTML(truncate(last.outfit, 70))}`
              : `<span class="label">en attente</span>aucune entrée pour l'instant`
          }
        </div>
      `;
      card.addEventListener("click", () => {
        location.hash = `#/pair/${pair.id}`;
      });
      grid.appendChild(card);
    });
  }

  function truncate(str, n) {
    if (!str) return "";
    return str.length > n ? str.slice(0, n - 1).trimEnd() + "…" : str;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  // ---------- detail ----------

  let currentPairId = null;

  function renderDetail(pairId) {
    currentPairId = pairId;
    const pair = state.pairs.find((p) => p.id === pairId);
    const idx = state.pairs.findIndex((p) => p.id === pairId);
    document.getElementById("detail-no").textContent = `Fiche ${String(idx + 1).padStart(2, "0")}`;

    const nameEl = document.getElementById("detail-name");
    nameEl.textContent = pair.name;

    const swatchBtn = document.getElementById("detail-swatch");
    swatchBtn.style.setProperty("--card-accent", pair.color);
    document.getElementById("detail-color").value = pair.color;

    const entries = entriesForPair(pairId);
    const last = entries[0];
    document.getElementById("detail-meta").textContent =
      entries.length === 0
        ? "aucune tenue consignée pour l'instant"
        : `${entries.length} tenue${entries.length > 1 ? "s" : ""} &middot; dernière fois : ${relativeLabel(last.date)}`.replace("&middot;", "·");

    document.getElementById("entry-form").hidden = true;
    document.getElementById("toggle-form-btn").hidden = false;
    editingEntryId = null;
    document.getElementById("search-input").value = "";

    renderEntryList(entries);
  }

  function renderEntryList(entries) {
    const list = document.getElementById("entry-list");
    const empty = document.getElementById("empty-state");
    list.innerHTML = "";
    if (entries.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    const pair = state.pairs.find((p) => p.id === currentPairId);

    entries.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "entry-card";
      li.style.setProperty("--card-accent", pair.color);
      li.innerHTML = `
        <div class="entry-date">${formatDate(entry.date)}</div>
        <div class="entry-body">
          <p class="entry-outfit">${escapeHTML(entry.outfit)}</p>
          ${entry.occasion ? `<span class="entry-occasion">${escapeHTML(entry.occasion)}</span>` : ""}
          ${entry.notes ? `<p class="entry-notes">${escapeHTML(entry.notes)}</p>` : ""}
        </div>
        <div class="entry-actions">
          <button type="button" class="icon-btn edit-btn" aria-label="Modifier cette entrée">✎</button>
          <button type="button" class="icon-btn delete-btn" aria-label="Supprimer cette entrée">✕</button>
        </div>
      `;
      li.querySelector(".edit-btn").addEventListener("click", () => startEdit(entry.id));
      li.querySelector(".delete-btn").addEventListener("click", () => deleteEntry(entry.id));
      list.appendChild(li);
    });
  }

  function filterAndRender() {
    const q = document.getElementById("search-input").value.trim().toLowerCase();
    let entries = entriesForPair(currentPairId);
    if (q) {
      entries = entries.filter((e) =>
        [e.outfit, e.occasion, e.notes].filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }
    renderEntryList(entries);
  }

  // ---------- entry form ----------

  function openForm() {
    document.getElementById("entry-form").hidden = false;
    document.getElementById("toggle-form-btn").hidden = true;
    document.getElementById("entry-date").value = todayISO();
    document.getElementById("entry-outfit").focus();
  }

  function closeForm() {
    document.getElementById("entry-form").reset();
    document.getElementById("entry-form").hidden = true;
    document.getElementById("toggle-form-btn").hidden = false;
    document.getElementById("entry-submit-btn").textContent = "Enregistrer l'entrée";
    editingEntryId = null;
  }

  function startEdit(entryId) {
    const entry = state.entries.find((e) => e.id === entryId);
    if (!entry) return;
    editingEntryId = entryId;
    document.getElementById("entry-form").hidden = false;
    document.getElementById("toggle-form-btn").hidden = true;
    document.getElementById("entry-date").value = entry.date;
    document.getElementById("entry-outfit").value = entry.outfit;
    document.getElementById("entry-occasion").value = entry.occasion || "";
    document.getElementById("entry-notes").value = entry.notes || "";
    document.getElementById("entry-submit-btn").textContent = "Mettre à jour l'entrée";
    document.getElementById("entry-outfit").focus();
  }

  function deleteEntry(entryId) {
    if (!confirm("Supprimer cette entrée du journal ?")) return;
    state.entries = state.entries.filter((e) => e.id !== entryId);
    saveState();
    filterAndRender();
    renderDetail(currentPairId);
    showToast("Entrée supprimée");
  }

  function handleFormSubmit(ev) {
    ev.preventDefault();
    const date = document.getElementById("entry-date").value;
    const outfit = document.getElementById("entry-outfit").value.trim();
    const occasion = document.getElementById("entry-occasion").value.trim();
    const notes = document.getElementById("entry-notes").value.trim();
    if (!date || !outfit) return;

    if (editingEntryId) {
      const entry = state.entries.find((e) => e.id === editingEntryId);
      Object.assign(entry, { date, outfit, occasion, notes });
      showToast("Entrée mise à jour");
    } else {
      state.entries.push({
        id: uid(),
        pairId: currentPairId,
        date,
        outfit,
        occasion,
        notes,
        createdAt: Date.now()
      });
      showToast("Tenue ajoutée à la fiche");
    }
    saveState();
    closeForm();
    renderDetail(currentPairId);
  }

  // ---------- pair editing ----------

  function handlePairNameBlur() {
    const el = document.getElementById("detail-name");
    const pair = state.pairs.find((p) => p.id === currentPairId);
    const value = el.textContent.trim();
    pair.name = value || pair.name;
    el.textContent = pair.name;
    saveState();
    renderGlobalStats();
  }

  function handlePairColorChange(ev) {
    const pair = state.pairs.find((p) => p.id === currentPairId);
    pair.color = ev.target.value;
    document.getElementById("detail-swatch").style.setProperty("--card-accent", pair.color);
    saveState();
    filterAndRender();
  }

  // ---------- export / import ----------

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallabee-dressing-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Fichier exporté");
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed.pairs) || !Array.isArray(parsed.entries)) throw new Error("shape");
        if (!confirm("Remplacer les données actuelles par ce fichier ?")) return;
        state = parsed;
        saveState();
        render();
        showToast("Données importées");
      } catch (e) {
        alert("Ce fichier ne ressemble pas à un export du Fichier Wallabee.");
      }
    };
    reader.readAsText(file);
  }

  // ---------- wire up ----------

  document.getElementById("toggle-form-btn").addEventListener("click", openForm);
  document.getElementById("entry-cancel-btn").addEventListener("click", closeForm);
  document.getElementById("entry-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("search-input").addEventListener("input", filterAndRender);
  document.getElementById("detail-name").addEventListener("blur", handlePairNameBlur);
  document.getElementById("detail-name").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") { ev.preventDefault(); ev.target.blur(); }
  });
  document.getElementById("detail-color").addEventListener("input", handlePairColorChange);
  document.getElementById("export-btn").addEventListener("click", exportData);
  document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-input").click());
  document.getElementById("import-input").addEventListener("change", (ev) => {
    if (ev.target.files[0]) importData(ev.target.files[0]);
    ev.target.value = "";
  });

  render();
})();
