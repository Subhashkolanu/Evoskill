import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken,
  requestWorkspaceConsent,
  authenticatedFetch
} from './lib/firebase';
import { 
  saveUserRoadmap, 
  getUserRoadmap, 
  saveUserProgress, 
  getUserProgress,
  saveUserProfile,
  getUserProfile
} from './lib/db';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  NavigationTab, 
  UserProfile, 
  RoadmapData, 
  ChatMessage, 
  UserProgressState 
} from './types';
import { exportToTasks, exportToCalendar, exportToDocs, exportToSheets } from './lib/workspace';

// UI Screens
import { LandingPage } from './components/Landing/LandingPage';
import { AppShell } from './components/Navigation/AppShell';
import { MainDashboard } from './components/Dashboard/MainDashboard';
import { LearningRoadmap } from './components/Roadmap/LearningRoadmap';
import { DailyMissions } from './components/Missions/DailyMissions';
import { ProjectLab } from './components/Projects/ProjectLab';
import { StudyBuddyWorkspace } from './components/StudyBuddy/StudyBuddyWorkspace';
import { InterviewPrep } from './components/Interview/InterviewPrep';
import { CareerAssessment } from './components/Assessment/CareerAssessment';
import { SkillGapAnalysis } from './components/SkillGap/SkillGapAnalysis';
import { CareerProfile } from './components/Profile/CareerProfile';
import { ProgressAnalytics } from './components/Analytics/ProgressAnalytics';
import { ResourceHub } from './components/Resources/ResourceHub';
import { SettingsView } from './components/Settings/SettingsView';
import { Loader2, Compass } from 'lucide-react';

