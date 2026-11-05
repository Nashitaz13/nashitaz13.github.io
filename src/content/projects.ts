import type { Claim } from './profile';

export type Project = {
  id: string;
  title: string;
  environment: 'Academic project' | 'Research prototype';
  membership: Claim;
  summary: Claim;
  stack: readonly string[];
  caseStudy: {
    context: Claim;
    problem: Claim;
    architecture: Claim;
    implementation: Claim;
    testing: Claim;
    results: Claim;
    limitations: Claim;
    tradeoff: Claim;
    takeaway: Claim;
  };
  individualContributions: readonly Claim[];
  links: readonly { label: string; href: string; sourceIds: readonly string[] }[];
  assets: readonly { path: string; alt: string; approved: boolean }[];
};

// Only public-safe drafts belong here. Blocked claims and owner questions stay in the audit.
export const projects: readonly Project[] = [
  {
    id: 'eks-cilium',
    title: 'EKS Cilium vs kube-proxy Benchmark',
    environment: 'Academic project',
    membership: {
      id: 'E10', text: 'Team member', sourceIds: ['CV01', 'E01'],
      status: 'corroborated', scope: 'identity', publish: true,
    },
    summary: {
      id: 'E11',
      text: 'An AWS EKS experiment comparing kube-proxy service routing with Cilium eBPF replacement through repeatable Fortio workloads.',
      sourceIds: ['E01', 'E02', 'E03', 'E04'],
      status: 'corroborated', scope: 'team', publish: true,
    },
    stack: ['AWS EKS', 'Terraform', 'Cilium', 'Helm', 'Fortio', 'Bash', 'Python', 'Prometheus', 'Grafana', 'Hubble'],
    caseStudy: {
      context: {
        id: 'E12', text: 'A university networking project investigating in-cluster Kubernetes Service traffic under steady load, connection churn and network policy changes.',
        sourceIds: ['E01', 'E04'], status: 'corroborated', scope: 'team', publish: true,
      },
      problem: {
        id: 'E13', text: 'Compare service-routing configurations while retaining workload parameters and artifacts needed to explain latency and request failures.',
        sourceIds: ['E04'], status: 'corroborated', scope: 'team', publish: true,
      },
      architecture: {
        id: 'E14', text: 'Terraform defines the VPC and managed EKS workers. Fortio clients call an HTTP echo workload through a ClusterIP Service; separate Helm values configure the routing modes and monitoring.',
        sourceIds: ['E02', 'E03', 'E04', 'E05'], status: 'corroborated', scope: 'team', publish: true,
      },
      implementation: {
        id: 'E15', text: 'Shell scripts orchestrate baseline, churn and policy experiments. Python analysis groups phase-level measurements and converts request latency into milliseconds.',
        sourceIds: ['E04', 'E06'], status: 'corroborated', scope: 'team', publish: true,
      },
      testing: {
        id: 'E16', text: 'The repository contains parser and experiment-metadata checks, including a request-versus-connection latency regression check. Their presence is not a claim that every test currently passes.',
        sourceIds: ['E07'], status: 'corroborated', scope: 'team', publish: true,
      },
      results: {
        id: 'E17', text: 'Stored Fortio measurements and analysis tables provide inspectable experimental evidence. A sampled steady-state group agrees with its rounded aggregate table; no general performance advantage is claimed here.',
        sourceIds: ['E06', 'E08'], status: 'corroborated', scope: 'team', publish: true,
      },
      limitations: {
        id: 'E18', text: 'The checked mode configurations also differ in IPAM and observability settings. These measurements compare configurations and do not isolate eBPF as the sole cause of a difference.',
        sourceIds: ['E03', 'E05'], status: 'corroborated', scope: 'team', publish: true,
      },
      tradeoff: {
        id: 'E19', text: 'Workers are pinned to one availability zone to reduce cross-zone variation, limiting how directly the experiment represents a multi-zone deployment.',
        sourceIds: ['E02', 'E04'], status: 'corroborated', scope: 'team', publish: true,
      },
      takeaway: {
        id: 'E20', text: 'Benchmark interpretation needs the configuration and request-level evidence alongside the aggregate numbers.',
        sourceIds: ['E03', 'E06', 'E07', 'E08'], status: 'corroborated', scope: 'editorial', publish: true,
      },
    },
    individualContributions: [],
    links: [{ label: 'Source repository', href: 'https://github.com/daithang59/NT531_EKS-Cilium-Kubeproxy-Benchmark', sourceIds: ['E01'] }],
    assets: [],
  },
  {
    id: 'sagelms',
    title: 'SageLMS — DevSecOps Delivery',
    environment: 'Academic project',
    membership: {
      id: 'S10', text: 'Team member', sourceIds: ['CV01', 'S01'],
      status: 'corroborated', scope: 'identity', publish: true,
    },
    summary: {
      id: 'S11', text: 'A microservices learning platform with GitHub Actions workflows for testing, container scanning, SBOM generation and image signing, plus FluxCD deployment configuration for GKE.',
      sourceIds: ['S01', 'S02', 'S03'], status: 'corroborated', scope: 'team', publish: true,
    },
    stack: ['Docker', 'GitHub Actions', 'Trivy', 'Cosign', 'Harbor', 'FluxCD', 'Kustomize', 'GKE', 'OpenTofu', 'Prometheus', 'Grafana'],
    caseStudy: {
      context: {
        id: 'S12', text: 'The team project combines a learning-management application with an engineering delivery environment for web and backend services.',
        sourceIds: ['S01'], status: 'corroborated', scope: 'team', publish: true,
      },
      problem: {
        id: 'S13', text: 'Make changes traceable from pull-request checks through container artifacts and deployment configuration, with security checks in the delivery path.',
        sourceIds: ['S01', 'S02'], status: 'corroborated', scope: 'team', publish: true,
      },
      architecture: {
        id: 'S14', text: 'A web client reaches backend services through a gateway. The DevSecOps configuration uses GKE, Harbor image storage, FluxCD/Kustomize reconciliation, external secret resources and Prometheus/Grafana monitoring.',
        sourceIds: ['S01', 'S03', 'S04'], status: 'corroborated', scope: 'team', publish: true,
      },
      implementation: {
        id: 'S15', text: 'CI defines service tests and security checks. CD defines image builds, Trivy scanning, CycloneDX SBOMs, Cosign signing and verification before preparing a deployment pull request.',
        sourceIds: ['S02'], status: 'corroborated', scope: 'team', publish: true,
      },
      testing: {
        id: 'S16', text: 'Workflows define Java, Python and frontend checks, plus separate rollout and endpoint smoke checks. The endpoint check accepts configured status codes, so success must be read within that scope.',
        sourceIds: ['S02', 'S05'], status: 'corroborated', scope: 'team', publish: true,
      },
      results: {
        id: 'S17', text: 'A historical post-deployment workflow has a recorded successful conclusion. This is evidence of that run, not a current availability or release-health guarantee.',
        sourceIds: ['S06'], status: 'corroborated', scope: 'team', publish: true,
      },
      limitations: {
        id: 'S18', text: 'The latest CD run inspected failed during Google Cloud authentication and skipped the image-build and deploy-PR jobs. The inspected supply-chain admission policies are configured in Audit mode.',
        sourceIds: ['S07', 'S08'], status: 'corroborated', scope: 'team', publish: true,
      },
      tradeoff: {
        id: 'S19', text: 'Pipeline definitions and policy resources show intended controls; successful execution and enforced admission require separate evidence.',
        sourceIds: ['S02', 'S07', 'S08'], status: 'corroborated', scope: 'editorial', publish: true,
      },
      takeaway: {
        id: 'S20', text: 'Delivery claims are strongest when tied to an image digest, workflow run and deployment revision rather than a pipeline diagram alone.',
        sourceIds: ['S02', 'S05', 'S06', 'S07'], status: 'corroborated', scope: 'editorial', publish: true,
      },
    },
    individualContributions: [],
    links: [{ label: 'Source repository', href: 'https://github.com/daithang59/sagelms', sourceIds: ['S01'] }],
    assets: [],
  },
  {
    id: 'drift-aware-mlops',
    title: 'Drift-Aware MLOps — Multi-Model Serving',
    environment: 'Research prototype',
    membership: {
      id: 'M10', text: 'Team member', sourceIds: ['CV01', 'M01'],
      status: 'corroborated', scope: 'identity', publish: true,
    },
    summary: {
      id: 'M11', text: 'A research prototype connecting model-version metadata, prediction serving, asynchronous logs and drift reports, with a controlled network-intrusion-detection study.',
      sourceIds: ['M01', 'M02', 'M03', 'M05'], status: 'corroborated', scope: 'team', publish: true,
    },
    stack: ['Django', 'FastAPI', 'PostgreSQL', 'Redpanda', 'Evidently', 'AWS S3', 'Docker', 'K3s', 'Argo Workflows', 'Terraform', 'Ansible'],
    caseStudy: {
      context: {
        id: 'M12', text: 'A team-built model-platform prototype and research case study, with local container and declared Kubernetes execution paths.',
        sourceIds: ['M01', 'M02', 'M04'], status: 'corroborated', scope: 'team', publish: true,
      },
      problem: {
        id: 'M13', text: 'Connect serving versions with monitoring evidence while distinguishing a distribution change from an actual loss of prediction quality.',
        sourceIds: ['M02', 'M05'], status: 'corroborated', scope: 'team', publish: true,
      },
      architecture: {
        id: 'M14', text: 'The Django control plane stores lifecycle metadata in PostgreSQL. A FastAPI gateway routes predictions; Redpanda and a consumer carry asynchronous records into drift analysis and report storage.',
        sourceIds: ['M02', 'M03'], status: 'corroborated', scope: 'team', publish: true,
      },
      implementation: {
        id: 'M15', text: 'Execution adapters support Docker and Argo paths. Terraform and Ansible define AWS/K3s infrastructure, while workflow manifests describe cluster jobs. Configuration is not evidence that every path was evaluated.',
        sourceIds: ['M02', 'M04'], status: 'corroborated', scope: 'team', publish: true,
      },
      testing: {
        id: 'M16', text: 'The source includes gateway authorization and Argo-backend tests. The research tree retains fixed-model experiment artifacts separately from a service replay report.',
        sourceIds: ['M05', 'M06', 'M07'], status: 'corroborated', scope: 'team', publish: true,
      },
      results: {
        id: 'M17', text: 'The manuscript and stored experiment reports describe cases where distribution alerts and predictive quality disagree. The evaluation keeps the classifier fixed and does not establish an effective adaptation policy.',
        sourceIds: ['M02', 'M05'], status: 'corroborated', scope: 'team', publish: true,
      },
      limitations: {
        id: 'M18', text: 'The study evaluates one classifier rather than multi-tenant performance isolation or platform scalability. Durable exactly-once logging and complete failure recovery are not established.',
        sourceIds: ['M02'], status: 'corroborated', scope: 'team', publish: true,
      },
      tradeoff: {
        id: 'M19', text: 'Prediction handling and logging are asynchronous; a successful prediction response alone does not prove that its monitoring record was durably stored.',
        sourceIds: ['M02', 'M03'], status: 'corroborated', scope: 'team', publish: true,
      },
      takeaway: {
        id: 'M20', text: 'Treat drift alerts as evidence for review, with model identity and labeled quality context, rather than as proof that automatic replacement is safe.',
        sourceIds: ['M02', 'M05'], status: 'corroborated', scope: 'editorial', publish: true,
      },
    },
    individualContributions: [],
    links: [{ label: 'Source repository', href: 'https://github.com/Viet-Hoang-2005/MLOps-paas-system', sourceIds: ['M01'] }],
    assets: [],
  },
];
