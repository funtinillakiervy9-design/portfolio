const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const yearNode = document.getElementById("year");
const scrollProgressFill = document.querySelector(".scroll-progress-fill");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (scrollProgressFill) {
  const updateScrollProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
    scrollProgressFill.style.transform = `scaleX(${progress})`;
  };

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  window.addEventListener("load", updateScrollProgress, { passive: true });
}

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!expanded));
    menuBtn.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
    }
  });
}

const navSectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const trackedSections = Array.from(navSectionLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (navSectionLinks.length && trackedSections.length) {
  const setActiveLink = (id) => {
    navSectionLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const syncActiveFromScroll = () => {
    const headerOffset = 120;
    const scrollY = window.scrollY + headerOffset;
    let currentSectionId = trackedSections[0]?.id;
    const nearPageBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    trackedSections.forEach((section) => {
      if (section.offsetTop <= scrollY) {
        currentSectionId = section.id;
      }
    });

    if (nearPageBottom) {
      currentSectionId = trackedSections[trackedSections.length - 1]?.id || currentSectionId;
    }

    if (currentSectionId) {
      setActiveLink(currentSectionId);
    }
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        setActiveLink(visible[0].target.id);
      }
    },
    {
      threshold: [0.35, 0.55, 0.75],
      rootMargin: "-30% 0px -45% 0px"
    }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
  navSectionLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      if (targetId) {
        setActiveLink(targetId);
      }
    });
  });
  navSectionLinks[0].classList.add("active");
  syncActiveFromScroll();
  window.addEventListener("load", syncActiveFromScroll, { passive: true });
  window.addEventListener("hashchange", syncActiveFromScroll, { passive: true });
  window.addEventListener("scroll", syncActiveFromScroll, { passive: true });
}

const sections = document.querySelectorAll(".reveal");
sections.forEach((section, idx) => {
  section.style.transitionDelay = `${idx * 90}ms`;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

sections.forEach((section) => observer.observe(section));

const timelineAnimateItems = document.querySelectorAll(".timeline-animate-item");
if (timelineAnimateItems.length) {
  const timelineObserver = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target;
        const siblings = Array.from(item.parentElement?.querySelectorAll(".timeline-animate-item") || []);
        const index = Math.max(0, siblings.indexOf(item));
        item.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
        item.classList.add("is-visible");
        currentObserver.unobserve(item);
      });
    },
    { threshold: 0.2 }
  );

  timelineAnimateItems.forEach((item) => timelineObserver.observe(item));
}

const counters = document.querySelectorAll(".count-value");
if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        const target = Number(node.dataset.target || 0);
        const startTime = performance.now();
        const duration = 900;

        const tick = (now) => {
          const elapsed = Math.min((now - startTime) / duration, 1);
          const value = Math.round(target * elapsed);
          node.textContent = String(value);
          if (elapsed < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(node);
      });
    },
    { threshold: 0.55 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const heroSection = document.querySelector(".hero");
if (heroSection) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const allowParallax = !prefersReducedMotion && window.innerWidth > 980;
  let pointerX = 0;
  let pointerY = 0;
  let scrollShift = 0;
  let rafId = null;

  const renderParallax = () => {
    heroSection.style.setProperty("--hero-parallax-x", `${pointerX.toFixed(2)}px`);
    heroSection.style.setProperty("--hero-parallax-y", `${pointerY.toFixed(2)}px`);
    heroSection.style.setProperty("--hero-scroll-shift", `${scrollShift.toFixed(2)}px`);
    rafId = null;
  };

  const queueRender = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(renderParallax);
  };

  if (allowParallax) {
    heroSection.addEventListener("pointermove", (event) => {
      const rect = heroSection.getBoundingClientRect();
      const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (event.clientY - rect.top) / rect.height - 0.5;
      pointerX = xRatio * 26;
      pointerY = yRatio * 18;
      queueRender();
    });

    heroSection.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
      queueRender();
    });

    const handleHeroScroll = () => {
      const rect = heroSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0), 1);
      scrollShift = (progress - 0.5) * 20;
      queueRender();
    };

    window.addEventListener("scroll", handleHeroScroll, { passive: true });
    handleHeroScroll();
  } else {
    heroSection.style.setProperty("--hero-parallax-x", "0px");
    heroSection.style.setProperty("--hero-parallax-y", "0px");
    heroSection.style.setProperty("--hero-scroll-shift", "0px");
  }
}

