const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const menuBtn = qs('.menu-btn');
const navLinks = qs('.nav-links');
const yearNode = qs('#year');
const scrollProgressFill = qs('.scroll-progress-fill');

if (yearNode) yearNode.textContent = new Date().getFullYear();

if (scrollProgressFill) {
  const updateScrollProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
    scrollProgressFill.style.transform = `scaleX(${progress})`;
  };

  updateScrollProgress();
  ['scroll', 'resize', 'load'].forEach((e) => addEventListener(e, updateScrollProgress, { passive: true }));
}

if (menuBtn && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  };

  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!expanded));
    menuBtn.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    navLinks.classList.toggle('open');
  });

  qsa('a', navLinks).forEach((link) => link.addEventListener('click', closeMenu));
  addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
}

const navSectionLinks = qsa('.nav-links a[href^="#"]');
const trackedSections = navSectionLinks.map((link) => qs(link.getAttribute('href'))).filter(Boolean);

if (navSectionLinks.length && trackedSections.length) {
  const setActiveLink = (id) => {
    navSectionLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const syncActiveFromScroll = () => {
    const marker = scrollY + 120;
    let current = trackedSections[0]?.id;

    trackedSections.forEach((section) => {
      if (section.offsetTop <= marker) current = section.id;
    });

    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
      current = trackedSections.at(-1)?.id || current;
    }

    if (current) setActiveLink(current);
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveLink(visible.target.id);
    },
    { threshold: [0.35, 0.55, 0.75], rootMargin: '-30% 0px -45% 0px' }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
  navSectionLinks.forEach((link) => link.addEventListener('click', () => {
    const id = link.getAttribute('href')?.slice(1);
    if (id) setActiveLink(id);
  }));

  navSectionLinks[0].classList.add('active');
  syncActiveFromScroll();
  ['load', 'hashchange', 'scroll'].forEach((e) => addEventListener(e, syncActiveFromScroll, { passive: true }));
}

const sections = qsa('.reveal');
sections.forEach((section, i) => {
  section.style.transitionDelay = `${i * 90}ms`;
});

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }),
  { threshold: 0.15 }
);
sections.forEach((section) => revealObserver.observe(section));

const timelineAnimateItems = qsa('.timeline-animate-item');
if (timelineAnimateItems.length) {
  const timelineObserver = new IntersectionObserver(
    (entries, currentObserver) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      const siblings = qsa('.timeline-animate-item', item.parentElement || document);
      item.style.transitionDelay = `${Math.min(Math.max(0, siblings.indexOf(item)) * 90, 360)}ms`;
      item.classList.add('is-visible');
      currentObserver.unobserve(item);
    }),
    { threshold: 0.2 }
  );

  timelineAnimateItems.forEach((item) => timelineObserver.observe(item));
}

const counters = qsa('.count-value');
if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.target || 0);
      const start = performance.now();
      const duration = 900;

      const tick = (now) => {
        const elapsed = Math.min((now - start) / duration, 1);
        node.textContent = String(Math.round(target * elapsed));
        if (elapsed < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(node);
    }),
    { threshold: 0.55 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const heroSection = qs('.hero');
if (heroSection) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const allowParallax = !reduced && innerWidth > 980;
  let pointerX = 0;
  let pointerY = 0;
  let scrollShift = 0;
  let rafId = null;

  const renderParallax = () => {
    heroSection.style.setProperty('--hero-parallax-x', `${pointerX.toFixed(2)}px`);
    heroSection.style.setProperty('--hero-parallax-y', `${pointerY.toFixed(2)}px`);
    heroSection.style.setProperty('--hero-scroll-shift', `${scrollShift.toFixed(2)}px`);
    rafId = null;
  };

  const queueRender = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(renderParallax);
  };

  if (allowParallax) {
    heroSection.addEventListener('pointermove', (event) => {
      const rect = heroSection.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 26;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
      queueRender();
    });

    heroSection.addEventListener('pointerleave', () => {
      pointerX = 0;
      pointerY = 0;
      queueRender();
    });

    const handleHeroScroll = () => {
      const rect = heroSection.getBoundingClientRect();
      const progress = Math.min(Math.max((innerHeight - rect.top) / (innerHeight + rect.height), 0), 1);
      scrollShift = (progress - 0.5) * 20;
      queueRender();
    };

    addEventListener('scroll', handleHeroScroll, { passive: true });
    handleHeroScroll();
  } else {
    ['--hero-parallax-x', '--hero-parallax-y', '--hero-scroll-shift'].forEach((key) => {
      heroSection.style.setProperty(key, '0px');
    });
  }
}

qsa('[data-slider]').forEach((slider) => {
  const track = qs('.project-slider-track', slider);
  const slides = qsa('.project-image', slider);
  const prev = qs('.slider-prev', slider);
  const next = qs('.slider-next', slider);
  if (!track || !slides.length || !prev || !next) return;

  let index = 0;
  const max = slides.length;
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'slider-dots';

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    qsa('.slider-dot', dotsWrap).forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => {
      index = i;
      render();
    });
    dotsWrap.appendChild(dot);
  });

  next.addEventListener('click', () => {
    index = (index + 1) % max;
    render();
  });

  prev.addEventListener('click', () => {
    index = (index - 1 + max) % max;
    render();
  });

  slider.appendChild(dotsWrap);
  render();
});

const modal = qs('#project-modal');
if (modal) {
  const modalImage = qs('#project-modal-image');
  const modalTitle = qs('#project-modal-title');
  const modalDesc = qs('#project-modal-desc');
  const modalTags = qs('#project-modal-tags');
  const modalPrev = qs('.project-modal-nav.prev', modal);
  const modalNext = qs('.project-modal-nav.next', modal);

  let modalImages = [];
  let modalIndex = 0;

  const renderModal = () => {
    if (!modalImage || !modalImages.length) return;
    modalImage.src = modalImages[modalIndex];
  };

  const closeModal = () => {
    modal.classList.remove('open', 'single-image');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  const openModal = (card) => {
    modalImages = qsa('.project-image', card).map((img) => img.src);
    modalIndex = 0;
    modal.classList.toggle('single-image', modalImages.length <= 1);
    if (modalTitle) modalTitle.textContent = qs('h3', card)?.textContent || '';
    if (modalDesc) modalDesc.textContent = qs('p', card)?.textContent || '';
    if (modalTags) {
      modalTags.innerHTML = '';
      qsa('.tags li', card).forEach((tag) => {
        const node = document.createElement('span');
        node.textContent = tag.textContent || '';
        modalTags.appendChild(node);
      });
    }
    renderModal();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  qsa('[data-project-card]').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.slider-btn, .slider-dot, .project-modal-nav')) return;
      openModal(card);
    });
  });

  qsa('[data-modal-close]', modal).forEach((node) => node.addEventListener('click', closeModal));

  modalPrev?.addEventListener('click', () => {
    if (!modalImages.length) return;
    modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
    renderModal();
  });

  modalNext?.addEventListener('click', () => {
    if (!modalImages.length) return;
    modalIndex = (modalIndex + 1) % modalImages.length;
    renderModal();
  });

  addEventListener('keydown', (event) => {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') closeModal();
    if (modalImages.length > 1) {
      if (event.key === 'ArrowRight') modalNext?.click();
      if (event.key === 'ArrowLeft') modalPrev?.click();
    }
  });
}
