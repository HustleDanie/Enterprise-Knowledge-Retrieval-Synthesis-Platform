'use client';

import { motion } from 'framer-motion';
import {
  Server,
  Search,
  Database,
  Brain,
  Activity,
  Container,
  GitBranch,
  Layout,
  Shield,
  Gauge,
  Layers,
  Code2,
  ArrowRight,
  ChevronRight,
  Cpu,
  BarChart3,
  FileCode2,
  Globe,
  Monitor,
  Upload,
  MessageSquare,
  Settings,
  ArrowDown,
  Shuffle,
  Filter,
  HardDrive,
  FileText,
  LineChart,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' },
  }),
};

interface TechItem {
  label: string;
  detail: string;
  icon: React.ElementType;
}

const architectureSections: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  items: TechItem[];
}[] = [
  {
    id: 'backend',
    title: 'Backend Architecture',
    subtitle: 'High-performance async API layer',
    icon: Server,
    color: 'from-blue-500 to-blue-700',
    items: [
      {
        label: 'FastAPI',
        detail:
          'Async web framework with auto-generated OpenAPI docs, Pydantic validation, and dependency injection.',
        icon: Code2,
      },
      {
        label: 'Lifespan Context Manager',
        detail:
          'Proper startup/shutdown lifecycle — pre-warms embedding models, vector database connections, and LLM clients in a background thread so the first user request is instant.',
        icon: Cpu,
      },
      {
        label: 'RESTful API Design',
        detail:
          'Versioned endpoints for document upload, querying, and health checks. All request/response payloads validated via Pydantic schemas with full Swagger documentation.',
        icon: Globe,
      },
    ],
  },
  {
    id: 'rag',
    title: 'RAG Pipeline',
    subtitle: 'Hybrid search with Reciprocal Rank Fusion',
    icon: Search,
    color: 'from-emerald-500 to-emerald-700',
    items: [
      {
        label: 'Semantic Search',
        detail:
          'Sentence-transformers MiniLM model generates 384-dimensional embeddings stored in ChromaDB. Captures meaning-level similarity beyond keyword overlap.',
        icon: Brain,
      },
      {
        label: 'Keyword Search',
        detail:
          'TF-IDF-style term overlap with exact phrase boosting. Catches specific names, policy numbers, and terms that semantic search can miss.',
        icon: FileCode2,
      },
      {
        label: 'Reciprocal Rank Fusion (k=60)',
        detail:
          'Results from both retrieval methods are merged using RRF — the same algorithm used by production search engines like Elasticsearch. Score = 1/(rank + k), weighted by α=0.7 for semantic.',
        icon: Layers,
      },
      {
        label: 'Local LLM Synthesis',
        detail:
          'Llama 3.2 via Ollama for on-device inference. Falls back to OpenAI if configured, or raw document excerpts otherwise. Uses asyncio.to_thread() to avoid blocking the event loop.',
        icon: Cpu,
      },
    ],
  },
  {
    id: 'embedding',
    title: 'Embedding & Vector Store',
    subtitle: 'Pluggable storage backends',
    icon: Database,
    color: 'from-violet-500 to-violet-700',
    items: [
      {
        label: 'ChromaDB (PersistentClient)',
        detail:
          'Vectors survive server restarts via persistent storage. Supports metadata filtering for scoped queries.',
        icon: Database,
      },
      {
        label: 'Pinecone (Cloud)',
        detail:
          'Production-ready managed vector database for large-scale deployments with auto-scaling and low-latency.',
        icon: Globe,
      },
      {
        label: 'In-Memory Fallback',
        detail:
          'Zero-config fallback for testing and development — swap backends without touching business logic.',
        icon: Cpu,
      },
      {
        label: 'Sentence-Transformers (all-MiniLM-L6-v2)',
        detail:
          '384-dimensional embeddings generated locally. No API keys, no network calls, full privacy.',
        icon: Brain,
      },
    ],
  },
  {
    id: 'ingestion',
    title: 'Document Ingestion',
    subtitle: 'Intelligent chunking and processing',
    icon: Layers,
    color: 'from-amber-500 to-amber-700',
    items: [
      {
        label: 'Multi-Format Loader',
        detail:
          'Supports PDF (via PyMuPDF), DOCX, TXT, and Markdown. Extensible loader architecture for adding new formats.',
        icon: FileCode2,
      },
      {
        label: 'Semantic Chunking',
        detail:
          'Configurable chunk size (1024 tokens) with overlap (128 tokens) to preserve context across boundaries. Generates metadata per chunk for traceability.',
        icon: Layers,
      },
    ],
  },
];

