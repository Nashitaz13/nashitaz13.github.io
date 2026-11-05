import { useEffect, useRef } from 'react';
import type { ProjectPresentation } from '../content/projectEvidence';
import ArchitectureFigure from './ArchitectureFigure';
import { panelTransition } from '../motion/gsap';
import Icon from './Icon';

export default function ArchitectureDialog({ figure, id }: { figure: ProjectPresentation['figure']; id: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const animation = useRef<ReturnType<typeof panelTransition> | null>(null);
  const savedOverflow = useRef<string | null>(null);
  function unlock() {
    if (savedOverflow.current !== null) document.documentElement.style.overflow = savedOverflow.current;
    savedOverflow.current = null;
  }
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function close(immediate = false) {
    const element = dialog.current;
    if (!element?.open) return;
    animation.current?.cancel();
    const done = () => { element.close();element.classList.remove('is-closing');unlock(); };
    if (immediate || reduced()) { done();return; }
    element.classList.add('is-closing');
    try {
      animation.current = panelTransition(element, false, true);
      void animation.current.finished.then(done,done);
    } catch { done(); }
  }
  useEffect(() => {
    const button = opener.current;
    if (button && typeof dialog.current?.showModal === 'function') button.hidden = false;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => { animation.current?.cancel();if (dialog.current?.classList.contains('is-closing')) close(true); };
    const navigate = () => close(true);
    preference.addEventListener('change',finish);window.addEventListener('hashchange',navigate);
    return () => {animation.current?.cancel();dialog.current?.close();unlock();preference.removeEventListener('change',finish);window.removeEventListener('hashchange',navigate);};
  }, []);
  function open() {
    const element = dialog.current;
    if (!element || element.open) return;
    animation.current?.cancel();element.showModal();
    savedOverflow.current=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    element.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
    if (!reduced()) {
      try {animation.current=panelTransition(element, true, true);} catch { /* Native dialog stays usable without animation. */ }
    }
  }
  return <>
    <button ref={opener} type="button" className="project-action action--secondary architecture-open" hidden onClick={open}>View architecture in detail<Icon name="external" /></button>
    <dialog ref={dialog} className="architecture-dialog" aria-labelledby={`${id}-dialog-title`} onKeyDown={event=> {
      if (event.key !== 'Tab') return;
      const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex="0"]')];
      const first=controls[0],last=controls[controls.length-1];
      if ((event.shiftKey && document.activeElement===first) || (!event.shiftKey && document.activeElement===last)) {
        event.preventDefault();(event.shiftKey?last:first)?.focus();
      }
    }} onCancel={event=>{event.preventDefault();close();}} onClose={()=> {
      unlock();
      const target = opener.current;
      if (target?.getClientRects().length) target.focus({preventScroll:true});
      else target?.closest('details')?.querySelector<HTMLElement>('summary')?.focus({preventScroll:true});
    }}>
      <div className="architecture-dialog__bar"><h4 id={`${id}-dialog-title`}>{figure.title}</h4><button type="button" className="project-action" onClick={()=>close()} autoFocus>Close<span aria-hidden="true">×</span></button></div>
      <ArchitectureFigure figure={figure} id={`${id}-detail`} inspectable={false} />
    </dialog>
  </>;
}
