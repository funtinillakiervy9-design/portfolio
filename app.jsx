const { useState, useEffect, useRef, useCallback } = React;

const PHOTO = 'public/images/projects/71824687-c457-4660-80fd-90d7ecdc3827-removebg-preview.png?v=20260323';

const NAV = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#process', label: 'Process' },
  { href: '#services', label: 'Skills' },
  { href: '#journey', label: 'Journey' },
];

const ROTATING_WORDS = ['clear', 'intuitive', 'accessible', 'delightful'];

const MARQUEE_A = ['User Research', 'Wireframing', 'Prototyping', 'Interaction Design', 'Visual Design', 'Design Systems'];
const MARQUEE_B = ['Figma', 'FigJam', 'VS Code', 'Canva', 'Usability Testing', 'Information Architecture'];

const PROCESS = [
  { icon: 'bi-search', title: 'Discover', text: 'Interviews, research, and user flows to understand who I am designing for and why.' },
  { icon: 'bi-bullseye', title: 'Define', text: 'Turning findings into clear problem statements, personas, and information architecture.' },
  { icon: 'bi-vector-pen', title: 'Design', text: 'From low-fi wireframes to polished, consistent high-fidelity UI in Figma.' },
  { icon: 'bi-arrow-repeat', title: 'Test & iterate', text: 'Interactive prototypes put in front of users, refined with every round of feedback.' },
];

const SERVICES = [
  { title: 'User Research', text: 'Interviews, user flows, and personas that ground every decision in real needs.' },
  { title: 'Wireframing & IA', text: 'Structuring content and navigation so people find what they need fast.' },
  { title: 'UI & Visual Design', text: 'Clean, consistent interfaces with clear hierarchy, contrast, and rhythm.' },
  { title: 'Prototyping & Testing', text: 'Interactive Figma prototypes, tested with users and refined from feedback.' },
];

const PRINCIPLES = [
  { icon: 'bi-eye', title: 'Clarity', text: 'Clear layouts and readable content so users finish tasks with confidence.' },
  { icon: 'bi-universal-access-circle', title: 'Accessibility', text: 'Contrast, hierarchy, and inclusive interactions for more people.' },
  { icon: 'bi-grid-1x2', title: 'Consistency', text: 'Reusable patterns that make every screen feel familiar.' },
  { icon: 'bi-chat-square-text', title: 'Feedback', text: 'Every action answered with clear states, messages, and transitions.' },
];

const TOOLS = [
  { icon: 'bi-vector-pen', label: 'Figma' },
  { icon: 'bi-diagram-3', label: 'FigJam' },
  { icon: 'bi-code-slash', label: 'VS Code' },
  { icon: 'bi-palette', label: 'Canva' },
];

const EXPERIENCE = [
  { years: '2024 — 2026', title: 'UI/UX Design Student', place: 'Academic Projects', text: 'Designed user-centered interfaces and case studies focused on usability, accessibility, and visual hierarchy.' },
  { years: '2024 — 2025', title: 'UX Research & Wireframing', place: 'Student Collaboration', text: 'Ran user interviews, built user flows, and created wireframes and prototypes for class product concepts.' },
  { years: '2025 — 2026', title: 'UI Design & Prototyping', place: 'Portfolio Development', text: 'Created high-fidelity mockups and interactive prototypes for portfolio-ready projects.' },
];

const EDUCATION = [
  { years: '2024 — Now', title: 'BS Information Technology, 2nd Year', place: 'Western Institute of Technology' },
  { years: '2024', title: 'Senior High School Graduate', place: 'Leganes National High School' },
  { years: '2022', title: 'Junior High School Graduate', place: 'Leganes National High School' },
  { years: '2018', title: 'Elementary Graduate', place: 'Leganes Central Elementary School' },
];

const SOCIALS = [
  { icon: 'bi-github', label: 'GitHub', href: 'https://github.com/funtinillakiervy9-design' },
  { icon: 'bi-facebook', label: 'Facebook', href: 'https://www.facebook.com/kirbiiiiastig' },
  { icon: 'bi-instagram', label: 'Instagram', href: 'https://www.instagram.com/yvr.3ik/' },
  { icon: 'bi-tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@kiervii' },
];

const EMAIL = 'funtinillakiervy9@gmail.com';

const BADGES = {
  solo: 'Solo Project',
  team: 'Team Project',
  academic: 'Academic',
  personal: 'Personal',
};

const pad = (n) => String(n).padStart(2, '0');

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function useReveal() {
  useEffect(() => {
    let pending = [...document.querySelectorAll('.reveal')];
    const check = () => {
      const limit = innerHeight * 0.9;
      pending = pending.filter((node) => {
        if (node.getBoundingClientRect().top >= limit) return true;
        node.classList.add('is-visible');
        return false;
      });
      if (!pending.length) stop();
    };
    const stop = () => {
      removeEventListener('scroll', check);
      removeEventListener('resize', check);
    };
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    check();
    return stop;
  }, []);
}

