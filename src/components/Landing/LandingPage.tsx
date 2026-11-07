import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Layers, 
  BrainCircuit, 
  Terminal, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Award, 
  Loader2,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';

interface LandingPageProps {
  onLogin: () => Promise<void>;
  isLoggingIn: boolean;
  authError: string | null;
  onExploreDemo?: () => void;
}

export function LandingPage({ onLogin, isLoggingIn, authError, onExploreDemo }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'outcomes'>('overview');
  const [showLegalModal, setShowLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const pillars = [
    {
      icon: Target,
      tag: "Career Discovery",
      title: "First-Principles Skill Mapping",
      description: "Unlike generic tutorial lists, EvoSkill analyzes your background to build an adaptive, micro-stepped curriculum with daily milestones.",
      color: "terracotta" as const
    },
    {
      icon: BrainCircuit,
      tag: "Deep Mentorship",
      title: "Roadmap-Aware AI Study Buddy",
      description: "Ask conceptual questions, debug code, and request practical challenges tailored specifically to the exact lesson you are tackling today.",
      color: "forest" as const
    },
    {
      icon: Terminal,
      tag: "Real Proof of Work",
      title: "Industry Capstone Project Lab",
      description: "Graduate with production-ready projects in your portfolio. EvoSkill guides you through real architecture decisions and GitHub deliverables.",
      color: "sage" as const
    },
    {
      icon: Calendar,
      tag: "Productive Habits",
      title: "Google Workspace Synchronization",
      description: "Export daily missions to Google Tasks, block deep focus intervals in Google Calendar, and archive study notes into Google Docs.",
      color: "gold" as const
    }
  ];

  const sampleCurriculum = [
    {
      phase: "Phase 1: Foundations & Systems",
      duration: "Week 1–2",
      milestones: [
        "Distributed Systems Fundamentals & Monolith vs Microservices",
        "Data structures in production: hash indexes & tree traversals",
        "Building a reliable RESTful API with automated integration tests"
      ]
    },
    {
      phase: "Phase 2: Modern Application Architecture",
      duration: "Week 3–5",
      milestones: [
        "Relational schema design, normalization & query optimization",
        "Asynchronous message queues and background job scheduling",
        "Authentication mechanisms: JWT, OAuth 2.0 & Session Security"
      ]
    },
    {
      phase: "Phase 3: Production Hardening & Capstone",
      duration: "Week 6–8",
      milestones: [
        "Containerization with Docker & Multi-stage CI/CD Pipelines",
        "Observability: Structured logging, Prometheus metrics & alerts",
        "Deploying and benchmarking a scalable cloud application"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      
      {/* Top Editorial Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--canvas)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#263A32] dark:bg-[#F4F0E6] flex items-center justify-center text-[#F4F0E6] dark:text-[#263A32] shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif-editorial text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                EvoSkill<span className="text-[#C66E4E]">.AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-[#829A91] border-l border-[var(--border)] pl-2">
                Career Accelerator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            {onExploreDemo && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExploreDemo}
                className="hidden md:inline-flex text-xs"
              >
                Explore Demo
              </Button>
            )}
            <Button 
              variant="primary" 
              size="md" 
              onClick={onLogin}
              isLoading={isLoggingIn}
              className="text-xs sm:text-sm"
            >
              Sign In with Google
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <Badge variant="terracotta" size="sm">V2.0 Release</Badge>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Editorial Career Intelligence & Mentorship Platform
              </span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.08]">
              Stop guessing your career path. <br />
              <span className="italic font-normal text-[#C66E4E]">Master it step by step.</span>
            </h1>

            <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto font-normal leading-relaxed pt-2">
              EvoSkill AI bridges the gap between where you are and where you want to be. 
              Get bespoke, first-principles learning roadmaps, real-world portfolio capstones, 
              and an AI mentor that keeps you accountable every single day.
            </p>

            {/* Call to Action Box */}
            <div className="pt-6 max-w-md mx-auto space-y-3">
              <button 
                onClick={onLogin}
                disabled={isLoggingIn}
                className="w-full py-4 px-6 rounded-xl bg-[#263A32] hover:bg-[#1A2822] text-[#F4F0E6] font-semibold text-base flex items-center justify-center gap-3 transition-all duration-150 shadow-md cursor-pointer disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                )}
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#829A91]" /> Standard OAuth only
                </span>
                <span>•</span>
                <span>No credit card required</span>
                <span>•</span>
                <span>Instant path generation</span>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium text-left">
                  {authError}
                </div>
              )}
            </div>

          </div>

          {/* Interactive Feature Matrix / Live Preview Teaser */}
          <div className="mt-16 sm:mt-24 p-6 sm:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-[var(--border-subtle)] gap-4">
              <div>
                <h3 className="font-serif-editorial text-2xl font-bold text-[var(--text-primary)]">
                  The Complete Career Readiness Engine
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Built specifically for career switchers, ambitious engineers, and self-directed learners.
                </p>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-[var(--canvas)] rounded-xl border border-[var(--border)]">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'overview' 
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Core Pillars
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'curriculum' 
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Sample Roadmap
                </button>
              </div>
            </div>

            {activeTab === 'overview' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                {pillars.map((pillar, i) => {
                  const Icon = pillar.icon;
                  return (
                    <div 
                      key={i}
                      className="p-6 rounded-2xl bg-[var(--surface-warm)] border border-[var(--border-subtle)] hover:border-[#829A91] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[#263A32] dark:text-[#F4F0E6]">
                          <Icon className="w-5 h-5 text-[#C66E4E]" />
                        </div>
                        <Badge variant={pillar.color} size="sm">{pillar.tag}</Badge>
                      </div>
                      <h4 className="font-serif-editorial text-lg font-bold text-[var(--text-primary)]">
                        {pillar.title}
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="pt-8 space-y-6">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="forest">Target Role</Badge>
                    <span className="font-bold text-sm">Full-Stack Cloud Systems Engineer</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono">8 Weeks • 2.5 hrs/day</span>
                </div>

                <div className="space-y-4">
                  {sampleCurriculum.map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[var(--surface-warm)] border border-[var(--border-subtle)] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#C66E4E]/15 text-[#C66E4E] inline-flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          {item.phase}
                        </h4>
                        <span className="text-xs text-[#829A91] font-semibold">{item.duration}</span>
                      </div>
                      <ul className="space-y-2 pl-8">
                        {item.milestones.map((milestone, mIdx) => (
                          <li key={mIdx} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#829A91] shrink-0" />
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Why EvoSkill vs Generic Chatbots */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[var(--surface-warm)] border-y border-[var(--border)] transition-colors">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="forest" size="sm">Design Philosophy</Badge>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                Why standard AI prompts fail your career
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                Most AI tools spit out 50 bullet points of video links with zero context, zero progression, and no accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Standard AI Chatbots
                </span>
                <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Passive reading lists that cause tutorial paralysis.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>No awareness of how much daily time you actually have.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Forgets your previous questions across different days.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>No tangible portfolio projects or interview validation.</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-3xl bg-[var(--surface)] border-2 border-[#829A91] space-y-4 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#375249] dark:text-[#C5D5CF]">
                  EvoSkill AI V2.0
                </span>
                <ul className="space-y-3 text-sm text-[var(--text-primary)]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C66E4E] shrink-0 mt-0.5" />
                    <span><strong>Problem-Based Learning:</strong> You build micro-solutions daily before reading abstract theory.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C66E4E] shrink-0 mt-0.5" />
                    <span><strong>Time-Boxed Milestones:</strong> Realistic schedule calculated from your available hours.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C66E4E] shrink-0 mt-0.5" />
                    <span><strong>Continuous Memory:</strong> Your Study Buddy knows your exact roadmap step and prior notes.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C66E4E] shrink-0 mt-0.5" />
                    <span><strong>Google Workspace Sync:</strong> Actionable tasks pushed directly into your daily calendar.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--canvas)] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#263A32] dark:bg-[#F4F0E6] flex items-center justify-center text-[#F4F0E6] dark:text-[#263A32]">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-serif-editorial text-lg font-bold text-[var(--text-primary)]">
              EvoSkill AI
            </span>
            <span className="text-xs text-[var(--text-muted)] ml-2">
              © {new Date().getFullYear()} EvoSkill AI. Editorial SaaS Edition.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
            <a 
              href="/privacy.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#C66E4E] transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#C66E4E] transition-colors"
            >
              Terms of Service
            </a>
            <button 
              onClick={() => setShowLegalModal('privacy')}
              className="hover:text-[#C66E4E] transition-colors cursor-pointer"
            >
              Privacy Summary
            </button>
            <button 
              onClick={() => setShowLegalModal('terms')}
              className="hover:text-[#C66E4E] transition-colors cursor-pointer"
            >
              Terms Summary
            </button>
          </div>
        </div>
      </footer>

      {/* Accessible In-App Privacy / Terms Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-serif-editorial text-xl font-bold">
                {showLegalModal === 'privacy' ? 'Privacy Policy & Data Rights' : 'Terms of Service'}
              </h3>
              <button 
                onClick={() => setShowLegalModal(null)}
                className="text-xs font-bold px-2 py-1 rounded bg-[var(--surface-warm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Close
              </button>
            </div>
            
            {showLegalModal === 'privacy' ? (
              <div className="text-xs text-[var(--text-secondary)] space-y-3 leading-relaxed">
                <p>
                  <strong>Data Minimization:</strong> EvoSkill AI only requests user email, profile name, and your generated study roadmaps. We do not sell your personal data or training conversations to third parties.
                </p>
                <p>
                  <strong>Google Workspace Permissions:</strong> Workspace scopes (Tasks, Calendar, Docs, Sheets) are requested strictly on-demand when you explicitly initiate an export action. We never read or modify files outside of the EvoSkill task lists or documents you create.
                </p>
                <p>
                  <strong>AI Processing:</strong> Learning roadmaps and mentor chats are processed securely via Google Gemini API with enterprise data privacy standards.
                </p>
                <p>
                  For the full legal policy, please visit our <a href="/privacy.html" target="_blank" className="text-[#C66E4E] underline">dedicated privacy page</a>.
                </p>
              </div>
            ) : (
              <div className="text-xs text-[var(--text-secondary)] space-y-3 leading-relaxed">
                <p>
                  <strong>Service Usage:</strong> EvoSkill AI is an educational platform providing AI-assisted career roadmaps, skill analysis, and study assistance.
                </p>
                <p>
                  <strong>User Conduct:</strong> You agree not to misuse the automated assessment APIs, attempt to bypass rate limits, or submit abusive queries.
                </p>
                <p>
                  <strong>Accuracy Disclaimer:</strong> Career projections and market analyses reflect AI synthesis of publicly available trends and are provided for educational planning purposes.
                </p>
                <p>
                  For the full agreement, see our <a href="/terms.html" target="_blank" className="text-[#C66E4E] underline">Terms of Service page</a>.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setShowLegalModal(null)}>
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
