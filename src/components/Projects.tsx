import { projects, type Project } from '../content/projects';
import { projectEvidence, type PresentedProjectId } from '../content/projectEvidence';
import type { Claim } from '../content/profile';
import ArchitectureFigure from './ArchitectureFigure';
import '../styles/projects.css';

function ClaimBlock({ title, claims, id, emphasized = false }: { title: string; claims: readonly Claim[]; id: string; emphasized?: boolean }) {
  const published = claims.filter(claim => claim.publish);
  if (!published.length) return null;
  return <section className={`case-study__block${emphasized ? ' case-study__block--bounded' : ''}`} aria-labelledby={id}>
    <h4 id={id}>{title}</h4>
    <div>{published.map(claim => <p key={claim.id} data-claim={claim.id}>{claim.text}</p>)}</div>
  </section>;
}

function CaseStudy({ project, number }: { project: Project; number: string }) {
  const presentation = projectEvidence[project.id as PresentedProjectId];
  const { anchor, figure, evidence, revision } = presentation;
  const study = project.caseStudy;
  const contributions = project.individualContributions.filter(claim => claim.publish && claim.scope === 'individual' && (claim.status === 'owner-confirmed' || claim.status === 'corroborated'));
  return (
    <article className="case-study" id={anchor} aria-labelledby={`${anchor}-title`} tabIndex={-1}>
      <header className="case-study__header">
        <p className="metadata">Case study {number} / {project.environment}</p>
        <h3 id={`${anchor}-title`}>{project.title}</h3>
        <div className="case-study__meta">
          {project.membership.publish && <span data-claim={project.membership.id}>{project.membership.text}</span>}
          <span>Repository snapshot · {revision}</span>
        </div>
      </header>
      <div className="case-study__layout">
        <div className="case-study__narrative">
          <ClaimBlock title="Overview" claims={[study.context]} id={`${anchor}-overview`} />
          <ClaimBlock title="Engineering problem" claims={[study.problem]} id={`${anchor}-problem`} />
          <ClaimBlock title="Architecture" claims={[study.architecture]} id={`${anchor}-architecture`} />
          <ClaimBlock title="Implementation" claims={[study.implementation]} id={`${anchor}-implementation`} />
          <ClaimBlock title="My contribution" claims={contributions} id={`${anchor}-contribution`} />
          <ClaimBlock title="Testing & evidence" claims={[study.testing]} id={`${anchor}-testing`} />
          <ClaimBlock title="Results & limitations" claims={[study.results, study.limitations]} id={`${anchor}-results`} emphasized />
          <ClaimBlock title="Trade-offs & engineering takeaways" claims={[study.tradeoff, study.takeaway]} id={`${anchor}-takeaway`} />
        </div>
        <aside className="case-study__evidence" aria-label={`${project.title}: architecture and sources`}>
          <ArchitectureFigure figure={figure} id={anchor} />
          <div className="evidence-list">
            <h4>Inspect the evidence</h4>
            <p className="metadata">Pinned source files and historical records. These links establish scope, not current service health.</p>
            <ul>{evidence.map(link => <li key={link.href}><a className="project-action" href={link.href}>{link.label}<span aria-hidden="true">↗</span></a></li>)}</ul>
          </div>
        </aside>
      </div>
      <a className="project-action case-study__return" href="#projects">Back to projects<span aria-hidden="true">↑</span></a>
    </article>
  );
}

export default function Projects() {
  const published = projects.filter(project => project.summary.publish && project.id in projectEvidence);
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="section-label"><span aria-hidden="true">01</span><h2 id="projects-title">Projects</h2></div>
      <p className="projects__lead">Team projects, inspected through their implementation, evidence and limits.</p>
      <ol className="project-rows">
        {published.map((project, i) => <li className="project-row" key={project.id}>
          <p className="metadata project-row__number">0{i + 1} / {project.environment}</p>
          <div className="project-row__content">
            <h3><a href={`#${projectEvidence[project.id as PresentedProjectId].anchor}`}>{project.title}</a></h3>
            <p data-claim={project.summary.id}>{project.summary.text}</p>
            <ul className="project-stack" aria-label="Project technology coverage">{project.stack.map(tool => <li key={tool}>{tool}</li>)}</ul>
            <div className="project-actions">
              <a className="project-action" href={`#${projectEvidence[project.id as PresentedProjectId].anchor}`} aria-label={`Explore case study: ${project.title}`}>Explore case study<span aria-hidden="true">↘</span></a>
              {project.links.map(link => <a className="project-action project-action--muted" href={link.href} key={link.href} aria-label={`${project.title}: ${link.label}`}>{link.label}<span aria-hidden="true">↗</span></a>)}
            </div>
          </div>
        </li>)}
      </ol>
      <div className="case-studies">{published.map((project, i) => <CaseStudy key={project.id} project={project} number={`0${i + 1}`} />)}</div>
    </section>
  );
}
