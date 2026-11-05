import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Projects from './components/Projects';
import { profile } from './content/profile';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" className="container" tabIndex={-1}>
        <Hero />

        <Projects />

        <section id="expertise" className="section compact-section" aria-labelledby="expertise-title">
          <div className="section-label"><span aria-hidden="true">02</span><h2 id="expertise-title">Expertise</h2></div>
          <ul className="capability-index" aria-label="Project technology coverage">
            {profile.expertise.filter(item => item.publish).map(item => <li key={item.id}>{item.category}</li>)}
          </ul>
        </section>

        <section id="about" className="section compact-section" aria-labelledby="about-title">
          <div className="section-label"><span aria-hidden="true">03</span><h2 id="about-title">About</h2></div>
          {profile.about[0]?.publish && <p className="section-copy">{profile.about[0].text}</p>}
        </section>

        <section id="contact" className="section compact-section" aria-labelledby="contact-title">
          <div className="section-label"><span aria-hidden="true">04</span><h2 id="contact-title">Contact</h2></div>
          {/* Contact values remain absent until approved by the owner. */}
        </section>
      </main>
      <Footer />
    </>
  );
}
