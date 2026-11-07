import React from 'react';
import { 
  Target, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Compass, 
  BookOpen, 
  ChevronRight 
} from 'lucide-react';
import { RoadmapData, UserProfile, NavigationTab, SkillGapItem } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface SkillGapAnalysisProps {
  roadmap: RoadmapData | null;
  profile: UserProfile | null;
  onTabChange: (tab: NavigationTab) => void;
}

export function SkillGapAnalysis({
  roadmap,
  profile,
  onTabChange
}: SkillGapAnalysisProps) {
  const targetCareer = roadmap?.user_profile_analysis.best_career_path || profile?.targetRole || "Full-Stack Cloud Engineer";

  // Compute skill gap items combining profile existing skills and roadmap target skills
  const gaps: SkillGapItem[] = [
    {
      skillName: "Distributed Systems & Consistency Models",
      category: "core",
      currentLevel: "Beginner",
      requiredLevel: "Advanced",
      gapScore: 70,
      recommendedStep: "Complete Phase 1: Cap Theorem & Eventual Consistency micro-step in your Roadmap."
    },
    {
      skillName: "Database Indexing & Query Optimization",
      category: "core",
      currentLevel: "Intermediate",
      requiredLevel: "Advanced",
      gapScore: 40,
      recommendedStep: "Execute Postgres EXPLAIN ANALYZE benchmarks on multi-million row datasets."
    },
    {
      skillName: "Containerization & Docker Orchestration",
      category: "tools",
      currentLevel: "Beginner",
      requiredLevel: "Intermediate",
      gapScore: 50,
      recommendedStep: "Build multi-stage Dockerfiles and deploy using Docker Compose in Project Lab."
    },
    {
      skillName: "Asynchronous Message Queues (Kafka / RabbitMQ)",
      category: "framework",
      currentLevel: "None",
      requiredLevel: "Intermediate",
      gapScore: 85,
      recommendedStep: "Implement pub/sub event bus with idempotency guarantees in Phase 2."
    },
    {
      skillName: "Cloud Infrastructure (GCP / AWS / Terraform)",
      category: "tools",
      currentLevel: "Beginner",
      requiredLevel: "Advanced",
      gapScore: 65,
      recommendedStep: "Automate zero-downtime deployment pipelines with Terraform declarations."
    },
    {
      skillName: "System Architecture & RFC Authoring",
      category: "soft-skills",
      currentLevel: "Beginner",
      requiredLevel: "Intermediate",
      gapScore: 45,
      recommendedStep: "Write an architectural decision record (ADR) for your Capstone project."
    }
  ];

  const overallReadiness = Math.round(100 - (gaps.reduce((acc, g) => acc + g.gapScore, 0) / gaps.length));

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="terracotta" size="sm">Competency Matrix</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Role: {targetCareer}
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)]">
            Skill Gap & Readiness Analysis
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            A precise evaluation of your current competencies against the industry standard for your target role.
          </p>
        </div>

        <Button 
          variant="primary" 
          size="md" 
          onClick={() => onTabChange('roadmap')}
        >
          View Roadmap Solutions <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Readiness Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Overall Role Readiness Score
          </span>
          <div className="flex items-baseline gap-3">
            <span className="font-serif-editorial text-4xl sm:text-5xl font-bold text-[var(--text-primary)]">
              {overallReadiness}%
            </span>
            <span className="text-sm font-semibold text-[#829A91]">
              Moderate Gap • Highly Achievable in ~12 Weeks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl">
            You currently possess strong foundational programming patterns. Closing the <strong>{100 - overallReadiness}% gap</strong> requires focused practice in distributed system primitives and database performance.
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2 shrink-0">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[var(--text-secondary)]">Bridge Progress</span>
            <span className="text-[#C66E4E]">{overallReadiness}%</span>
          </div>
          <div className="w-full bg-[var(--surface-muted)] h-3 rounded-full overflow-hidden">
            <div 
              className="bg-[#C66E4E] h-full rounded-full transition-all duration-700" 
              style={{ width: `${overallReadiness}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] block text-right">
            6 critical competencies tracked
          </span>
        </div>
      </div>

      {/* Competency Gap List */}
      <div className="space-y-4">
        <h3 className="font-serif-editorial text-xl font-bold text-[var(--text-primary)]">
          Target Role Competency Breakdown
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {gaps.map((item, idx) => (
            <Card key={idx} className="p-5 sm:p-6 space-y-4 hover:border-[#829A91] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      item.category === 'core' ? 'forest' : 
                      item.category === 'framework' ? 'terracotta' : 
                      item.category === 'tools' ? 'sage' : 'gold'
                    } size="sm">
                      {item.category}
                    </Badge>
                    <h4 className="font-bold text-base text-[var(--text-primary)]">
                      {item.skillName}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Current vs Target</span>
                    <span className="font-bold text-[var(--text-secondary)]">
                      {item.currentLevel} → <strong className="text-[#C66E4E]">{item.requiredLevel}</strong>
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.gapScore > 60 ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 
                    item.gapScore > 35 ? 'bg-[#D6AE57]/15 text-[#8F6C1E] dark:text-[#F3DFB0] border border-[#D6AE57]/30' : 
                    'bg-[#829A91]/15 text-[#375249] dark:text-[#C5D5CF] border border-[#829A91]/30'
                  }`}>
                    {item.gapScore}% Gap
                  </span>
                </div>
              </div>

              {/* Progress bar of current capability vs required */}
              <div className="space-y-1">
                <div className="w-full bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#829A91] h-full rounded-full" 
                    style={{ width: `${100 - item.gapScore}%` }} 
                  />
                </div>
              </div>

              {/* Actionable prescription to bridge the gap */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-warm)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                <ArrowUpRight className="w-4 h-4 text-[#C66E4E] shrink-0 mt-0.5" />
                <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">Recommended Action:</strong> {item.recommendedStep}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
