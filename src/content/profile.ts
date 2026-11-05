export type EvidenceStatus =
  | 'corroborated'
  | 'CV-only'
  | 'owner-confirmed'
  | 'unverified';

export type Claim = {
  id: string;
  text: string;
  sourceIds: readonly string[];
  status: EvidenceStatus;
  scope: 'identity' | 'team' | 'individual' | 'editorial';
  publish: boolean;
};

// Source IDs resolve in the internal content audit; never render that audit.
export const profile = {
  name: {
    id: 'P01',
    text: 'Bùi Ngọc Thái',
    sourceIds: ['CV01', 'E01', 'S01', 'M01'],
    status: 'corroborated',
    scope: 'identity',
    publish: true,
  },
  positioning: {
    id: 'P02',
    text: 'DevOps Intern / Cloud & Platform Engineering',
    sourceIds: ['OWNER01', 'CV01'],
    status: 'owner-confirmed',
    scope: 'identity',
    publish: true,
  },
  intro: {
    id: 'P03',
    text: 'A portfolio of team projects in Kubernetes networking, software delivery and model-serving infrastructure.',
    sourceIds: ['E01', 'S01', 'M01'],
    status: 'corroborated',
    scope: 'team',
    publish: true,
  },
  primaryAction: { label: 'Explore projects', href: '#projects' },
  about: [
    {
      id: 'P04',
      text: 'Computer Networks and Data Communications, University of Information Technology, VNU-HCM.',
      sourceIds: ['CV01', 'E01', 'M01'],
      status: 'corroborated',
      scope: 'identity',
      publish: true,
    },
    {
      id: 'P05',
      text: 'These case studies describe the systems, evidence and limitations of my team projects. They distinguish repository functionality from individual contribution.',
      sourceIds: ['E01', 'S01', 'M01', 'SPEC01'],
      status: 'corroborated',
      scope: 'editorial',
      publish: true,
    },
  ] satisfies readonly Claim[],
  // This is project coverage, not a personal proficiency or employment claim.
  expertise: [
    {
      id: 'X01',
      category: 'Cloud & Infrastructure',
      text: 'Project configurations cover AWS EKS with Terraform and GKE with OpenTofu.',
      technologies: ['AWS EKS', 'Terraform', 'GKE', 'OpenTofu'],
      projectIds: ['eks-cilium', 'sagelms'],
      sourceIds: ['E02', 'S02', 'S03'],
      status: 'corroborated',
      scope: 'team',
      publish: true,
    },
    {
      id: 'X02',
      category: 'Containers & Delivery',
      text: 'SageLMS connects container builds, image scanning, SBOMs and signing to a FluxCD deployment configuration.',
      technologies: ['Docker', 'GitHub Actions', 'Trivy', 'Cosign', 'FluxCD', 'Kustomize'],
      projectIds: ['sagelms'],
      sourceIds: ['S02', 'S03'],
      status: 'corroborated',
      scope: 'team',
      publish: true,
    },
    {
      id: 'X03',
      category: 'Networking & Observability',
      text: 'The EKS benchmark combines Fortio workloads with Cilium configuration and Prometheus/Grafana monitoring configuration.',
      technologies: ['Cilium', 'Fortio', 'Prometheus', 'Grafana', 'Hubble'],
      projectIds: ['eks-cilium'],
      sourceIds: ['E03', 'E04', 'E05'],
      status: 'corroborated',
      scope: 'team',
      publish: true,
    },
    {
      id: 'X04',
      category: 'Model Platform Engineering',
      text: 'The MLOps prototype separates lifecycle metadata, prediction serving, asynchronous logging and drift reporting.',
      technologies: ['Django', 'FastAPI', 'PostgreSQL', 'Redpanda', 'Evidently', 'Argo Workflows'],
      projectIds: ['drift-aware-mlops'],
      sourceIds: ['M02', 'M03', 'M04'],
      status: 'corroborated',
      scope: 'team',
      publish: true,
    },
  ] satisfies readonly (Claim & {
    category: string;
    technologies: readonly string[];
    projectIds: readonly string[];
  })[],
  contacts: { approved: false, items: [] },
  resume: { approved: false, href: null },
  publication: { approved: false, items: [] },
} satisfies {
  name: Claim;
  positioning: Claim;
  intro: Claim;
  primaryAction: { label: string; href: string };
  about: readonly Claim[];
  expertise: readonly (Claim & {
    category: string;
    technologies: readonly string[];
    projectIds: readonly string[];
  })[];
  contacts: { approved: boolean; items: readonly { label: string; href: string }[] };
  resume: { approved: boolean; href: string | null };
  publication: { approved: boolean; items: readonly { title: string; href: string }[] };
};