const productionSections: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  items: { label: string; detail: string }[];
}[] = [
  {
    id: 'mlops',
    title: 'MLOps Infrastructure',
    subtitle: 'Experiment tracking & model monitoring',
    icon: Activity,
    color: 'from-rose-500 to-rose-700',
    items: [
      {
        label: 'MLflow Experiment Tracking',
        detail:
          'Logs parameters (top_k, model type, chunk size), metrics (retrieval recall, MRR, latency), and artifacts for every experiment run. Enables systematic comparison of configurations.',
      },
      {
        label: 'Prometheus Metrics',
        detail:
          'Custom collectors track query count, latency histograms, embedding generation time, vector search duration, and relevance scores in real-time.',
      },
      {
        label: 'Grafana Dashboards',
        detail:
          'Pre-configured dashboards visualise system health, query performance trends, and resource utilisation. Connected to Prometheus data source.',
      },
      {
        label: 'Evidently AI (Drift Detection)',
        detail:
          'Monitors embedding distribution shifts and data drift over time. Alerts when model performance degrades so you can retrain or adjust.',
      },
    ],
  },
  {
    id: 'devops',
    title: 'Docker & Infrastructure',
    subtitle: 'Six-service orchestration',
    icon: Container,
    color: 'from-cyan-500 to-cyan-700',
    items: [
      {
        label: 'Docker Compose (6 Services)',
        detail:
          'PostgreSQL for metadata, ChromaDB for vectors, MLflow for experiments, Prometheus + Grafana for monitoring, app + frontend. Health checks and dependency ordering.',
      },
      {
        label: 'Multi-Stage Dockerfile',
        detail:
          'Optimised builds with separate builder and runtime stages. Minimal final image with only production dependencies.',
      },
      {
        label: 'Kubernetes-Ready',
        detail:
          'Architecture designed for K8s deployment with horizontal scaling, readiness/liveness probes, and environment-based configuration.',
      },
    ],
  },
  {
    id: 'cicd',
    title: 'CI/CD Pipeline',
    subtitle: 'Automated testing, build & deploy',
    icon: GitBranch,
    color: 'from-orange-500 to-orange-700',
    items: [
      {
        label: 'GitHub Actions',
        detail:
          'Three-stage pipeline: lint (flake8) + type check (mypy) + test (pytest with coverage), build (Docker image), deploy. Uses PostgreSQL service container for real integration tests.',
      },
      {
        label: 'Code Quality',
        detail:
          'Automated linting with flake8, static type analysis with mypy, and test coverage reporting via codecov on every push.',
      },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'Modern React with intelligent health checks',
    icon: Layout,
    color: 'from-indigo-500 to-indigo-700',
    items: [
      {
        label: 'Next.js 16 + React 19',
        detail:
          'Latest framework versions with Turbopack for fast development builds. Server-side rendering capable with App Router.',
      },
      {
        label: 'Three-Step Flow',
        detail:
          'Upload → Ask → Results. Guided user experience with drag-and-drop upload, real-time status tracking, and animated transitions via Framer Motion.',
      },
      {
        label: 'Smart Health Checks',
        detail:
          'Consecutive-failure tracking to avoid false offline alerts, paused during queries. Uses native fetch with AbortController and 15s timeout.',
      },
    ],
  },
];

const designDecisions: {
  question: string;
  answer: string;
  icon: React.ElementType;
}[] = [
  {
    question: 'Why hybrid search over pure semantic?',
    answer:
      'Semantic search captures meaning but misses exact term matches — policy numbers, proper names, acronyms. Keyword search catches those. Reciprocal Rank Fusion gives the best of both worlds without manual weight tuning.',
    icon: Search,
  },
  {
    question: 'Why local LLM over cloud API?',
    answer:
      'Running Llama 3.2 locally through Ollama means document content stays on-premise. No API costs and no data leaving the network.',
    icon: Shield,
  },
  {
    question: 'Why ChromaDB over FAISS?',
    answer:
      'ChromaDB provides persistence, metadata filtering, and a clean Python API. FAISS is faster for pure vector similarity, but ChromaDB is the better choice for a production system that needs restarts, filtered queries, and multi-tenant isolation.',
    icon: Database,
  },
  {
    question: 'Why asyncio.to_thread for the LLM call?',
    answer:
      "Ollama's Python client is synchronous. Calling it directly in an async FastAPI handler freezes the entire event loop, making the server unresponsive to health checks and other requests. Offloading to a thread pool keeps the server responsive during 30–60 s generation times.",
    icon: Gauge,
  },
  {
    question: 'Why Reciprocal Rank Fusion (RRF)?',
    answer:
      'RRF is score-agnostic — it only cares about rank ordering, so you can fuse results from systems with incompatible score scales (cosine similarity vs TF-IDF) without normalisation. It is simple, robust, and used by Elasticsearch and other production systems.',
    icon: BarChart3,
  },
];

const techStack: { layer: string; tech: string }[] = [
  { layer: 'Frontend', tech: 'Next.js 16, React 19, Tailwind CSS, Framer Motion' },
  { layer: 'Backend', tech: 'FastAPI, Python 3.12, Uvicorn, Pydantic' },
  { layer: 'Embeddings', tech: 'Sentence-Transformers (all-MiniLM-L6-v2, 384-dim)' },
  { layer: 'Vector DB', tech: 'ChromaDB (PersistentClient) / Pinecone' },
  { layer: 'LLM', tech: 'Ollama + Llama 3.2 (local, private)' },
  { layer: 'Search', tech: 'Hybrid (semantic + keyword), Reciprocal Rank Fusion' },
  { layer: 'MLOps', tech: 'MLflow, Prometheus, Grafana, Evidently AI' },
  { layer: 'Database', tech: 'PostgreSQL (metadata, RBAC, audit logs)' },
  { layer: 'DevOps', tech: 'Docker Compose, GitHub Actions CI/CD' },
  { layer: 'Testing', tech: 'Pytest with coverage, flake8, mypy' },
];

/* ------------------------------------------------------------------ */
/*  Reusable pieces                                                    */
/* ------------------------------------------------------------------ */

/* ---------- Pipeline Diagram ---------- */

interface PipelineNodeProps {
  icon: React.ElementType;
  label: string;
  sublabels?: string[];
  gradient: string;
  delay?: number;
  wide?: boolean;
}

function PipelineNode({ icon: Icon, label, sublabels, gradient, delay = 0, wide }: PipelineNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={clsx(
        'relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow',
        wide ? 'col-span-full max-w-md mx-auto w-full' : ''
      )}
    >
      <div className={clsx('rounded-t-2xl px-5 py-3 bg-gradient-to-r text-white flex items-center gap-2.5', gradient)}>
        <Icon className="h-5 w-5" />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      {sublabels && sublabels.length > 0 && (
        <ul className="px-5 py-3 space-y-1">
          {sublabels.map((s) => (
            <li key={s} className="text-xs text-gray-600 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-gray-400 flex-shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function PipelineArrow({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      className="flex justify-center py-1"
    >
      <div className="flex flex-col items-center">
        <div className="w-px h-6 bg-gradient-to-b from-brand-400 to-brand-600" />
        <ArrowDown className="h-4 w-4 text-brand-600 -mt-1" />
      </div>
    </motion.div>
  );
}

function ArchitecturePipelineDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="glass-effect card-shadow rounded-2xl p-6 sm:p-10 mb-20"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pipeline Overview</h2>
        <p className="text-sm text-gray-500">End-to-end data flow from user query to synthesised answer</p>
      </div>

      <div className="flex flex-col items-center">
        {/* Layer 1 — User Interface */}
        <PipelineNode
          icon={Monitor}
          label="User Interface Layer"
          sublabels={['Next.js 16 Web Frontend', 'REST API Clients']}
          gradient="from-indigo-500 to-indigo-700"
          delay={0}
          wide
        />
        <PipelineArrow delay={0.1} />

        {/* Layer 2 — FastAPI Backend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="col-span-full max-w-lg mx-auto w-full rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg"
        >
          <div className="rounded-t-2xl px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center gap-2.5">
            <Server className="h-5 w-5" />
            <span className="font-semibold text-sm">FastAPI Backend</span>
          </div>
          <div className="px-5 py-4 grid grid-cols-3 gap-3">
            {[
              { icon: MessageSquare, label: 'Query Route' },
              { icon: Upload, label: 'Upload Route' },
              { icon: Settings, label: 'Admin Route' },
            ].map((route) => (
              <div key={route.label} className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50/80 py-3 px-2">
                <route.icon className="h-4 w-4 text-blue-600" />
                <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{route.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <PipelineArrow delay={0.25} />

        {/* Layer 3 — RAG Chain */}
        <PipelineNode
          icon={Brain}
          label="RAG Chain"
          sublabels={['Hybrid Retriever', 'Cross-Encoder Reranker', 'LLM Generator (Ollama / Llama 3.2)']}
          gradient="from-emerald-500 to-emerald-700"
          delay={0.3}
          wide
        />
        <PipelineArrow delay={0.35} />

        {/* Layer 4 — Retrieval Pipeline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="max-w-lg mx-auto w-full rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg"
        >
          <div className="rounded-t-2xl px-5 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white flex items-center gap-2.5">
            <Layers className="h-5 w-5" />
            <span className="font-semibold text-sm">Retrieval Pipeline</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            {/* Row: Query Rewriter + Embedding Service */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 py-2.5 px-3">
                <Shuffle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700">Query Rewriter</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 py-2.5 px-3">
                <Cpu className="h-4 w-4 text-teal-600 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700">Embedding Service</span>
              </div>
            </div>
            {/* Arrow down */}
            <div className="flex justify-center">
              <ArrowDown className="h-4 w-4 text-teal-500" />
            </div>
            {/* Hybrid Search */}
            <div className="rounded-xl border border-teal-100 bg-teal-50/50 py-3 px-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-teal-700" />
                <span className="text-xs font-semibold text-teal-800">Hybrid Search</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-[11px] text-teal-700 bg-white/70 rounded-lg py-1.5 px-2 text-center border border-teal-100">Semantic (Vector)</span>
                <span className="text-[11px] text-teal-700 bg-white/70 rounded-lg py-1.5 px-2 text-center border border-teal-100">Keyword (BM25)</span>
              </div>
            </div>
            {/* Arrow down */}
            <div className="flex justify-center">
              <ArrowDown className="h-4 w-4 text-teal-500" />
            </div>
            {/* Reranker */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 py-2.5 px-3 mx-auto max-w-[200px]">
              <Filter className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700">Reranker (Cross-Encoder)</span>
            </div>
          </div>
        </motion.div>
        <PipelineArrow delay={0.5} />

        {/* Layer 5 — Data & Storage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="max-w-lg mx-auto w-full rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg"
        >
          <div className="rounded-t-2xl px-5 py-3 bg-gradient-to-r from-violet-500 to-violet-700 text-white flex items-center gap-2.5">
            <Database className="h-5 w-5" />
            <span className="font-semibold text-sm">Data & Storage Layer</span>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 py-3 px-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-gray-800">ChromaDB</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">Embeddings & Semantic Search</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 py-3 px-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-gray-800">PostgreSQL</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">Metadata, RBAC & Logs</p>
            </div>
          </div>
        </motion.div>
        <PipelineArrow delay={0.6} />

        {/* Layer 6 — MLOps & Monitoring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="max-w-lg mx-auto w-full rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg"
        >
          <div className="rounded-t-2xl px-5 py-3 bg-gradient-to-r from-rose-500 to-rose-700 text-white flex items-center gap-2.5">
            <Activity className="h-5 w-5" />
            <span className="font-semibold text-sm">MLOps & Monitoring</span>
          </div>
          <div className="px-5 py-4 grid grid-cols-3 gap-3">
            {[
              { icon: FileText, label: 'MLflow', sub: 'Experiments & Registry' },
              { icon: LineChart, label: 'Prometheus / Grafana', sub: 'Metrics & Dashboards' },
              { icon: AlertTriangle, label: 'Evidently AI', sub: 'Drift Detection' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50/80 py-3 px-2 text-center">
                <item.icon className="h-4 w-4 text-rose-600" />
                <span className="text-[11px] font-semibold text-gray-800 leading-tight">{item.label}</span>
                <span className="text-[10px] text-gray-500 leading-tight">{item.sub}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SectionHeading({
  title,
  subtitle,
  icon: Icon,
  gradient,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div
        className={clsx(
          'flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
          gradient
        )}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ArchitecturePage() {
  return (
    <main className="flex-1 overflow-auto">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-white to-brand-100/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-100/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            System Architecture
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A production-grade RAG platform with hybrid search, local LLM
            inference, MLOps monitoring, and containerised deployment.
          </p>
        </motion.div>

        {/* ========================================================= */}
        {/*  Pipeline Diagram                                          */}
        {/* ========================================================= */}
        <ArchitecturePipelineDiagram />

        {/* ========================================================= */}
        {/*  PART 3 — Architecture Deep Dive                          */}
        {/* ========================================================= */}

        <section className="mb-20 space-y-14">
          {architectureSections.map((section, si) => (
            <motion.div
              key={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="glass-effect card-shadow rounded-2xl p-6 sm:p-8"
            >
              <SectionHeading
                title={section.title}
                subtitle={section.subtitle}
                icon={section.icon}
                gradient={section.color}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      custom={si * 3 + i}
                      variants={fadeUp}
                      className="rounded-xl border border-gray-100 bg-white/60 p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ItemIcon className="h-4 w-4 text-brand-600" />
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.label}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.detail}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </section>

        {/* ========================================================= */}
        {/*  PART 4 — Production Engineering                           */}
        {/* ========================================================= */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-4"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            Production Engineering
          </h2>
          <p className="text-center text-gray-500 mt-2 mb-12">
            MLOps, monitoring, containerisation & CI/CD
          </p>
        </motion.div>

        <section className="mb-20 space-y-10">
          {productionSections.map((section, si) => (
            <motion.div
              key={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="glass-effect card-shadow rounded-2xl p-6 sm:p-8"
            >
              <SectionHeading
                title={section.title}
                subtitle={section.subtitle}
                icon={section.icon}
                gradient={section.color}
              />
              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <motion.li
                    key={item.label}
                    custom={si * 3 + i}
                    variants={fadeUp}
                    className="flex items-start gap-3"
                  >
                    <ChevronRight className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {item.label}
                      </span>
                      <span className="text-sm text-gray-600">
                        {' — '}
                        {item.detail}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </section>

        {/* ========================================================= */}
        {/*  PART 5 — API Documentation (link-out)                     */}
        {/* ========================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="glass-effect card-shadow rounded-2xl p-8 text-center">
            <SectionHeading
              title="API Documentation"
              subtitle="Interactive Swagger UI auto-generated from Pydantic models"
              icon={Code2}
              gradient="from-teal-500 to-teal-700"
            />
            <p className="text-gray-600 mb-6 text-sm max-w-xl mx-auto">
              The full REST API is documented with OpenAPI / Swagger. Every
              endpoint, request schema, and response model is auto-generated
              from the FastAPI type hints and Pydantic validators — try them
              interactively.
            </p>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-shadow"
            >
              Open Swagger UI <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/*  PART 6 — Design Decisions & Trade-offs                    */}
        {/* ========================================================= */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-4"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            Design Decisions
          </h2>
          <p className="text-center text-gray-500 mt-2 mb-12">
            Key trade-offs and why they were made
          </p>
        </motion.div>

        <section className="mb-20 space-y-5">
          {designDecisions.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={d.question}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i}
                variants={fadeUp}
                className="glass-effect card-shadow rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{d.question}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {d.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ========================================================= */}
        {/*  Tech Stack Table                                          */}
        {/* ========================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Tech Stack
          </h2>
          <div className="glass-effect card-shadow rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-50/60">
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Layer
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700">
                    Technology
                  </th>
                </tr>
              </thead>
              <tbody>
                {techStack.map((row, i) => (
                  <tr
                    key={row.layer}
                    className={clsx(
                      'border-t border-gray-100',
                      i % 2 === 0 ? 'bg-white/40' : 'bg-brand-50/20'
                    )}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {row.layer}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{row.tech}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
