import { useRef } from 'react';
import { gsap, useGSAP } from '../motion/gsap';

export default function Atmosphere() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    try { media.add('(prefers-reduced-motion: no-preference)', () => {
      const ambient = root.current?.querySelector('.atmosphere__ambient');
      if (ambient) gsap.to(ambient, { x: '18vw', y: '15vh', opacity: .35, ease: 'none', scrollTrigger: {
        id: 'atmosphere', trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: .6,
      } });
    });
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const light = root.current?.querySelector<HTMLElement>('.motion-light');
      if (!light) return;
      const xTo = gsap.quickTo(light, 'x', { duration: .28, ease: 'power3.out' });
      const yTo = gsap.quickTo(light, 'y', { duration: .28, ease: 'power3.out' });
      let visible = false;
      let calm = !!document.querySelector('.case-disclosure[open]');
      const stop = () => { visible = false; xTo.tween.pause(); yTo.tween.pause(); light.style.opacity = '0'; };
      const pointer = (event: PointerEvent) => {
        if (calm || document.hidden || event.pointerType !== 'mouse') return;
        const x = event.clientX - 180, y = event.clientY - 180;
        if (!visible) { xTo(x, x); yTo(y, y); visible = true; light.style.opacity = '1'; }
        else { xTo(x); yTo(y); }
      };
      const layout = () => { calm = !!document.querySelector('.case-disclosure[open]'); if (calm) stop(); };
      document.addEventListener('pointermove', pointer, { passive: true });
      document.documentElement.addEventListener('pointerleave', stop);
      document.addEventListener('visibilitychange', stop);
      document.addEventListener('case-layout-settled', layout);
      window.addEventListener('scroll', stop, { passive: true });
      return () => {
        stop(); document.removeEventListener('pointermove', pointer);
        document.documentElement.removeEventListener('pointerleave', stop);
        document.removeEventListener('visibilitychange', stop); document.removeEventListener('case-layout-settled', layout); window.removeEventListener('scroll', stop);
      };
    }); } catch { media.revert(); }
    // Only the scroll controller schedules geometry refreshes after disclosures settle.
    return () => { media.revert(); };
  }, { scope: root });
  return <div ref={root} className="atmosphere" aria-hidden="true">
    <div className="atmosphere__grid" /><div className="atmosphere__ambient" /><div className="motion-light" />
  </div>;
}
