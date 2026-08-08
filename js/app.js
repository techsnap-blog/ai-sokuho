// L5 client-side personalization + search (localStorage only, no backend).
// State: sokuho.myai / sokuho.installed / sokuho.saved (slug arrays), sokuho.lastVisit (ISO).
(() => {
  const root = document.body.dataset.root || "";

  // PWA: service worker 登録（対応環境のみ）
  if ("serviceWorker" in navigator)
    window.addEventListener("load", () => navigator.serviceWorker.register(root + "sw.js").catch(() => {}));
  const key = (k) => "sokuho." + k;
  const getArr = (k) => { try { return JSON.parse(localStorage.getItem(key(k))) || []; } catch { return []; } };
  const setArr = (k, v) => localStorage.setItem(key(k), JSON.stringify(v));
  const has = (k, id) => getArr(k).includes(id);
  const toggle = (k, id) => { const a = getArr(k), i = a.indexOf(id); if (i < 0) a.push(id); else a.splice(i, 1); setArr(k, a); return i < 0; };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // --- toggle buttons (My AI / Installed / Saved) ---
  const sync = (b) => { const on = has(b.dataset.key, b.dataset.id); b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on)); b.textContent = on ? b.dataset.on : b.dataset.off; };
  document.querySelectorAll("[data-toggle]").forEach((b) => { sync(b); b.addEventListener("click", () => { toggle(b.dataset.key, b.dataset.id); sync(b); }); });

  // --- data (cached) ---
  const cache = {};
  const load = (name) => (cache[name] ||= fetch(root + "data/" + name + ".json").then((r) => r.json()));

  const logoHTML = (thumb, name, bg) => thumb
    ? `<img class="logo${bg === "dark" ? " logo-on-dark" : ""}" src="${root}${esc(thumb)}" alt="" loading="lazy" width="40" height="40">`
    : `<span class="logo logo-fallback" aria-hidden="true">${esc((name || "?").trim().charAt(0).toUpperCase())}</span>`;

  const cardHTML = (a, mine) => `<a class="card${mine ? " is-mine" : ""}" data-slug="${esc(a.slug)}" data-service="${esc(a.service_slug)}" href="${root}articles/${esc(a.slug)}.html">
<span class="thumb-wrap">${logoHTML(a.thumb, a.service_name, a.thumb_bg)}</span>
<span><span class="meta">${mine ? '<span class="badge mine-pill">My AI</span>' : ""}<span>${esc(a.service_name)}</span><span class="badge">${esc(a.article_type || "UPDATE")}</span><span>${esc(a.published_at || "")}</span></span>
<span class="card-title">${esc(a.title)}</span></span></a>`;

  const serviceHTML = (s, extra) => `<a class="ai-item" href="${root}ai/${esc(s.slug)}.html">
${logoHTML(s.logo, s.name, s.logo_bg)}
<span class="ai-item-body"><span class="ai-name">${esc(s.name)}</span>
<span class="ai-sub">${esc(s.company)}${extra ? "・" + esc(extra) : ""}</span></span></a>`;

  // --- Home: Since you were away (前回訪問以降の更新。My AIがあれば優先) ---
  const sa = document.getElementById("since-away");
  if (sa) {
    load("articles").then(({ articles }) => {
      const last = localStorage.getItem(key("lastVisit"));
      if (last) {
        const cut = last.slice(0, 10);
        let since = articles.filter((a) => (a.updated_at || a.published_at || "") > cut);
        const mine = getArr("myai");
        if (mine.length) { const m = since.filter((a) => mine.includes(a.service_slug)); if (m.length) since = m; }
        if (since.length) {
          sa.querySelector(".sa-list").innerHTML = since.slice(0, 10).map(cardHTML).join("");
          sa.hidden = false;
        }
      }
      localStorage.setItem(key("lastVisit"), new Date().toISOString());
    });
    const clear = document.getElementById("sa-clear");
    if (clear) clear.addEventListener("click", (e) => { e.preventDefault(); localStorage.setItem(key("lastVisit"), new Date().toISOString()); sa.hidden = true; });
  }

  // --- Home: 最新 で My AI のAI記事を末尾＋強調（localStorageのみ） ---
  const latest = document.getElementById("latest-list");
  if (latest) {
    const mine = getArr("myai");
    if (mine.length) load("articles").then(({ articles }) => {
      const mineArticles = articles
        .filter((a) => mine.includes(a.service_slug))
        .sort((a, b) => (b.updated_at || b.published_at || "").localeCompare(a.updated_at || a.published_at || ""))
        .slice(0, 6);
      if (!mineArticles.length) return;
      const mineSlugs = new Set(mineArticles.map((a) => a.slug));
      // サーバー描画済みの同記事は除いて末尾に挿し直す（重複防止）
      latest.querySelectorAll(".card[data-slug]").forEach((c) => { if (mineSlugs.has(c.dataset.slug)) c.remove(); });
      latest.insertAdjacentHTML("beforeend", mineArticles.map((a) => cardHTML(a, true)).join(""));
    });
  }

  // --- Home: My AI（登録したAIの一覧。最新の後に並べる。未登録なら非表示） ---
  const homeMyai = document.getElementById("home-myai");
  if (homeMyai) {
    const mine = getArr("myai");
    if (mine.length) load("services").then((services) => {
      const list = services.filter((s) => mine.includes(s.slug));
      if (!list.length) return;
      const installed = getArr("installed");
      document.getElementById("home-myai-list").innerHTML =
        list.map((s) => serviceHTML(s, installed.includes(s.slug) ? "導入済み" : "")).join("");
      homeMyai.hidden = false;
    });
  }

  // --- My AI page ---
  const myaiList = document.getElementById("myai-list");
  if (myaiList) load("services").then((services) => {
    const mine = getArr("myai"), installed = getArr("installed");
    const list = services.filter((s) => mine.includes(s.slug));
    if (!list.length) return;
    document.getElementById("myai-empty").hidden = true;
    myaiList.innerHTML = list.map((s) => serviceHTML(s, installed.includes(s.slug) ? "導入済み" : "")).join("");
  });

  // --- Saved page ---
  const savedList = document.getElementById("saved-list");
  if (savedList) load("articles").then(({ articles }) => {
    const saved = getArr("saved");
    const list = articles.filter((a) => saved.includes(a.slug));
    if (!list.length) return;
    document.getElementById("saved-empty").hidden = true;
    savedList.innerHTML = list.map(cardHTML).join("");
  });

  // --- Search page (記事 + AI。§75/§78) ---
  const q = document.getElementById("q");
  if (q) Promise.all([load("articles"), load("services")]).then(([{ articles }, services]) => {
    const results = document.getElementById("search-results"), empty = document.getElementById("search-empty");
    const run = () => {
      const t = q.value.trim().toLowerCase();
      if (!t) { results.innerHTML = ""; empty.hidden = true; return; }
      const aHits = articles.filter((a) => (a.title + " " + (a.summary || "") + " " + (a.service_name || "")).toLowerCase().includes(t));
      const sHits = services.filter((s) => (s.name + " " + s.company).toLowerCase().includes(t));
      results.innerHTML = sHits.map((s) => serviceHTML(s, s.company)).join("") + aHits.map(cardHTML).join("");
      empty.hidden = aHits.length + sHits.length > 0;
    };
    q.addEventListener("input", run);
    const initial = new URLSearchParams(location.search).get("q");
    if (initial) { q.value = initial; run(); }
  });
})();
