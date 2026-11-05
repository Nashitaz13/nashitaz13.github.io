import { useEffect, useState } from 'react';

const sectionIds = ['intro', 'projects', 'expertise', 'about', 'contact'] as const;
function hashSection(hash: string) {
  const id = hash.slice(1);
  return id.startsWith('project-') ? 'projects' : sectionIds.find(section => section === id);
}

export default function useActiveSection() {
  const [current, setCurrent] = useState<string>('intro');

  useEffect(() => {
    const sections = sectionIds.flatMap(id => {
      const section = document.getElementById(id);
      return section ? [section] : [];
    });
    let observer: IntersectionObserver | undefined;
    let footerObserver: IntersectionObserver | undefined;
    let frame = 0;
    let anchor = hashSection(window.location.hash);
    let anchorY: number | null = null;
    // A midpoint also lets short closing sections become current before reaching the footer.
    const readingLine = () => Math.round(window.innerHeight * .5);

    function update() {
      // Keep an explicit anchor selected until the visitor actually changes scroll position.
      if (anchor && (anchorY === null || Math.abs(window.scrollY - anchorY) < 1)) {
        setCurrent(anchor);
        return;
      }
      anchor = undefined;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const section = [...sections].reverse().find(section => section.getBoundingClientRect().top <= readingLine() + 1);
      setCurrent(atBottom ? 'contact' : section?.id ?? 'intro');
    }

    function anchorIntent(hash: string) {
      anchor = hashSection(hash);
      anchorY = null;
      if (anchor) setCurrent(anchor);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { anchorY = window.scrollY; update(); });
    }
    const onHashChange = () => anchorIntent(window.location.hash);
    function onAnchorClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (link && hashSection(link.hash)) anchorIntent(link.hash);
    }
    function observe() {
      observer?.disconnect(); footerObserver?.disconnect();
      if ('IntersectionObserver' in window) {
        const line = readingLine();
        observer = new IntersectionObserver(update, { rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 1)}px 0px` });
        sections.forEach(section => observer?.observe(section));
        const footer = document.querySelector('footer');
        footerObserver = new IntersectionObserver(update, { threshold: [0, 1] });
        if (footer) footerObserver.observe(footer);
      }
      update();
    }
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('click', onAnchorClick);
    window.addEventListener('resize', observe);
    observe();
    anchorIntent(window.location.hash);
    return () => {
      observer?.disconnect(); footerObserver?.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onAnchorClick);
      window.removeEventListener('resize', observe);
    };
  }, []);

  return current;
}
