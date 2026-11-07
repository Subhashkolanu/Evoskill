import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Code2, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  Terminal, 
  Loader2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RoadmapData, ChatMessage } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { authenticatedFetch } from '../../lib/firebase';

interface StudyBuddyWorkspaceProps {
  roadmap: RoadmapData | null;
  initialTaskTitle?: string | null;
  initialTaskDesc?: string | null;
}

export function StudyBuddyWorkspace({
  roadmap,
  initialTaskTitle,
  initialTaskDesc
}: StudyBuddyWorkspaceProps) {
  const activeTask = initialTaskTitle || roadmap?.micro_steps_roadmap[0]?.daily_breakdown[0]?.title || "Distributed Systems Basics";
  const activeDesc = initialTaskDesc || roadmap?.micro_steps_roadmap[0]?.daily_breakdown[0]?.description || "Foundational concepts and principles.";

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'init-1',
        sender: 'ai',
        text: `Hello! I am your **EvoSkill AI Mentor & Study Buddy**.

I have loaded your active milestone: **${activeTask}**.

How can I help you conquer this concept today? You can ask me to:
- Explain this concept from **First Principles** with intuitive analogies.
- Provide a small **Practical Exercise or Code Kata** to test your knowledge.
- Review your code implementation or clarify architectural trade-offs.`
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await authenticatedFetch('/api/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepTitle: activeTask,
          stepDescription: activeDesc,
          chatHistory: newHistory
        })
      });

      if (!res.ok) {
        throw new Error("Mentor API request failed");
      }

      const data = await res.json();
      if (data.message) {
        setMessages([...newHistory, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.message
        }]);
      } else {
        throw new Error(data.error || "No response received");
      }
    } catch (err: any) {
      console.error(err);
      setMessages([...newHistory, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `### Key Concept Overview for: ${activeTask}

When approaching **${activeTask}**, always break down the problem to first principles:

1. **State the core constraint:** What physical or computational limits dictate this problem?
2. **Minimal Working Solution:** Before optimizing, verify a basic prototype works end-to-end.
3. **Failure Scenarios:** What happens when network packets drop, disks run out of space, or invalid payloads arrive?

*(Note: AI service is currently operating in offline conceptual mode. Please check network or try again shortly.)*`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptType: 'first-principles' | 'challenge' | 'code') => {
    let text = "";
    if (promptType === 'first-principles') {
      text = `Please break down "${activeTask}" from first principles. Why does this exist, and what problem does it solve that simpler tools could not?`;
    } else if (promptType === 'challenge') {
      text = `Give me a realistic, bite-sized mini coding challenge or comprehension question to prove I understand "${activeTask}".`;
    } else if (promptType === 'code') {
      text = `Show me an idiomatic production code example demonstrating "${activeTask}" with clean comments explaining the tricky edge cases.`;
    }
    handleSend(text);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      
      {/* Top Context Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="terracotta" size="sm">Active Mentorship Chamber</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono truncate max-w-xs">
              Task: {activeTask}
            </span>
          </div>
          <h2 className="font-serif-editorial text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            AI Study Buddy & Deep Mentor
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([{
              id: Date.now().toString(),
              sender: 'ai',
              text: `Conversation cleared. I am ready to explore **${activeTask}** with you.`
            }])}
            className="text-xs text-[var(--text-muted)]"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Chat
          </Button>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={() => handleQuickPrompt('first-principles')}
          className="px-3 py-1.5 rounded-xl bg-[var(--surface-warm)] border border-[var(--border)] hover:border-[#829A91] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
        >
          💡 First-Principles Breakdown
        </button>
        <button
          onClick={() => handleQuickPrompt('challenge')}
          className="px-3 py-1.5 rounded-xl bg-[var(--surface-warm)] border border-[var(--border)] hover:border-[#829A91] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
        >
          🎯 Quiz Me With a Challenge
        </button>
        <button
          onClick={() => handleQuickPrompt('code')}
          className="px-3 py-1.5 rounded-xl bg-[var(--surface-warm)] border border-[var(--border)] hover:border-[#829A91] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
        >
          💻 Show Production Code Pattern
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div 
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isAi ? '' : 'ml-auto justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-[#263A32] text-[#F4F0E6] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[#D6AE57]" />
                </div>
              )}

              <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                isAi 
                  ? 'bg-[var(--surface-warm)] text-[var(--text-primary)] border border-[var(--border-subtle)] prose prose-sm max-w-none' 
                  : 'bg-[#C66E4E] text-white font-medium rounded-tr-xs'
              }`}>
                {isAi ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-[var(--text-muted)] animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[#263A32] text-[#F4F0E6] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#D6AE57]" />
            </div>
            <span>EvoSkill Study Buddy is composing response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask anything about "${activeTask}" or paste code...`}
          disabled={isLoading}
          className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
        />
        <Button 
          type="submit" 
          variant="primary" 
          size="md"
          disabled={!input.trim() || isLoading}
          isLoading={isLoading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

    </div>
  );
}
