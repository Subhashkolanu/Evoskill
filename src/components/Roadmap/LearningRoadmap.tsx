import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Link as LinkIcon, 
  Bot, 
  Calendar, 
  FileText, 
  CheckSquare, 
  BarChart2, 
  Download, 
  RotateCcw, 
  Search, 
  AlertCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RoadmapData, NavigationTab, UserProgressState } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface LearningRoadmapProps {
  roadmap: RoadmapData;
  progress: UserProgressState;
  onToggleStep: (stepId: string) => void;
  onUpdateNote: (stepId: string, note: string) => void;
  onAskStudyBuddy: (stepTitle: string, stepDescription: string) => void;
  onExportTasks: () => Promise<void>;
  onExportCalendar: () => Promise<void>;
  onExportDocs: () => Promise<void>;
  onExportSheets: () => Promise<void>;
  onStartOver: () => void;
  isExporting: boolean;
}

export function LearningRoadmap({
  roadmap,
  progress,
  onToggleStep,
  onUpdateNote,
  onAskStudyBuddy,
  onExportTasks,
  onExportCalendar,
  onExportDocs,
  onExportSheets,
  onStartOver,
  isExporting
}: LearningRoadmapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [showExportModal, setShowExportModal] = useState(false);

  const completedSet = new Set(progress.completedSteps);
  const totalSteps = roadmap.micro_steps_roadmap.reduce(
    (acc, phase) => acc + phase.daily_breakdown.length, 0
  );
  const progressPercent = totalSteps > 0 ? Math.round((completedSet.size / totalSteps) * 100) : 0;

  // Filter roadmap phases and tasks by search query
  const filteredPhases = roadmap.micro_steps_roadmap.map((phase, pIdx) => {
    const matchingSteps = phase.daily_breakdown.map((step, sIdx) => ({
      step,
      stepId: `${pIdx}-${sIdx}`
    })).filter(({ step }) => 
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...phase,
      pIdx,
      matchingSteps
    };
  }).filter(p => p.matchingSteps.length > 0);

  const toggleNoteOpen = (stepId: string) => {
    setExpandedNotes(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleDownloadMarkdown = () => {
    let md = `# EvoSkill AI Roadmap: ${roadmap.user_profile_analysis.best_career_path}\n\n`;
    md += `> **Why this path:** ${roadmap.user_profile_analysis.why_this_path_suits_them}\n\n`;
    md += `**Progress:** ${completedSet.size} of ${totalSteps} tasks completed (${progressPercent}%)\n\n`;
    md += `---\n\n`;

    roadmap.micro_steps_roadmap.forEach((phase, pIdx) => {
      md += `## ${phase.phase_name}\n`;
      md += `*Goal: ${phase.goal}*\n\n`;

      phase.daily_breakdown.forEach((step, sIdx) => {
        const id = `${pIdx}-${sIdx}`;
        const isDone = completedSet.has(id);
        md += `### ${isDone ? '[x]' : '[ ]'} ${step.title}\n`;
        md += `${step.description}\n\n`;
        if (step.estimated_duration_hours) {
          md += `*Estimated Duration:* ${step.estimated_duration_hours} hours\n\n`;
        }
        if (progress.stepNotes[id]) {
          md += `**My Notes:**\n${progress.stepNotes[id]}\n\n`;
        }
      });
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EvoSkill_Roadmap_${roadmap.user_profile_analysis.best_career_path.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="terracotta" size="sm">First-Principles Curriculum</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {completedSet.size} / {totalSteps} Tasks Done
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            {roadmap.user_profile_analysis.best_career_path}
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl mt-1 leading-relaxed">
            {roadmap.user_profile_analysis.why_this_path_suits_them}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            size="md" 
            onClick={handleDownloadMarkdown}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Markdown
          </Button>
          <Button 
            variant="forest" 
            size="md" 
            onClick={() => setShowExportModal(true)}
            className="text-xs"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Workspace Sync
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search milestones, skills, concepts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
          <span className="text-[var(--text-muted)]">Progress:</span>
          <div className="w-32 bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#C66E4E] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-bold text-[var(--text-primary)]">{progressPercent}%</span>
        </div>
      </div>

      {/* Phases and Daily Tasks Timeline */}
      <div className="space-y-10">
        {filteredPhases.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border)] space-y-3">
            <p className="text-sm text-[var(--text-muted)]">No tasks match "{searchQuery}"</p>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              Clear Search Filter
            </Button>
          </div>
        ) : (
          filteredPhases.map((phase) => (
            <div key={phase.pIdx} className="space-y-4">
              
              {/* Phase Header Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-warm)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#829A91] block">
                    Curriculum Stage
                  </span>
                  <h3 className="font-serif-editorial text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                    {phase.phase_name}
                  </h3>
                </div>
                <Badge variant="sage" size="md">
                  Goal: {phase.goal}
                </Badge>
              </div>

              {/* Task Items inside Phase */}
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-[var(--border)]">
                {phase.matchingSteps.map(({ step, stepId }) => {
                  const isDone = completedSet.has(stepId);
                  const note = progress.stepNotes[stepId] || "";
                  const isNoteOpen = expandedNotes[stepId] || false;

                  return (
                    <div 
                      key={stepId}
                      className={`p-5 rounded-2xl bg-[var(--surface)] border transition-all duration-200 space-y-3 ${
                        isDone 
                          ? 'border-[var(--border-subtle)] bg-[var(--surface-warm)]/60 opacity-80' 
                          : 'border-[var(--border)] hover:border-[#829A91] shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => onToggleStep(stepId)}
                            className="mt-0.5 text-[var(--text-muted)] hover:text-[#C66E4E] cursor-pointer shrink-0 transition-transform active:scale-90"
                            aria-label={isDone ? `Mark ${step.title} incomplete` : `Mark ${step.title} complete`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-[#829A91]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[var(--text-muted)]" />
                            )}
                          </button>

                          <div className="space-y-1 flex-1">
                            <h4 className={`text-sm sm:text-base font-bold ${
                              isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                            }`}>
                              {step.title}
                            </h4>
                            <div className="text-xs text-[var(--text-secondary)] leading-relaxed prose prose-sm max-w-none">
                              <ReactMarkdown>{step.description}</ReactMarkdown>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {step.estimated_duration_hours && (
                            <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5" /> {step.estimated_duration_hours}h
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAskStudyBuddy(step.title, step.description)}
                            className="text-xs text-[#829A91]"
                          >
                            <Bot className="w-3.5 h-3.5 mr-1" /> Ask Buddy
                          </Button>
                        </div>
                      </div>

                      {/* Resource Links */}
                      {step.resource_links && step.resource_links.length > 0 && (
                        <div className="flex flex-wrap gap-2 pl-8 pt-1">
                          {step.resource_links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C66E4E] hover:underline bg-[#C66E4E]/5 px-2.5 py-1 rounded-md border border-[#C66E4E]/20"
                            >
                              <LinkIcon className="w-3 h-3" /> {link.title}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Notes Accordion */}
                      <div className="pl-8 pt-2 border-t border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={() => toggleNoteOpen(stepId)}
                          className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                        >
                          {isNoteOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {note ? "Edit My Notes / Solution" : "Add Personal Notes & Insights"}
                        </button>

                        {isNoteOpen && (
                          <div className="pt-2 animate-fadeIn space-y-2">
                            <textarea
                              rows={2}
                              value={note}
                              onChange={e => onUpdateNote(stepId, e.target.value)}
                              placeholder="Record takeaways, code snippets, or hurdles encountered during this step..."
                              className="w-full bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
                            />
                            <p className="text-[10px] text-[var(--text-muted)]">
                              Notes are automatically synced and included in Markdown and Workspace exports.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Google Workspace Synchronization Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="font-serif-editorial text-xl font-bold">Google Workspace Sync</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Export your actionable curriculum into your daily productivity stack.
                </p>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-xs font-bold px-2 py-1 rounded bg-[var(--surface-warm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  await onExportTasks();
                  setShowExportModal(false);
                }}
                disabled={isExporting}
                className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-warm)] hover:bg-[var(--surface-muted)] flex items-center gap-3.5 text-left transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#C66E4E]/10 flex items-center justify-center text-[#C66E4E] shrink-0">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Send to Google Tasks</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Creates a dedicated EvoSkill Task List with every micro-step.</p>
                </div>
              </button>

              <button
                onClick={async () => {
                  await onExportCalendar();
                  setShowExportModal(false);
                }}
                disabled={isExporting}
                className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-warm)] hover:bg-[var(--surface-muted)] flex items-center gap-3.5 text-left transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#D6AE57]/15 flex items-center justify-center text-[#B8923C] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Schedule in Google Calendar</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Blocks weekly phase focus sessions starting tomorrow morning.</p>
                </div>
              </button>

              <button
                onClick={async () => {
                  await onExportDocs();
                  setShowExportModal(false);
                }}
                disabled={isExporting}
                className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-warm)] hover:bg-[var(--surface-muted)] flex items-center gap-3.5 text-left transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#829A91]/15 flex items-center justify-center text-[#375249] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Save to Google Docs</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Generates a formatted curriculum document with your market analysis.</p>
                </div>
              </button>

              <button
                onClick={async () => {
                  await onExportSheets();
                  setShowExportModal(false);
                }}
                disabled={isExporting}
                className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-warm)] hover:bg-[var(--surface-muted)] flex items-center gap-3.5 text-left transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#263A32]/10 flex items-center justify-center text-[#263A32] shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Export to Google Sheets</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Structured spreadsheet with phase, duration, and status tracking.</p>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center">
              <Button variant="ghost" size="sm" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
