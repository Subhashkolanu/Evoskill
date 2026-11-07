import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Award, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';
import { RoadmapData, DailyMission, UserProgressState } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface DailyMissionsProps {
  roadmap: RoadmapData | null;
  progress: UserProgressState;
  onToggleStep: (stepId: string) => void;
  onFocusSessionComplete?: (durationMinutes: number) => void;
}

export function DailyMissions({
  roadmap,
  progress,
  onToggleStep,
  onFocusSessionComplete
}: DailyMissionsProps) {
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60); // 25 min default
  const [initialDuration, setInitialDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string>("Active Milestone Sprint");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Derive today's priority missions from active roadmap
  const activePhase = roadmap?.micro_steps_roadmap[0];
  const steps = activePhase?.daily_breakdown.slice(0, 4) || [];

  const completedSet = new Set(progress.completedSteps);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isRunning) {
      setIsRunning(false);
      if (onFocusSessionComplete) {
        onFocusSessionComplete(Math.round(initialDuration / 60));
      }
      if (soundEnabled && typeof window !== 'undefined') {
        try {
          // Subtle audio notification using Web Audio API
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        } catch (e) {
          // ignore
        }
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerSeconds, initialDuration, onFocusSessionComplete, soundEnabled]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = (minutes: number = 25) => {
    setIsRunning(false);
    setInitialDuration(minutes * 60);
    setTimerSeconds(minutes * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = Math.round(((initialDuration - timerSeconds) / initialDuration) * 100);

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="terracotta" size="sm">Focus Engine</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Phase 1 Sprint
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)]">
            Daily Missions & Focus Chamber
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Execute high-leverage milestones with deep concentration. Avoid context switching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {progress.currentStreak && progress.currentStreak > 0 ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-[#D6AE57]/15 border border-[#D6AE57]/30 flex items-center gap-2 text-xs font-bold text-[#8F6C1E] dark:text-[#F3DFB0]">
              <Flame className="w-4 h-4 fill-current text-[#D6AE57]" />
              <span>{progress.currentStreak} Day Momentum</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Deep Work Focus Timer (1 col) */}
        <div className="space-y-6">
          <Card className="p-6 text-center space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="font-bold uppercase tracking-wider">Deep Work Timer</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                title={soundEnabled ? "Mute completion chime" : "Enable chime"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Circular / Large Timer Display */}
            <div className="py-4 space-y-2">
              <div className="font-mono text-5xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
                {formatTime(timerSeconds)}
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium truncate px-4">
                {activeTaskTitle}
              </p>
              
              {/* Progress Line */}
              <div className="w-full bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden mt-4">
                <div 
                  className="bg-[#C66E4E] h-full rounded-full transition-all duration-300" 
                  style={{ width: `${timerProgress}%` }} 
                />
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button 
                variant="primary" 
                size="md" 
                onClick={toggleTimer}
                className="px-6 text-sm"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-1.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1.5" /> Begin Focus
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="md" 
                onClick={() => resetTimer(25)}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Presets */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
              <button 
                onClick={() => resetTimer(15)} 
                className="px-2.5 py-1 rounded-md bg-[var(--surface-warm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono cursor-pointer"
              >
                15m
              </button>
              <button 
                onClick={() => resetTimer(25)} 
                className="px-2.5 py-1 rounded-md bg-[var(--surface-warm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono font-bold text-[#C66E4E] cursor-pointer"
              >
                25m Pomodoro
              </button>
              <button 
                onClick={() => resetTimer(50)} 
                className="px-2.5 py-1 rounded-md bg-[var(--surface-warm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono cursor-pointer"
              >
                50m Sprint
              </button>
            </div>
          </Card>

          {/* Productivity Tip */}
          <div className="p-4 rounded-2xl bg-[var(--surface-warm)] border border-[var(--border)] text-xs space-y-2">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D6AE57]" /> Single-Tasking Rule
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Research demonstrates that task switching incurs up to 40% cognitive deficit. Keep one mission active on screen until the interval rings.
            </p>
          </div>
        </div>

        {/* Right Column: Today's Actionable Tasks (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-serif-editorial text-xl font-bold text-[var(--text-primary)]">
              Scheduled Action Items
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {steps.length} priority items
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((step, sIdx) => {
              const stepId = `0-${sIdx}`;
              const isDone = completedSet.has(stepId);
              const priority = sIdx === 0 ? "High" : sIdx === 1 ? "Medium" : "Normal";

              return (
                <Card 
                  key={stepId}
                  className={`p-5 space-y-3 transition-all ${
                    isDone ? 'opacity-60 bg-[var(--surface-warm)]' : 'hover:border-[#829A91]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleStep(stepId)}
                        className="mt-0.5 text-[var(--text-muted)] hover:text-[#C66E4E] cursor-pointer shrink-0"
                        aria-label={`Toggle task ${step.title}`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#829A91]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[var(--text-muted)]" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={priority === 'High' ? 'terracotta' : priority === 'Medium' ? 'gold' : 'slate'} size="sm">
                            {priority} Priority
                          </Badge>
                          <h4 className={`text-sm font-bold ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                            {step.title}
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {step.estimated_duration_hours && (
                        <span className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {step.estimated_duration_hours}h
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTaskTitle(step.title);
                          resetTimer(25);
                          setIsRunning(true);
                        }}
                        className="text-xs text-[#C66E4E]"
                      >
                        <Play className="w-3 h-3 mr-1" /> Focus This
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
