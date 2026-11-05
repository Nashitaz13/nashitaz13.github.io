import { profile } from '../content/profile';
import { projects } from '../content/projects';
import { projectEvidence, type PresentedProjectId } from '../content/projectEvidence';
import '../styles/profile-sections.css';

export default function ProfileSections() {
  // The approval gate applies to every channel in this list, including personal profiles.
  const contacts: { approved: boolean; items: readonly { label: string; href: string }[] } = profile.contacts;
  const approvedContacts = contacts.approved ? contacts.items : [];
  const education = profile.about[0];
  const projectContext = profile.about[1];

  return <>
    <section id="expertise" className="section expertise" aria-labelledby="expertise-title">
      <div className="section-label"><span aria-hidden="true">02</span><h2 id="expertise-title">Expertise</h2></div>
      <p className="expertise__intro">Technology coverage from team projects. These examples describe system scope rather than individual proficiency.</p>
      <ol className="expertise__rows">
        {profile.expertise.filter(item => item.publish).map((item, index) => (
          <li className="expertise__row" key={item.id}>
            <div className="expertise__category"><span className="metadata" aria-hidden="true">0{index + 1}</span><h3>{item.category}</h3></div>
            <div className="expertise__context">
              <p data-claim={item.id}>{item.text}</p>
              <ul className="project-stack" aria-label={`${item.category}: project technologies`}>
                {item.technologies.map(tool => <li key={tool}>{tool}</li>)}
              </ul>
              <ul className="expertise__examples" aria-label={`${item.category}: related case studies`}>
                {item.projectIds.map(id => {
                  const project = projects.find(project => project.id === id && project.summary.publish);
                  const presentation = projectEvidence[id as PresentedProjectId];
                  if (!project || !presentation) return null;
                  return <li key={id}><a className="project-action" href={`#${presentation.anchor}`} aria-label={`${item.category}: ${project.title}`}>{project.title}<span aria-hidden="true">↗</span></a></li>;
                })}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>

    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="section-label"><span aria-hidden="true">03</span><h2 id="about-title">About</h2></div>
      <div className="about__content">
        <div className="about__identity">
          {profile.name.publish && <h3 data-claim={profile.name.id}>{profile.name.text}</h3>}
          {profile.positioning.publish && <div className="about__direction"><p className="metadata">Career direction</p><p data-claim={profile.positioning.id}>{profile.positioning.text}</p></div>}
        </div>
        <div className="about__context">
          {education?.publish && <div><h3>Education</h3><p data-claim={education.id}>{education.text}</p></div>}
          {projectContext?.publish && <div><h3>Project context</h3><p data-claim={projectContext.id}>{projectContext.text}</p></div>}
        </div>
      </div>
    </section>

    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="section-label"><span aria-hidden="true">04</span><h2 id="contact-title">Contact</h2></div>
      <div className="contact__content">
        {approvedContacts.length ? <ul>{approvedContacts.map(item => <li key={item.href}><a className="project-action" href={item.href}>{item.label}<span aria-hidden="true">↗</span></a></li>)}</ul> : <p>Contact details are not publicly listed.</p>}
      </div>
    </section>
  </>;
}
