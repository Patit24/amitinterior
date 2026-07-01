const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const preloader = document.querySelector(".preloader");
const count = document.querySelector(".preloader__count");

const unlockPage = () => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("ready");
  preloader?.setAttribute("aria-hidden", "true");
};

if (prefersReducedMotion) {
  unlockPage();
} else {
  const startedAt = performance.now();
  const loadingDuration = 2150;

  const updateCount = (now) => {
    const progress = Math.min((now - startedAt) / loadingDuration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    count.textContent = String(Math.round(eased * 100)).padStart(2, "0");
    if (progress < 1) requestAnimationFrame(updateCount);
  };

  requestAnimationFrame(updateCount);

  window.addEventListener("load", () => {
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(loadingDuration - elapsed, 0);

    window.setTimeout(() => {
      preloader.classList.add("is-complete");
      window.setTimeout(() => {
        preloader.classList.add("is-open");
        unlockPage();
        window.setTimeout(() => preloader.remove(), 1150);
      }, 430);
    }, wait);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -7% 0px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

const setMenuState = (open) => {
  menuToggle?.setAttribute("aria-expanded", String(open));
  mobileMenu?.setAttribute("aria-hidden", String(!open));
  mobileMenu?.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
};

menuToggle?.addEventListener("click", () => {
  setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

const finePointer = window.matchMedia("(pointer: fine)").matches;

if (!prefersReducedMotion && finePointer) {
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
    const interactive = event.target.closest("a, button, input, textarea, select, .portfolio-tile, .comparison");
    document.body.classList.toggle("cursor-hover", Boolean(interactive));
    document.body.classList.toggle("cursor-hero", Boolean(event.target.closest(".hero")));
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) {
      document.body.classList.remove("cursor-hover", "cursor-hero");
    }
  });

  cursorFrame = requestAnimationFrame(renderCursor);
  window.addEventListener("pagehide", () => cancelAnimationFrame(cursorFrame), { once: true });
}

const comparison = document.querySelector(".comparison");
const comparisonRange = document.querySelector("#comparison-range");
comparisonRange?.addEventListener("input", () => {
  comparison.style.setProperty("--position", `${comparisonRange.value}%`);
});

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
} = {}) => {
  const lines = [
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
  ].filter(Boolean);
  return lines.join("\n");
};

const redirectToWhatsApp = (details) => {
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(createWhatsAppMessage(details))}`;
  window.location.assign(url);
};

const form = document.querySelector(".consultation-form");
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = form.querySelector(".form-status");
  status.textContent = "Opening WhatsApp with your consultation request…";
  redirectToWhatsApp({
    name: fieldValue(form, "[name='name'], #name, #contact-name"),
    phone: fieldValue(form, "[name='phone'], #phone, #contact-phone"),
    email: fieldValue(form, "[name='email'], #email, #contact-email"),
    projectType: fieldValue(form, "[name='project-type'], #project-type, #contact-type"),
    message: fieldValue(form, "[name='message'], #message, #contact-message"),
    source: "Home page form",
  });
  form.reset();
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

const portfolioItems = [
  { src: "/Images/portfolio/portfolio-01.jpg", title: "Bedroom Media Wall", meta: "Wardrobe · TV unit", alt: "Bedroom media wall with wardrobe and TV unit" },
  { src: "/Images/portfolio/portfolio-02.jpg", title: "Soft Bedroom Suite", meta: "Neutral palette · Warm light", alt: "Neutral bedroom suite with bed, side table and warm lighting" },
  { src: "/Images/portfolio/portfolio-03.jpg", title: "Compact TV Console", meta: "Storage · Back panel", alt: "Compact TV console with storage and vertical wall panel" },
  { src: "/Images/portfolio/portfolio-04.jpg", title: "Staircase Lobby", meta: "Glass rail · Wall finish", alt: "Bright staircase lobby with glass railing and wall art" },
  { src: "/Images/portfolio/portfolio-05.jpg", title: "Vanity Storage", meta: "Mirror · Display shelves", alt: "Modern vanity storage with mirror and display shelves" },
  { src: "/Images/portfolio/portfolio-06.jpg", title: "Floating TV Unit", meta: "Panel · Drawer storage", alt: "Floating TV unit with drawers and soft neutral paneling" },
  { src: "/Images/portfolio/portfolio-07.jpg", title: "Living TV Wall", meta: "Fluted panel · Cove light", alt: "Living room TV wall with fluted panel and ceiling light" },
  { src: "/Images/portfolio/portfolio-08.jpg", title: "Bedroom Feature Wall", meta: "Arch detail · Ceiling fan", alt: "Bedroom feature wall with arched headboard and ceiling fan" },
  { src: "/Images/portfolio/portfolio-09.jpg", title: "Entrance Wall Finish", meta: "Stone texture · Door detail", alt: "Entrance wall with textured finish and geometric door detail" },
  { src: "/Images/portfolio/portfolio-10.jpg", title: "Study Wardrobe Unit", meta: "Desk · Open shelves", alt: "Compact study and wardrobe unit with open shelves" },
  { src: "/Images/portfolio/portfolio-11.jpg", title: "Daybed Nook", meta: "Storage · Soft seating", alt: "Soft daybed nook with wall storage and lighting" },
  { src: "/Images/portfolio/portfolio-12.jpg", title: "Open Living Room", meta: "Seating · Display wall", alt: "Open living room with sofa, display wall and dining connection" },
];

const filterButtons = [...document.querySelectorAll(".portfolio-filters button")];
const portfolioTiles = [...document.querySelectorAll(".portfolio-tile")];

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    portfolioTiles.forEach((tile) => {
      const categories = tile.dataset.category.split(" ");
      tile.classList.toggle("is-filtered-out", filter !== "all" && !categories.includes(filter));
    });
  });
});

const viewer = document.querySelector(".project-viewer");
const viewerImage = viewer?.querySelector(".project-viewer__image");
const viewerTitle = viewer?.querySelector("#viewer-title");
const viewerMeta = viewer?.querySelector(".project-viewer__meta");
const viewerCount = viewer?.querySelector(".project-viewer__count");
const viewerClose = viewer?.querySelector(".project-viewer__close");
const viewerPrev = viewer?.querySelector(".project-viewer__nav--prev");
const viewerNext = viewer?.querySelector(".project-viewer__nav--next");
let viewerIndex = 0;
let viewerTrigger = null;

const renderViewer = (index, animate = true) => {
  viewerIndex = (index + portfolioItems.length) % portfolioItems.length;
  const item = portfolioItems[viewerIndex];
  const applyItem = () => {
    viewerImage.src = item.src;
    viewerImage.alt = item.alt;
    viewerTitle.textContent = item.title;
    viewerMeta.textContent = item.meta;
    viewerCount.textContent = `${String(viewerIndex + 1).padStart(2, "0")} / ${portfolioItems.length}`;
    viewer.classList.remove("is-changing");
  };

  if (animate && !prefersReducedMotion) {
    viewer.classList.add("is-changing");
    window.setTimeout(applyItem, 220);
  } else {
    applyItem();
  }
};

const openViewer = (index, trigger) => {
  viewerTrigger = trigger;
  renderViewer(index, false);
  viewer.classList.add("is-open");
  viewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("portfolio-open");
  window.setTimeout(() => viewerClose.focus(), prefersReducedMotion ? 0 : 300);
};

const closeViewer = () => {
  viewer.classList.remove("is-open");
  viewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("portfolio-open");
  viewerTrigger?.focus();
};

portfolioTiles.forEach((tile) => {
  tile.addEventListener("click", () => openViewer(Number(tile.dataset.index), tile));
});

viewerClose?.addEventListener("click", closeViewer);
viewerPrev?.addEventListener("click", () => renderViewer(viewerIndex - 1));
viewerNext?.addEventListener("click", () => renderViewer(viewerIndex + 1));

document.addEventListener("keydown", (event) => {
  if (!viewer?.classList.contains("is-open")) return;
  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowLeft") renderViewer(viewerIndex - 1);
  if (event.key === "ArrowRight") renderViewer(viewerIndex + 1);
});

const showroom = document.querySelector(".showroom");
const hero = document.querySelector(".hero");
const media = document.querySelector(".hero__media");
const sun = document.querySelector(".hero__sun");
const materialCards = [...document.querySelectorAll(".hero__material-card")];
const scenes = [...document.querySelectorAll(".room-scene")];
const roomIndex = document.querySelector(".room-status__index");
const roomName = document.querySelector(".room-status strong");
const progressBar = document.querySelector(".room-progress span");
let activeScene = 0;
let scrollProgress = 0;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let ticking = false;

const updateShowroom = () => {
  if (!showroom) return;
  const start = showroom.offsetTop;
  const distance = Math.max(showroom.offsetHeight - window.innerHeight, 1);
  scrollProgress = Math.min(Math.max((window.scrollY - start) / distance, 0), 1);
  const nextScene = Math.min(Math.floor(scrollProgress * scenes.length), scenes.length - 1);

  if (nextScene !== activeScene) {
    scenes[activeScene]?.classList.remove("is-active");
    scenes[nextScene]?.classList.add("is-active");
    activeScene = nextScene;
    roomIndex.textContent = String(nextScene + 1).padStart(2, "0");
    roomName.textContent = scenes[nextScene].dataset.room;
  }

  progressBar.style.transform = `scaleY(${scrollProgress})`;
  header?.classList.toggle("is-scrolled", window.scrollY > 70);
  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateShowroom);
  },
  { passive: true },
);

updateShowroom();

if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  let frame;

  const renderParallax = () => {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    const horizontalTravel = currentX * -48;
    const verticalTravel = currentY * -12 + scrollProgress * -18;
    media.style.transform = `translate3d(${horizontalTravel}px, ${verticalTravel}px, 0) scale(1.04)`;
    hero.style.setProperty("--hero-x", `${58 + currentX * 18}%`);
    hero.style.setProperty("--hero-y", `${44 + currentY * 18}%`);
    sun.style.transform = `translate3d(${currentX * 22}px, ${currentY * 12}px, 0) rotate(14deg)`;
    materialCards.forEach((card, index) => {
      const depth = index === 0 ? 18 : -14;
      const lift = index === 0 ? -scrollProgress * 22 : scrollProgress * 16;
      card.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth * 0.55 + lift}px, 0)`;
    });
    frame = requestAnimationFrame(renderParallax);
  };

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width - 0.5;
    targetY = (event.clientY - rect.top) / rect.height - 0.5;
  });

  hero.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  frame = requestAnimationFrame(renderParallax);
  window.addEventListener("pagehide", () => cancelAnimationFrame(frame), { once: true });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * 0.08}px, ${y * 0.1}px, 0)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "translate3d(0, 0, 0)";
    });
  });
}
