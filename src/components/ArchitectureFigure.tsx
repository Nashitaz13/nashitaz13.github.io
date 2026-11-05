import type { ProjectPresentation } from '../content/projectEvidence';

export default function ArchitectureFigure({ figure, id }: { figure: ProjectPresentation['figure']; id: string }) {
  const height = figure.nodes.length * 104 - 40;
  return (
    <figure className="architecture-figure">
      <figcaption id={`${id}-figure-caption`}>
        <span className="metadata">Architecture detail</span>
        <strong>{figure.title}</strong>
        <span>{figure.description}</span>
      </figcaption>
      <svg viewBox={`0 0 300 ${height}`} role="img" aria-labelledby={`${id}-figure-title ${id}-figure-desc`}>
        <title id={`${id}-figure-title`}>{figure.title}</title>
        <desc id={`${id}-figure-desc`}>{figure.nodes.map((node, i) => `${node}${figure.edges[i] ? ` — ${figure.edges[i]} → ` : ''}`).join('')}</desc>
        {figure.nodes.map((node, i) => (
          <g key={node}>
            <rect x="4" y={i * 104 + 4} width="292" height="56" rx="4" />
            <text x="150" y={i * 104 + 38} textAnchor="middle">{node}</text>
            {figure.edges[i] && <>
              <path d={`M150 ${i * 104 + 60} v44 m-4 -5 l4 5 l4 -5`} />
              <text className="architecture-figure__edge" x="162" y={i * 104 + 88}>{figure.edges[i]}</text>
            </>}
          </g>
        ))}
      </svg>
    </figure>
  );
}