function useActiveSection() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const sections = NAV.map((item) => document.querySelector(item.href)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(`#${entry.target.id}`);
      }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return active;
}

function ScrollProgress() {
  const bar = useRef(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, []);
  return <div className="scroll-progress" aria-hidden="true"><span ref={bar}></span></div>;
}

function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return;
    document.body.classList.add('has-cursor');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      const target = e.target.closest('a, button, [data-cursor]');
      const label = target?.closest('[data-cursor]')?.dataset.cursor || '';
      ring.current?.classList.toggle('is-hover', Boolean(target));
      ring.current?.classList.toggle('is-label', Boolean(label));
      if (ring.current) ring.current.dataset.label = label;
    };
    const onLeave = () => ring.current?.classList.add('is-hidden');
    const onEnter = () => ring.current?.classList.remove('is-hidden');

    addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true"></div>
      <div className="cursor-ring" ref={ring} aria-hidden="true"></div>
    </>
  );
}

function CountUp({ to, suffix = '', digits = 2 }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) { setValue(to); return; }
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 1400, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [to]);

  return <strong ref={ref}>{String(value).padStart(digits, '0')}{suffix}</strong>;
}

function LocalTime() {
  const format = () => new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila',
  }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, []);
  return <span>{time} in Iloilo, PH</span>;
}

function RotatingWord() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATING_WORDS.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hl rotator" aria-label={ROTATING_WORDS[0]}>
      <span key={index} className="rotator-word" aria-hidden="true">{ROTATING_WORDS[index]}</span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 12);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a href="#top" className="logo" onClick={close}>
          Kiervy<span className="logo-dot">.</span>
        </a>
        <nav className={`nav${open ? ' is-open' : ''}`} aria-label="Main navigation">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className={active === item.href ? 'is-active' : ''}
              style={{ '--i': i }}
            >
              {item.label}
            </a>
          ))}
          <a className="btn btn-dark nav-cta" href="#contact" onClick={close}>
            Let's talk <i className="bi bi-arrow-up-right"></i>
          </a>
        </nav>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero container" id="top">
      <div className="hero-grid">
        <div className="hero-text">
          <div className="hero-meta intro" style={{ '--d': 0 }}>
            <p className="chip"><span className="pulse"></span> Open to internships & collaborations</p>
            <p className="hero-time"><i className="bi bi-clock"></i> <LocalTime /></p>
          </div>
          <h1 className="hero-title">
            <span className="line"><span className="intro" style={{ '--d': 1 }}>Designing <RotatingWord /></span></span>
            <span className="line"><span className="intro" style={{ '--d': 2 }}>human-centered</span></span>
            <span className="line"><span className="intro" style={{ '--d': 3 }}>digital products.</span></span>
          </h1>
          <p className="hero-copy intro" style={{ '--d': 4 }}>
            I'm Jonh Kiervy Funtinilla, a UI/UX designer and BSIT student. I turn ideas into intuitive
            interfaces through research, wireframes, prototypes, and clean visual design.
          </p>
          <div className="hero-actions intro" style={{ '--d': 5 }}>
            <a className="btn btn-dark" href="#work">View my work <i className="bi bi-arrow-down-right"></i></a>
            <a className="btn btn-outline" href="#contact">Get in touch</a>
          </div>
        </div>
        <figure className="hero-card intro" style={{ '--d': 2 }}>
          <img src={PHOTO} alt="Portrait of Jonh Kiervy Funtinilla" fetchpriority="high" />
          <span className="float-chip chip-a"><i className="bi bi-bounding-box"></i> Wireframes</span>
          <span className="float-chip chip-b"><i className="bi bi-phone"></i> Prototypes</span>
          <span className="float-chip chip-c"><i className="bi bi-people"></i> User research</span>
          <figcaption className="hero-card-tag">
            <span>
              <strong>Jonh Kiervy Funtinilla</strong>
              <span>UI/UX Designer · BSIT Student</span>
            </span>
            <span className="hero-card-spin" aria-hidden="true"><i className="bi bi-asterisk"></i></span>
          </figcaption>
        </figure>
      </div>
      <ul className="stats reveal">
        <li><CountUp to={window.PROJECTS.length} /><span>Featured projects</span></li>
        <li><CountUp to={2} suffix="+" digits={1} /><span>Years learning design</span></li>
        <li><CountUp to={TOOLS.length} /><span>Daily design tools</span></li>
      </ul>
    </section>
  );
}

