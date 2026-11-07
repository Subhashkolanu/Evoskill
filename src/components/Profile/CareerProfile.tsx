import React, { useState } from 'react';
import { 
  UserCheck, 
  GraduationCap, 
  Briefcase, 
  Clock, 
  Target, 
  Award, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2 
} from 'lucide-react';
import { UserProfile } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface CareerProfileProps {
  profile: UserProfile | null;
  onSaveProfile: (updatedProfile: UserProfile) => Promise<void>;
  onGenerateRoadmapFromProfile?: () => void;
}

export function CareerProfile({
  profile,
  onSaveProfile,
  onGenerateRoadmapFromProfile
}: CareerProfileProps) {
  const [formData, setFormData] = useState<UserProfile>(() => {
    return profile || {
      name: "Scholar",
      email: "",
      education: "Bachelor's in Computer Science or related STEM",
      degree: "Undergraduate",
      yearsExperience: 1,
      currentRole: "Junior Developer / Learner",
      targetRole: "Full-Stack Cloud & AI Engineer",
      targetTimelineMonths: 6,
      hoursPerDay: 2.5,
      interests: ["Distributed Systems", "Cloud Architecture", "Generative AI", "Clean Architecture"],
      existingSkills: [
        { name: "JavaScript / TypeScript", level: "Intermediate" },
        { name: "React & Modern UI", level: "Intermediate" },
        { name: "SQL & Relational DBs", level: "Beginner" },
        { name: "Git & Version Control", level: "Intermediate" },
      ],
      bio: "Committed to deep work and systematic skill acquisition to transition into senior engineering roles."
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>("Beginner");
  const [newInterest, setNewInterest] = useState("");

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setFormData(prev => ({
      ...prev,
      existingSkills: [...prev.existingSkills, { name: newSkillName.trim(), level: newSkillLevel }]
    }));
    setNewSkillName("");
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingSkills: prev.existingSkills.filter((_, i) => i !== index)
    }));
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, newInterest.trim()]
    }));
    setNewInterest("");
  };

  const handleRemoveInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="forest" size="sm">Baseline Assessment</Badge>
            {saveSuccess && (
              <span className="text-xs font-semibold text-[#829A91] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully
              </span>
            )}
          </div>
          <h1 className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)]">
            Career Baseline & Profile
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Configure your professional background, current capabilities, target trajectory, and daily availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleSubmit} 
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-1.5" /> Save Profile
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Core Identity & Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C66E4E]" /> Target Career Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <Input
                label="Target Role Title"
                value={formData.targetRole}
                onChange={e => handleInputChange('targetRole', e.target.value)}
                hint="e.g. Full-Stack Engineer, AI Engineer, Solutions Architect"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Target Horizon (Months)"
                  type="number"
                  min="1"
                  max="36"
                  value={formData.targetTimelineMonths}
                  onChange={e => handleInputChange('targetTimelineMonths', parseInt(e.target.value) || 6)}
                />
                <Input
                  label="Daily Hours Commitment"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={formData.hoursPerDay}
                  onChange={e => handleInputChange('hoursPerDay', parseFloat(e.target.value) || 2)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Professional Bio / Motivation
                </label>
                <textarea
                  value={formData.bio || ""}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
                  placeholder="What is driving your current career development?"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#829A91]" /> Education & Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <Input
                label="Highest Education / Credential"
                value={formData.education}
                onChange={e => handleInputChange('education', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Current Role / Title"
                  value={formData.currentRole}
                  onChange={e => handleInputChange('currentRole', e.target.value)}
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  max="40"
                  value={formData.yearsExperience}
                  onChange={e => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-warm)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#829A91]">
                  Weekly Allocation
                </span>
                <p className="font-serif-editorial text-xl font-bold text-[var(--text-primary)]">
                  {(formData.hoursPerDay * 7).toFixed(1)} Hours / Week
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Sufficient for steady progression through project milestones.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Existing Skills Matrix */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D6AE57]" /> Verified Skills & Competencies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <p className="text-xs text-[var(--text-muted)]">
              Specify skills you already command. EvoSkill skips basics and calibrates your curriculum accordingly.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {formData.existingSkills.map((skill, idx) => (
                <div 
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-warm)] border border-[var(--border)] text-xs"
                >
                  <span className="font-bold text-[var(--text-primary)]">{skill.name}</span>
                  <Badge variant={
                    skill.level === 'Expert' ? 'forest' : 
                    skill.level === 'Advanced' ? 'terracotta' : 
                    skill.level === 'Intermediate' ? 'gold' : 'sage'
                  } size="sm">
                    {skill.level}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-[var(--text-muted)] hover:text-red-500 ml-1 cursor-pointer"
                    aria-label={`Remove skill ${skill.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Skill Row */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="Add skill (e.g., Docker, PostgreSQL, Go)..."
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
              />
              <select
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(e.target.value as any)}
                className="bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Professional Interests & Domains */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#263A32] dark:text-[#CBD5CE]" /> Core Interests & Specializations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface-warm)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)]"
                >
                  {interest}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveInterest(idx)}
                    className="text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <input
                type="text"
                placeholder="Add focus area (e.g., Microservices, Cryptography, LLM Orchestration)..."
                value={newInterest}
                onChange={e => setNewInterest(e.target.value)}
                className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddInterest}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Interest
              </Button>
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  );
}
