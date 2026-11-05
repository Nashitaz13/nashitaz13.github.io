import { profile } from '../content/profile';
import ProfileTerminal from './ProfileTerminal';
import '../styles/hero.css';

export default function Hero() {
  const name = profile.name.text;
  const split = name.lastIndexOf(' ');

  return (
    <section id="intro" className="hero section" aria-labelledby="intro-title">
      <div className="hero__identity">
        {profile.positioning.publish && <p className="eyebrow">{profile.positioning.text}</p>}
        <h1 id="intro-title" className="hero__name">
          {profile.name.publish && (split > 0 ? <>
            <span>{name.slice(0, split)}</span>{' '}
            <span>{name.slice(split + 1)}<span className="hero__period" aria-hidden="true">.</span></span>
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
