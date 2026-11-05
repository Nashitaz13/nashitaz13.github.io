import { useEffect, useRef } from 'react';
import { profile } from '../content/profile';
import useActiveSection from '../hooks/useActiveSection';
import { headerOffset } from '../motion/gsap';

const sections = [
  ['intro', 'Intro'],
  ['projects', 'Projects'],
  ['expertise', 'Expertise'],
  ['about', 'About'],
  ['contact', 'Contact'],
] as const;

export default function Header() {
  const menu = useRef<HTMLDetailsElement>(null);
  const header = useRef<HTMLElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const currentSection = useActiveSection();
  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const root = document.documentElement;
    const previous = root.style.getPropertyValue('--header-offset');
    const measure = () => root.style.setProperty('--header-offset', `${headerOffset()}px`);
    const resize = new ResizeObserver(measure); resize.observe(element); measure();
    const stuck = new IntersectionObserver(([entry]) => { element.classList.toggle('is-stuck', !entry?.isIntersecting); });
    if (sentinel.current) stuck.observe(sentinel.current);
    return () => { resize.disconnect(); stuck.disconnect(); if (previous) root.style.setProperty('--header-offset',previous); else root.style.removeProperty('--header-offset'); };
  }, []);

  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }

  const links = sections.map(([id, label], index) => (
    <a key={id} href={`#${id}`} aria-current={currentSection === id ? 'location' : undefined} onClick={closeMenu}>
      <span className="nav-index" aria-hidden="true">0{index + 1}</span>{label}
    </a>
  ));

  return (
    <><div ref={sentinel} className="header-sentinel" aria-hidden="true" /><header ref={header} className="site-header">
      <div className="container header-bar">
        <a className="brand" href="#intro" aria-label={`${profile.name.text}, introduction`}>
          <span className="brand-mark" aria-hidden="true">bt<span>_</span></span>
          <span className="brand-label">Engineering portfolio</span>
        </a>
        <nav className="desktop-nav section-nav" aria-label="Main navigation">{links}</nav>
        <details className="mobile-menu" ref={menu} onKeyDown={event => {
          if (event.key === 'Escape' && menu.current?.open) {
            closeMenu();
            menu.current.querySelector('summary')?.focus();
          }
        }}>
          <summary>Menu <span aria-hidden="true">⌄</span></summary>
          <nav className="section-nav" aria-label="Mobile navigation">{links}</nav>
        </details>
      </div>
      <div className="reading-progress" aria-hidden="true"><span /></div>
    </header></>
  );
}
