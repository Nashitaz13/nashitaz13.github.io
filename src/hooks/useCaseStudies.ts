import { useEffect, useRef } from 'react';
import { panelTransition, headerOffset } from '../motion/gsap';

export default function useCaseStudies() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const region = root.current;
    if (!region) return;
    const disclosures = [...region.querySelectorAll<HTMLDetailsElement>('.case-disclosure')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let animation: ReturnType<typeof panelTransition> | undefined;
    let revision = 0;
    let ownHistory = false;
    let frame = 0;
    let anchorFrame = 0;
    let savedAnchoring: string | null = null;
    function restoreAnchoring() {
      if (savedAnchoring !== null) document.documentElement.style.overflowAnchor = savedAnchoring;
      savedAnchoring = null;
    }
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const feedbackTimers = new WeakMap<HTMLOutputElement,ReturnType<typeof setTimeout>>();
    let copyRevision = 0;
    const article = (detail: HTMLDetailsElement) => detail.querySelector<HTMLElement>('.case-study')!;
    const summary = (detail: HTMLDetailsElement) => detail.querySelector<HTMLElement>('summary')!;
    const entry = (detail: HTMLDetailsElement) => detail.closest<HTMLElement>('.project-entry')!;
    const find = (hash: string) => disclosures.find(detail => '#'+article(detail).id === hash);
    function animate(el: HTMLElement, opening: boolean) {
      if (reduce.matches) return;
      try {
        return panelTransition(el, opening);
      } catch { return; }
    }
    function url(hash: string) {
      if (location.hash === hash) return;
      history.pushState(null,'',hash);
      ownHistory = true;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      ownHistory = false;
    }
    async function select(next: HTMLDetailsElement | undefined, focus: 'summary' | 'article' | false, contextual: boolean, updateUrl: boolean) {
      const ticket = ++revision;
      animation?.cancel();
      cancelAnimationFrame(anchorFrame);
      if (contextual) {
        if (savedAnchoring === null) savedAnchoring = document.documentElement.style.overflowAnchor;
        document.documentElement.style.overflowAnchor = 'none';
      }
      const previous = disclosures.find(detail=>detail.open);
      const context = next ?? previous;
      const anchorElement = context ? (document.activeElement===summary(context) || !next && focus==='summary' ? summary(context) : entry(context)) : undefined;
      const before = anchorElement?.getBoundingClientRect().top ?? 0;
      const desired = before >= headerOffset() && before < innerHeight ? Math.min(before, Math.max(headerOffset(), innerHeight-120)) : headerOffset();
      if (previous && previous !== next && contextual) {
        const box = article(previous).getBoundingClientRect();
        if (box.bottom > 0 && box.top < innerHeight) {
          animation = animate(article(previous),false);
          if (animation) await animation.finished.catch(()=>{});
        }
      }
      if (ticket !== revision) return;
      disclosures.forEach(detail => { detail.open = detail === next; });
      if (previous !== next) region?.dispatchEvent(new Event('case-layout-settled', { bubbles: true }));
      if (contextual && anchorElement) {
        scrollTo({top:Math.max(0,scrollY+anchorElement.getBoundingClientRect().top-desired),behavior:'instant'});
      }
      if (next && contextual) animation = animate(article(next),true);
      if (updateUrl) url(next ? '#'+article(next).id : '#projects');
      if (focus && context) (focus==='article'&&next ? article(next) : summary(context)).focus({preventScroll:true});
      anchorFrame = requestAnimationFrame(()=>{anchorFrame=requestAnimationFrame(()=>{
        const timer=setTimeout(()=>{timers.delete(timer);if(ticket===revision)restoreAnchoring();},400);timers.add(timer);
      });});
    }
    function sync() {
      if (ownHistory) return;
      const destination = find(location.hash);
      const next = destination ?? (typeof history.state?.caseStudy === 'string' ? find('#'+history.state.caseStudy) : undefined);
      void select(next,false,false,false);
      cancelAnimationFrame(frame);
      if (destination) frame = requestAnimationFrame(()=>article(destination).scrollIntoView({block:'start',behavior:'instant'}));
    }
    function click(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const trigger = target?.closest<HTMLElement>('.case-disclosure > summary');
      if (trigger && region?.contains(trigger)) {
        event.preventDefault();
        const detail = trigger.parentElement as HTMLDetailsElement;
        void select(detail.open ? undefined : detail,'summary',true,true);
        return;
      }
      const collapse = target?.closest<HTMLElement>('[data-case-collapse]');
      if (collapse && region?.contains(collapse)) { event.preventDefault();void select(undefined,'summary',true,true);return; }
      const copy = target?.closest<HTMLButtonElement>('[data-copy-case]');
      if (copy && region?.contains(copy)) {
        const output = copy.parentElement?.querySelector<HTMLOutputElement>('output');
        const address = `${location.origin}${location.pathname}#${copy.dataset.copyCase}`;
        if (output) {
          const copyTicket=++copyRevision;
          copy.removeAttribute('data-copied');
          const previousTimer=feedbackTimers.get(output);
          if (previousTimer) {clearTimeout(previousTimer);timers.delete(previousTimer);}
          const copied = navigator.clipboard?.writeText ? navigator.clipboard.writeText(address) : Promise.reject(new Error('Clipboard unavailable'));
          void copied.then(()=> {
            if (copyTicket!==copyRevision) return;
            output.textContent='Link copied.';
            copy.dataset.copied='true';
            const timer=setTimeout(()=>{timers.delete(timer);output.textContent='';copy.removeAttribute('data-copied');},2500);timers.add(timer);feedbackTimers.set(output,timer);
          },()=>{if(copyTicket===copyRevision)output.textContent=`Copy unavailable. Select this link: ${address}`;});
        }
        return;
      }
      const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      const next = link ? find(link.hash) : undefined;
      if (next) {
        event.preventDefault();
        const local = entry(next).contains(link ?? null);
        void select(next,local?'summary':'article',local,true);
        if (!local) {cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>article(next).scrollIntoView({block:'start',behavior:'instant'}));}
      }
    }
    const enhanced = [...region.querySelectorAll<HTMLButtonElement>('[data-case-collapse],[data-copy-case]')];
    enhanced.forEach(button=>{button.hidden=false;});
    const change = () => { animation?.cancel(); };
    document.addEventListener('click',click);
    window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);
    reduce.addEventListener('change',change);
    sync();
    return () => {
      revision++;copyRevision++;animation?.cancel();cancelAnimationFrame(frame);cancelAnimationFrame(anchorFrame);restoreAnchoring();timers.forEach(timer=>clearTimeout(timer));
      enhanced.forEach(button=>{button.hidden=true;});
      document.removeEventListener('click',click);window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync);
      reduce.removeEventListener('change',change);
    };
  }, []);
  return root;
}
