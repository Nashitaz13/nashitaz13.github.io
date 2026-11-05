import { profile } from '../content/profile';
import ProfileTerminal from './ProfileTerminal';
import '../styles/hero.css';
import { useRef } from 'react';
import { gsap, useGSAP } from '../motion/gsap';

export default function Hero() {
  const name = profile.name.text;
  const split = name.lastIndexOf(' ');
  const heading = useRef<HTMLHeadingElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    let played = false;
    let timeline: gsap.core.Timeline | undefined;
    const finish = () => timeline?.progress(1);
    try { media.add('(prefers-reduced-motion: no-preference)', () => {
      if (played || document.hidden || location.hash && location.hash !== '#intro') return;
      played = true;
      timeline = gsap.timeline().fromTo('.hero__line', { y: 28, opacity: .15 },
        { y: 0, opacity: 1, duration: .72, stagger: .12, ease: 'power3.out' })
        .fromTo('.hero__period', { opacity: .4, scale: .85 }, { opacity: 1, scale: 1, duration: .24, ease: 'power3.out' }, .56);
    }); } catch { media.revert(); }
    window.addEventListener('hashchange', finish);
    const visibility = () => { if (document.hidden) finish(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('hashchange',finish); document.removeEventListener('visibilitychange',visibility); media.revert(); };
  }, { scope: heading });

  return (
    <section id="intro" className="hero section" aria-labelledby="intro-title" tabIndex={-1}>
      <div className="hero__identity">
        {profile.positioning.publish && <p className="eyebrow">{profile.positioning.text}</p>}
        <h1 ref={heading} id="intro-title" className="hero__name">
          {profile.name.publish && (split > 0 ? <>
            <span className="hero__mask"><span className="hero__line">{name.slice(0, split)}</span></span>{' '}
            <span className="hero__mask"><span className="hero__line">{name.slice(split + 1)}<span className="hero__period" aria-hidden="true">.</span></span></span>
          </> : name)}
        </h1>
        {profile.intro.publish && <p className="hero__intro">{profile.intro.text}</p>}
        <a className="primary-link" href={profile.primaryAction.href}>
          {profile.primaryAction.label}<span aria-hidden="true">↘</span>
        </a>
      </div>
      <ProfileTerminal />
    </section>
  );
}
