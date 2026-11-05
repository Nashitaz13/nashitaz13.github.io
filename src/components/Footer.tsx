import { profile } from '../content/profile';

export default function Footer() {
  return (
    <footer className="site-footer container">
      <div><p>{profile.name.publish && profile.name.text}</p><p className="icon-credit">Product names and logos are trademarks of their owners.</p></div>
      <a href="#intro">Back to top <span aria-hidden="true">↑</span></a>
    </footer>
  );
}
