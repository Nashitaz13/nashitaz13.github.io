import { useEffect, useRef } from 'react';
import '../styles/motion.css';

export default function MotionExperience() {
  const light = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const hero = document.querySelector<HTMLElement>('.hero');
    const terminal = document.querySelector<HTMLElement>('.profile-terminal');
    if (!hero || !terminal || !Element.prototype.animate) return;
    const running = new Set<Animation>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let frame = 0;
    let x = 0, y = 0;
    const ease = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim();
    function play(el: Element, frames: Keyframe[], options: KeyframeAnimationOptions) {
      let animation: Animation;
      try { animation = el.animate(frames, options); } catch { return null; }
      running.add(animation);
      void animation.finished.then(() => running.delete(animation), () => running.delete(animation));
      return animation;
    }
    function settle() {
      running.forEach(animation => animation.cancel()); running.clear();
      timers.forEach(timer => clearTimeout(timer)); timers.clear();
      terminal?.querySelectorAll('.is-typing').forEach(el => el.classList.remove('is-typing'));
      terminal?.removeAttribute('data-typing');
    }
    function stopLight() {
      cancelAnimationFrame(frame); frame = 0;
      if (light.current) light.current.style.opacity = '0';
    }
    function preference() { if (reduce.matches) settle(); if (reduce.matches || !fine.matches) stopLight(); }
    function visibility() { if (document.hidden) { settle(); stopLight(); } }
    function pointer(event: PointerEvent) {
      if (!fine.matches || reduce.matches || document.hidden || event.pointerType !== 'mouse') return;
      x = event.clientX; y = event.clientY;
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = hero?.getBoundingClientRect();
        if (!bounds) return;
        if (light.current) {
          light.current.style.transform = `translate3d(${x - 180}px,${y - 180}px,0)`;
          light.current.style.opacity = y >= bounds.top && y <= bounds.bottom && x >= bounds.left && x <= bounds.right ? '1' : '0';
        }
      });
    }
    function press(event: PointerEvent) {
      if (terminal?.contains(event.target as Node)) settle();
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.primary-link') : null;
      if (!target || reduce.matches || event.button !== 0) return;
      const rect = target.getBoundingClientRect();
      target.classList.add('is-pressed');
      const ripple = document.createElement('span');
      ripple.className = 'motion-ripple'; ripple.setAttribute('aria-hidden','true');
      ripple.style.left = `${event.clientX - rect.left}px`; ripple.style.top = `${event.clientY - rect.top}px`;
      target.append(ripple);
      const animation = play(ripple,[{transform:'translate(-50%,-50%) scale(.6)',opacity:.22},{transform:'translate(-50%,-50%) scale(3)',opacity:0}],{duration:280,easing:ease});
      if (animation) void animation.finished.then(() => ripple.remove(), () => ripple.remove());
      else ripple.remove();
    }
    function release() { document.querySelectorAll('.primary-link.is-pressed').forEach(el=>el.classList.remove('is-pressed')); }
    function selection() { if (getSelection()?.anchorNode && terminal?.contains(getSelection()?.anchorNode ?? null)) settle(); }
    const introAllowed = !location.hash || location.hash === '#intro';
    if (!reduce.matches && !document.hidden && introAllowed) {
      const targets = ['.hero .eyebrow','.hero__name > span:first-child','.hero__name > span:last-child','.hero__intro','.hero .primary-link','.profile-terminal'];
      targets.forEach((selector,index) => {
        const el = document.querySelector(selector);
        if (el) play(el,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:index===1||index===2?560:360,delay:[0,60,140,220,300,380][index] ?? 0,easing:ease,fill:'backwards'});
      });
      terminal.dataset.typing = 'true';
      const lines = [...terminal.querySelectorAll<HTMLElement>('.terminal-line')];
      lines.forEach((line,index) => {
        const delay = 720 + index * 100;
        const typed = line.hasAttribute('data-type-key');
        const animation = play(typed ? line.querySelector('.terminal-line__ink') ?? line : line,typed ? [{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}] : [{opacity:0},{opacity:1}],{delay,duration:typed?180:90,easing:typed?'steps(16,end)':ease,fill:'backwards'});
        if (!animation) return;
        const timer = setTimeout(() => {timers.delete(timer);terminal.querySelectorAll('.is-typing').forEach(el=>el.classList.remove('is-typing'));line.classList.add('is-typing');},delay); timers.add(timer);
        void animation.finished.then(() => line.classList.remove('is-typing'), () => line.classList.remove('is-typing'));
      });
      const timer = setTimeout(() => {timers.delete(timer);terminal.removeAttribute('data-typing');},720 + lines.length * 100 + 180); timers.add(timer);
    }
    const seen = new WeakSet<Element>();
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target); observer?.unobserve(entry.target);
        if (!reduce.matches && !document.hidden && !location.hash) play(entry.target,[{opacity:.45,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:ease});
      });
    },{threshold:.6}) : null;
    document.querySelectorAll('main > section > .section-label').forEach(el => observer?.observe(el));
    document.addEventListener('pointermove',pointer,{passive:true});
    document.addEventListener('pointerdown',press,{passive:true});
    document.addEventListener('pointerup',release); document.addEventListener('pointercancel',release); window.addEventListener('blur',release);
    document.addEventListener('selectionchange',selection);
    document.addEventListener('visibilitychange',visibility);
    document.documentElement.addEventListener('pointerleave',stopLight);
    window.addEventListener('scroll',stopLight,{passive:true});
    window.addEventListener('hashchange',settle);
    reduce.addEventListener('change',preference); fine.addEventListener('change',preference);
    return () => {
      settle(); stopLight(); release(); observer?.disconnect();
      document.removeEventListener('pointermove',pointer); document.removeEventListener('pointerdown',press);
      document.removeEventListener('pointerup',release); document.removeEventListener('pointercancel',release); window.removeEventListener('blur',release);
      document.removeEventListener('selectionchange',selection); document.removeEventListener('visibilitychange',visibility);
      document.documentElement.removeEventListener('pointerleave',stopLight);
      window.removeEventListener('scroll',stopLight); window.removeEventListener('hashchange',settle);
      reduce.removeEventListener('change',preference); fine.removeEventListener('change',preference);
    };
  }, []);
  return <div ref={light} className="motion-light" aria-hidden="true" />;
}
