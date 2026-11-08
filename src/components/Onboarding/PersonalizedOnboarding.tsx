import React, { useState, useId } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Target,
  Clock,
  Layers,
  BookOpen,
  Cpu,
  Shield,
  Database,
  Code,
  Terminal,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Briefcase,
  Calendar,
  Zap,
  HelpCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { OnboardingAnswers, UserProfile, RoadmapData, UserProgressState } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { generateDomainRoadmap } from '../../lib/roadmapGenerator';
import { authenticatedFetch } from '../../lib/firebase';
import { saveUserRoadmap, saveUserProfile, saveUserProgress } from '../../lib/db';

interface PersonalizedOnboardingProps {
  user: User | null;
  initialProfile?: UserProfile | null;
  onComplete: (roadmap: RoadmapData, profile: UserProfile, progress: UserProgressState) => void;
  onCancel?: () => void;
}

export function PersonalizedOnboarding({
  user,
  initialProfile,
  onComplete,
  onCancel
}: PersonalizedOnboardingProps) {
  // Step indicator: 1 = Domain & Goal, 2 = Level & Skills, 3 = Role & Pace, 4 = Synthesis & Confirmation, 5 = Generating
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [tagInput, setTagInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [loadingStatusText, setLoadingStatusText] = useState<string>('Analyzing your requirements...');

  // 8 Specific Questions State
  const [fieldOfInterest, setFieldOfInterest] = useState<string>(
    initialProfile?.onboardingAnswers?.fieldOfInterest || 'Software Development (Frontend / Backend / Full-Stack)'
  );
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    initialProfile?.onboardingAnswers?.primaryGoal || 'Land my first tech job (Junior / Entry-level)'
  );
  const [currentLevel, setCurrentLevel] = useState<'Absolute Beginner' | 'Basic Knowledge' | 'Intermediate' | 'Advanced'>(
    initialProfile?.onboardingAnswers?.currentLevel || 'Basic Knowledge'
  );
  const [existingSkills, setExistingSkills] = useState<string[]>(
    initialProfile?.onboardingAnswers?.existingSkills || []
  );
  const [targetRole, setTargetRole] = useState<string>(
    initialProfile?.onboardingAnswers?.targetRole || ''
  );
  const [dailyCommitment, setDailyCommitment] = useState<string>(
    initialProfile?.onboardingAnswers?.dailyCommitment || '1.5 hours / day (Steady progress)'
  );
  const [hoursPerDay, setHoursPerDay] = useState<number>(
    initialProfile?.onboardingAnswers?.hoursPerDay || initialProfile?.hoursPerDay || 1.5
  );
  const [customHours, setCustomHours] = useState<string>('2');
  const [learningStyle, setLearningStyle] = useState<string>(
    initialProfile?.onboardingAnswers?.learningStyle || 'Project-Based (Learn by building real applications)'
  );
  const [targetTimeline, setTargetTimeline] = useState<string>(
    initialProfile?.onboardingAnswers?.targetTimeline || '3 months (Focused quarter)'
  );
  const [targetTimelineMonths, setTargetTimelineMonths] = useState<number>(
    initialProfile?.onboardingAnswers?.targetTimelineMonths || 3
  );

  // Field Options (Question 1)
  const fieldOptions = [
    { id: 'Software Development (Frontend / Backend / Full-Stack)', icon: Code, desc: 'TypeScript, modern web architectures, scalable backend APIs & full-stack apps' },
    { id: 'AI / Machine Learning & Data Science', icon: Cpu, desc: 'Neural networks, PyTorch, LLMs, mathematical intuitions & model serving' },
    { id: 'Cybersecurity & Ethical Hacking', icon: Shield, desc: 'Network security, penetration testing, OWASP vulnerabilities & defense' },
    { id: 'Cloud Computing & DevOps', icon: Terminal, desc: 'Docker, Kubernetes, Terraform infrastructure as code & CI/CD pipelines' },
    { id: 'Data Analytics & Business Intelligence', icon: Database, desc: 'SQL modeling, Python analysis, KPIs, Tableau and decision storytelling' },
    { id: 'Competitive Programming & Data Structures', icon: Zap, desc: 'Algorithms, LeetCode patterns, graph theory & asymptotic optimization' },
    { id: 'Other / Custom Track', icon: Compass, desc: 'Tailored hybrid curriculum based on your unique career objectives' }
  ];

  // Primary Goal Options (Question 2)
  const goalOptions = [
    'Land my first tech job (Junior / Entry-level)',
    'Prepare for internships / campus placements',
    'Upskill in current role to mid / senior engineer',
    'Switch career from non-tech to tech',
    'Build real-world portfolio projects',
    'Academic excellence & coursework mastery',
    'Curious self-learner / exploratory'
  ];

  // Current Level Options (Question 3)
  const levelOptions: { id: 'Absolute Beginner' | 'Basic Knowledge' | 'Intermediate' | 'Advanced'; label: string; desc: string }[] = [
    { id: 'Absolute Beginner', label: 'Absolute Beginner', desc: 'No prior coding experience. Need ground-up foundations.' },
    { id: 'Basic Knowledge', label: 'Basic Knowledge', desc: 'Familiar with syntax and small scripts. Need structured guidance.' },
    { id: 'Intermediate', label: 'Intermediate', desc: 'Have built small projects. Need architecture and best practices.' },
    { id: 'Advanced', label: 'Advanced', desc: 'Professional experience or complex apps built. Need mastery and scale.' }
  ];

  // Quick-Add Skills Suggestions tailored to Field
  const getSuggestedSkillsForField = (field: string): string[] => {
    if (field.includes('AI') || field.includes('Machine')) {
      return ['Python', 'NumPy', 'Pandas', 'Linear Algebra', 'PyTorch', 'Scikit-Learn', 'SQL', 'FastAPI'];
    }
    if (field.includes('Cyber') || field.includes('Security')) {
      return ['Linux', 'Networking (TCP/IP)', 'Bash', 'Wireshark', 'Python', 'OWASP Top 10', 'Burp Suite'];
    }
    if (field.includes('Cloud') || field.includes('DevOps')) {
      return ['Linux', 'Docker', 'AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Bash', 'Git'];
    }
    if (field.includes('Data Analytics')) {
      return ['SQL', 'Excel', 'Python', 'Pandas', 'Tableau', 'Power BI', 'Statistics'];
    }
    if (field.includes('Competitive')) {
      return ['C++', 'Python', 'Data Structures', 'Algorithms', 'Time Complexity', 'Recursion', 'Graphs'];
    }
    return ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'HTML/CSS', 'Tailwind'];
  };

  // Target Role Suggestions
  const getRolePlaceholder = (field: string): string => {
    if (field.includes('AI')) return 'e.g. Applied Machine Learning Engineer';
    if (field.includes('Cyber')) return 'e.g. Information Security Analyst';
    if (field.includes('Cloud')) return 'e.g. Cloud DevOps Engineer';
    if (field.includes('Data Analytics')) return 'e.g. Data Analytics Engineer';
    if (field.includes('Competitive')) return 'e.g. Algorithms & Systems Specialist';
    return 'e.g. Full-Stack Software Engineer';
  };

  // Daily Commitment Options (Question 6)
  const commitmentOptions = [
    { label: '30 minutes / day', hours: 0.5, desc: 'Bite-sized, steady habit' },
    { label: '1 hour / day', hours: 1.0, desc: 'Solid daily momentum' },
    { label: '2 hours / day', hours: 2.0, desc: 'Accelerated growth pace' },
    { label: '3 hours / day', hours: 3.0, desc: 'Deep immersion' },
    { label: '4+ hours / day', hours: 4.0, desc: 'Bootcamp / Full-time focus' }
  ];

  // Learning Style Options (Question 7)
  const styleOptions = [
    { label: 'Project-Based (Learn by building real applications)', desc: 'Solve real engineering problems from day one' },
    { label: 'Official Documentation & Deep Reading', desc: 'Deep dive into official specs, manuals and canonical texts' },
    { label: 'Interactive Coding Exercises & Drills', desc: 'Hands-on problem solving and algorithmic puzzles' },
    { label: 'Balanced Synthesis (Projects + Docs + Exercises)', desc: 'Holistic mix of theory, practice and projects' }
  ];

  // Timeline Options (Question 8)
  const timelineOptions = [
    { label: '1 month (Sprint / Intensive review)', months: 1 },
    { label: '3 months (Focused quarter)', months: 3 },
    { label: '6 months (Comprehensive transformation)', months: 6 },
    { label: '1 year (Deep mastery & specialization)', months: 12 }
  ];

  // Handle skill tag addition
  const handleAddTag = (tagToAdd?: string) => {
    const val = (tagToAdd || tagInput).trim();
    if (!val) return;
    if (!existingSkills.includes(val)) {
      setExistingSkills(prev => [...prev, val]);
    }
    if (!tagToAdd) {
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setExistingSkills(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleClearAllSkills = () => {
    setExistingSkills([]);
    setCurrentLevel('Absolute Beginner');
  };

  // Handle Synthesis & Confirmation
  const handleConfirmAndSynthesize = async () => {
    setIsGenerating(true);
    setCurrentStep(5); // Show generating UI
    setGenerationError(null);

    const answers: OnboardingAnswers = {
      fieldOfInterest,
      primaryGoal,
      currentLevel,
      existingSkills,
      targetRole: targetRole.trim() || getRolePlaceholder(fieldOfInterest).replace('e.g. ', ''),
      dailyCommitment,
      hoursPerDay,
      learningStyle,
      targetTimeline,
      targetTimelineMonths
    };

    try {
      setLoadingStatusText("Connecting to EvoSkill AI curriculum engine...");

      // Build structured ChatMessage history for the Gemini backend
      const historyPayload = [
        { id: '1', sender: 'ai', text: 'What technical domain are you targeting?' },
        { id: '2', sender: 'user', text: answers.fieldOfInterest },
        { id: '3', sender: 'ai', text: 'What is your primary milestone or career goal?' },
        { id: '4', sender: 'user', text: answers.primaryGoal },
        { id: '5', sender: 'ai', text: 'What is your experience level and existing skills?' },
        { id: '6', sender: 'user', text: `Level: ${answers.currentLevel}. Known skills: ${answers.existingSkills.length > 0 ? answers.existingSkills.join(', ') : 'Starting from scratch'}` },
        { id: '7', sender: 'ai', text: 'What is your target role title, time commitment, and timeline?' },
        { id: '8', sender: 'user', text: `Target role: ${answers.targetRole}. Time commitment: ${answers.dailyCommitment} (${answers.hoursPerDay} hrs/day). Learning style: ${answers.learningStyle}. Target horizon: ${answers.targetTimeline} (${answers.targetTimelineMonths} months).` }
      ];

      let generatedRoadmap: RoadmapData | null = null;

      try {
        setLoadingStatusText("Synthesizing First-Principles learning trajectory...");
        const res = await authenticatedFetch('/api/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatHistory: historyPayload })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.user_profile_analysis && data.micro_steps_roadmap) {
            const returnedPath = (data.user_profile_analysis.best_career_path || "").toLowerCase();
            const chosenPath = (answers.targetRole || "").trim().toLowerCase();
            const chosenField = (fieldOfInterest || "").split(' ')[0].trim().toLowerCase();
            const firstStepTitle = (data.micro_steps_roadmap[0]?.daily_breakdown?.[0]?.title || "").toLowerCase();

            // Detect if this is the generic cloud architecture fallback from api/index.ts
            const isGenericCloudFallback = firstStepTitle.includes("concurrency") || firstStepTitle.includes("event loop");
            const isTargetCloud = chosenField.includes("cloud") || chosenPath.includes("cloud");

            // Only accept backend response if it's genuinely synthesized for the user's track
            if (!isGenericCloudFallback || isTargetCloud) {
              const pathMatches = chosenPath.length > 0 && (returnedPath.includes(chosenPath) || chosenPath.includes(returnedPath));
              const fieldMatches = chosenField.length > 0 && returnedPath.includes(chosenField);
              if (pathMatches || fieldMatches) {
                generatedRoadmap = data;
              }
            }
          }
        }
      } catch (apiErr) {
        console.warn("Backend API call deferred, utilizing domain generator:", apiErr);
      }

      // If backend API returns error or is offline or returned generic track, generate high-fidelity domain roadmap
      if (!generatedRoadmap) {
        setLoadingStatusText("Generating custom curriculum from domain patterns...");
        generatedRoadmap = generateDomainRoadmap(answers);
      } else {
        // Enforce user's exact chosen role title
        generatedRoadmap.user_profile_analysis.best_career_path = answers.targetRole;
      }

      // Build updated UserProfile
      const updatedProfile: UserProfile = {
        name: user?.displayName || initialProfile?.name || "EvoSkill Scholar",
        email: user?.email || initialProfile?.email || "",
        avatarUrl: user?.photoURL || initialProfile?.avatarUrl,
        education: initialProfile?.education || "Self-Directed / Professional",
        yearsExperience: currentLevel === 'Absolute Beginner' ? 0 : currentLevel === 'Basic Knowledge' ? 1 : 2,
        currentRole: currentLevel === 'Absolute Beginner' ? "Aspiring Developer" : "Junior Developer",
        targetRole: answers.targetRole,
        targetTimelineMonths: answers.targetTimelineMonths,
        hoursPerDay: answers.hoursPerDay,
        interests: [fieldOfInterest],
        existingSkills: answers.existingSkills.map(name => ({
          name,
          level: currentLevel === 'Absolute Beginner' ? 'Beginner' : currentLevel === 'Advanced' ? 'Advanced' : 'Intermediate'
        })),
        bio: `Focused on ${answers.targetRole} with a target of ${answers.hoursPerDay}h/day over ${answers.targetTimelineMonths} months.`,
        onboardingCompleted: true,
        onboardingAnswers: answers
      };

      // Initial clean progress state: 0 completed, 0 streak, user's real daily hours
      const initialProgress: UserProgressState = {
        completedSteps: [],
        stepNotes: {},
        hoursPerDay: answers.hoursPerDay,
        lastActivityDate: null,
        currentStreak: 0,
        totalFocusSeconds: 0
      };

      // Persist to Firestore if authenticated user
      if (user && user.uid !== 'demo-user-123') {
        setLoadingStatusText("Saving your personalized curriculum to cloud workspace...");
        await Promise.all([
          saveUserRoadmap(user.uid, generatedRoadmap),
          saveUserProfile(user.uid, updatedProfile),
          saveUserProgress(user.uid, initialProgress)
        ]);
      }

      setLoadingStatusText("Workspace ready! Opening your executive dashboard...");
      setTimeout(() => {
        onComplete(generatedRoadmap!, updatedProfile, initialProgress);
      }, 600);

    } catch (err: any) {
      console.error("Roadmap generation error:", err);
      setGenerationError(err.message || "Failed to generate roadmap. Please try again.");
      setIsGenerating(false);
      setCurrentStep(4);
    }
  };

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fadeIn font-sans">

      {/* Editorial Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <Compass className="w-4 h-4 text-[#C66E4E]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Personalized Curriculum Architect
          </span>
        </div>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
          Design Your Learning Trajectory
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto">
          No generic roadmaps or assumed experience. Answer these 8 questions to synthesize a custom, project-backed path tailored to your exact constraints.
        </p>

        {/* Multi-Step Indicator */}
        {currentStep <= 4 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? 'w-10 bg-[#C66E4E]'
                    : currentStep > step
                      ? 'w-6 bg-[#829A91]'
                      : 'w-6 bg-[var(--border)]'
                }`}
              />
            ))}
            <span className="text-xs font-mono text-[var(--text-muted)] ml-2">
              Step {currentStep} of 4
            </span>
          </div>
        )}
      </div>

      {/* STEP 1: Field of Interest & Primary Goal */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 space-y-8">

          {/* Question 1: Field of Interest */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66E4E]">Question 1 of 8</span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Which field or discipline do you want to learn?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Select the primary technical domain you want to specialize in.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fieldOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = fieldOfInterest === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFieldOfInterest(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#C66E4E] bg-[#C66E4E]/5 ring-1 ring-[#C66E4E] shadow-xs'
                        : 'border-[var(--border)] hover:border-[#829A91] bg-[var(--surface)]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isSelected ? 'bg-[#C66E4E] text-white' : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-sm font-bold ${isSelected ? 'text-[#C66E4E]' : 'text-[var(--text-primary)]'}`}>
                        {opt.id}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Primary Goal */}
          <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66E4E]">Question 2 of 8</span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                What is your primary milestone or career goal?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                This dictates whether we emphasize portfolio projects, system design, or interview problem sets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {goalOptions.map((goal) => {
                const isSelected = primaryGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setPrimaryGoal(goal)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#C66E4E] bg-[#C66E4E]/5 text-[#C66E4E] font-bold'
                        : 'border-[var(--border)] text-[var(--text-primary)] hover:border-[#829A91] bg-[var(--surface)]'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C66E4E] shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
            {onCancel ? (
              <Button variant="ghost" size="md" onClick={onCancel}>
                Cancel
              </Button>
            ) : <div />}
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(2)}
              className="ml-auto"
            >
              Continue to Step 2 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Current Level & Prior Skills */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-8">

          {/* Question 3: Current Level */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66E4E]">Question 3 of 8</span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                What is your current technical experience level?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Be honest—we calibrate the starting phase so you never waste time or feel overwhelmed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {levelOptions.map((lvl) => {
                const isSelected = currentLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setCurrentLevel(lvl.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'border-[#C66E4E] bg-[#C66E4E]/5 ring-1 ring-[#C66E4E]'
                        : 'border-[var(--border)] hover:border-[#829A91] bg-[var(--surface)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isSelected ? 'text-[#C66E4E]' : 'text-[var(--text-primary)]'}`}>
                        {lvl.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C66E4E]" />}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {lvl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 4: Prior Skills (Tag Input) */}
          <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66E4E]">Question 4 of 8</span>
                <button
                  type="button"
                  onClick={handleClearAllSkills}
                  className="text-xs text-[var(--text-muted)] hover:text-[#C66E4E] underline cursor-pointer"
                >
                  I have no prior skills (Start fresh)
                </button>
              </div>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                What tools, languages, or skills do you already know?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Add skills you have used before so we can skip redundant basics and build directly on what you know.
              </p>
            </div>

            {/* Dynamic Tag Input Box */}
            <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill (e.g. Python, SQL, Git) and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 bg-[var(--surface)] text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag()}
                  className="text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
                </Button>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2 min-h-8 items-center">
                {existingSkills.length > 0 ? (
                  existingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#829A91]/15 text-[#263A32] dark:text-[#C5D5CF] text-xs font-semibold border border-[#829A91]/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(skill)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--text-muted)] italic">
                    No prior skills added yet. Click suggestions below or start ground-up.
                  </span>
                )}
              </div>
            </div>

            {/* Quick Suggestions tailored to domain */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Suggested for {fieldOfInterest.split(' ')[0]}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getSuggestedSkillsForField(fieldOfInterest).map((s) => {
                  const alreadyAdded = existingSkills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => alreadyAdded ? handleRemoveTag(s) : handleAddTag(s)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        alreadyAdded
                          ? 'bg-[#829A91] text-white border-[#829A91]'
                          : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[#829A91]'
                      }`}
                    >
                      {alreadyAdded ? '✓ ' : '+ '}{s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
            <Button variant="outline" size="md" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(3)}
            >
              Continue to Step 3 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Role, Commitment, Learning Style & Horizon */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 space-y-8">

          {/* Question 5: Target Role */}
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66E4E]">Question 5 of 8</span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                What is your specific target job title or role?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Leave blank to use our recommended title based on your chosen domain.
              </p>
            </div>
            <Input
              placeholder={getRolePlaceholder(fieldOfInterest)}
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="text-sm bg-[var(--surface)] font-medium"
            />
          </div>

          {/* Question 6: Daily Time Commitment */}
          <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66E4E]">Question 6 of 8</span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                How much focused time can you commit each day?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                We calculate daily milestone durations and weekly study hours directly from this value.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {commitmentOptions.map((opt) => {
                const isSelected = hoursPerDay === opt.hours;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setHoursPerDay(opt.hours);
                      setDailyCommitment(`${opt.label} (${opt.desc})`);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#C66E4E] bg-[#C66E4E]/5 ring-1 ring-[#C66E4E]'
                        : 'border-[var(--border)] hover:border-[#829A91] bg-[var(--surface)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#C66E4E]' : 'text-[var(--text-primary)]'}`}>
                        {opt.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#C66E4E]" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 7: Preferred Learning Style */}
          <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66E4E]">Question 7 of 8</span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                What is your preferred learning style?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Choose the method that helps you absorb and retain technical concepts best.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {styleOptions.map((st) => {
                const isSelected = learningStyle === st.label;
                return (
                  <button
                    key={st.label}
                    type="button"
                    onClick={() => setLearningStyle(st.label)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'border-[#C66E4E] bg-[#C66E4E]/5 ring-1 ring-[#C66E4E]'
                        : 'border-[var(--border)] hover:border-[#829A91] bg-[var(--surface)]'
                    }`}
                  >
                    <p className={`text-xs font-bold ${isSelected ? 'text-[#C66E4E]' : 'text-[var(--text-primary)]'}`}>
                      {st.label}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {st.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 8: Target Timeline */}
          <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C66E4E]">Question 8 of 8</span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                What is your target timeline horizon?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Determines how many phases and weekly milestones are synthesized in your roadmap.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {timelineOptions.map((tl) => {
                const isSelected = targetTimelineMonths === tl.months;
                return (
                  <button
                    key={tl.label}
                    type="button"
                    onClick={() => {
                      setTargetTimelineMonths(tl.months);
                      setTargetTimeline(tl.label);
                    }}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#C66E4E] bg-[#C66E4E]/5 text-[#C66E4E] font-bold ring-1 ring-[#C66E4E]'
                        : 'border-[var(--border)] text-[var(--text-primary)] hover:border-[#829A91] bg-[var(--surface)]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{tl.months} {tl.months === 1 ? 'Month' : 'Months'}</span>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      {tl.label.split('(')[1]?.replace(')', '') || ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
            <Button variant="outline" size="md" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(4)}
            >
              Review Trajectory Synthesis <Sparkles className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Intelligent Synthesis & Explicit Confirmation Screen */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div>
                <Badge variant="terracotta" size="sm">Step 2: Trajectory Analysis</Badge>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                  Synthesizing Your Learning Trajectory
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Carefully review your verified inputs before we generate your First-Principles curriculum.
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#C66E4E]/10 text-[#C66E4E] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Trajectory Analysis Summary Banner */}
            <div className="p-5 rounded-2xl bg-[var(--surface-warm)] border border-[#829A91]/30 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C66E4E]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#263A32] dark:text-[#C5D5CF]">
                  Recommended Direction: {targetRole.trim() || getRolePlaceholder(fieldOfInterest).replace('e.g. ', '')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                <strong>Why this fits your profile:</strong> Targeting <em>"{primaryGoal}"</em> with <em>{hoursPerDay} hours/day</em> over a <em>{targetTimelineMonths}-month horizon</em> requires focused practical momentum. We will bypass passive video tutorials and construct 2 real-world portfolio deliverables aligned with modern hiring standards.
              </p>
            </div>

            {/* Prerequisite & Knowledge Baseline */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
              <h3 className="font-serif-editorial text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#829A91]" /> Prerequisite Assessment
              </h3>
              {existingSkills.length > 0 ? (
                <div className="space-y-2 text-xs">
                  <p className="text-[var(--text-secondary)]">
                    Identified prior foundation in: <strong>{existingSkills.join(', ')}</strong>.
                  </p>
                  <p className="text-[var(--text-muted)]">
                    ✓ Phase 1 will bridge directly into advanced system mechanics, avoiding repetitive entry-level syntax.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <p>
                    <strong>Ground-Up Ramp:</strong> You are starting with zero assumed prerequisites.
                  </p>
                  <p className="text-[var(--text-muted)]">
                    ✓ Week 1 will build foundational mental models and development tools without confusing jargon.
                  </p>
                </div>
              )}
            </div>

            {/* 8-Point Profile Summary Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Confirmed Profile Baseline
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">

                <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">1. Field</span>
                  <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">{fieldOfInterest.split(' ')[0]}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">2. Goal</span>
                  <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">{primaryGoal.split('(')[0]}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">3. Level</span>
                  <span className="font-bold text-[#C66E4E] truncate block mt-0.5">{currentLevel}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">4. Prior Skills</span>
                  <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">
                    {existingSkills.length > 0 ? `${existingSkills.length} verified` : 'None / Fresh'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">5. Target Role</span>
                  <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">
                    {targetRole.trim() || getRolePlaceholder(fieldOfInterest).replace('e.g. ', '')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">6. Daily Hours</span>
                  <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">{hoursPerDay} hrs / day</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">7. Style</span>
                  <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">{learningStyle.split(' ')[0]}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-semibold">8. Timeline</span>
                  <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">{targetTimelineMonths} Months</span>
                </div>

              </div>
            </div>

            {/* Error Notification if any */}
            {generationError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            {/* Actions: Edit vs Confirm */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Adjust Answers
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirmAndSynthesize}
                className="w-full sm:w-auto shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Confirm & Synthesize Personalized Roadmap
              </Button>
            </div>

          </Card>
        </div>
      )}

      {/* STEP 5: Generating State (Editorial Pulse) */}
      {currentStep === 5 && (
        <Card className="p-8 sm:p-12 text-center space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#263A32] text-[#F4F0E6] flex items-center justify-center mx-auto shadow-sm animate-pulse">
            <Compass className="w-8 h-8 text-[#C66E4E] animate-spin" />
          </div>

          <div className="space-y-2">
            <Badge variant="terracotta" size="sm">Synthesizing Curriculum</Badge>
            <h2 className="font-serif-editorial text-2xl font-bold text-[var(--text-primary)]">
              Generating Your First-Principles Path
            </h2>
            <p className="text-xs text-[var(--text-muted)] animate-fadeIn">
              {loadingStatusText}
            </p>
          </div>

          <div className="w-full bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden">
            <div className="bg-[#C66E4E] h-full rounded-full animate-pulse w-3/4" />
          </div>

          <p className="text-[11px] text-[var(--text-muted)]">
            Tailoring micro-step milestones, capstone projects, and salary intelligence for your {targetTimelineMonths}-month horizon...
          </p>
        </Card>
      )}

    </div>
  );
}
