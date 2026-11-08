import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Sun, 
  Moon, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SettingsViewProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
  onResetRoadmap: () => void;
  onRestartOnboarding?: () => void;
}

export function SettingsView({
  userProfile,
  onSignOut,
  onResetRoadmap,
  onRestartOnboarding
}: SettingsViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="pb-6 border-b border-[var(--border)]">
        <Badge variant="forest" size="sm">Preferences</Badge>
        <h1 className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)] mt-1">
          Platform & Account Settings
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Manage your account credentials, visual theme, privacy parameters, and study data.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Account Profile Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-serif-editorial text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <User className="w-4 h-4 text-[#829A91]" /> Account Information
            </h3>
            <Badge variant="sage" size="sm">Verified Session</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Display Name</span>
              <span className="font-bold text-[var(--text-primary)] text-sm">{userProfile?.name || "EvoSkill Scholar"}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Authenticated Email</span>
              <span className="font-bold text-[var(--text-primary)] text-sm">{userProfile?.email || "Signed in with Google"}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Primary Target Goal</span>
              <span className="font-bold text-[#C66E4E] text-sm">{userProfile?.targetRole || "Software Systems Engineer"}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Daily Commitment</span>
              <span className="font-bold text-[var(--text-primary)] text-sm">{userProfile?.hoursPerDay || 2} Hours / Day</span>
            </div>
          </div>
        </Card>

        {/* Visual Appearance & Theme Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-serif-editorial text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#D6AE57]" /> Visual Theme & Palette
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[var(--text-primary)] block text-sm">Theme Mode</span>
              <span className="text-[var(--text-muted)]">
                Toggle between Warm Ivory (Day workspace) and Forest Slate (Night workspace).
              </span>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* Privacy & Legal Policies */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-serif-editorial text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#263A32] dark:text-[#CBD5CE]" /> Privacy & Data Transparency
            </h3>
          </div>

          <div className="text-xs text-[var(--text-secondary)] space-y-3 leading-relaxed">
            <p>
              EvoSkill AI adheres to strict data minimization. Your chat queries with the AI Study Buddy and assessment responses are processed securely via Google Gemini API with enterprise data encryption in transit and at rest.
            </p>
            <div className="flex gap-4 pt-1 font-semibold text-[#C66E4E]">
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                Privacy Policy <ExternalLink className="w-3 h-3" />
              </a>
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                Terms of Service <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </Card>

        {/* Danger Zone: Reset Roadmap & Sign Out */}
        <Card className="p-6 space-y-4 border-red-200 dark:border-red-950/40">
          <div className="flex items-center justify-between pb-3 border-b border-red-100 dark:border-red-950/30">
            <h3 className="font-serif-editorial text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Data Management & Reset
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs pb-4 border-b border-red-100 dark:border-red-950/30">
            <div>
              <span className="font-bold text-[var(--text-primary)] block text-sm">Change Learning Path / Restart Onboarding</span>
              <span className="text-[var(--text-muted)]">
                Re-answer the 8 personalization questions to switch domain, timeline, or weekly commitment.
              </span>
            </div>

            {onRestartOnboarding && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRestartOnboarding}
                className="text-xs shrink-0"
              >
                Restart Onboarding
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-[var(--text-primary)] block text-sm">Reset Active Roadmap</span>
              <span className="text-[var(--text-muted)]">
                Archive your current learning roadmap and clear milestone progress.
              </span>
            </div>

            {confirmReset ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => {
                    onResetRoadmap();
                    setConfirmReset(false);
                  }}
                >
                  Yes, Reset Path
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-red-600 dark:text-red-400"
              >
                Reset Roadmap
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
            <Button variant="secondary" size="sm" onClick={onSignOut}>
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out of Platform
            </Button>
          </div>
        </Card>

      </div>

    </div>
  );
}
