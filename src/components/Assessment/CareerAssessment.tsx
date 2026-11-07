import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Target, 
  GraduationCap, 
  Clock, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { ChatMessage, RoadmapData, UserProfile } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface CareerAssessmentProps {
  onComplete: (history: ChatMessage[]) => Promise<void>;
  isGenerating: boolean;
  initialProfile?: UserProfile | null;
}

export function CareerAssessment({
  onComplete,
  isGenerating,
  initialProfile
}: CareerAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form State
  const [targetRole, setTargetRole] = useState(initialProfile?.targetRole || "");
  const [interests, setInterests] = useState(initialProfile?.interests.join(', ') || "");
  const [motivation, setMotivation] = useState(initialProfile?.bio || "");
  
  const [education, setEducation] = useState(initialProfile?.education || "");
  const [experienceYears, setExperienceYears] = useState(initialProfile?.yearsExperience?.toString() || "1");
  const [skills, setSkills] = useState(
    initialProfile?.existingSkills.map(s => `${s.name} (${s.level})`).join(', ') || ""
  );

  const [hoursPerDay, setHoursPerDay] = useState(initialProfile?.hoursPerDay?.toString() || "2");
  const [targetMonths, setTargetMonths] = useState(initialProfile?.targetTimelineMonths?.toString() || "6");
  const [learningStyle, setLearningStyle] = useState("project-first");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading state message animation
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const loadingMessages = [
    "Synthesizing your career profile & constraints...",
    "Querying current market demand & compensation tiers...",
    "Designing First-Principles micro-step curriculum...",
    "Formulating real-world capstone project deliverables...",
    "Finalizing your personalized EvoSkill A-to-Z Roadmap..."
  ];

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Validation per step
  const validateStep = (step: number) => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!targetRole.trim()) errs.targetRole = "Please specify a target career or role title.";
      if (!interests.trim()) errs.interests = "Please enter at least one core interest or subject area.";
    } else if (step === 2) {
      if (!education.trim()) errs.education = "Please specify your educational background or highest degree.";
    } else if (step === 3) {
      const h = parseFloat(hoursPerDay);
      if (isNaN(h) || h < 0.5 || h > 16) errs.hoursPerDay = "Please specify realistic daily hours (between 0.5 and 16).";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    if (!validateStep(currentStep)) return;

    // Build chat history representation for Gemini backend
    const simulatedHistory: ChatMessage[] = [
      {
        id: '1',
        sender: 'ai',
        text: "Hi! I'm EvoSkill AI, your personal career and life coach. What career path, interests, and background are we mapping today?"
      },
      {
        id: '2',
        sender: 'user',
        text: `Target Career: ${targetRole}.
Core Interests: ${interests}.
Motivation: ${motivation || "Transition into high-impact engineering"}.
Education Background: ${education}.
Experience Level: ${experienceYears} years.
Current Known Skills: ${skills || "Foundational computing"}.
Commitment: ${hoursPerDay} hours per day for ${targetMonths} months.
Preferred Learning Style: ${learningStyle === 'project-first' ? 'First-Principles and Problem-Based Learning' : 'Deep-dive structured concept mastery'}.`
      }
    ];

    await onComplete(simulatedHistory);
  };

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-8 max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-[#263A32] text-[#F4F0E6] flex items-center justify-center shadow-lg animate-pulse">
          <Sparkles className="w-10 h-10 text-[#D6AE57]" />
        </div>

        <div className="space-y-3">
          <Badge variant="terracotta" size="sm">EvoSkill AI Engine</Badge>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {loadingMessages[loadingMsgIdx]}
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Structuring every day into actionable micro-steps. This usually takes 10 to 20 seconds.
          </p>
        </div>

        <div className="w-full max-w-md bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden">
          <div className="bg-[#C66E4E] h-full rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Stepper Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="forest" size="sm">Intelligent Onboarding</Badge>
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
              Structured Career Assessment
            </h1>
          </div>
          <span className="text-xs font-mono font-bold text-[#829A91]">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(step => (
            <div 
              key={step} 
              className={`h-2 rounded-full transition-all duration-300 ${
                step <= currentStep ? 'bg-[#C66E4E]' : 'bg-[var(--surface-muted)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Cards */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-serif-editorial text-xl font-bold text-[var(--text-primary)]">
                  Step 1: Target Career & Passions
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Where do you want to head next, and what fields fascinate you?
                </p>
              </div>

              <Input
                label="Target Role or Career Vision"
                placeholder="e.g. Full-Stack Engineer, Distributed Systems Architect, Machine Learning Engineer"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                error={errors.targetRole}
                hint="Be as specific as possible (e.g. 'Backend Go/Rust Engineer')."
              />

              <Input
                label="Core Interests & Domains"
                placeholder="e.g. Cloud native, databases, compilers, fintech, automation"
                value={interests}
                onChange={e => setInterests(e.target.value)}
                error={errors.interests}
                hint="Comma-separated topics that keep you intellectually engaged."
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Why this specific path? (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share any past projects, career motivations, or goals that drive this decision."
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-serif-editorial text-xl font-bold text-[var(--text-primary)]">
                  Step 2: Educational Baseline & Known Skills
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  EvoSkill will bypass redundant introductory material you already know.
                </p>
              </div>

              <Input
                label="Highest Educational Level / Degree"
                placeholder="e.g. Bachelor's in CS, Self-Taught Bootcamp, Non-STEM Degree"
                value={education}
                onChange={e => setEducation(e.target.value)}
                error={errors.education}
              />

              <Input
                label="Years of Relevant Tech or Work Experience"
                type="number"
                min="0"
                max="40"
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Existing Technical Skills & Proficiency
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Python (Intermediate), JavaScript (Intermediate), SQL (Beginner), Git (Intermediate)"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  List languages, frameworks, or tools you've used before.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-serif-editorial text-xl font-bold text-[var(--text-primary)]">
                  Step 3: Timeline & Learning Commitment
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  We use these parameters to calibrate daily micro-step durations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Available Study Hours Per Day"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  value={hoursPerDay}
                  onChange={e => setHoursPerDay(e.target.value)}
                  error={errors.hoursPerDay}
                  hint="How many focused hours can you dedicate each day?"
                />

                <Input
                  label="Target Completion Horizon (Months)"
                  type="number"
                  min="1"
                  max="24"
                  value={targetMonths}
                  onChange={e => setTargetMonths(e.target.value)}
                  hint="Typical horizons range between 3 to 9 months."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Pedagogical Approach
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLearningStyle('project-first')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      learningStyle === 'project-first'
                        ? 'border-[#C66E4E] bg-[#C66E4E]/5 shadow-xs'
                        : 'border-[var(--border)] hover:bg-[var(--surface-warm)]'
                    }`}
                  >
                    <span className="font-bold text-xs block text-[var(--text-primary)]">
                      First-Principles & Project-First
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] mt-1 block leading-relaxed">
                      Build micro-implementations immediately, solving practical challenges before abstract theory.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLearningStyle('structured')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      learningStyle === 'structured'
                        ? 'border-[#C66E4E] bg-[#C66E4E]/5 shadow-xs'
                        : 'border-[var(--border)] hover:bg-[var(--surface-warm)]'
                    }`}
                  >
                    <span className="font-bold text-xs block text-[var(--text-primary)]">
                      Comprehensive Theory & Practice
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] mt-1 block leading-relaxed">
                      Balanced mix of system design documentation, academic papers, and incremental code katas.
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Actions */}
          <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
            {currentStep > 1 ? (
              <Button variant="outline" size="md" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            ) : <div />}

            {currentStep < totalSteps ? (
              <Button variant="primary" size="md" onClick={handleNext}>
                Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleGenerate}
                className="bg-[#263A32] hover:bg-[#1A2822] text-[#F4F0E6]"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-[#D6AE57]" /> Generate Adaptive Roadmap
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
