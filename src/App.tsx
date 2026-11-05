import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Projects from './components/Projects';
import ProfileSections from './components/ProfileSections';
import MotionExperience from './components/MotionExperience';
import { useRef } from 'react';
import Atmosphere from './components/Atmosphere';
import ScrollExperience from './components/ScrollExperience';
import NavigationExperience from './components/NavigationExperience';

export default function App() {
  const main = useRef<HTMLElement>(null);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <MotionExperience />
      <Atmosphere />
      <Header />
      <main ref={main} id="main" className="container" tabIndex={-1}>
        <Hero />

        <Projects />

        <ProfileSections />
      </main>
      <ScrollExperience scope={main} />
      <Footer />
      <NavigationExperience />
    </>
  );
}
