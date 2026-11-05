import { profile } from '../content/profile';

export default function Footer() {
  return (
    <footer className="site-footer container">
      <p>{profile.name.publish && profile.name.text}</p>
      <a href="#intro">Back to top <span aria-hidden="true">↑</span></a>
    </footer>
  );
}
