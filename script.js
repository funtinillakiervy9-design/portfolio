const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const yearNode = document.getElementById("year");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
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
    if (event.key === "ArrowRight") modalNext?.click();
    if (event.key === "ArrowLeft") modalPrev?.click();
  });
}