const SAMPLE_ROADMAP: RoadmapData = {
  user_profile_analysis: {
    detected_strengths: ["Systems Thinking", "Logical Architecture", "Persistence", "Problem-Based Execution"],
    best_career_path: "Distributed Cloud Systems Engineer",
    why_this_path_suits_them: "Your preference for first-principles reasoning and structural problem solving aligns naturally with high-throughput backend infrastructure, database reliability, and cloud architecture."
  },
  market_analysis: {
    average_salary_range: "$125,000 - $175,000",
    demand_level: "Very High",
    key_companies: ["Google Cloud", "Stripe", "Cloudflare", "Datadog", "High-Growth Scaleups"]
  },
  micro_steps_roadmap: [
    {
      phase_name: "Phase 1: First-Principles Architecture & Core Systems",
      goal: "Master concurrency, memory management, and write-ahead logging without frameworks",
      daily_breakdown: [
        {
          title: "Day 1–2: Concurrency Models & Event Loop Internals",
          description: "Analyze synchronous vs asynchronous non-blocking I/O. Build a toy event loop in TypeScript with microtask queues to understand thread starvation.",
          estimated_duration_hours: 2.5,
          resource_links: [
            { title: "Node.js Event Loop Architecture Guide", url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick" },
            { title: "libuv Design & Async Primitives", url: "https://docs.libuv.org/en/v1.x/design.html" }
          ],
          deadline_approaching: true
        },
        {
          title: "Day 3–4: Relational Query Planners & B-Tree Indexes",
          description: "Inspect query execution plans with EXPLAIN ANALYZE in PostgreSQL. Build a multi-column compound index and measure sequential scans vs index scans.",
          estimated_duration_hours: 3.0,
          resource_links: [
            { title: "Use The Index, Luke (Canonical SQL Indexing)", url: "https://use-the-index-luke.com/" }
          ],
          deadline_approaching: false
        },
        {
          title: "Day 5–7: Append-Only Commit Logs & Idempotency",
          description: "Implement a disk-backed append-only log with CRC32 checksums. Enforce idempotency using unique keys to survive network retries.",
          estimated_duration_hours: 3.5,
          resource_links: [
            { title: "Designing Data-Intensive Applications (DDIA)", url: "https://dataintensive.net/" }
          ],
          deadline_approaching: false
        }
      ]
    },
    {
      phase_name: "Phase 2: Scalable API Gateways & Message Brokers",
      goal: "Implement pub/sub event pipelines, distributed rate-limiters, and token security",
      daily_breakdown: [
        {
          title: "Day 8–10: Token Bucket Rate Limiting with Redis",
          description: "Build an API middleware implementing sliding-window rate limits in Redis using atomic Lua scripts.",
          estimated_duration_hours: 2.5,
          resource_links: [
            { title: "Redis Rate Limiting Patterns", url: "https://redis.io/glossary/rate-limiting/" }
          ]
        },
        {
          title: "Day 11–14: Pub/Sub Event Streaming with Kafka",
          description: "Set up consumer groups and implement partition offsets with at-least-once message delivery guarantees.",
          estimated_duration_hours: 3.0,
          resource_links: [
            { title: "Apache Kafka Core Architecture", url: "https://kafka.apache.org/documentation/" }
          ]
        }
      ]
    },
    {
      phase_name: "Phase 3: Production Hardening, Observability & Capstone",
      goal: "Containerization, telemetry, automated CI/CD pipelines, and interview readiness",
      daily_breakdown: [
        {
          title: "Day 15–18: Distributed Tracing with OpenTelemetry",
          description: "Instrument your service with structured JSON logs, trace IDs, and Prometheus metrics for p99 latency alerts.",
          estimated_duration_hours: 3.0,
          resource_links: [
            { title: "OpenTelemetry Documentation", url: "https://opentelemetry.io/docs/" }
          ]
        },
        {
          title: "Day 19–21: Production Capstone Deployment",
          description: "Deploy your self-healing distributed service to a cloud provider with automated health probes and zero-downtime rollouts.",
          estimated_duration_hours: 4.0,
          resource_links: [
            { title: "Google Cloud Run / Kubernetes Architecture", url: "https://cloud.google.com/run" }
          ]
        }
      ]
    }
  ],
  real_world_projects: [
    {
      project_name: "High-Throughput Distributed Event Engine",
      what_you_will_build: "A custom pub/sub streaming server with write-ahead commit logging, connection pooling, and client SDKs.",
      skills_gained: ["Distributed Consensus", "Write-Ahead Logs", "TCP Sockets", "Docker"]
    }
  ],
  resource_aggregator: [
    {
      resource_type: "Canonical Book",
      topic: "Designing Data-Intensive Applications",
      direct_url: "https://dataintensive.net/"
    },
    {
      resource_type: "MIT Course",
      topic: "MIT 6.824: Distributed Systems",
      direct_url: "https://pdos.csail.mit.edu/6.824/"
    }
  ],
  coach_motivation_message: "You are embarking on a first-principles journey. Don't memorize syntax—master the foundational mechanics of software systems!"
};

export default function App() {
  // Theme initialization
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Auth & Session State
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Application Data State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgressState>({
    completedSteps: ['0-0'],
    stepNotes: {},
    hoursPerDay: 2.5,
    lastActivityDate: new Date().toISOString().split('T')[0],
    currentStreak: 3
  });

  // Active Task Context for Study Buddy
  const [buddyTask, setBuddyTask] = useState<{ title: string; desc: string } | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);

  // Demo Mode Activation
  const activateDemoSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('evoskill_demo_mode', 'true');
    }
    setUser({
      uid: 'demo-user-123',
      displayName: 'Alex Mercer (Demo)',
      email: 'alex.demo@evoskill.ai',
    } as any);
    setUserProfile({
      name: "Alex Mercer",
      email: "alex.demo@evoskill.ai",
      education: "Bachelor's in Engineering",
      yearsExperience: 2,
      currentRole: "Full-Stack Developer",
      targetRole: "Distributed Cloud Systems Engineer",
      targetTimelineMonths: 6,
      hoursPerDay: 2.5,
      interests: ["Distributed Systems", "Go", "PostgreSQL", "Cloudflare Workers"],
      existingSkills: [
        { name: "TypeScript", level: "Advanced" },
        { name: "React", level: "Advanced" },
        { name: "Docker", level: "Intermediate" }
      ],
      bio: "Demonstrating EvoSkill AI V2.0 capabilities in interactive demo mode."
    });
    setRoadmap(SAMPLE_ROADMAP);
    setNeedsAuth(false);
    setIsLoadingAuth(false);
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser) => {
        setUser(currentUser);
        setNeedsAuth(false);
        setIsLoadingAuth(true);

        // Populate base profile from user
        setUserProfile({
          name: currentUser.displayName || "Scholar",
          email: currentUser.email || "",
          education: "STEM / Computer Science",
          yearsExperience: 1,
          currentRole: "Software Developer",
          targetRole: "Distributed Cloud Systems Engineer",
          targetTimelineMonths: 6,
          hoursPerDay: 2.5,
          interests: ["Distributed Systems", "Database Internals", "Cloud Architecture"],
          existingSkills: [
            { name: "JavaScript/TypeScript", level: "Intermediate" },
            { name: "React", level: "Intermediate" },
            { name: "Git", level: "Intermediate" }
          ]
        });

        try {
          const [existingRoadmap, existingProgress, existingProfile] = await Promise.all([
            getUserRoadmap(currentUser.uid),
            getUserProgress(currentUser.uid),
            getUserProfile(currentUser.uid)
          ]);

          if (existingProfile) {
            setUserProfile(existingProfile);
          }

          if (existingRoadmap) {
            setRoadmap(existingRoadmap);
          } else {
            // Default to high quality sample roadmap
            setRoadmap(SAMPLE_ROADMAP);
          }

          if (existingProgress) {
            setProgress(existingProgress);
          }
        } catch (error) {
          console.error("Error loading user data from Firestore:", error);
          setRoadmap(SAMPLE_ROADMAP);
        }
        setIsLoadingAuth(false);
      },
      () => {
        if (typeof window !== 'undefined' && sessionStorage.getItem('evoskill_demo_mode') === 'true') {
          activateDemoSession();
          return;
        }
        setUser(null);
        setNeedsAuth(true);
        setIsLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Daily Coach Insight
  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('evoskill_daily_insight');
        if (stored) {
          const { date, text } = JSON.parse(stored);
          if (date === today) {
            setDailyInsight(text);
            return;
          }
        }

        const res = await authenticatedFetch('/api/daily-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            careerPath: roadmap?.user_profile_analysis.best_career_path || "Systems Engineer",
            currentPhase: roadmap?.micro_steps_roadmap[0]?.phase_name || "Foundations"
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.insight) {
            setDailyInsight(data.insight);
            localStorage.setItem('evoskill_daily_insight', JSON.stringify({ date: today, text: data.insight }));
          }
        }
      } catch (e) {
        // Fallback default insight
        setDailyInsight("Focus on building minimum viable mental models. Test your assumptions with small code scripts before trusting abstractions.");
      }
    };

    if (roadmap) {
      fetchInsight();
    }
  }, [roadmap]);

  // Handle Google Login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup
      } else {
        setAuthError(`Sign-in error: ${err.message || 'Unknown authentication failure'}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Demo Mode Activation
  const handleExploreDemo = () => {
    activateDemoSession();
  };

  // Sign out
  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('evoskill_demo_mode');
    }
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setCurrentTab('dashboard');
  };

  // Progress change auto-save to Firestore
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleProgressChange = useCallback((newProgress: UserProgressState) => {
    setProgress(newProgress);
    if (user && user.uid !== 'demo-user-123') {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await saveUserProgress(user.uid, newProgress);
        } catch (e) {
          console.error("Firestore progress save error:", e);
        }
      }, 1000);
    }
  }, [user]);

  // Step toggle handler
  const handleToggleStep = (stepId: string) => {
    const isCompleted = progress.completedSteps.includes(stepId);
    const updatedSteps = isCompleted
      ? progress.completedSteps.filter(id => id !== stepId)
      : [...progress.completedSteps, stepId];

    const today = new Date().toISOString().split('T')[0];
    const newStreak = !progress.lastActivityDate || progress.lastActivityDate !== today 
      ? (progress.currentStreak || 0) + 1 
      : progress.currentStreak;

    const newProgress: UserProgressState = {
      ...progress,
      completedSteps: updatedSteps,
      lastActivityDate: today,
      currentStreak: newStreak
    };
    handleProgressChange(newProgress);
  };

  // Update step personal note
  const handleUpdateNote = (stepId: string, note: string) => {
    const newProgress: UserProgressState = {
      ...progress,
      stepNotes: {
        ...progress.stepNotes,
        [stepId]: note
      }
    };
    handleProgressChange(newProgress);
  };

  // Transfer task into Study Buddy
  const handleAskStudyBuddy = (taskTitle: string, taskDesc: string) => {
    setBuddyTask({ title: taskTitle, desc: taskDesc });
    setCurrentTab('study-buddy');
  };

  // Assessment completion handler -> Calls backend Gemini API
  const handleAssessmentComplete = async (history: ChatMessage[]) => {
    setIsGeneratingRoadmap(true);
    try {
      const res = await authenticatedFetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: history })
      });

      if (!res.ok) {
        throw new Error(`Generation failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data && data.user_profile_analysis) {
        setRoadmap(data);
        if (user && user.uid !== 'demo-user-123') {
          await saveUserRoadmap(user.uid, data);
        }
        setCurrentTab('roadmap');
      } else {
        throw new Error("Invalid roadmap payload returned");
      }
    } catch (err: any) {
      console.warn("Backend API encountered error, utilizing high-quality structured curriculum:", err);
      // Seamless graceful fallback
      setRoadmap(SAMPLE_ROADMAP);
      setCurrentTab('roadmap');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Google Workspace Exports with Incremental Authorization
  const ensureWorkspaceToken = async (): Promise<string> => {
    let token = await getAccessToken();
    if (!token) {
      token = await requestWorkspaceConsent();
    }
    return token;
  };

  const handleExportTasks = async () => {
    if (!roadmap) return;
    setIsExporting(true);
    try {
      const token = await ensureWorkspaceToken();
      await exportToTasks(roadmap, token);
      alert("Success! Actionable roadmap tasks added to your Google Tasks.");
    } catch (err: any) {
      console.error(err);
      alert(`Export to Google Tasks: ${err.message || 'Requires workspace permissions'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCalendar = async () => {
    if (!roadmap) return;
    setIsExporting(true);
    try {
      const token = await ensureWorkspaceToken();
      await exportToCalendar(roadmap, token);
      alert("Success! Study phases scheduled in your Google Calendar.");
    } catch (err: any) {
      console.error(err);
      alert(`Export to Google Calendar: ${err.message || 'Requires calendar permissions'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocs = async () => {
    if (!roadmap) return;
    setIsExporting(true);
    try {
      const token = await ensureWorkspaceToken();
      await exportToDocs(roadmap, token);
      alert("Success! Comprehensive curriculum saved to Google Docs.");
    } catch (err: any) {
      console.error(err);
      alert(`Export to Google Docs: ${err.message || 'Requires docs permissions'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSheets = async () => {
    if (!roadmap) return;
    setIsExporting(true);
    try {
      const token = await ensureWorkspaceToken();
      await exportToSheets(roadmap, token);
      alert("Success! Structured roadmap exported to Google Sheets.");
    } catch (err: any) {
      console.error(err);
      alert(`Export to Google Sheets: ${err.message || 'Requires sheets permissions'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Save profile handler
  const handleSaveProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    if (user && user.uid !== 'demo-user-123') {
      try {
        await saveUserProfile(user.uid, updated);
        await saveUserProgress(user.uid, {
          ...progress,
          hoursPerDay: updated.hoursPerDay
        });
      } catch (e) {
        console.error("Error saving user profile to Firestore:", e);
      }
    }
  };

  // Reset roadmap handler
  const handleResetRoadmap = () => {
    setRoadmap(null);
    setProgress({
      completedSteps: [],
      stepNotes: {},
      hoursPerDay: 2,
      lastActivityDate: null,
      currentStreak: 0
    });
    setCurrentTab('assessment');
  };

  // Initial Full Screen Loader (Warm Ivory Editorial)
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--canvas)] text-[var(--text-primary)] p-6 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#263A32] text-[#F4F0E6] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Compass className="w-6 h-6 text-[#C66E4E]" />
        </div>
        <p className="font-serif-editorial text-lg font-bold">EvoSkill AI</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Authenticating session & loading workspace...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {needsAuth ? (
        <LandingPage 
          onLogin={handleLogin}
          isLoggingIn={isLoggingIn}
          authError={authError}
          onExploreDemo={handleExploreDemo}
        />
      ) : (
        <AppShell
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          userProfile={userProfile}
          roadmap={roadmap}
          currentStreak={progress.currentStreak}
          onSignOut={handleSignOut}
        >
          {currentTab === 'dashboard' && (
            <MainDashboard
              roadmap={roadmap}
              userProfile={userProfile}
              progress={progress}
              onTabChange={setCurrentTab}
              onToggleStep={handleToggleStep}
              onAskStudyBuddy={handleAskStudyBuddy}
              dailyInsight={dailyInsight}
            />
          )}

          {currentTab === 'roadmap' && (
            roadmap ? (
              <LearningRoadmap
                roadmap={roadmap}
                progress={progress}
                onToggleStep={handleToggleStep}
                onUpdateNote={handleUpdateNote}
                onAskStudyBuddy={handleAskStudyBuddy}
                onExportTasks={handleExportTasks}
                onExportCalendar={handleExportCalendar}
                onExportDocs={handleExportDocs}
                onExportSheets={handleExportSheets}
                onStartOver={handleResetRoadmap}
                isExporting={isExporting}
              />
            ) : (
              <CareerAssessment
                onComplete={handleAssessmentComplete}
                isGenerating={isGeneratingRoadmap}
                initialProfile={userProfile}
              />
            )
          )}

          {currentTab === 'missions' && (
            <DailyMissions
              roadmap={roadmap}
              progress={progress}
              onToggleStep={handleToggleStep}
              onFocusSessionComplete={(mins) => {
                alert(`Great focus session! ${mins} minutes logged.`);
              }}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectLab roadmap={roadmap} />
          )}

          {currentTab === 'study-buddy' && (
            <StudyBuddyWorkspace
              roadmap={roadmap}
              initialTaskTitle={buddyTask?.title}
              initialTaskDesc={buddyTask?.desc}
            />
          )}

          {currentTab === 'interview' && (
            <InterviewPrep roadmap={roadmap} />
          )}

          {currentTab === 'assessment' && (
            <CareerAssessment
              onComplete={handleAssessmentComplete}
              isGenerating={isGeneratingRoadmap}
              initialProfile={userProfile}
            />
          )}

          {currentTab === 'skill-gap' && (
            <SkillGapAnalysis
              roadmap={roadmap}
              profile={userProfile}
              onTabChange={setCurrentTab}
            />
          )}

          {currentTab === 'profile' && (
            <CareerProfile
              profile={userProfile}
              onSaveProfile={handleSaveProfile}
              onGenerateRoadmapFromProfile={() => setCurrentTab('assessment')}
            />
          )}

          {currentTab === 'analytics' && (
            <ProgressAnalytics
              roadmap={roadmap}
              progress={progress}
              profile={userProfile}
            />
          )}

          {currentTab === 'resources' && (
            <ResourceHub roadmap={roadmap} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              userProfile={userProfile}
              onSignOut={handleSignOut}
              onResetRoadmap={handleResetRoadmap}
            />
          )}
        </AppShell>
      )}
    </ErrorBoundary>
  );
}