const sliders = document.querySelectorAll("[data-slider]");

sliders.forEach((slider) => {
  const track = slider.querySelector(".project-slider-track");
  const slides = slider.querySelectorAll(".project-image");
  const prev = slider.querySelector(".slider-prev");
  const next = slider.querySelector(".slider-next");

  if (!track || slides.length === 0 || !prev || !next) {
    return;
  }

  let index = 0;
  const max = slides.length;
  const dotsWrap = document.createElement("div");
  dotsWrap.className = "slider-dots";
  const dots = [];

  slides.forEach((_, dotIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Go to slide ${dotIndex + 1}`);
    dot.addEventListener("click", () => {
      index = dotIndex;
      render();
    });
    dots.push(dot);
    dotsWrap.appendChild(dot);
  });

  slider.appendChild(dotsWrap);

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  const goNext = () => {
    index = (index + 1) % max;
    render();
  };

  const goPrev = () => {
    index = (index - 1 + max) % max;
    render();
  };

  next.addEventListener("click", () => {
    goNext();
  });

  prev.addEventListener("click", () => {
    goPrev();
  });

  render();
});

const modal = document.getElementById("project-modal");
if (modal) {
  const modalImage = document.getElementById("project-modal-image");
  const modalTitle = document.getElementById("project-modal-title");
  const modalDesc = document.getElementById("project-modal-desc");
  const modalTags = document.getElementById("project-modal-tags");
  const modalPrev = modal.querySelector(".project-modal-nav.prev");
  const modalNext = modal.querySelector(".project-modal-nav.next");
  const modalCloseItems = modal.querySelectorAll("[data-modal-close]");
  const projectCards = document.querySelectorAll("[data-project-card]");

  let modalImages = [];
  let modalIndex = 0;

  const renderModal = () => {
    if (!modalImage || modalImages.length === 0) return;
    modalImage.src = modalImages[modalIndex];
  };

  const openModal = (card) => {
    modalImages = Array.from(card.querySelectorAll(".project-image")).map((img) => img.src);
    modalIndex = 0;
    modal.classList.toggle("single-image", modalImages.length <= 1);
    if (modalTitle) modalTitle.textContent = card.querySelector("h3")?.textContent || "";
    if (modalDesc) modalDesc.textContent = card.querySelector("p")?.textContent || "";
    if (modalTags) {
      modalTags.innerHTML = "";
      card.querySelectorAll(".tags li").forEach((tag) => {
        const node = document.createElement("span");
        node.textContent = tag.textContent || "";
        modalTags.appendChild(node);
      });
    }
    renderModal();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.classList.remove("single-image");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  projectCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      const blocker = event.target.closest(".slider-btn, .slider-dot, .project-modal-nav");
      if (blocker) return;
      openModal(card);
    });
  });

  modalCloseItems.forEach((node) => node.addEventListener("click", closeModal));

  modalPrev?.addEventListener("click", () => {
    if (!modalImages.length) return;
    modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
    renderModal();
  });

  modalNext?.addEventListener("click", () => {
    if (!modalImages.length) return;
    modalIndex = (modalIndex + 1) % modalImages.length;
    renderModal();
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("open")) return;
    if (event.key === "Escape") closeModal();
    if (modalImages.length > 1) {
      if (event.key === "ArrowRight") modalNext?.click();
      if (event.key === "ArrowLeft") modalPrev?.click();
    }
  });
}
