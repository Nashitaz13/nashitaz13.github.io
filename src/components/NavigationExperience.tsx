import { gsap, useGSAP, headerOffset } from '../motion/gsap';

// Explicit anchor navigation only. Browser history and manual scrolling keep their native ownership.
export default function NavigationExperience() {
  useGSAP((_context, safe) => {
    let tween: gsap.core.Tween | undefined;
    let ownHash = false;
    let frame = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const supported = (hash: string) => /^#(intro|projects|expertise|about|contact|project-summary-[\w-]+)$/.test(hash);
    const announce = (phase: 'start' | 'end' | 'cancel', hash = location.hash) =>
      window.dispatchEvent(new CustomEvent('portfolio-scroll', { detail: { phase, hash } }));
    const stop = () => { if (tween) { const old = tween; tween = undefined; old.kill(); } };
    const click = safe!((event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link || link.hasAttribute('download') || link.target && link.target !== '_self' || !supported(link.hash)) return;
      const destination = document.getElementById(link.hash.slice(1));
      if (!destination) return;
      event.preventDefault(); stop();
      const caseStudy = document.querySelector('.case-disclosure[open] .case-study')?.id ?? null;
      if (location.hash !== link.hash) history.pushState({ caseStudy }, '', link.hash);
      ownHash = true; window.dispatchEvent(new HashChangeEvent('hashchange')); ownHash = false;
      let finished = false;
      const finish = (phase: 'end' | 'cancel') => {
        if (finished) return;
        finished = true;
        tween = undefined;
        if (phase === 'end') destination.focus({ preventScroll: true });
        announce(phase, link.hash);
      };
      const offset = link.hash === '#intro' ? destination.getBoundingClientRect().top + scrollY : headerOffset();
      const distance = Math.abs(destination.getBoundingClientRect().top - offset);
      announce('start', link.hash);
      if (reduced.matches || distance < 2) {
        scrollTo({ top: Math.max(0, destination.getBoundingClientRect().top + scrollY - offset), behavior: 'instant' });
        finish('end'); return;
      }
      try {
        tween = gsap.to(window, { duration: Math.min(.8, .45 + distance / 14000), ease: 'power3.inOut',
          scrollTo: { y: destination, offsetY: offset, autoKill: true, onAutoKill: () => finish('cancel') },
          onComplete: () => finish('end'), onInterrupt: () => finish('cancel') });
      } catch { destination.scrollIntoView({ behavior: 'instant' }); finish('end'); }
    });
    const hash = () => { if (!ownHash) stop(); };
    const keyboard = (event: KeyboardEvent) => { if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Tab'].includes(event.key)) stop(); };
    const preference = () => { if (reduced.matches) stop(); };
    document.addEventListener('click', click);
    document.addEventListener('wheel', stop, { passive: true });
    document.addEventListener('touchstart', stop, { passive: true });
    document.addEventListener('pointerdown', stop, { passive: true });
    document.addEventListener('keydown', keyboard);
    window.addEventListener('hashchange', hash); window.addEventListener('popstate', stop);
    reduced.addEventListener('change', preference);
    // Reconcile a direct native destination after the sticky header has been measured.
    if (supported(location.hash)) frame = requestAnimationFrame(() => {
      const destination = document.getElementById(location.hash.slice(1));
      if (destination) scrollTo({ top: location.hash === '#intro' ? 0 : Math.max(0, scrollY + destination.getBoundingClientRect().top - headerOffset()), behavior: 'instant' });
    });
    return () => {
      stop(); cancelAnimationFrame(frame);
      document.removeEventListener('click', click); document.removeEventListener('wheel', stop);
      document.removeEventListener('touchstart', stop); document.removeEventListener('pointerdown', stop); document.removeEventListener('keydown', keyboard);
      window.removeEventListener('hashchange', hash); window.removeEventListener('popstate', stop); reduced.removeEventListener('change', preference);
    };
  });
  return null;
}
