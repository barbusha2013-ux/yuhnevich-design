(function () {
  let content;
  let settings = {};
  const state = {
    lang: "ru",
    filter: "all"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  async function loadContent() {
    try {
      const response = await fetch("content/site.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (window.siteContent) return window.siteContent;
      console.error(error);
      showContentError();
      return null;
    }
  }

  async function init() {
    content = await loadContent();
    if (!content) return;

    settings = content.settings || {};
    const savedLang = localStorage.getItem("site-lang");
    state.lang = content[savedLang] ? savedLang : settings.defaultLang || "ru";
    if (!content[state.lang]) state.lang = content.ru ? "ru" : Object.keys(content).find((key) => key !== "settings");

    const accent = settings.accentColor || "#2F6D66";
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-soft", toSoft(accent, 0.22));

    bootInteractions();
    render();
    updateProgress();
  }

  function showContentError() {
    const main = document.querySelector("main");
    if (!main) return;
    main.innerHTML =
      '<section class="section"><div class="shell"><h1 class="section-title">Content is temporarily unavailable</h1><p>Please refresh the page in a moment.</p></div></section>';
  }

  function toSoft(hex, alpha) {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    if (!match) return `rgba(47,109,102,${alpha})`;
    const rgb = match.slice(1).map((part) => parseInt(part, 16)).join(",");
    return `rgba(${rgb},${alpha})`;
  }

  function text(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value || "";
  }

  function chip(label) {
    const span = document.createElement("span");
    span.textContent = label;
    return span;
  }

  function render() {
    const t = content[state.lang];
    document.documentElement.lang = state.lang;

    $$("[data-nav]").forEach((link) => {
      link.textContent = t.nav[link.dataset.nav];
    });
    $$("[data-footer-nav]").forEach((link) => {
      link.textContent = t.nav[link.dataset.footerNav];
    });

    $(".header-cta").textContent = t.headerCta;
    text("scrollCue", t.scrollCue);
    text("heroKicker", t.heroKicker);
    text("heroFeatTag", t.heroFeatTag);
    text("heroFeatTitle", t.heroFeatTitle);
    text("heroBadge1", t.heroBadge1);
    text("heroH1a", t.heroH1a);
    text("heroH1b", t.heroH1b);
    text("heroSub", t.heroSub);
    text("heroCta1", t.heroCta1);
    text("heroCta2", t.heroCta2);
    text("heroFacts", t.heroFacts);
    $("#heroImageAlt").alt = t.heroImageAlt;

    [
      "aboutLabel",
      "aboutH2",
      "aboutP1",
      "aboutP2",
      "aboutToolsLabel",
      "aboutValuesLabel",
      "servicesH2",
      "servicesLabel",
      "workH2",
      "workLabel",
      "workNote",
      "processH2",
      "processLabel",
      "collabLabel",
      "ctaH2",
      "ctaSub",
      "footerTagline",
      "footerRemote"
    ].forEach((key) => text(key, t[key]));

    $("#tools").replaceChildren(...t.tools.map(chip));
    $("#values").replaceChildren(...t.values.map(chip));

    renderServices(t);
    renderFilters(t);
    renderProjects(t);
    renderStats(t);
    renderProcess(t);
    renderCollabs(t);
    renderContact(t);
    updateLangButtons();
    updateActiveNav();
    observeReveals();
  }

  function renderServices(t) {
    const cards = t.services.map((service, index) => {
      const card = document.createElement("article");
      card.className = "service-card reveal";
      card.style.gridColumn = `span ${service.span}`;

      const top = document.createElement("div");
      top.className = "card-top";
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const glyph = document.createElement("span");
      glyph.className = "glyph";
      glyph.textContent = service.glyph;
      top.append(number, glyph);

      const body = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = service.title;
      const desc = document.createElement("p");
      desc.textContent = service.desc;
      body.append(title, desc);

      card.append(top, body);
      return card;
    });

    $("#servicesGrid").replaceChildren(...cards);
  }

  function renderFilters(t) {
    const buttons = t.filters.map((filter) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = filter.label;
      button.dataset.filter = filter.key;
      button.className = filter.key === state.filter ? "active" : "";
      button.addEventListener("click", () => {
        state.filter = filter.key;
        renderFilters(t);
        renderProjects(t);
      });
      return button;
    });
    $("#filters").replaceChildren(...buttons);
  }

  function renderProjects(t) {
    const projects = t.projects.filter((project) => state.filter === "all" || project.cats.includes(state.filter));
    const cards = projects.map((project) => {
      const card = document.createElement("article");
      card.className = "project-card reveal";

      const imageButton = document.createElement("button");
      imageButton.type = "button";
      imageButton.className = "project-image";
      imageButton.title = t.openLabel;
      imageButton.addEventListener("click", () => openLightbox(project));

      const img = document.createElement("img");
      img.src = project.src;
      img.alt = project.alt || project.title;
      img.loading = "lazy";
      imageButton.append(img, Object.assign(document.createElement("span"), { textContent: "⤢" }));

      const footer = document.createElement("div");
      footer.className = "project-footer";

      const titleWrap = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = project.title;
      const meta = document.createElement("p");
      meta.textContent = project.meta;
      titleWrap.append(title, meta);

      const tag = document.createElement("span");
      tag.textContent = project.tag;
      footer.append(titleWrap, tag);

      card.append(imageButton, footer);
      return card;
    });
    $("#projectsGrid").replaceChildren(...cards);
    observeReveals();
  }

  function renderStats(t) {
    const cards = t.stats.map((stat) => {
      const card = document.createElement("article");
      card.className = "stat reveal";

      const number = document.createElement("strong");
      number.innerHTML = `<span data-count="${/^\d+$/.test(stat.value) ? stat.value : ""}">${stat.value}</span><em>${stat.suffix}</em>`;

      const label = document.createElement("p");
      label.textContent = stat.label;
      card.append(number, label);
      return card;
    });
    $("#statsGrid").replaceChildren(...cards);
  }

  function renderProcess(t) {
    const steps = t.steps.map((step, index) => {
      const item = document.createElement("article");
      item.className = "process-step reveal";
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("h3");
      title.textContent = step.title;
      const desc = document.createElement("p");
      desc.textContent = step.desc;
      item.append(number, title, desc);
      return item;
    });
    $("#processGrid").replaceChildren(...steps);
  }

  function renderCollabs(t) {
    const names = [...t.collabs, ...t.collabs];
    const items = names.map((name) => {
      const span = document.createElement("span");
      span.textContent = name;
      return span;
    });
    $("#collabTrack").replaceChildren(...items);
  }

  function renderContact(t) {
    const email = settings.email || "";
    const mailto = `mailto:${email}`;
    $("#ctaButton").href = mailto;
    $("#ctaButton").textContent = t.ctaBtn;
    $("#emailLine").textContent = `${email} · ${t.ctaEmailNote}`;
    $("#footerEmail").href = mailto;
    $("#footerEmail").textContent = email;
    $("#footerSocial").textContent = settings.social || "";
  }

  function openLightbox(project) {
    const lightbox = $("#lightbox");
    $("img", lightbox).src = project.src;
    $("img", lightbox).alt = project.alt || project.title;
    $("strong", lightbox).textContent = project.title;
    $("span", lightbox).textContent = project.meta;
    lightbox.hidden = false;
    document.body.classList.add("locked");
  }

  function closeLightbox() {
    $("#lightbox").hidden = true;
    document.body.classList.remove("locked");
  }

  function updateLangButtons() {
    $$("[data-lang]").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === state.lang);
    });
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight || 1;
    $("#progress").style.width = `${Math.max(0, Math.min(100, (window.scrollY / max) * 100))}%`;
  }

  function updateActiveNav() {
    let active = "";
    $$("[data-section]").forEach((section) => {
      if (section.getBoundingClientRect().top <= 140) active = section.id;
    });
    $$("[data-nav]").forEach((link) => {
      link.classList.toggle("active", link.dataset.nav === active);
    });
  }

  let revealObserver;
  function observeReveals() {
    if (revealObserver) revealObserver.disconnect();
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((node) => node.classList.add("visible"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    $$(".reveal").forEach((node) => revealObserver.observe(node));
  }

  function bootInteractions() {
    $$("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        state.lang = button.dataset.lang;
        localStorage.setItem("site-lang", state.lang);
        render();
      });
    });

    const menuToggle = $(".menu-toggle");
    const nav = $(".main-nav");
    menuToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      nav.hidden = false;
    });
    $$(".main-nav a").forEach((link) => {
      link.addEventListener("click", () => document.body.classList.remove("menu-open"));
    });

    $("#lightbox").addEventListener("click", closeLightbox);
    $(".lightbox-close").addEventListener("click", closeLightbox);
    $("#lightbox figure").addEventListener("click", (event) => event.stopPropagation());
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
    });

    window.addEventListener("scroll", () => {
      updateProgress();
      updateActiveNav();
    }, { passive: true });
    window.addEventListener("resize", updateActiveNav, { passive: true });
  }

  init();
})();
