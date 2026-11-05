import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Projects from './components/Projects';
import ProfileSections from './components/ProfileSections';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" className="container" tabIndex={-1}>
        <Hero />

        <Projects />

        <ProfileSections />
      </main>
      <Footer />
    </>
  );
}
