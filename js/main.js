(() => {
  "use strict";

  const number = new Intl.NumberFormat("en");

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach((el) => {
      if (value !== null && value !== undefined && value !== "") {
        el.textContent = value;
      }
    });
  }

  function relativeTime(iso) {
    if (!iso) return "recently";
    const then = new Date(iso);
    if (Number.isNaN(then.getTime())) return "recently";
    const seconds = Math.round((then.getTime() - Date.now()) / 1000);
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const units = [
      ["year", 31536000],
      ["month", 2592000],
      ["day", 86400],
      ["hour", 3600],
      ["minute", 60],
    ];
    for (const [unit, size] of units) {
      if (Math.abs(seconds) >= size || unit === "minute") {
        return formatter.format(Math.round(seconds / size), unit);
      }
    }
    return "just now";
  }

  function safeText(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderRepos(repos) {
    const grid = document.querySelector("#live-repo-grid");
    if (!grid || !Array.isArray(repos) || repos.length === 0) return;
    grid.innerHTML = repos.slice(0, 6).map((repo) => `
      <a class="repo-card" href="${safeText(repo.url)}" target="_blank" rel="noopener noreferrer">
        <div class="repo-card-top">
          <span class="repo-icon" aria-hidden="true">⌘</span>
          <span class="repo-name">${safeText(repo.name)}</span>
        </div>
        <p>${safeText(repo.description || "Open-source project")}</p>
        <div class="repo-meta">
          <span>${safeText(repo.language || "Code")}</span>
          <span>★ ${number.format(repo.stars || 0)}</span>
          <span>⑂ ${number.format(repo.forks || 0)}</span>
        </div>
      </a>
    `).join("");
  }

  async function loadPulse() {
    try {
      const response = await fetch("data/site-pulse.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setText("[data-live='followers']", data.github?.followers != null ? number.format(data.github.followers) : "—");
      setText("[data-live='repos']", data.github?.public_repos != null ? number.format(data.github.public_repos) : "—");
      setText("[data-live='refresh']", relativeTime(data.last_updated_utc));
      setText("[data-live='refresh-count']", number.format(data.refresh_number || 0));
      renderRepos(data.repositories);
    } catch (error) {
      console.debug("Live portfolio data unavailable:", error);
      setText("[data-live='refresh']", "automatically");
    }
  }

  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
  }

  function setupTerminal() {
    const target = document.querySelector("#terminal-role");
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const roles = [
      "data scientist",
      "AI researcher",
      "R package developer",
      "open science builder",
      "reproducibility advocate",
    ];
    let role = 0;
    let char = roles[0].length;
    let deleting = true;
    const tick = () => {
      const word = roles[role];
      char += deleting ? -1 : 1;
      target.textContent = word.slice(0, Math.max(0, char));
      if (!deleting && char >= word.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
      if (deleting && char <= 0) {
        deleting = false;
        role = (role + 1) % roles.length;
      }
      setTimeout(tick, deleting ? 45 : 75);
    };
    setTimeout(tick, 1300);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setText("#footer-year", new Date().getFullYear());
    loadPulse();
    setupReveal();
    setupTerminal();
  });
})();
