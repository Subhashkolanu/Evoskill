export type NavigationTab = 
  | 'dashboard' 
  | 'roadmap' 
  | 'assessment' 
  | 'profile' 
  | 'skill-gap' 
  | 'missions'
  | 'projects' 
  | 'study-buddy' 
  | 'interview' 
  | 'analytics' 
  | 'resources' 
  | 'settings';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  education: string;
  degree?: string;
  yearsExperience: number;
  currentRole: string;
  targetRole: string;
  targetTimelineMonths: number;
  hoursPerDay: number;
  interests: string[];
  existingSkills: {
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }[];
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface SkillGapItem {
  skillName: string;
  category: 'core' | 'framework' | 'tools' | 'soft-skills';
  currentLevel: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
  requiredLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  gapScore: number; // 0 to 100% gap
  recommendedStep: string;
}

export interface DailyMission {
  id: string;
  title: string;
  phaseName: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedMinutes: number;
  completed: boolean;
  dueDate: string;
  notes?: string;
}

export interface ProjectLabItem {
  id: string;
  title: string;
  tagline: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Capstone';
  estimatedHours: number;
  skillsGained: string[];
  deliverables: string[];
  brief: string;
  milestones: {
    title: string;
    description: string;
    done: boolean;
  }[];
  githubTemplateUrl?: string;
  completed: boolean;
}

export interface InterviewQuestion {
  id: string;
  category: 'technical' | 'behavioral' | 'system-design';
  role: string;
  difficulty: 'Junior' | 'Mid' | 'Senior';
  question: string;
  keyConcepts: string[];
  suggestedAnswerGuide: string;
  userAnswerNotes?: string;
  practiced: boolean;
  rating?: number;
}

export interface AnalyticsMetric {
  learningHoursThisWeek: number;
  totalFocusHours: number;
  tasksCompletedTotal: number;
  tasksCompletedThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  skillsAcquiredCount: number;
  projectsCompletedCount: number;
  weeklyActivity: {
    day: string; // Mon, Tue, etc.
    hours: number;
    tasks: number;
  }[];
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'Documentation' | 'Course' | 'Interactive' | 'Book' | 'Repository';
  topic: string;
  url: string;
  isFree: boolean;
  rating?: number;
  estimatedHours?: string;
  bookmarked?: boolean;
}

export interface RoadmapData {
  user_profile_analysis: {
    detected_strengths: string[];
    best_career_path: string;
    why_this_path_suits_them: string;
  };
  market_analysis?: {
    average_salary_range: string;
    demand_level: string;
    key_companies: string[];
  };
  micro_steps_roadmap: {
    phase_name: string;
    goal: string;
    daily_breakdown: {
      title: string;
      description: string;
      estimated_duration_hours?: number;
      resource_links?: { title: string; url: string }[];
      deadline_approaching?: boolean;
    }[];
  }[];
  real_world_projects: {
    project_name: string;
    what_you_will_build: string;
    skills_gained: string[];
  }[];
  resource_aggregator: {
    resource_type: string;
    topic: string;
    direct_url: string;
  }[];
  coach_motivation_message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp?: string;
}

export interface UserProgressState {
  completedSteps: string[];
  stepNotes: Record<string, string>;
  hoursPerDay: number;
  lastActivityDate?: string | null;
  currentStreak?: number;
  totalFocusSeconds?: number;
}
