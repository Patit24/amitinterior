const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
