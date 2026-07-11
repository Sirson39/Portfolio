const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navbar = document.querySelector(".navbar");
const homeSection = document.getElementById("home");
const progressFill = document.getElementById("progress-fill");
const cursor = document.querySelector(".cursor");
const cursorTrail = document.querySelector(".cursor-trail");
const rotator = document.getElementById("rotator");
const themeToggle = document.querySelector(".theme-toggle");
const backToTop = document.querySelector(".back-to-top");
const contactForm = document.getElementById("contact-form");
const contactFormStatus = document.querySelector(".contact-form-status");
let contactStatusTimer = null;
const THEME_STORAGE_KEY = "portfolio-theme";
const DEFAULT_THEME = "dark";

const roles = [
  "AI & ML Integrator",
  "Python / Django Developer",
  "React Frontend Builder",
  "C# / .NET Builder"
];

let roleIndex = 0;
let typingTimer = null;
let deletingTimer = null;

function typeRole(text, index = 0) {
  if (!rotator) return;
  if (deletingTimer) window.clearTimeout(deletingTimer);
  rotator.textContent = text.slice(0, index);

  if (index < text.length) {
    typingTimer = window.setTimeout(() => typeRole(text, index + 1), 42);
    return;
  }

  deletingTimer = window.setTimeout(() => eraseRole(text), 2500);
}

function eraseRole(text) {
  if (!rotator) return;
  if (typingTimer) window.clearTimeout(typingTimer);
  const current = rotator.textContent || "";

  if (current.length > 0) {
    rotator.textContent = current.slice(0, -1);
    deletingTimer = window.setTimeout(() => eraseRole(text), 24);
    return;
  }

  roleIndex = (roleIndex + 1) % roles.length;
  window.setTimeout(() => typeRole(roles[roleIndex]), 180);
}

if (rotator) {
  if (prefersReducedMotion) {
    rotator.textContent = roles[0];
  } else {
    rotator.textContent = "";
    typeRole(roles[roleIndex]);
  }
}

function getThemeIcon(theme) {
  if (theme === "light") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M21 12.8A8.8 8.8 0 1 1 11.2 3a7.2 7.2 0 0 0 9.8 9.8Z"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="3.5"></circle>
      <path d="M12 2.5v2.2"></path>
      <path d="M12 19.3v2.2"></path>
      <path d="M4.9 4.9l1.6 1.6"></path>
      <path d="M17.5 17.5l1.6 1.6"></path>
      <path d="M2.5 12h2.2"></path>
      <path d="M19.3 12h2.2"></path>
      <path d="M4.9 19.1l1.6-1.6"></path>
      <path d="M17.5 6.5l1.6-1.6"></path>
    </svg>
  `;
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : DEFAULT_THEME;
  document.body.dataset.theme = nextTheme;

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "light"));
    themeToggle.setAttribute(
      "aria-label",
      nextTheme === "light" ? "Switch to dark mode" : "Switch to light mode"
    );
    const icon = themeToggle.querySelector(".theme-toggle-icon");
    if (icon) {
      icon.innerHTML = getThemeIcon(nextTheme);
    }
  }
}

function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function setStoredTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors in private or restricted browsing modes.
  }
}

applyTheme(getStoredTheme());

themeToggle?.addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme === "light" ? "light" : DEFAULT_THEME;
  const nextTheme = currentTheme === "light" ? DEFAULT_THEME : "light";
  applyTheme(nextTheme);
  setStoredTheme(nextTheme);
});

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (targetId && targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        navLinks.classList.remove("open");
        navToggle?.setAttribute("aria-expanded", "false");
      }
    }
  });
});

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

const reveals = document.querySelectorAll(".reveal, .reveal-item");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);
reveals.forEach((node) => revealObserver.observe(node));

const eduTimeline = document.querySelector("[data-edu-timeline]");
if (eduTimeline) {
  const eduCards = [...eduTimeline.querySelectorAll("[data-edu-card]")];
  const eduNodes = [...eduTimeline.querySelectorAll("[data-edu-node]")];
  const eduRail = eduTimeline.querySelector(".edu-rail");

  function syncEducationTimeline() {
    if (!eduRail || eduCards.length === 0 || eduCards.length !== eduNodes.length) return;

    const timelineRect = eduTimeline.getBoundingClientRect();
    const centers = eduCards.map((card) => {
      const rect = card.getBoundingClientRect();
      return rect.top - timelineRect.top + rect.height / 2;
    });

    eduNodes.forEach((node, index) => {
      node.style.top = `${centers[index]}px`;
    });

    const firstCenter = centers[0];
    const lastCenter = centers[centers.length - 1];
    eduRail.style.setProperty("--edu-line-top", `${firstCenter}px`);
    eduRail.style.setProperty("--edu-line-bottom", `${Math.max(0, eduTimeline.offsetHeight - lastCenter)}px`);
  }

  const scheduleEducationSync = () => window.requestAnimationFrame(syncEducationTimeline);

  const eduObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = eduCards.indexOf(entry.target);
        if (index === -1) return;
        eduNodes[index].classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { threshold: 0.45, rootMargin: "0px 0px -12% 0px" }
  );

  eduCards.forEach((card) => eduObserver.observe(card));

  eduCards.forEach((card) => {
    card.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform") {
        scheduleEducationSync();
      }
    });
  });

  if (typeof ResizeObserver !== "undefined") {
    const eduResizeObserver = new ResizeObserver(scheduleEducationSync);
    eduResizeObserver.observe(eduTimeline);
    eduCards.forEach((card) => eduResizeObserver.observe(card));
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleEducationSync).catch(() => {});
  }
  window.addEventListener("load", scheduleEducationSync, { once: true });
  window.addEventListener("resize", scheduleEducationSync);
  scheduleEducationSync();
}

const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.getAttribute("data-count") || "0");
      const start = 0;
      const duration = 1300;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(start + (target - start) * easeOutCubic(progress));
        el.textContent = `${value}+`;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((node) => counterObserver.observe(node));

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

const sections = [...document.querySelectorAll("main section[id]")];
const navItems = [...document.querySelectorAll(".nav-link")];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navItems.forEach((item) => item.classList.toggle("active", item.getAttribute("href") === `#${entry.target.id}`));
    });
  },
  { threshold: 0.55 }
);
sections.forEach((section) => sectionObserver.observe(section));

function setProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;
  progressFill.style.transform = `scaleX(${ratio})`;
  const homeLimit = homeSection ? homeSection.offsetTop + homeSection.offsetHeight - 1 : 80;
  navbar?.classList.toggle("scrolled", scrollTop > homeLimit);
  backToTop?.classList.toggle("visible", scrollTop > 320);
}
window.addEventListener("scroll", setProgress, { passive: true });
setProgress();

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitBtn = contactForm.querySelector(".contact-clean-submit");
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  if (contactStatusTimer) {
    window.clearTimeout(contactStatusTimer);
    contactStatusTimer = null;
  }

  contactFormStatus.textContent = "Sending message...";
  contactFormStatus.classList.remove("is-error", "is-success");
  submitBtn.disabled = true;

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || "Message could not be sent.");
    }

    contactForm.reset();
    contactFormStatus.textContent = "Message sent successfully. I’ll get back to you soon.";
    contactFormStatus.classList.add("is-success");
    contactStatusTimer = window.setTimeout(() => {
      contactFormStatus.textContent = "";
      contactFormStatus.classList.remove("is-success");
    }, 3500);
  } catch (error) {
    contactFormStatus.textContent = error?.message || "Sorry, the message could not be sent right now.";
    contactFormStatus.classList.add("is-error");
    contactStatusTimer = window.setTimeout(() => {
      contactFormStatus.textContent = "";
      contactFormStatus.classList.remove("is-error");
    }, 4500);
  } finally {
    submitBtn.disabled = false;
  }
});

