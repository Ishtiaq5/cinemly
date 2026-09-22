/* Cinemly — vanilla JS discovery engine */
(function () {
  "use strict";

  var MOVIES = [
    { id: "neon-requiem", title: "Neon Requiem", year: 2025, rating: 8.7, genre: "Sci-Fi", heat: 96, art: "linear-gradient(160deg,#3a1b6d,#8b1f6b 45%,#ff6b3d)", tag: "Editor pick" },
    { id: "glass-harbor", title: "Glass Harbor", year: 2024, rating: 8.2, genre: "Drama", heat: 88, art: "linear-gradient(160deg,#0e2a45,#1d6b8c 50%,#7fe7d8)", tag: "" },
    { id: "midnight-circuit", title: "Midnight Circuit", year: 2025, rating: 7.9, genre: "Thriller", heat: 84, art: "linear-gradient(160deg,#12061f,#5c1030 55%,#ff3d8b)", tag: "" },
    { id: "solar-drift", title: "Solar Drift", year: 2023, rating: 8.4, genre: "Sci-Fi", heat: 81, art: "linear-gradient(160deg,#4a1d02,#b45a08 50%,#ffd166)", tag: "" },
    { id: "paper-moonlight", title: "Paper Moonlight", year: 2024, rating: 7.6, genre: "Romance", heat: 73, art: "linear-gradient(160deg,#3a0f45,#a83279 50%,#ffb3d9)", tag: "" },
    { id: "iron-vale", title: "Iron Vale", year: 2022, rating: 8.1, genre: "Action", heat: 78, art: "linear-gradient(160deg,#1b1b1f,#4b5563 50%,#c9d3e3)", tag: "" },
    { id: "lantern-fields", title: "Lantern Fields", year: 2025, rating: 8.9, genre: "Drama", heat: 92, art: "linear-gradient(160deg,#0b2b1f,#1f7a52 50%,#b6ff7a)", tag: "New" },
    { id: "echo-chamber", title: "Echo Chamber", year: 2023, rating: 7.4, genre: "Thriller", heat: 69, art: "linear-gradient(160deg,#240b3a,#6b21a8 55%,#c084fc)", tag: "" },
    { id: "the-quiet-orbit", title: "The Quiet Orbit", year: 2024, rating: 8.5, genre: "Sci-Fi", heat: 86, art: "linear-gradient(160deg,#061a2b,#0e7490 50%,#67e8f9)", tag: "" },
    { id: "velvet-heist", title: "Velvet Heist", year: 2025, rating: 7.8, genre: "Action", heat: 76, art: "linear-gradient(160deg,#2b0716,#9d174d 55%,#fda4af)", tag: "" },
    { id: "hollow-lantern", title: "Hollow Lantern", year: 2022, rating: 7.2, genre: "Horror", heat: 64, art: "linear-gradient(160deg,#0a0a0a,#3f3f46 55%,#a1a1aa)", tag: "" },
    { id: "amber-signal", title: "Amber Signal", year: 2025, rating: 8.3, genre: "Mystery", heat: 83, art: "linear-gradient(160deg,#3b2200,#b45309 50%,#fcd34d)", tag: "" },
    { id: "saltwater-songs", title: "Saltwater Songs", year: 2023, rating: 7.7, genre: "Drama", heat: 71, art: "linear-gradient(160deg,#04263a,#0369a1 50%,#7dd3fc)", tag: "" },
    { id: "static-bloom", title: "Static Bloom", year: 2024, rating: 8.0, genre: "Romance", heat: 74, art: "linear-gradient(160deg,#2b0726,#a21caf 50%,#f0abfc)", tag: "" },
    { id: "northbound", title: "Northbound", year: 2022, rating: 7.9, genre: "Action", heat: 68, art: "linear-gradient(160deg,#0f172a,#334155 50%,#93c5fd)", tag: "" },
    { id: "the-last-frame", title: "The Last Frame", year: 2025, rating: 8.6, genre: "Mystery", heat: 90, art: "linear-gradient(160deg,#1a0630,#7e22ce 50%,#c4b5fd)", tag: "Trending" }
  ];

  var STORAGE_KEY = "cinemly.watchlist.v1";
  var GENRES = ["All"].concat(
    MOVIES.map(function (m) { return m.genre; }).filter(function (g, i, a) { return a.indexOf(g) === i; }).sort()
  );

  var state = { genre: "All", query: "", list: load() };

  var $ = function (sel) { return document.querySelector(sel); };
  var grid = $("#grid");
  var chips = $("#genreChips");
  var search = $("#search");
  var watchlistEl = $("#watchlist");
  var listEmpty = $("#listEmpty");
  var emptyState = $("#emptyState");
  var navCount = $("#navCount");
  var toast = $("#toast");
  var toastTimer = null;

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.list)); } catch (e) { /* storage unavailable */ }
  }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isSaved(id) { return state.list.indexOf(id) !== -1; }

  function flash(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  function renderChips() {
    chips.innerHTML = GENRES.map(function (g) {
      return '<button class="chip" type="button" data-genre="' + esc(g) + '" aria-pressed="' +
        (state.genre === g) + '">' + esc(g) + "</button>";
    }).join("");
  }

  function visible() {
    var q = state.query.trim().toLowerCase();
    return MOVIES.filter(function (m) {
      var genreOk = state.genre === "All" || m.genre === state.genre;
      var queryOk = !q || (m.title + " " + m.genre + " " + m.year).toLowerCase().indexOf(q) !== -1;
      return genreOk && queryOk;
    });
  }

  function renderGrid() {
    var items = visible();
    emptyState.hidden = items.length > 0;
    grid.innerHTML = items.map(function (m) {
      var saved = isSaved(m.id);
      return '<article class="card reveal" role="listitem">' +
        '<span class="card-art" style="background:' + m.art + '" aria-hidden="true">' +
        '<span class="card-rating">' + m.rating.toFixed(1) + "\u2605</span></span>" +
        '<div class="card-body">' +
        '<h3 class="card-title">' + esc(m.title) + "</h3>" +
        '<p class="card-meta">' + esc(m.genre) + " \u00b7 " + m.year + "</p>" +
        '<div class="card-foot"><span class="trend-genre">' + esc(m.tag || "In vault") + "</span>" +
        '<button class="save" type="button" data-id="' + esc(m.id) + '" aria-pressed="' + saved + '" aria-label="' +
        (saved ? "Remove " : "Add ") + esc(m.title) + (saved ? " from" : " to") + ' watchlist">' +
        (saved ? "\u2713 Saved" : "+ Save") + "</button></div></div></article>";
    }).join("");
    observeReveal();
  }

  function renderTrending() {
    var top = MOVIES.slice().sort(function (a, b) { return b.heat - a.heat; }).slice(0, 6);
    $("#trendList").innerHTML = top.map(function (m, i) {
      return "<li><span class=\"trend-rank\">" + (i + 1) + "</span>" +
        '<span class="trend-title">' + esc(m.title) + "</span>" +
        '<span class="trend-genre">' + esc(m.genre) + "</span>" +
        '<span class="trend-bar" aria-hidden="true"><span style="width:' + m.heat + '%"></span></span></li>';
    }).join("");
  }

  function renderWatchlist() {
    var items = state.list.map(function (id) {
      return MOVIES.filter(function (m) { return m.id === id; })[0];
    }).filter(Boolean);

    navCount.textContent = items.length;
    listEmpty.hidden = items.length > 0;
    watchlistEl.innerHTML = items.map(function (m) {
      return "<li>" +
        '<span class="wl-thumb" style="background:' + m.art + '" aria-hidden="true"></span>' +
        '<span class="wl-info"><h4>' + esc(m.title) + "</h4><p>" + esc(m.genre) + " \u00b7 " + m.rating.toFixed(1) + "\u2605</p></span>" +
        '<button class="remove" type="button" data-remove="' + esc(m.id) + '" aria-label="Remove ' + esc(m.title) + ' from watchlist">\u2715</button>' +
        "</li>";
    }).join("");
  }

  function toggle(id) {
    var i = state.list.indexOf(id);
    var movie = MOVIES.filter(function (m) { return m.id === id; })[0];
    if (i === -1) { state.list.push(id); flash("Added " + movie.title + " to your list"); }
    else { state.list.splice(i, 1); flash("Removed " + movie.title + " from your list"); }
    save();
    renderGrid();
    renderWatchlist();
  }

  function observeReveal() {
    var nodes = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
  }

  function setFeatured() {
    var top = MOVIES.slice().sort(function (a, b) { return b.heat - a.heat; })[0];
    $("#featuredArt").style.background = top.art;
    $("#featuredTitle").textContent = top.title;
    $("#featuredMeta").innerHTML = esc(top.genre) + " \u00b7 " + top.year + " \u00b7 " + top.rating.toFixed(1) + "\u2605";
  }

  /* events */
  chips.addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) { return; }
    state.genre = btn.getAttribute("data-genre");
    renderChips();
    renderGrid();
  });

  search.addEventListener("input", function (e) {
    state.query = e.target.value;
    renderGrid();
  });

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".save");
    if (btn) { toggle(btn.getAttribute("data-id")); }
  });

  watchlistEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".remove");
    if (btn) { toggle(btn.getAttribute("data-remove")); }
  });

  $("#clearList").addEventListener("click", function () {
    if (!state.list.length) { flash("Your list is already empty"); return; }
    state.list = [];
    save();
    renderGrid();
    renderWatchlist();
    flash("Watchlist cleared");
  });

  /* init */
  renderChips();
  renderGrid();
  renderTrending();
  renderWatchlist();
  setFeatured();
  observeReveal();
  window.addEventListener("load", observeReveal);
})();
