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

if (!reduced && window.matchMedia("(pointer: fine)").matches) {
  const cursor = document.createElement("div");
  cursor.className = "site-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);
  document.body.classList.add("has-custom-cursor");

  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let renderedCursorX = cursorX;
  let renderedCursorY = cursorY;
  let cursorFrame;

  const renderCursor = () => {
    renderedCursorX += (cursorX - renderedCursorX) * 0.18;
    renderedCursorY += (cursorY - renderedCursorY) * 0.18;
    cursor.style.transform = `translate3d(${renderedCursorX}px, ${renderedCursorY}px, 0) translate(-50%, -50%) scale(var(--cursor-scale, 1))`;
    cursorFrame = requestAnimationFrame(renderCursor);
  };

  window.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    document.body.classList.add("cursor-ready");
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    const interactive = event.target.closest("a, button, input, textarea, select, .portfolio-tile, .service-icon-card");
    document.body.classList.toggle("cursor-hover", Boolean(interactive));
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) document.body.classList.remove("cursor-hover");
  });

  cursorFrame = requestAnimationFrame(renderCursor);
  window.addEventListener("pagehide", () => cancelAnimationFrame(cursorFrame), { once: true });
}

const whatsappNumber = "917003033961";
const fieldValue = (form, selector) => form.querySelector(selector)?.value?.trim() || "";

const createWhatsAppMessage = ({
  name = "",
  phone = "",
  email = "",
  projectType = "",
  location = "",
  message = "",
  source = "Website consultation form",
} = {}) => [
  "Hello Amit Interior,",
  "",
  "I want to book a consultation.",
  `Source: ${source}`,
  name && `Name: ${name}`,
  phone && `Phone: ${phone}`,
  email && `Email: ${email}`,
  projectType && `Project type: ${projectType}`,
  location && `Location: ${location}`,
  message && `Project details: ${message}`,
].filter(Boolean).join("\n");

const redirectToWhatsApp = (details) => {
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(createWhatsAppMessage(details))}`;
  window.location.assign(url);
};

document.querySelectorAll(".consultation-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelector(".form-status").textContent = "Opening WhatsApp with your consultation request…";
    redirectToWhatsApp({
      name: fieldValue(form, "[name='name'], #contact-name"),
      phone: fieldValue(form, "[name='phone'], #contact-phone"),
      email: fieldValue(form, "[name='email'], #contact-email"),
      projectType: fieldValue(form, "[name='project-type'], #contact-type"),
      message: fieldValue(form, "[name='message'], #contact-message"),
      source: "Contact page form",
    });
    form.reset();
  });
});

const openConsultationModal = () => {
  let modal = document.querySelector(".booking-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "booking-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="booking-modal__backdrop" data-booking-close></div>
      <section class="booking-modal__panel" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button class="booking-modal__close" type="button" data-booking-close aria-label="Close consultation form">×</button>
        <p class="eyebrow"><span></span> Book consultation</p>
        <h2 id="booking-title">Tell us about your dream home.</h2>
        <form class="booking-form">
          <label>Name<input name="name" autocomplete="name" required /></label>
          <label>Phone<input name="phone" type="tel" autocomplete="tel" required /></label>
          <label>Location<input name="location" autocomplete="street-address" placeholder="Kolkata, Howrah, etc." /></label>
          <label>Project type<select name="project-type"><option>Full home interior</option><option>Modular kitchen</option><option>Bedroom / furniture</option><option>Renovation</option><option>Office / commercial</option></select></label>
          <label class="booking-form__wide">Project details<textarea name="message" rows="3" placeholder="Tell us your room size, budget, timeline or idea."></textarea></label>
          <button class="contact__cta booking-form__submit" type="submit"><span>Send to WhatsApp</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" /></svg></button>
        </form>
      </section>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-booking-close]")) {
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("booking-open");
      }
    });
    modal.querySelector(".booking-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const bookingForm = event.currentTarget;
      redirectToWhatsApp({
        name: fieldValue(bookingForm, "[name='name']"),
        phone: fieldValue(bookingForm, "[name='phone']"),
        location: fieldValue(bookingForm, "[name='location']"),
        projectType: fieldValue(bookingForm, "[name='project-type']"),
        message: fieldValue(bookingForm, "[name='message']"),
        source: "Book consultation popup",
      });
    });
  }
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("booking-open");
  modal.querySelector("[name='name']")?.focus();
};

document.querySelectorAll("a").forEach((link) => {
  const label = link.textContent.trim().toLowerCase();
  if (!/(book consultation|start brief)/.test(label)) return;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openConsultationModal();
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
