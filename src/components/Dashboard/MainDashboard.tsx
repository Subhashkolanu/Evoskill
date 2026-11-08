import React from 'react';
import {
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Bot,
  Award,
  Layers,
  AlertCircle,
  Briefcase,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { RoadmapData, UserProfile, NavigationTab, UserProgressState } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface MainDashboardProps {
  roadmap: RoadmapData | null;
  userProfile: UserProfile | null;
  progress: UserProgressState | null;
  onTabChange: (tab: NavigationTab) => void;
  onToggleStep?: (stepId: string) => void;
  onAskStudyBuddy?: (taskTitle: string, taskDesc: string) => void;
  dailyInsight?: string | null;
}

export function MainDashboard({
  roadmap,
  userProfile,
  progress,
  onTabChange,
  onToggleStep,
  onAskStudyBuddy,
  dailyInsight
}: MainDashboardProps) {
  const completedCount = progress?.completedSteps.length || 0;

  // Calculate total steps across phases
  const totalSteps = roadmap?.micro_steps_roadmap.reduce(
    (acc, phase) => acc + phase.daily_breakdown.length, 0
  ) || 0;

  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const currentStreak = progress?.currentStreak || 0;
  const targetCareer = roadmap?.user_profile_analysis.best_career_path || userProfile?.targetRole || "Software Systems Engineer";

  // Get active phase & next upcoming steps
  const activePhase = roadmap?.micro_steps_roadmap[0];
  const upcomingSteps = activePhase?.daily_breakdown.slice(0, 3) || [];

  // Skills mastered count estimation
  const detectedStrengths = roadmap?.user_profile_analysis.detected_strengths || ["Systems Thinking", "Problem Solving", "Continuous Learning"];

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* 1. Personalized Greeting Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="terracotta" size="sm">Active Milestone</Badge>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {progressPercent}% Complete
              </span>
            </div>
            <h1 className="font-serif-editorial text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              {completedCount === 0
                ? `Welcome to your learning journey, ${userProfile?.name?.split(' ')[0] || "Scholar"}.`
                : `Welcome back, ${userProfile?.name?.split(' ')[0] || "Scholar"}.`}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {completedCount === 0 ? (
                <>Your personalized curriculum is calibrated for <strong className="text-[var(--text-primary)]">{targetCareer}</strong>. Complete your first milestone below to begin building your consistency streak.</>
              ) : (
                <>Your personalized curriculum is currently focused on mastering <strong className="text-[var(--text-primary)]">{targetCareer}</strong>. You have completed <strong>{completedCount}</strong> of <strong>{totalSteps}</strong> actionable milestones.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => onTabChange('missions')}
              className="text-xs sm:text-sm"
            >
              Start Today's Mission <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onTabChange('study-buddy')}
              className="text-xs sm:text-sm"
            >
              <Bot className="w-4 h-4 mr-1 text-[#829A91]" /> AI Mentor
            </Button>
          </div>
        </div>

        {/* Subtle decorative editorial accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C66E4E]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Strip (Asymmetrical & Editorial) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* Metric 1: Overall Progress */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Progress</span>
            <Target className="w-4 h-4 text-[#C66E4E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)]">{progressPercent}%</span>
            <span className="text-xs text-[var(--text-muted)]">of roadmap</span>
          </div>
          <div className="w-full bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#C66E4E] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Streak & Consistency */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Daily Streak</span>
            <Flame className="w-4 h-4 text-[#D6AE57]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-editorial text-3xl font-bold text-[#D6AE57]">{currentStreak}</span>
            <span className="text-xs text-[var(--text-muted)]">consecutive days</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] truncate">
            {currentStreak > 0 ? "Momentum is active! Keep it up." : "Log in daily to build streak."}
          </p>
        </div>

        {/* Metric 3: Skills Verified */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Strengths</span>
            <Award className="w-4 h-4 text-[#829A91]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-editorial text-3xl font-bold text-[#829A91]">
              {detectedStrengths.length}
            </span>
            <span className="text-xs text-[var(--text-muted)]">detected</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] truncate">
            {detectedStrengths[0] || "Foundational logic"}
          </p>
        </div>

        {/* Metric 4: Daily Commitment */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Time Commitment</span>
            <Clock className="w-4 h-4 text-[#343D50] dark:text-[#CBD5CE]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)]">
              {progress?.hoursPerDay || userProfile?.hoursPerDay || 1.5}h
            </span>
            <span className="text-xs text-[var(--text-muted)]">per day target</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            ~{Math.round((progress?.hoursPerDay || userProfile?.hoursPerDay || 1.5) * 7)} hours dedicated weekly
          </p>
        </div>

      </div>

      {/* 3. Daily Coach Insight Strip (if available) */}
      {dailyInsight && (
        <div className="p-5 rounded-2xl bg-[var(--surface-warm)] border border-[#829A91]/30 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#829A91]/15 text-[#375249] dark:text-[#C5D5CF] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#829A91]">
              Today's Mentor Reflection
            </span>
            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
              "{dailyInsight}"
            </p>
          </div>
        </div>
      )}

      {/* 4. Main Two-Column Workflow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Active Roadmap Milestones (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div>
              <h3 className="font-serif-editorial text-xl font-bold text-[var(--text-primary)]">
                Current Learning Milestones
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Phase 1: {activePhase?.phase_name || "Foundations & Problem Breakdown"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange('roadmap')}
              className="text-xs"
            >
              Full Curriculum <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {upcomingSteps.length > 0 ? (
              upcomingSteps.map((step, sIdx) => {
                const stepId = `0-${sIdx}`;
                const isCompleted = progress?.completedSteps.includes(stepId) || false;
                return (
                  <div
                    key={sIdx}
                    className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[#829A91] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted ? 'bg-[#829A91] text-white' : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                        }`}>
                          {sIdx + 1}
                        </span>
                        <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] pl-7 line-clamp-2">
                        {step.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
                      {step.estimated_duration_hours && (
                        <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {step.estimated_duration_hours}h
                        </span>
                      )}
                      {onAskStudyBuddy && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAskStudyBuddy(step.title, step.description)}
                          className="text-xs text-[#829A91]"
                        >
                          <Bot className="w-3.5 h-3.5 mr-1" /> Discuss
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border)] space-y-3">
                <p className="text-sm text-[var(--text-muted)]">No roadmap loaded yet.</p>
                <Button variant="primary" size="sm" onClick={() => onTabChange('onboarding')}>
                  Generate Custom Roadmap
                </Button>
              </div>
            )}
          </div>

          {/* Real-World Projects Quick Teaser */}
          {roadmap?.real_world_projects && roadmap.real_world_projects.length > 0 && (
            <div className="p-6 rounded-2xl bg-[var(--surface-warm)] border border-[var(--border)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#C66E4E]" />
                  <h4 className="font-serif-editorial text-base font-bold text-[var(--text-primary)]">
                    Featured Portfolio Project
                  </h4>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onTabChange('projects')} className="text-xs">
                  View Project Lab
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  {roadmap.real_world_projects[0].project_name}
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {roadmap.real_world_projects[0].what_you_will_build}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {roadmap.real_world_projects[0].skills_gained.map((skill, k) => (
                    <Badge key={k} variant="sage" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Industry Outlook & Quick Actions (1 col) */}
        <div className="space-y-6">

          {/* Market Intelligence Card */}
          {roadmap?.market_analysis ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#829A91]" /> Market Outlook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Average Annual Salary
                  </span>
                  <p className="font-serif-editorial text-2xl font-bold text-[var(--text-primary)]">
                    {roadmap.market_analysis.average_salary_range}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-secondary)]">Demand Index</span>
                  <Badge variant="gold" size="sm">
                    {roadmap.market_analysis.demand_level}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Active Hiring Sectors
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                    {roadmap.market_analysis.key_companies?.join(', ') || "Technology, Finance, Cloud Infrastructure"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Career Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Complete your assessment to receive real-time salary benchmarks, demand projections, and hiring trends for your target role.
                </p>
                <Button variant="secondary" size="sm" onClick={() => onTabChange('assessment')} className="w-full text-xs">
                  Run Career Assessment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Platform Shortcuts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daily Toolkit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <button
                onClick={() => onTabChange('missions')}
                className="w-full p-3 rounded-xl bg-[var(--surface-warm)] hover:bg-[var(--surface-muted)] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#C66E4E]" />
                  <span className="text-xs font-bold">Deep Work Focus Timer</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>

              <button
                onClick={() => onTabChange('skill-gap')}
                className="w-full p-3 rounded-xl bg-[var(--surface-warm)] hover:bg-[var(--surface-muted)] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-[#829A91]" />
                  <span className="text-xs font-bold">Skill Gap Matrix</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>

              <button
                onClick={() => onTabChange('interview')}
                className="w-full p-3 rounded-xl bg-[var(--surface-warm)] hover:bg-[var(--surface-muted)] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[#D6AE57]" />
                  <span className="text-xs font-bold">Technical Interview Lab</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
