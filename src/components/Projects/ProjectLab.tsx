import React, { useState } from 'react';
import { 
  FolderGit2, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Code2, 
  Layers, 
  Briefcase, 
  ChevronRight,
  GitPullRequest
} from 'lucide-react';
import { RoadmapData, ProjectLabItem } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ProjectLabProps {
  roadmap: RoadmapData | null;
}

export function ProjectLab({ roadmap }: ProjectLabProps) {
  // Built-in curated industry projects tailored to full-stack & AI roles + roadmap projects
  const initialProjects: ProjectLabItem[] = [
    {
      id: 'p1',
      title: roadmap?.real_world_projects[0]?.project_name || "High-Throughput Distributed Event Engine",
      tagline: "Build a production-grade pub/sub messaging queue with persistence and idempotency.",
      difficulty: "Intermediate",
      estimatedHours: 24,
      skillsGained: roadmap?.real_world_projects[0]?.skills_gained || ["Distributed Systems", "Concurrency", "Write-Ahead Logging", "gRPC"],
      deliverables: [
        "Concurrent TCP socket listener with connection pooling",
        "Append-only commit log with segment compaction",
        "Client SDK in TypeScript/Go with heartbeat monitoring"
      ],
      brief: "Passive code tutorials don't convince engineering hiring managers. This project demonstrates foundational understanding of message queues like Apache Kafka without relying on pre-packaged abstractions.",
      milestones: [
        { title: "Define binary wire protocol and frame parsing", description: "Implement length-prefixed packet encoder and decoder.", done: true },
        { title: "Append-only segment store with memory-mapped indexing", description: "Design fast sequential disk writes with flush intervals.", done: false },
        { title: "Consumer group partition balancing and offset tracking", description: "Implement rebalance protocol with lock leases.", done: false }
      ],
      completed: false
    },
    {
      id: 'p2',
      title: "Real-Time Observability & Metric Analytics Platform",
      tagline: "Ingest, aggregate, and visualize high-cardinality time-series data.",
      difficulty: "Foundational",
      estimatedHours: 16,
      skillsGained: ["Time-Series DBs", "Prometheus Metrics", "Next.js / React", "WebSockets"],
      deliverables: [
        "Fast telemetry ingestion HTTP daemon",
        "In-memory downsampling bucket algorithm",
        "Interactive dashboard with anomaly detection alerts"
      ],
      brief: "Learn how monitoring giants like Datadog and Grafana aggregate millions of events per second with low memory overhead.",
      milestones: [
        { title: "Build time-series ring buffer with rolling averages", description: "Store metric points without memory leaks.", done: true },
        { title: "Streaming WebSocket broadcast to front-end clients", description: "Push live updates under 50ms latency.", done: false },
        { title: "Docker container and Kubernetes deployment manifest", description: "Hardened container with non-root user.", done: false }
      ],
      completed: false
    },
    {
      id: 'p3',
      title: "Self-Healing AI Agent Workflow Orchestrator",
      tagline: "Autonomous multi-step LLM task runner with state machines and tool call sandboxing.",
      difficulty: "Capstone",
      estimatedHours: 40,
      skillsGained: ["Agent Architecture", "Gemini API", "PostgreSQL", "Docker Sandboxes"],
      deliverables: [
        "Declarative directed acyclic graph (DAG) workflow engine",
        "Deterministic JSON schema validation with auto-repair retry loops",
        "Comprehensive integration test suite simulating API outages"
      ],
      brief: "A showcase portfolio centerpiece demonstrating modern Generative AI engineering, prompt caching, stateful executions, and sandbox isolation.",
      milestones: [
        { title: "State machine engine with rollback snapshots", description: "Handle step failures with automated checkpointing.", done: false },
        { title: "Gemini Structured Output integration with backoff", description: "Integrate model tool declarations and circuit breakers.", done: false },
        { title: "Full end-to-end execution benchmark report", description: "Produce a publishable technical blog post and README.", done: false }
      ],
      completed: false
    }
  ];

  const [projects, setProjects] = useState<ProjectLabItem[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('p1');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const toggleMilestone = (milestoneIdx: number) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id !== selectedProjectId) return proj;
      const updatedMilestones = proj.milestones.map((m, idx) => 
        idx === milestoneIdx ? { ...m, done: !m.done } : m
      );
      const allDone = updatedMilestones.every(m => m.done);
      return {
        ...proj,
        milestones: updatedMilestones,
        completed: allDone
      };
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="sage" size="sm">Proof of Work</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              3 Production Portfolios
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)]">
            Industry Project Lab
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Replace toy tutorials with demonstrable, production-quality capstone repositories.
          </p>
        </div>
      </div>

      {/* Project Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          const completedMilestones = proj.milestones.filter(m => m.done).length;
          const totalMilestones = proj.milestones.length;

          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer text-left space-y-3 ${
                isSelected 
                  ? 'border-[#C66E4E] bg-[var(--surface)] shadow-sm' 
                  : 'border-[var(--border)] bg-[var(--surface-warm)] hover:bg-[var(--surface)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge variant={
                  proj.difficulty === 'Capstone' ? 'terracotta' : 
                  proj.difficulty === 'Intermediate' ? 'gold' : 'sage'
                } size="sm">
                  {proj.difficulty}
                </Badge>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {completedMilestones}/{totalMilestones} Tasks
                </span>
              </div>

              <h4 className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">
                {proj.title}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {proj.tagline}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-[var(--surface-muted)] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#C66E4E] h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(completedMilestones / totalMilestones) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Project Deep Dive Detail Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-[var(--border-subtle)] gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="terracotta" size="sm">{selectedProject.difficulty} Level</Badge>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                ~{selectedProject.estimatedHours} Hours Scope
              </span>
            </div>
            <h2 className="font-serif-editorial text-2xl font-bold text-[var(--text-primary)]">
              {selectedProject.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {selectedProject.brief}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert(`GitHub starter template guidance for ${selectedProject.title} copied to clipboard.`)}
              className="text-xs"
            >
              <Code2 className="w-3.5 h-3.5 mr-1" /> Template Guidance
            </Button>
          </div>
        </div>

        {/* Deliverables & Architecture Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              Engineering Deliverables
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-primary)]">
              {selectedProject.deliverables.map((del, dIdx) => (
                <li key={dIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#829A91] shrink-0 mt-0.5" />
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              Competencies Showcased
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject.skillsGained.map((skill, sIdx) => (
                <Badge key={sIdx} variant="sage" size="md">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone Checklist */}
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">
            Execution Milestones Checklist
          </h4>

          <div className="space-y-2.5">
            {selectedProject.milestones.map((m, mIdx) => (
              <div
                key={mIdx}
                onClick={() => toggleMilestone(mIdx)}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                  m.done 
                    ? 'bg-[var(--surface-warm)]/70 border-[var(--border-subtle)] opacity-80' 
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[#829A91]'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-[#C66E4E]">
                  {m.done ? (
                    <CheckCircle2 className="w-5 h-5 text-[#829A91]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--text-muted)]" />
                  )}
                </div>
                <div className="space-y-0.5 flex-1">
                  <span className={`text-sm font-bold block ${m.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                    {m.title}
                  </span>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

    </div>
  );
}
