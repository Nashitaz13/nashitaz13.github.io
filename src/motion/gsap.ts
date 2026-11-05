import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, DrawSVGPlugin, useGSAP);
export { gsap, ScrollTrigger, useGSAP };

export const motion = { reveal: .5, stagger: .06, panelIn: .26, panelOut: .18, dialogIn: .22, ease: 'power3.out' };

export function headerOffset() {
  return Math.ceil(document.querySelector('.site-header')?.getBoundingClientRect().height ?? 80) + 16;
}

// One owner for panel visibility; interruption resolves the previous operation and restores CSS.
export function panelTransition(element: HTMLElement, opening: boolean, dialog = false) {
  let context: gsap.Context;
  let finished = false;
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  const finish = () => {
    if (finished) return;
    finished = true;
    context?.revert();
    resolve();
  };
  try {
    context = gsap.context(() => {
      gsap.fromTo(element,
        opening ? { opacity: 0, y: 8, scale: dialog ? .985 : 1 } : { opacity: 1, y: 0, scale: 1 },
        { opacity: opening ? 1 : 0, y: opening ? 0 : 6, scale: 1,
          duration: opening ? (dialog ? motion.dialogIn : motion.panelIn) : motion.panelOut,
          ease: motion.ease, onComplete: finish, onInterrupt: finish });
    }, element);
  } catch { finish(); }
  return { cancel: finish, finished: promise };
}
