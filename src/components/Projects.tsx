import { projects, type Project } from '../content/projects';
import { projectEvidence, type PresentedProjectId } from '../content/projectEvidence';
import type { Claim } from '../content/profile';
import ArchitectureFigure from './ArchitectureFigure';
import '../styles/projects.css';
import useCaseStudies from '../hooks/useCaseStudies';
import '../styles/disclosures.css';
import TechnologyStack from './TechnologyStack';
import Icon, { type IconName } from './Icon';

function sourceKind(href: string): { icon: IconName; label: string } {
  if (href.includes('/actions/runs/')) return { icon: 'branch', label: 'Workflow run' };
  if (/test/i.test(href)) return { icon: 'test', label: 'Test source' };
  if (/\.csv$/.test(href)) return { icon: 'table', label: 'Stored data' };
  if (/\.(ya?ml|tf)$/.test(href)) return { icon: 'config', label: 'Configuration' };
  if (/\.(py|ts|js)$/.test(href)) return { icon: 'code', label: 'Implementation' };
  return { icon: 'file', label: 'Document' };
}

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
            <div className="evidence-list__bar"><h4>Inspect the evidence</h4><span className="metadata">Source files</span></div>
            <p className="metadata">Pinned source files and historical records. These links establish scope, not current service health.</p>
            <ul>{evidence.map(link => {
              const kind = sourceKind(link.href);
              return <li key={link.href}><a className="evidence-link" href={link.href} target="_blank" rel="noopener noreferrer">
                <Icon name={kind.icon} /><span className="evidence-link__text"><span>{link.label}</span><small>{kind.label}</small></span><Icon name="external" className="evidence-link__external" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a></li>;
            })}</ul>
          </div>
        </aside>
      </div>
      <div className="case-study__actions">
        <button type="button" className="project-action action--secondary case-study__return" data-case-collapse hidden><Icon name="chevron" />Collapse case study</button>
        <button type="button" className="project-action action--utility" data-copy-case={anchor} hidden><Icon name="copy" className="copy-icon" /><Icon name="check" className="copied-icon" /><span>Copy case-study link</span></button>
        <a className="project-action action--back" href={`#project-summary-${project.id}`}><Icon name="up" />Back to project</a>
        <output className="copy-status" role="status" aria-live="polite" />
      </div>
    </article>
  );
}

export default function Projects() {
  const region = useCaseStudies();
  const published = projects.filter(project => project.summary.publish && project.id in projectEvidence);
  return (
    <section ref={region} id="projects" className="section projects" tabIndex={-1} aria-labelledby="projects-title">
      <div className="section-label"><span aria-hidden="true">01</span><h2 id="projects-title">Projects</h2></div>
      <p className="projects__lead">Team projects, inspected through their implementation, evidence and limits.</p>
      <ol className="project-rows">
        {published.map((project, i) => <li className="project-entry" key={project.id}>
          <div className="project-row" tabIndex={-1} id={`project-summary-${project.id}`}>
          <p className="metadata project-row__number">0{i + 1} / {project.environment}</p>
          <div className="project-row__content">
            <h3><a href={`#${projectEvidence[project.id as PresentedProjectId].anchor}`}>{project.title}</a></h3>
            <p data-claim={project.summary.id}>{project.summary.text}</p>
            <TechnologyStack tools={project.stack} label="Project technology coverage" />
            <div className="project-actions">
              {project.links.map(link => <a className="project-action action--source" href={link.href} target="_blank" rel="noopener noreferrer" key={link.href} aria-label={`${project.title}: ${link.label} (opens in a new tab)`}><Icon name="branch" />{link.label}<Icon name="external" /></a>)}
            </div>
          </div>
          </div>
          <details className="case-disclosure" name="portfolio-case-studies">
            <summary className="project-action" aria-label={`Case study: ${project.title}`}>
              <span className="case-disclosure__closed">Explore case study</span><span className="case-disclosure__open">Collapse case study</span><span className="case-disclosure__icon" aria-hidden="true">+</span>
            </summary>
            <CaseStudy project={project} number={`0${i + 1}`} />
          </details>
        </li>)}
      </ol>
    </section>
  );
}
