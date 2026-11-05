import { useEffect } from 'react';
import '../styles/motion.css';

export default function MotionExperience() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const hero = document.querySelector<HTMLElement>('.hero');
    const terminal = document.querySelector<HTMLElement>('.profile-terminal');
    if (!hero || !terminal || !Element.prototype.animate) return;
    const running = new Set<Animation>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
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
    function preference() { if (reduce.matches) settle(); }
    function visibility() { if (document.hidden) settle(); }
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
      const targets = ['.hero .eyebrow','.hero__intro','.hero .primary-link','.profile-terminal'];
      targets.forEach((selector,index) => {
        const el = document.querySelector(selector);
        if (el) play(el,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,delay:[0,220,300,380][index] ?? 0,easing:ease,fill:'backwards'});
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
    document.addEventListener('pointerdown',press,{passive:true});
    document.addEventListener('pointerup',release); document.addEventListener('pointercancel',release); window.addEventListener('blur',release);
    document.addEventListener('selectionchange',selection);
    document.addEventListener('visibilitychange',visibility);
    window.addEventListener('hashchange',settle);
    reduce.addEventListener('change',preference);
    return () => {
      settle(); release();
      document.removeEventListener('pointerdown',press);
      document.removeEventListener('pointerup',release); document.removeEventListener('pointercancel',release); window.removeEventListener('blur',release);
      document.removeEventListener('selectionchange',selection); document.removeEventListener('visibilitychange',visibility);
      window.removeEventListener('hashchange',settle);
      reduce.removeEventListener('change',preference);
    };
  }, []);
  return null;
}