function Marquee() {
  const row = (items) => [...items, ...items, ...items, ...items];
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee marquee-light">
        <div className="marquee-track">
          {row(MARQUEE_A).map((item, i) => <span key={i}>{item} <i className="bi bi-asterisk"></i></span>)}
        </div>
      </div>
      <div className="marquee marquee-dark">
        <div className="marquee-track is-reverse">
          {row(MARQUEE_B).map((item, i) => <span key={i}>{item} <i className="bi bi-star-fill"></i></span>)}
        </div>
      </div>
    </div>
  );
}

function Gallery({ project, onOpen }) {
  const { images, title } = project;
  const [index, setIndex] = useState(0);
  const go = (step) => setIndex((i) => (i + step + images.length) % images.length);

  return (
    <div className="gallery">
      <div className="gallery-chrome" aria-hidden="true">
        <span></span><span></span><span></span>
        <em>{project.link ? project.link.replace(/^https?:\/\//, '').replace(/\/$/, '') : `${title.toLowerCase().replace(/\s+/g, '')}.design`}</em>
      </div>
      <button
        type="button"
        className="gallery-frame"
        onClick={() => onOpen(project, index)}
        aria-label={`Open ${title} preview`}
        data-cursor="View"
      >
        <img key={images[index].src} src={images[index].src} alt={images[index].alt} loading="lazy" decoding="async" />
      </button>
      {images.length > 1 && (
        <div className="gallery-bar">
          <div className="gallery-thumbs">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                className={`thumb${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
              >
                <img src={img.src} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
          <div className="gallery-arrows">
            <span className="gallery-count">{pad(index + 1)} / {pad(images.length)}</span>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image"><i className="bi bi-arrow-left"></i></button>
            <button type="button" onClick={() => go(1)} aria-label="Next image"><i className="bi bi-arrow-right"></i></button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project, number, onOpen }) {
  const { title, type, category, description, role, tools, timeline, tags, link, highlights = [] } = project;
  return (
    <article className="project reveal">
      <Gallery project={project} onOpen={onOpen} />
      <div className="project-info">
        <span className="project-num">{pad(number)} <em>/ {pad(window.PROJECTS.length)}</em></span>
        <h3>{title}</h3>
        <ul className="pills">
          <li>{BADGES[type]}</li>
          <li>{BADGES[category]}</li>
        </ul>
        <p className="project-desc">{description}</p>
        {highlights.length > 0 && (
          <ul className="highlights">
            {highlights.map((h) => <li key={h}><i className="bi bi-check2"></i> {h}</li>)}
          </ul>
        )}
        <dl className="project-meta">
          <div><dt>Role</dt><dd>{role}</dd></div>
          <div><dt>Tools</dt><dd>{tools}</dd></div>
          <div><dt>Timeline</dt><dd>{timeline}</dd></div>
        </dl>
        <ul className="tags">
          {tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        <div className="project-actions">
          <button type="button" className="btn btn-dark" onClick={() => onOpen(project, 0)}>
            View screens <i className="bi bi-images"></i>
          </button>
          {link && (
            <a className="btn btn-outline" href={link} target="_blank" rel="noopener noreferrer">
              Live site <i className="bi bi-arrow-up-right"></i>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Lightbox({ state, onClose }) {
  const [index, setIndex] = useState(0);
  const images = state ? state.project.images : [];
  const go = useCallback((step) => setIndex((i) => (i + step + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!state) return;
    setIndex(state.index);
    document.body.classList.add('modal-open');
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [state, onClose, go]);

  if (!state) return null;
  const { project } = state;
  const image = images[index] || images[0];

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${project.title} preview`}>
      <div className="lightbox-backdrop" onClick={onClose}></div>
      <div className="lightbox-dialog">
        <div className="lightbox-head">
          <div>
            <h3>{project.title}</h3>
            <p>{images.length > 1 ? `${index + 1} / ${images.length} — ${image.alt}` : image.alt}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close preview">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="lightbox-media">
          <img key={image.src} src={image.src} alt={image.alt} />
          {images.length > 1 && (
            <>
              <button type="button" className="icon-btn lightbox-prev" onClick={() => go(-1)} aria-label="Previous image"><i className="bi bi-arrow-left"></i></button>
              <button type="button" className="icon-btn lightbox-next" onClick={() => go(1)} aria-label="Next image"><i className="bi bi-arrow-right"></i></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, children, light }) {
  return (
    <div className={`section-head reveal${light ? ' is-light' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children && <p className="section-sub">{children}</p>}
    </div>
  );
}

function Work() {
  const [lightbox, setLightbox] = useState(null);
  const open = useCallback((project, index) => setLightbox({ project, index }), []);
  const close = useCallback(() => setLightbox(null), []);

  return (
    <section className="dark-band" id="work">
      <div className="section container">
        <SectionHead eyebrow="Selected work" title={<>Projects I've<br />designed & built</>} light>
          A few recent projects — from research and wireframes to shipped interfaces.
        </SectionHead>
        <div className="project-list">
          {window.PROJECTS.map((project, i) => (
            <ProjectRow key={project.title} project={project} number={i + 1} onOpen={open} />
          ))}
        </div>
      </div>
      <Lightbox state={lightbox} onClose={close} />
    </section>
  );
}

function About() {
  return (
    <section className="section container about" id="about">
      <div className="about-photo reveal">
        <img src={PHOTO} alt="Portrait of Jonh Kiervy Funtinilla" loading="lazy" />
        <span className="about-sticker">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs><path id="circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" /></defs>
            <text><textPath href="#circle">UI/UX DESIGNER • BSIT STUDENT • </textPath></text>
          </svg>
          <i className="bi bi-asterisk"></i>
        </span>
      </div>
      <div className="about-body reveal">
        <p className="eyebrow">About me</p>
        <h2>I design interfaces that feel <span className="hl">obvious</span> to use.</h2>
        <p>
          I'm a 2nd-year BS Information Technology student focused on creating clean, user-centered
          digital experiences. I work closely with teams to turn ideas into interfaces that are both
          visually engaging and easy to use.
        </p>
        <p>
          My strengths are user research, wireframing, prototyping, interaction design, and design
          systems — solving real user problems while balancing goals and accessibility.
        </p>
        <ul className="tool-list">
          {TOOLS.map((tool) => (
            <li key={tool.label}><i className={`bi ${tool.icon}`}></i> {tool.label}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Process() {
  return (
    <div className="section container" id="process">
      <SectionHead eyebrow="How I work" title="A simple, user-first process" light>
        Every project moves through the same four steps — so decisions are backed by users, not guesses.
      </SectionHead>
      <ol className="process">
        {PROCESS.map((step, i) => (
          <li key={step.title} className="process-step reveal" style={{ '--d': i }}>
            <div className="process-top">
              <span className="process-icon"><i className={`bi ${step.icon}`}></i></span>
              <span className="process-num">{pad(i + 1)}</span>
            </div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Services() {
  return (
    <section className="dark-band">
      <Process />
      <div className="container section section-tight" id="services">
        <SectionHead eyebrow="What I do" title="Skills & capabilities" light>
          Methods I use to move from user insight to refined, tested interfaces.
        </SectionHead>
        <ol className="service-list">
          {SERVICES.map((s, i) => (
            <li key={s.title} className="reveal">
              <span className="service-num">{pad(i + 1)}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <i className="bi bi-arrow-up-right service-arrow"></i>
            </li>
          ))}
        </ol>
        <div className="principles">
          {PRINCIPLES.map((p) => (
            <article key={p.title} className="principle reveal">
              <i className={`bi ${p.icon}`}></i>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Journey() {
  return (
    <section className="section container" id="journey">
      <SectionHead eyebrow="Journey" title="Experience & education" />
      <div className="journey">
        <div className="journey-col reveal">
          <h3 className="journey-label"><i className="bi bi-briefcase"></i> Experience</h3>
          <ul className="timeline">
            {EXPERIENCE.map((item) => (
              <li key={item.title}>
                <span className="timeline-years">{item.years}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p className="timeline-place">{item.place}</p>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="journey-col reveal">
          <h3 className="journey-label"><i className="bi bi-mortarboard"></i> Education</h3>
          <ul className="timeline">
            {EDUCATION.map((item) => (
              <li key={item.title}>
                <span className="timeline-years">{item.years}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p className="timeline-place">{item.place}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <footer className="contact" id="contact">
      <div className="container">
        <div className="contact-top">
          <p className="eyebrow">Contact</p>
          <p className="contact-status"><span className="pulse"></span> Available for internships · <LocalTime /></p>
        </div>
        <h2 className="contact-title reveal">
          Let's build something<br /><span className="hl">valuable</span> together.
        </h2>
        <div className="contact-row reveal">
          <div className="contact-email-wrap">
            <a className="contact-email" href={`mailto:${EMAIL}`}>
              {EMAIL} <i className="bi bi-arrow-up-right"></i>
            </a>
            <button type="button" className="copy-btn" onClick={copy}>
              <i className={`bi ${copied ? 'bi-check2' : 'bi-copy'}`}></i> {copied ? 'Copied!' : 'Copy email'}
            </button>
          </div>
          <ul className="socials">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <i className={`bi ${s.icon}`}></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="footer-mark" aria-hidden="true">Kiervy<span>.</span></p>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Jonh Kiervy Funtinilla. Designed & built by me.</p>
          <a href="#top">Back to top <i className="bi bi-arrow-up"></i></a>
        </div>
      </div>
    </footer>
  );
}

function PortfolioApp() {
  useReveal();
  return (
    <>
      <a className="skip-link" href="#work">Skip to content</a>
      <ScrollProgress />
      <Cursor />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Work />
        <About />
        <Services />
        <Journey />
      </main>
      <Contact />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PortfolioApp />);
