import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Sparkles, 
  BookOpen, 
  MessageSquare,
  ThumbsUp,
  BrainCircuit
} from 'lucide-react';
import { RoadmapData, InterviewQuestion } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface InterviewPrepProps {
  roadmap: RoadmapData | null;
}

export function InterviewPrep({ roadmap }: InterviewPrepProps) {
  const targetCareer = roadmap?.user_profile_analysis.best_career_path || "Full-Stack Software Engineer";

  const [activeCategory, setActiveCategory] = useState<'all' | 'technical' | 'behavioral' | 'system-design'>('all');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('q1');
  const [userPracticeAnswer, setUserPracticeAnswer] = useState<string>('');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [practicedMap, setPracticedMap] = useState<Record<string, boolean>>({});

  const questions: InterviewQuestion[] = [
    {
      id: 'q1',
      category: 'technical',
      role: targetCareer,
      difficulty: 'Mid',
      question: "How does the Node.js / JavaScript Event Loop handle asynchronous I/O versus CPU-intensive workloads, and what happens when the thread pool is starved?",
      keyConcepts: ["libuv Event Loop", "Microtasks (Promises) vs Macrotasks", "Thread pool starvation", "Worker threads"],
      suggestedAnswerGuide: "Explain that V8 executes synchronously on a single main thread, while libuv delegates network/file I/O to operating system primitives (epoll/kqueue) or a 4-thread default pool. For heavy computation, CPU tasks block the event loop, requiring worker threads or offloading to separate worker processes.",
      practiced: false
    },
    {
      id: 'q2',
      category: 'system-design',
      role: targetCareer,
      difficulty: 'Senior',
      question: "Design an idempotent payment processing API endpoint. How do you guarantee customers are never double-charged under network retries and distributed server crashes?",
      keyConcepts: ["Idempotency Keys", "Distributed Locks (Redis)", "Database Unique Constraints", "State Machine Transitions"],
      suggestedAnswerGuide: "Clients supply a unique UUID `Idempotency-Key` in request headers. The server verifies this key against a transactional key-value store or DB unique index before processing. Subsequent retries with the same key immediately return the stored completed result without re-executing credit card charges.",
      practiced: false
    },
    {
      id: 'q3',
      category: 'behavioral',
      role: targetCareer,
      difficulty: 'Mid',
      question: "Describe a situation where you had a strong technical disagreement with a peer or senior engineer regarding system design. How did you resolve it?",
      keyConcepts: ["STAR Framework", "Objective Benchmarking", "Disagree and Commit", "Collaborative Post-Mortem"],
      suggestedAnswerGuide: "Use the STAR method (Situation, Task, Action, Result). Emphasize using data and benchmarks rather than ego (e.g. running latency load tests to prove throughput vs readability trade-offs), followed by graceful alignment under team consensus.",
      practiced: false
    },
    {
      id: 'q4',
      category: 'technical',
      role: targetCareer,
      difficulty: 'Senior',
      question: "What is the difference between Optimistic Concurrency Control (OCC) and Pessimistic Locking in database transactions? When would you select OCC?",
      keyConcepts: ["Row versioning", "SELECT FOR UPDATE", "High concurrency read-heavy workloads", "Write skew"],
      suggestedAnswerGuide: "Pessimistic locking locks records upfront (`SELECT FOR UPDATE`), preventing concurrent updates but causing lock contention. OCC allows concurrent reads and writes, appending a `version` or timestamp column and rejecting or retrying the commit if the version has changed. OCC is ideal for read-heavy systems with low collision probability.",
      practiced: false
    }
  ];

  const filteredQuestions = questions.filter(q => 
    activeCategory === 'all' ? true : q.category === activeCategory
  );

  const activeQuestion = questions.find(q => q.id === selectedQuestionId) || questions[0];

  const markAsPracticed = (qId: string) => {
    setPracticedMap(prev => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" size="sm">Hiring Readiness</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Target Role: {targetCareer}
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)]">
            Technical & Behavioral Interview Prep
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Master the rigorous questions asked by top engineering hiring panels.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl shrink-0">
          {(['all', 'technical', 'system-design', 'behavioral'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-[#C66E4E] text-white shadow-xs' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Mock Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Questions List (1 col) */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Question Bank ({filteredQuestions.length})
          </span>

          <div className="space-y-2.5">
            {filteredQuestions.map((q) => {
              const isSelected = q.id === selectedQuestionId;
              const isPracticed = practicedMap[q.id];

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestionId(q.id);
                    setUserPracticeAnswer('');
                    setShowGuide(false);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                    isSelected 
                      ? 'border-[#C66E4E] bg-[var(--surface)] shadow-xs' 
                      : 'border-[var(--border)] bg-[var(--surface-warm)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      q.category === 'technical' ? 'forest' : 
                      q.category === 'system-design' ? 'terracotta' : 'gold'
                    } size="sm">
                      {q.category}
                    </Badge>
                    {isPracticed && (
                      <span className="text-[10px] text-[#829A91] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Practiced
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-2 leading-relaxed">
                    {q.question}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Simulation & Evaluation Chamber (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6">
            
            <div className="space-y-3 pb-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Badge variant="terracotta" size="sm">{activeQuestion.difficulty} Level</Badge>
                <span className="text-xs text-[var(--text-muted)] font-mono uppercase">
                  Category: {activeQuestion.category}
                </span>
              </div>
              <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug">
                {activeQuestion.question}
              </h3>

              {/* Key Concept Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeQuestion.keyConcepts.map((concept, idx) => (
                  <Badge key={idx} variant="sage" size="sm">{concept}</Badge>
                ))}
              </div>
            </div>

            {/* Answer Practice Workspace */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Your Draft Answer / Structure:
                </label>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Practice typing or bulleting your response
                </span>
              </div>

              <textarea
                rows={5}
                value={userPracticeAnswer}
                onChange={e => setUserPracticeAnswer(e.target.value)}
                placeholder="Structure your answer clearly: 1. Core Principle, 2. Trade-offs, 3. Production Experience..."
                className="w-full bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl p-3.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#829A91]/40 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-[#829A91]" />
                  {showGuide ? "Hide Answer Guide" : "Reveal Model Answer Guide"}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => markAsPracticed(activeQuestion.id)}
                  className="text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Save & Mark Practiced
                </Button>
              </div>
            </div>

            {/* Suggested Answer Guide Panel */}
            {showGuide && (
              <div className="p-5 rounded-2xl bg-[var(--surface-warm)] border border-[#829A91]/40 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-[#375249] dark:text-[#C5D5CF]">
                  <Sparkles className="w-4 h-4 text-[#C66E4E]" />
                  <span>Model Answer Guide & Talking Points</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {activeQuestion.suggestedAnswerGuide}
                </p>
              </div>
            )}

          </Card>
        </div>

      </div>

    </div>
  );
}
