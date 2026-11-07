import React, { useState } from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  Map, 
  CheckSquare, 
  FolderGit2, 
  Bot, 
  Mic, 
  Sparkles, 
  Target, 
  UserCheck, 
  BarChart3, 
  Library, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Flame,
  Clock,
  ChevronRight
} from 'lucide-react';
import { NavigationTab, UserProfile, RoadmapData } from '../../types';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/Badge';

interface AppShellProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  userProfile?: UserProfile | null;
  roadmap?: RoadmapData | null;
  currentStreak?: number;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppShell({
  currentTab,
  onTabChange,
  userProfile,
  roadmap,
  currentStreak = 0,
  onSignOut,
  children
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navGroups = [
    {
      title: "Core Workflow",
      items: [
        { id: 'dashboard' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'roadmap' as NavigationTab, label: 'Learning Roadmap', icon: Map },
        { id: 'missions' as NavigationTab, label: 'Daily Missions', icon: CheckSquare },
        { id: 'projects' as NavigationTab, label: 'Project Lab', icon: FolderGit2 },
      ]
    },
    {
      title: "AI Mentorship",
      items: [
        { id: 'study-buddy' as NavigationTab, label: 'AI Study Buddy', icon: Bot },
        { id: 'interview' as NavigationTab, label: 'Interview Prep', icon: Mic },
        { id: 'assessment' as NavigationTab, label: 'Career Assessment', icon: Sparkles },
      ]
    },
    {
      title: "Career Intelligence",
      items: [
        { id: 'skill-gap' as NavigationTab, label: 'Skill Gap Matrix', icon: Target },
        { id: 'profile' as NavigationTab, label: 'Career Profile', icon: UserCheck },
        { id: 'analytics' as NavigationTab, label: 'Progress Analytics', icon: BarChart3 },
        { id: 'resources' as NavigationTab, label: 'Resource Hub', icon: Library },
      ]
    }
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const getTitle = () => {
    switch(currentTab) {
      case 'dashboard': return 'Executive Overview';
      case 'roadmap': return 'Adaptive Learning Roadmap';
      case 'missions': return "Today's Daily Missions";
      case 'projects': return 'Industry Project Lab';
      case 'study-buddy': return 'AI Study Buddy & Mentor';
      case 'interview': return 'Interview Readiness Lab';
      case 'assessment': return 'Career Assessment';
      case 'skill-gap': return 'Skill Gap Matrix';
      case 'profile': return 'Career Profile & Baseline';
      case 'analytics': return 'Progress & Focus Analytics';
      case 'resources': return 'Curated Resource Hub';
      case 'settings': return 'Platform Settings';
      default: return 'EvoSkill AI';
    }
  };

  return (
    <div className="flex h-screen bg-[var(--canvas)] text-[var(--text-primary)] font-sans overflow-hidden transition-colors">
      
      {/* Desktop Editorial Sidebar (Forest Ink) */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#1B2923] text-[#F4F0E6] border-r border-[#2D3E36] shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#2D3E36]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F4F0E6] text-[#1B2923] flex items-center justify-center font-bold shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif-editorial text-xl font-bold tracking-tight text-[#F4F0E6]">
                EvoSkill<span className="text-[#C66E4E]">.AI</span>
              </span>
              <p className="text-[10px] text-[#A5B5AD] uppercase tracking-wider font-semibold">
                V2.0 Editorial SaaS
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Goal Banner */}
        <div className="px-5 py-3.5 mx-4 mt-4 rounded-xl bg-[#25352E] border border-[#314A3F] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#A5B5AD] font-medium">
            <span className="uppercase tracking-wider font-bold text-[#D6AE57]">Active Path</span>
            {currentStreak > 0 && (
              <span className="flex items-center gap-1 text-[#C66E4E] font-bold">
                <Flame className="w-3.5 h-3.5 fill-[#C66E4E]" /> {currentStreak}d streak
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-[#F4F0E6] truncate">
            {roadmap?.user_profile_analysis.best_career_path || "Software Systems Architect"}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <p className="px-3 text-[10px] uppercase font-bold tracking-widest text-[#829A91] mb-1.5">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left ${
                      isActive 
                        ? 'bg-[#C66E4E] text-[#FFFFFF] shadow-sm font-bold' 
                        : 'text-[#CBD5CE] hover:bg-[#25352E] hover:text-[#FFFFFF]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#A5B5AD]'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 opacity-80" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Navigation: Settings, Theme, Sign Out */}
        <div className="p-4 border-t border-[#2D3E36] bg-[#16221D] space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavClick('settings')}
              className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'settings' 
                  ? 'bg-[#C66E4E] text-white' 
                  : 'text-[#A5B5AD] hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <ThemeToggle className="bg-[#25352E] border-[#314A3F] text-[#F4F0E6] hover:bg-[#2E4238]" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#25352E]">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-[#C66E4E]/30 text-[#F4F0E6] font-bold text-xs flex items-center justify-center shrink-0 border border-[#C66E4E]/40">
                {userProfile?.name?.charAt(0) || "U"}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-[#F4F0E6] truncate">
                  {userProfile?.name || "Career Scholar"}
                </p>
                <p className="text-[10px] text-[#A5B5AD] truncate">
                  {userProfile?.email || "Signed In"}
                </p>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-[#A5B5AD] hover:text-red-400 hover:bg-[#25352E] transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 md:h-20 bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-8 flex items-center justify-between shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-warm)] text-[var(--text-primary)] cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-serif-editorial text-lg sm:text-2xl font-bold text-[var(--text-primary)] leading-tight">
                {getTitle()}
              </h2>
              <p className="hidden sm:block text-xs text-[var(--text-muted)] font-medium">
                EvoSkill AI • Professional Career Acceleration Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {roadmap?.market_analysis && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-warm)] border border-[var(--border)] text-xs">
                <span className="text-[10px] font-bold text-[#829A91] uppercase">Salary Range:</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {roadmap.market_analysis.average_salary_range}
                </span>
              </div>
            )}
            <ThemeToggle className="lg:hidden" />
          </div>
        </header>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80%] bg-[#1B2923] text-[#F4F0E6] h-full flex flex-col z-10 p-5 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-4 border-b border-[#2D3E36]">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#C66E4E]" />
                  <span className="font-serif-editorial text-lg font-bold">EvoSkill AI</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#A5B5AD] hover:text-white"
                  aria-label="Close mobile navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-4">
                {navGroups.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#829A91]">
                      {group.title}
                    </p>
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                            isActive 
                              ? 'bg-[#C66E4E] text-white' 
                              : 'text-[#CBD5CE] hover:bg-[#25352E]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="mt-auto pt-4 border-t border-[#2D3E36] space-y-3">
                <button
                  onClick={() => handleNavClick('settings')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#CBD5CE] hover:bg-[#25352E]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-[#25352E]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
