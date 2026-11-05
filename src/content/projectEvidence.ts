// Public, pinned repository references only. Internal audit material is never imported.
export type EvidenceLink = { label: string; href: string; sourceIds: readonly string[] };
export type ProjectPresentation = {
  anchor: string;
  revision: string;
  evidence: readonly EvidenceLink[];
  figure: {
    title: string;
    description: string;
    nodes: readonly string[];
    edges: readonly string[];
    sourceIds: readonly string[];
  };
};

const eks = 'https://github.com/daithang59/NT531_EKS-Cilium-Kubeproxy-Benchmark/blob/d03ec64db9973df061c8afe01ecc75937e67ead4/';
const sage = 'https://github.com/daithang59/sagelms/blob/3e92cd6fd93050347bd0d58456e211d378bdf590/';
const mlops = 'https://github.com/Viet-Hoang-2005/MLOps-paas-system/blob/a6c03a882ff633b732e95c40f34f0d49ab897426/';

export const projectEvidence = {
  'eks-cilium': {
    anchor: 'project-eks-cilium', revision: 'd03ec64',
    evidence: [
      { label: 'Experiment protocol', href: eks + 'docs/experiment_spec.md', sourceIds: ['E04'] },
      { label: 'EKS infrastructure', href: eks + 'terraform/modules/eks/main.tf', sourceIds: ['E02'] },
      { label: 'Baseline routing configuration', href: eks + 'helm/cilium/values-baseline.yaml', sourceIds: ['E03'] },
      { label: 'Replacement routing configuration', href: eks + 'helm/cilium/values-ebpfkpr.yaml', sourceIds: ['E03'] },
      { label: 'Latency parser tests', href: eks + 'tests/test_parse_latency.py', sourceIds: ['E07'] },
      { label: 'Stored comparison table', href: eks + 'results_analysis/comparison_AB.csv', sourceIds: ['E06'] },
    ],
    figure: {
      title: 'In-cluster request path',
      description: 'Simplified experimental setup on AWS EKS. Fortio calls the HTTP echo workload through a ClusterIP Service. Routing modes are alternative configurations, not successive stages.',
      nodes: ['Fortio client', 'ClusterIP Service', 'HTTP echo workload'],
      edges: ['HTTP requests', 'Service routing'], sourceIds: ['E02', 'E04'],
    },
  },
  sagelms: {
    anchor: 'project-sagelms', revision: '3e92cd6',
    evidence: [
      { label: 'CI checks', href: sage + '.github/workflows/ci-pr.yml', sourceIds: ['S02'] },
      { label: 'Build, scan and signing workflow', href: sage + '.github/workflows/cd-main.yml', sourceIds: ['S02'] },
      { label: 'FluxCD reconciliation', href: sage + 'infra/k8s/devsecops/fluxcd/apps-kustomization.yaml', sourceIds: ['S03'] },
      { label: 'Supply-chain policy modes', href: sage + 'infra/k8s/devsecops/kyverno/policies/supply-chain.yaml', sourceIds: ['S08'] },
      { label: 'Historical post-deploy run', href: 'https://github.com/daithang59/sagelms/actions/runs/26326491637', sourceIds: ['S06'] },
      { label: 'Inspected failed CD run', href: 'https://github.com/daithang59/sagelms/actions/runs/29681319773', sourceIds: ['S07'] },
    ],
    figure: {
      title: 'Declared GitOps reconciliation',
      description: 'Simplified configured deployment path. FluxCD reads the application configuration from Git and reconciles resources on GKE. This is a configuration view, not a successful deployment record.',
      nodes: ['Git application configuration', 'FluxCD / Kustomize', 'GKE application resources'],
      edges: ['Read desired state', 'Reconcile resources'], sourceIds: ['S03'],
    },
  },
  'drift-aware-mlops': {
    anchor: 'project-mlops', revision: 'a6c03a8',
    evidence: [
      { label: 'Prototype architecture and study', href: mlops + 'research/paper/A_Drift-Aware_MLOps_Framework_for_Multi-Model_Serving_CSONET.tex', sourceIds: ['M02'] },
      { label: 'Asynchronous record persistence', href: mlops + 'services/consumer/src/database.py', sourceIds: ['M03'] },
      { label: 'Evidently monitoring implementation', href: mlops + 'services/evidently/src/application.py', sourceIds: ['M03'] },
      { label: 'Controlled experiment protocol', href: mlops + 'research/paper/experiments/drift_only/README.md', sourceIds: ['M05'] },
      { label: 'Serving authorization tests', href: mlops + 'services/model-server/tests/test_jwt_security.py', sourceIds: ['M06'] },
    ],
    figure: {
      title: 'Asynchronous monitoring records',
      description: 'Partial implemented architecture: inference schedules an event for Redpanda; a consumer persists records in PostgreSQL. Prediction success does not guarantee durable logging. Control-plane and report generation paths are omitted here.',
      nodes: ['FastAPI inference', 'Redpanda', 'Asynchronous consumer', 'PostgreSQL records'],
      edges: ['Background event', 'Consume records', 'Persist records'], sourceIds: ['M02', 'M03'],
    },
  },
} satisfies Record<string, ProjectPresentation>;

export type PresentedProjectId = keyof typeof projectEvidence;
