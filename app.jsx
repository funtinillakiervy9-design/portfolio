const { useEffect } = React;

function PortfolioApp() {
  useEffect(() => {
    const qs = (s, p = document) => p.querySelector(s);
    const qsa = (s, p = document) => [...p.querySelectorAll(s)];

    const menuBtn = qs('.menu-btn');
    const navLinks = qs('.nav-links');
    const scrollProgressFill = qs('.scroll-progress-fill');

    if (scrollProgressFill) {
      const updateScrollProgress = () => {
        const maxScroll = document.documentElement.scrollHeight - innerHeight;
        const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
        scrollProgressFill.style.transform = `scaleX(${progress})`;
      };

      updateScrollProgress();
      ['scroll', 'resize', 'load'].forEach((e) =>
        addEventListener(e, updateScrollProgress, { passive: true })
      );
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
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) setActiveLink(visible.target.id);
        },
        { threshold: [0.35, 0.55, 0.75], rootMargin: '-30% 0px -45% 0px' }
      );

      trackedSections.forEach((section) => sectionObserver.observe(section));
      navSectionLinks.forEach((link) =>
        link.addEventListener('click', () => {
          const id = link.getAttribute('href')?.slice(1);
          if (id) setActiveLink(id);
        })
      );

      navSectionLinks[0].classList.add('active');
      syncActiveFromScroll();
      ['load', 'hashchange', 'scroll'].forEach((e) =>
        addEventListener(e, syncActiveFromScroll, { passive: true })
      );
    }

    const sections = qsa('.reveal');
    sections.forEach((section, i) => {
      section.style.transitionDelay = `${i * 90}ms`;
    });

    const revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
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
        (entries, currentObserver) =>
          entries.forEach((entry) => {
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
        (entries) =>
          entries.forEach((entry) => {
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
          const progress = Math.min(
            Math.max((innerHeight - rect.top) / (innerHeight + rect.height), 0),
            1
          );
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
  }, []);

  return (
    <>
      <a className="skip-link" href="#top">Skip to content</a>
      <div className="scroll-progress" aria-hidden="true">
        <span className="scroll-progress-fill"></span>
      </div>
      <div className="background-orb orb-a"></div>
      <div className="background-orb orb-b"></div>
      <div className="background-grid"></div>

      <header className="site-header">
        <nav className="container nav" aria-label="Main navigation">
          <a href="#top" className="brand">
            <span className="brand-avatar-wrap">
              <img className="brand-avatar" src="public/images/projects/71824687-c457-4660-80fd-90d7ecdc3827-removebg-preview.png?v=20260323" alt="Jonh Kiervy Funtinilla profile photo" />
            </span>
            <span className="brand-name">Jonh Kiervy Funtinilla</span>
          </a>
          <div className="nav-actions">
            <button className="menu-btn" aria-expanded="false" aria-label="Open menu">Menu</button>
          </div>
          <ul className="nav-links">
            <li><a href="#about"><i className="bi bi-person"></i> About</a></li>
            <li><a href="#experience"><i className="bi bi-briefcase"></i> Experience</a></li>
            <li><a href="#education"><i className="bi bi-mortarboard"></i> Education</a></li>
            <li><a href="#projects"><i className="bi bi-grid"></i> Projects</a></li>
            <li><a href="#contact"><i className="bi bi-chat-dots"></i> Contact</a></li>
          </ul>
        </nav>
      </header>

      <main id="top">
        <section className="hero container reveal">
          <div className="hero-layout">
            <div className="hero-text">
              <p className="eyebrow">UI/UX Designer | Student | Focused on User-Centered Digital Products</p>
              <p className="student-badge"><i className="bi bi-patch-check"></i> 2nd Year BSIT - UI/UX Student - 2026</p>
              <h1>Designing intuitive digital experiences with thoughtful UI and user-centered UX.</h1>
              <p className="hero-copy">
                I help teams transform ideas into seamless, engaging products through research, wireframes,
                prototypes, and clean visual design. I focus on usability, accessibility, and meaningful
                user outcomes.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#projects"><i className="bi bi-grid-3x3-gap"></i> View Projects</a>
                <a className="btn btn-secondary" href="#contact"><i className="bi bi-chat-square-dots"></i> Let's Talk</a>
              </div>
            </div>
            <figure className="hero-photo card">
              <img
                src="public/images/projects/71824687-c457-4660-80fd-90d7ecdc3827-removebg-preview.png?v=20260323"
                alt="Photo of Jonh Kiervy Funtinilla"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
              <figcaption>Jonh Kiervy Funtinilla</figcaption>
            </figure>
          </div>
          <ul className="highlights">
            <li><i className="bi bi-mortarboard"></i> <span className="highlight-copy"><strong><span className="count-value" data-target="5">0</span> Projects</strong> in UI/UX design practice</span></li>
            <li><i className="bi bi-calendar4-week"></i> <span className="highlight-copy"><strong><span className="count-value" data-target="2">0</span> Years</strong> of continuous design learning</span></li>
            <li><i className="bi bi-universal-access"></i> <span className="highlight-copy"><strong><span className="count-value" data-target="5">0</span> Case Studies</strong> focused on usability</span></li>
          </ul>
        </section>

        <section className="container section trust-strip reveal" aria-label="Daily tools">
          <div className="card trust-strip-card">
            <p className="eyebrow">Daily Workflow</p>
            <h2>Tools I use every day</h2>
            <p className="section-intro">Core tools I use to research, design, and build polished user experiences.</p>
            <ul className="tool-strip">
              <li><i className="bi bi-pen"></i> Figma</li>
              <li><i className="bi bi-diagram-3"></i> FigJam</li>
              <li><i className="bi bi-code-slash"></i> VS Code</li>
            </ul>
          </div>
        </section>

        <section id="about" className="container section reveal">
          <div className="section-heading">
            <p className="eyebrow">About</p>
            <h2>UI/UX Designer</h2>
            <p className="section-intro">I design clear, user-centered interfaces that balance usability and visual quality.</p>
          </div>
          <div className="card about-grid">
            <p>
              I am a UI/UX designer focused on creating clean, user-centered digital experiences.
              I work closely with product teams to turn ideas into intuitive interfaces that are both
              visually engaging and easy to use.
            </p>
            <p>
              My strengths include user research, wireframing, prototyping, interaction design, and
              design systems. I aim to solve real user problems while balancing business goals and
              accessibility best practices.
            </p>
          </div>
        </section>

        <section id="experience" className="container section reveal">
          <div className="section-heading">
            <p className="eyebrow">Experience</p>
            <h2>UI/UX Student Experience</h2>
            <p className="section-intro">Hands-on academic and collaborative work focused on solving real user problems.</p>
          </div>
          <div className="timeline">
            <article className="card timeline-item timeline-animate-item">
              <div className="timeline-top">
                <h3>UI/UX Design Student</h3>
                <p>Academic Projects - 2024 - 2026</p>
              </div>
              <p>Designed user-centered interfaces and case studies focused on usability, accessibility, and visual hierarchy.</p>
            </article>
            <article className="card timeline-item timeline-animate-item">
              <div className="timeline-top">
                <h3>UX Research & Wireframing Practice</h3>
                <p>Student Collaboration - 2024 - 2025</p>
              </div>
              <p>Conducted user interviews, built user flows, and created wireframes and prototypes for class-based product concepts.</p>
            </article>
            <article className="card timeline-item timeline-animate-item">
              <div className="timeline-top">
                <h3>UI Design & Prototyping</h3>
                <p>Portfolio Development - 2025 - 2026</p>
              </div>
              <p>Created high-fidelity mockups and interactive prototypes using modern design tools for portfolio-ready projects.</p>
            </article>
          </div>
        </section>

        <section id="education" className="container section reveal">
          <div className="section-heading">
            <p className="eyebrow">Education</p>
            <h2>Academic Background</h2>
            <p className="section-intro">My academic path in Information Technology and UI/UX design foundations.</p>
          </div>
          <div className="card education-card">
            <ul className="education-list">
              <li className="education-item timeline-animate-item">
                <div className="education-year">2026</div>
                <h3>BS Information Technology - 2nd Year (Current)</h3>
                <p>Western Institute of Technology - Started IT track in 2024</p>
              </li>
              <li className="education-item timeline-animate-item">
                <div className="education-year">2024</div>
                <h3>Senior High School Graduate</h3>
                <p>Leganes National High School</p>
              </li>
              <li className="education-item timeline-animate-item">
                <div className="education-year">2022</div>
                <h3>Junior High School Graduate</h3>
                <p>Leganes National High School</p>
              </li>
              <li className="education-item timeline-animate-item">
                <div className="education-year">2018</div>
                <h3>Elementary Graduate</h3>
                <p>Leganes Central Elementary School</p>
              </li>
            </ul>
          </div>
        </section>

        <section id="projects" className="container section reveal">
          <div className="section-heading">
            <p className="eyebrow">Projects</p>
            <h2>Selected work</h2>
            <p className="section-intro">A curated set of projects showcasing my process, design decisions, and outcomes.</p>
          </div>
          <div className="project-grid">
            <article className="card project" data-project-card>
              <img className="project-image" src="public/images/project2/Screenshot 2026-03-22 170251.png" alt="Notion AwesomeTodos project screenshot" loading="lazy" decoding="async" width="1200" height="760" />
              <h3>Notion AwesomeTodos</h3>
              <ul className="project-badges">
                <li className="badge-solo"><i className="bi bi-person"></i> Solo Project</li>
                <li className="badge-academic"><i className="bi bi-mortarboard"></i> Academic</li>
              </ul>
              <p>
                A clean and intuitive task management app inspired by Notion, where users can add, organize, edit, and track daily tasks efficiently.
              </p>
              <ul className="project-meta">
                <li><strong>Role:</strong> UI/UX Designer & Frontend Developer</li>
                <li><strong>Tools:</strong> Figma, HTML, CSS, JavaScript</li>
                <li><strong>Timeline:</strong> 2026 Student Project</li>
              </ul>
              <ul className="tags">
                <li>TypeScript</li>
                <li>React</li>
                <li>Node.js</li>
              </ul>
            </article>
            <article className="card project" data-project-card>
              <div className="project-slider" data-slider>
                <div className="project-slider-track">
                  <img className="project-image" src="public/images/project/1.jpg" alt="KonektBarangay slide 1" loading="lazy" decoding="async" width="1200" height="760" />
                  <img className="project-image" src="public/images/project/2.jpg" alt="KonektBarangay slide 2" loading="lazy" decoding="async" width="1200" height="760" />
                  <img className="project-image" src="public/images/project/3.jpg" alt="KonektBarangay slide 3" loading="lazy" decoding="async" width="1200" height="760" />
                  <img className="project-image" src="public/images/project/4.jpg" alt="KonektBarangay slide 4" loading="lazy" decoding="async" width="1200" height="760" />
                </div>
                <button className="slider-btn slider-prev" type="button" aria-label="Previous slide">
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button className="slider-btn slider-next" type="button" aria-label="Next slide">
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
              <h3>KonektBarangay</h3>
              <ul className="project-badges">
                <li className="badge-team"><i className="bi bi-people"></i> Team Project</li>
                <li className="badge-academic"><i className="bi bi-mortarboard"></i> Academic</li>
              </ul>
              <p>
                KonektBarangay is our modern e-services platform where residents can book appointments, request barangay documents, and track service updates online with speed and convenience.
              </p>
              <ul className="project-meta">
                <li><strong>Role:</strong> UI/UX Designer</li>
                <li><strong>Tools:</strong> Figma</li>
                <li><strong>Timeline:</strong> 2026 Team Project</li>
              </ul>
              <ul className="tags">
                <li>Figma</li>
              </ul>
            </article>
            <article className="card project" data-project-card>
              <div className="project-slider" data-slider>
                <div className="project-slider-track">
                  <img className="project-image" src="public/images/project3/i1.png?v=20260322" alt="My Portfolio slide 1" loading="lazy" decoding="async" width="1200" height="760" />
                  <img className="project-image" src="public/images/project3/i2.png" alt="My Portfolio slide 2" loading="lazy" decoding="async" width="1200" height="760" />
                  <img className="project-image" src="public/images/project3/i3.png" alt="My Portfolio slide 3" loading="lazy" decoding="async" width="1200" height="760" />
                  <img className="project-image" src="public/images/project3/i4.png" alt="My Portfolio slide 4" loading="lazy" decoding="async" width="1200" height="760" />
                  <img className="project-image" src="public/images/project3/i5.png" alt="My Portfolio slide 5" loading="lazy" decoding="async" width="1200" height="760" />
                </div>
                <button className="slider-btn slider-prev" type="button" aria-label="Previous slide">
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button className="slider-btn slider-next" type="button" aria-label="Next slide">
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
              <h3>My Portfolio</h3>
              <ul className="project-badges">
                <li className="badge-solo"><i className="bi bi-person"></i> Solo Project</li>
                <li className="badge-academic"><i className="bi bi-mortarboard"></i> Academic</li>
              </ul>
              <p>
                A personal portfolio website that showcases my UI/UX journey, featured projects, education, and contact information with a modern, responsive design.
              </p>
              <ul className="project-meta">
                <li><strong>Role:</strong> UI/UX Designer & Web Developer</li>
                <li><strong>Tools:</strong> HTML, CSS, JavaScript, Figma</li>
                <li><strong>Timeline:</strong> 2026 Personal Project</li>
              </ul>
              <ul className="tags">
                <li>HTML</li>
                <li>JavaScript</li>
                <li>CSS</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="container section reveal">
          <div className="section-heading">
            <p className="eyebrow">UI/UX Capabilities</p>
            <h2>UI/UX Skills & Tools</h2>
            <p className="section-intro">Methods and tools I use to move from user insights to refined interfaces.</p>
          </div>
          <div className="card skills">
            <span>User Research</span>
            <span>Wireframing</span>
            <span>Prototyping</span>
            <span>Interaction Design</span>
            <span>Information Architecture</span>
            <span>Visual Design</span>
            <span>Usability Testing</span>
            <span>Design Systems</span>
            <span>Figma</span>
            <span>Canva</span>
          </div>
        </section>

        <section className="container section reveal">
          <div className="section-heading">
            <p className="eyebrow">Design Mindset</p>
            <h2>Design Principles</h2>
            <p className="section-intro">The principles that guide every decision across research, interface, and interaction.</p>
          </div>
          <div className="principles-grid">
            <article className="card principle-card">
              <h3><i className="bi bi-eye"></i> Clarity</h3>
              <p>I prioritize clear layouts and readable content so users can complete tasks quickly and confidently.</p>
            </article>
            <article className="card principle-card">
              <h3><i className="bi bi-universal-access-circle"></i> Accessibility</h3>
              <p>I design with contrast, hierarchy, and inclusive interactions so more users can use the product smoothly.</p>
            </article>
            <article className="card principle-card">
              <h3><i className="bi bi-grid-1x2"></i> Consistency</h3>
              <p>I keep components and patterns consistent to reduce confusion and make interfaces feel familiar.</p>
            </article>
            <article className="card principle-card">
              <h3><i className="bi bi-chat-square-text"></i> Feedback</h3>
              <p>I ensure every user action gets clear feedback through states, messages, and transitions.</p>
            </article>
          </div>
        </section>

        <section id="contact" className="container section reveal">
          <div className="contact card">
            <p className="eyebrow">Contact</p>
            <h2>Let's build something valuable together.</h2>
            <p>
              Open to full-time roles, contract collaborations, and high-impact product work.
            </p>
            <div className="contact-links">
              <a href="mailto:funtinillakiervy9@gmail.com"><i className="bi bi-envelope"></i> Gmail</a>
              <a href="https://github.com/funtinillakiervy9-design" target="_blank" rel="noopener noreferrer"><i className="bi bi-github"></i> GitHub</a>
              <a href="https://www.facebook.com/kirbiiiiastig" target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook"></i> Facebook</a>
              <a href="https://www.instagram.com/yvr.3ik/" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram"></i> Instagram</a>
              <a href="https://www.tiktok.com/@kiervii" target="_blank" rel="noopener noreferrer"><i className="bi bi-tiktok"></i> TikTok</a>
            </div>
          </div>
        </section>
      </main>

      <div className="project-modal" id="project-modal" aria-hidden="true">
        <div className="project-modal-backdrop" data-modal-close></div>
        <div className="project-modal-dialog card" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
          <button className="project-modal-close" type="button" aria-label="Close project preview" data-modal-close>
            <i className="bi bi-x-lg"></i>
          </button>
          <div className="project-modal-media">
            <button className="project-modal-nav prev" type="button" aria-label="Previous image">
              <i className="bi bi-chevron-left"></i>
            </button>
            <img id="project-modal-image" src="" alt="Project preview image" />
            <button className="project-modal-nav next" type="button" aria-label="Next image">
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
          <div className="project-modal-body">
            <h3 id="project-modal-title"></h3>
            <p id="project-modal-desc"></p>
            <div id="project-modal-tags" className="project-modal-tags"></div>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Jonh Kiervy Funtinilla. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PortfolioApp />);