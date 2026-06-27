import fallbackServiceImage from "../Images/sections/after-finished.png";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteBase = import.meta.env.BASE_URL || "/";
const sitePath = (path) => `${siteBase}${path.replace(/^\//, "")}`;

document.body.classList.add("ready");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
);

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));

const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => header?.classList.toggle("is-scrolled", scrollY > 40), { passive: true });

const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector(".mobile-menu");
const setMenu = (open) => {
  menuButton?.setAttribute("aria-expanded", String(open));
  menu?.setAttribute("aria-hidden", String(!open));
  menu?.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
};
menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.querySelectorAll(".consultation-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelector(".form-status").textContent = "Thank you — we’ll contact you shortly.";
    form.reset();
  });
});

document.querySelectorAll("[data-count]").forEach((counter) => {
  const target = Number(counter.dataset.count);
  if (reduced) {
    counter.textContent = `${target}${counter.dataset.suffix || ""}`;
    return;
  }
  const countObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - started) / 900, 1);
      counter.textContent = `${Math.round(target * (1 - Math.pow(1 - progress, 3)))}${counter.dataset.suffix || ""}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.disconnect();
  });
  countObserver.observe(counter);
});

const filterButtons = [...document.querySelectorAll(".portfolio-filters button")];
const tiles = [...document.querySelectorAll(".portfolio-tile")];
filterButtons.forEach((button) => button.addEventListener("click", () => {
  filterButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  const filter = button.dataset.filter;
  tiles.forEach((tile) => {
    const hidden = filter !== "all" && !tile.dataset.category.split(" ").includes(filter);
    tile.classList.toggle("is-filtered-out", hidden);
    tile.classList.remove("is-refreshed");
    if (!hidden && !reduced) {
      requestAnimationFrame(() => tile.classList.add("is-refreshed"));
    }
  });
}));

const observeNewReveals = (root = document) => {
  root.querySelectorAll(".reveal:not(.is-visible)").forEach((item) => observer.observe(item));
};

const activatePortfolioFilters = (filter) => {
  const buttons = [...document.querySelectorAll(".portfolio-filters button")];
  const currentTiles = [...document.querySelectorAll(".portfolio-tile")];
  buttons.forEach((item) => {
    const active = item.dataset.filter === filter;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  currentTiles.forEach((tile) => {
    const categories = (tile.dataset.category || "").split(" ");
    const hidden = filter !== "all" && !categories.includes(filter);
    tile.classList.toggle("is-filtered-out", hidden);
    tile.classList.remove("is-refreshed");
    if (!hidden && !reduced) requestAnimationFrame(() => tile.classList.add("is-refreshed"));
  });
};

document.addEventListener("click", (event) => {
  const button = event.target.closest(".portfolio-filters button");
  if (!button) return;
  activatePortfolioFilters(button.dataset.filter);
});

const layoutClass = (layout) => {
  if (layout === "hero") return " portfolio-tile--hero";
  if (layout === "wide") return " portfolio-tile--wide";
  if (layout === "tall") return " portfolio-tile--tall";
  return "";
};

const renderFirebasePortfolio = async () => {
  const grid = document.querySelector(".portfolio-masonry--page");
  const filters = document.querySelector(".portfolio-filters");
  if (!grid) return;
  try {
    const { getPortfolioItems } = await import("./cms.js");
    const items = await getPortfolioItems();
    if (!items.length) return;
    const categories = items.flatMap((item) => (item.category || "").split(" ").filter(Boolean));
    const counts = categories.reduce((acc, category) => ({ ...acc, [category]: (acc[category] || 0) + 1 }), {});
    const categoryButtons = Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, count]) => `<button type="button" data-filter="${category}" aria-pressed="false">${category} <span>${String(count).padStart(2, "0")}</span></button>`)
      .join("");
    if (filters) {
      filters.innerHTML = `<button class="is-active" type="button" data-filter="all" aria-pressed="true">All <span>${String(items.length).padStart(2, "0")}</span></button>${categoryButtons}`;
    }
    grid.innerHTML = items
      .map((item, index) => `
        <button class="portfolio-tile${layoutClass(item.layout)} reveal" style="--i:${index}" type="button" data-category="${item.category || ""}">
          <img src="${item.imageUrl}" alt="${item.alt || item.title || "Portfolio image"}" loading="lazy" />
          <span><strong>${item.title || "Portfolio"}</strong><small>${item.meta || ""}</small></span>
        </button>
      `)
      .join("");
    observeNewReveals(grid);
  } catch (error) {
    console.info("Using static portfolio fallback.", error);
  }
};

const renderFirebaseServices = async () => {
  const grid = document.querySelector(".services-suite__grid");
  if (!grid) return;
  try {
    const { getServices } = await import("./cms.js");
    const services = await getServices();
    if (!services.length) return;
    grid.innerHTML = services
      .map((service, index) => {
        const bullets = (service.bullets || []).map((item) => `<li>${item}</li>`).join("");
        const wideClass = index === 0 ? " service-scope-card--large" : index === services.length - 1 ? " service-scope-card--wide" : "";
        return `
          <article id="${service.slug || service.id}" class="service-scope-card${wideClass} reveal" style="--i: ${index}">
            <a href="${sitePath("contact/")}" aria-label="Discuss ${service.title || "service"}">
              <figure><img src="${service.imageUrl || fallbackServiceImage}" alt="${service.title || "Amit Interior service"}" loading="lazy" /></figure>
              <div class="service-scope-card__content">
                <span>${service.label || service.slug || "Service"}</span>
                <h3>${service.title || "Interior service"}</h3>
                <p>${service.description || ""}</p>
                <ul>${bullets}</ul>
                <strong>View scope ↗</strong>
              </div>
            </a>
          </article>
        `;
      })
      .join("");
    observeNewReveals(grid);
  } catch (error) {
    console.info("Using static services fallback.", error);
  }
};

renderFirebasePortfolio();
renderFirebaseServices();
