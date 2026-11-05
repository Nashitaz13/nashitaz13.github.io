import Icon from './Icon';

const assets = import.meta.glob<string>(['../assets/icons/*.svg', '!../assets/icons/ui-*.svg', '!../assets/icons/flux.svg', '!../assets/icons/kubernetes.svg'], { eager: true, query: '?no-inline', import: 'default' });
const marks: Record<string, string> = {
  'AWS EKS': 'aws', 'AWS S3': 'aws', GKE: 'google-cloud', Terraform: 'terraform',
  Cilium: 'cilium', Helm: 'helm', Bash: 'bash', Python: 'python', Prometheus: 'prometheus',
  Grafana: 'grafana', Docker: 'docker', 'GitHub Actions': 'github-actions', Trivy: 'trivy',
  Harbor: 'harbor', FluxCD: 'si-flux', OpenTofu: 'opentofu', Django: 'django', FastAPI: 'fastapi',
  PostgreSQL: 'postgres', K3s: 'k3s', 'Argo Workflows': 'argo', Ansible: 'ansible',
};

export default function TechnologyStack({ tools, label }: { tools: readonly string[]; label: string }) {
  return <ul className="project-stack technology-grid" aria-label={label}>
    {tools.map(tool => {
      const source = marks[tool] ? assets[`../assets/icons/${marks[tool]}.svg`] : undefined;
      return <li className="technology-tile" key={tool}>
        <span className="technology-tile__mark" aria-hidden="true">
          {source ? <img src={source} alt="" width="32" height="32" loading="lazy" /> : <Icon name="box" />}
        </span>
        <span>{tool}</span>
      </li>;
    })}
  </ul>;
}