if (!prefersReducedMotion) {
  const moveElements = document.querySelectorAll("[data-magnetic]");
  moveElements.forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`;
    });
    element.addEventListener("mouseleave", () => {
      element.style.transform = "";
    });
  });
}

document.querySelectorAll(".tilt-card").forEach((card) => {
  if (prefersReducedMotion) return;
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 10;
    const rotateY = (x - 0.5) * 12;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

const canvas = document.getElementById("star-canvas");
const ctx = canvas.getContext("2d");
let stars = [];
let width = 0;
let height = 0;
let mouse = { x: 0, y: 0, active: false };

function resizeCanvas() {
  width = canvas.width = window.innerWidth * window.devicePixelRatio;
  height = canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  createStars();
}

function createStars() {
  const count = Math.round((window.innerWidth * window.innerHeight) / 12000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 1.4 + 0.2,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2
  }));
}

function drawStars() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.92)";

  stars.forEach((star) => {
    if (!prefersReducedMotion) {
      star.x += star.vx * star.z;
      star.y += star.vy * star.z;

      if (mouse.active) {
        const dx = star.x - mouse.x;
        const dy = star.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.max(0, 1 - dist / (240 * window.devicePixelRatio));
        star.x += (dx / dist) * pull * 0.55;
        star.y += (dy / dist) * pull * 0.55;
      }
    }

    if (star.x < -10) star.x = width + 10;
    if (star.x > width + 10) star.x = -10;
    if (star.y < -10) star.y = height + 10;
    if (star.y > height + 10) star.y = -10;

    const size = star.r * star.z * window.devicePixelRatio;
    ctx.beginPath();
    ctx.shadowBlur = 18 * star.z;
    ctx.shadowColor = "rgba(124, 246, 255, 0.35)";
    ctx.globalAlpha = 0.2 + star.z * 0.5;
    ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}

window.addEventListener("resize", resizeCanvas, { passive: true });
window.addEventListener(
  "mousemove",
  (event) => {
    mouse = {
      x: event.clientX * window.devicePixelRatio,
      y: event.clientY * window.devicePixelRatio,
      active: true
    };

    if (cursor && cursorTrail) {
      cursor.style.opacity = "1";
      cursorTrail.style.opacity = "1";
      cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
    }
  },
  { passive: true }
);

window.addEventListener("mouseleave", () => {
  mouse.active = false;
  if (cursor && cursorTrail) {
    cursor.style.opacity = "0";
    cursorTrail.style.opacity = "0";
  }
});

window.addEventListener(
  "scroll",
  () => {
    document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
  },
  { passive: true }
);

resizeCanvas();
drawStars();

if (prefersReducedMotion) {
  document.body.classList.add("reduce-motion");
  cursor?.remove();
  cursorTrail?.remove();
}

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(".skb-fill").forEach((bar, index) => {
        setTimeout(() => bar.classList.add("ready"), index * 60);
      });
      skillObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".skc").forEach((card) => skillObserver.observe(card));

function filterSkills(cat, el) {
  document.querySelectorAll(".sft").forEach((tab) => tab.classList.remove("on"));
  if (el) el.classList.add("on");

  document.querySelectorAll(".skc").forEach((card) => {
    const visible = cat === "all" || card.dataset.cat === cat;
    card.style.display = visible ? "" : "none";
    card.querySelectorAll(".skb-fill").forEach((bar) => bar.classList.remove("ready"));
  });

  setTimeout(() => {
    document.querySelectorAll('.skc:not([style*="display: none"]) .skb-fill').forEach((bar, index) => {
      setTimeout(() => bar.classList.add("ready"), index * 60);
    });
  }, 80);
}

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
  });
});

const projectCarousel = document.querySelector("[data-project-carousel]");

if (projectCarousel) {
  const track = projectCarousel.querySelector(".project-track");
  const cards = [...projectCarousel.querySelectorAll(".project-card")];
  const prevBtn = projectCarousel.querySelector(".project-nav--prev");
  const nextBtn = projectCarousel.querySelector(".project-nav--next");
  const dotsWrap = projectCarousel.querySelector(".project-dots");
  const projectWindow = projectCarousel.querySelector(".project-window");

  let currentIndex = 0;
  let lastWheelNavAt = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;

  function getVisibleCount() {
    const visible = getComputedStyle(track).getPropertyValue("--visible");
    return Number.parseInt(visible, 10) || 3;
  }

  function getGap() {
    const gap = getComputedStyle(track).gap;
    return Number.parseFloat(gap) || 0;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCount());
  }

  function buildDots() {
    dotsWrap.innerHTML = "";

    const totalDots = getMaxIndex() + 1;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "project-dot";
      dot.setAttribute("aria-label", `Go to project slide ${i + 1}`);

      dot.addEventListener("click", () => {
        currentIndex = i;
        updateCarousel();
      });

      dotsWrap.appendChild(dot);
    }
  }

  function updateCarousel() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const moveX = currentIndex * (cardWidth + getGap());

    track.style.transform = `translateX(-${moveX}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === getMaxIndex();

    [...dotsWrap.children].forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
    updateCarousel();
  });

  function goNext() {
    currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
    updateCarousel();
  }

  function goPrev() {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  }

  if (projectWindow) {
    projectWindow.addEventListener(
      "wheel",
      (event) => {
        const now = Date.now();
        if (now - lastWheelNavAt < 450) return;

        const absX = Math.abs(event.deltaX);
        const absY = Math.abs(event.deltaY);
        const primaryDelta = absX > absY ? event.deltaX : event.deltaY;

        if (Math.abs(primaryDelta) < 18) return;

        if (primaryDelta > 0) {
          goNext();
        } else {
          goPrev();
        }

        lastWheelNavAt = now;
        event.preventDefault();
      },
      { passive: false }
    );

    projectWindow.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) return;
      touchActive = true;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    });

    projectWindow.addEventListener(
      "touchmove",
      (event) => {
        if (!touchActive || event.touches.length !== 1) return;

        const dx = event.touches[0].clientX - touchStartX;
        const dy = event.touches[0].clientY - touchStartY;

        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
          event.preventDefault();
        }
      },
      { passive: false }
    );

    projectWindow.addEventListener("touchend", (event) => {
      if (!touchActive) return;
      touchActive = false;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;

      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    });
  }

  window.addEventListener("resize", () => {
    currentIndex = Math.min(currentIndex, getMaxIndex());
    buildDots();
    updateCarousel();
  });

  buildDots();
  updateCarousel();
}
