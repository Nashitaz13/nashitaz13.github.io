import type { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP, motion } from '../motion/gsap';

type Entry = { targets: Element[]; timeline?: gsap.core.Timeline; context?: gsap.Context; trigger?: ScrollTrigger };

export default function ScrollExperience({ scope }: { scope: RefObject<HTMLElement | null> }) {
  useGSAP(() => {
    const main = scope.current;
    if (!main) return;
    const media = gsap.matchMedia();
    const seen = new WeakSet<Element>();
    let refreshTimer: ReturnType<typeof setTimeout>;
    let frame = 0;
    let syncCases = () => {};
    try { media.add('(prefers-reduced-motion: no-preference)', () => {
      const controllers = new Map<HTMLElement, Entry>();
      const group = (element: HTMLElement, targets: Element[], figure = false) => {
        if (!targets.length || seen.has(element) || controllers.has(element) || !element.getClientRects().length) return;
        const entry: Entry = { targets }; controllers.set(element, entry);
        const enter = () => {
          seen.add(element);
          const destination = location.hash ? document.getElementById(location.hash.slice(1)) : null;
          const directHeading = element.matches('.section-label') && element.parentElement === destination || element.matches('.case-study__header') && element.closest('article') === destination;
          if (directHeading || element.contains(document.activeElement)) return;
          try {
            entry.context = gsap.context(() => {
            const timeline = gsap.timeline({ onComplete: () => {
              targets.forEach(target => { if (target instanceof HTMLElement || target instanceof SVGElement) { target.style.removeProperty('opacity'); target.style.removeProperty('transform'); } });
              element.querySelectorAll<SVGPathElement>(':scope>svg path').forEach(path => { path.style.removeProperty('stroke-dasharray'); path.style.removeProperty('stroke-dashoffset'); });
            } });
            entry.timeline = timeline;
            timeline.fromTo(targets, { opacity: .3, y: (_index, target: Element) => target.matches('a,button,summary') || target.querySelector('a,button,summary') ? 0 : matchMedia('(pointer: coarse)').matches ? 12 : 20 },
              { opacity: 1, y: 0, duration: motion.reveal, stagger: { amount: Math.min(.3, targets.length * motion.stagger) }, ease: motion.ease });
            if (figure) timeline.fromTo(element.querySelectorAll(':scope>svg path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: .6, stagger: .08, ease: 'power2.out' }, .12);
            }, element);
          } catch { entry.context?.revert(); entry.timeline?.revert(); }
        };
        entry.trigger = ScrollTrigger.create({ trigger: element, start: 'top 82%', once: true, onEnter: enter });
      };
      main.querySelectorAll<HTMLElement>('.section-label').forEach(el => group(el, [...el.children, ...(el.nextElementSibling?.matches('p') ? [el.nextElementSibling] : [])]));
      main.querySelectorAll<HTMLElement>('.project-row').forEach(el => group(el,
        [...el.querySelectorAll('.project-row__number,h3,.project-row__content>p,.project-actions'), ...el.parentElement!.querySelectorAll('.case-disclosure>summary')]));
      main.querySelectorAll<HTMLElement>('.technology-grid,.expertise__category,.about__identity,.about__context,.contact__content').forEach(el => group(el,
        el.matches('.contact__content') ? [...el.querySelectorAll(':scope>.contact__location,:scope>ul>li')] : [...el.children]));
      main.querySelectorAll<HTMLElement>('.expertise__context>p').forEach(el => group(el, [el]));
      const footer = document.querySelector<HTMLElement>('.site-footer');
      if (footer) group(footer, [...footer.children]);
      syncCases = () => {
        controllers.forEach((entry, el) => {
          const detail = el.closest('details');
          if (detail && !detail.open) { entry.context?.revert(); entry.trigger?.kill(); controllers.delete(el); }
        });
        main.querySelectorAll<HTMLElement>('.case-disclosure[open] .case-study__header,.case-disclosure[open] .evidence-list').forEach(el => group(el, [...el.children]));
        main.querySelectorAll<HTMLElement>('.case-disclosure[open] .case-study__evidence>.architecture-figure').forEach(el => group(el, [...el.querySelectorAll(':scope>figcaption,:scope>svg')], true));
      };
      syncCases();
      const revealNow = () => controllers.forEach(({ timeline }) => timeline?.progress(1));
      const focus = (event: FocusEvent) => controllers.forEach(({ targets, timeline }) => { if (targets.some(target => target.contains(event.target as Node))) timeline?.progress(1); });
      window.addEventListener('hashchange', revealNow); document.addEventListener('focusin', focus);
      const progress = document.querySelector('.reading-progress>span');
      if (progress) gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { id: 'reading-progress', start: 0, end: () => Math.max(1, ScrollTrigger.maxScroll(window)), scrub: .15 } });
      return () => {
        controllers.forEach(({ context, trigger }) => { context?.revert(); trigger?.kill(); });
        syncCases = () => {};
        window.removeEventListener('hashchange', revealNow); document.removeEventListener('focusin', focus);
      };
    }); } catch { media.revert(); }
    const refresh = () => {
      cancelAnimationFrame(frame); frame = requestAnimationFrame(() => syncCases());
      clearTimeout(refreshTimer); refreshTimer = setTimeout(() => ScrollTrigger.refresh(true), 320);
    };
    main.addEventListener('case-layout-settled', refresh);
    return () => { clearTimeout(refreshTimer); cancelAnimationFrame(frame); main.removeEventListener('case-layout-settled', refresh); media.revert(); };
  }, { scope });
  return null;
}
