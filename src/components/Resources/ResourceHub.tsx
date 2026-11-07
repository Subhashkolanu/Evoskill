import React, { useState } from 'react';
import { 
  Library, 
  ExternalLink, 
  BookOpen, 
  Bookmark, 
  Check, 
  Search, 
  Filter, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { RoadmapData, ResourceItem } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ResourceHubProps {
  roadmap: RoadmapData | null;
}

export function ResourceHub({ roadmap }: ResourceHubProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Documentation' | 'Course' | 'Interactive' | 'Book'>('All');
  const [search, setSearch] = useState('');
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  const defaultResources: ResourceItem[] = [
    {
      id: 'r1',
      title: "Designing Data-Intensive Applications (DDIA)",
      type: "Book",
      topic: "Distributed Systems & Replication",
      url: "https://dataintensive.net/",
      isFree: false,
      rating: 4.9,
      estimatedHours: "40h"
    },
    {
      id: 'r2',
      title: "The Architecture of Open Source Applications",
      type: "Documentation",
      topic: "System Architecture",
      url: "https://aosabook.org/en/",
      isFree: true,
      rating: 4.8,
      estimatedHours: "20h"
    },
    {
      id: 'r3',
      title: "PostgreSQL Official Internals & Index Documentation",
      type: "Documentation",
      topic: "Relational Storage Engines",
      url: "https://www.postgresql.org/docs/current/internals.html",
      isFree: true,
      rating: 4.9,
      estimatedHours: "15h"
    },
    {
      id: 'r4',
      title: "MIT 6.824: Distributed Systems (Spring Lectures & Labs)",
      type: "Course",
      topic: "Raft Consensus & Distributed Key-Value",
      url: "https://pdos.csail.mit.edu/6.824/",
      isFree: true,
      rating: 5.0,
      estimatedHours: "60h"
    },
    {
      id: 'r5',
      title: "Execute Program: Advanced TypeScript & Concurrency",
      type: "Interactive",
      topic: "Type Systems & Runtime Semantics",
      url: "https://www.executeprogram.com/",
      isFree: false,
      rating: 4.8,
      estimatedHours: "12h"
    },
    {
      id: 'r6',
      title: "Google Cloud Architecture Framework",
      type: "Documentation",
      topic: "Cloud Reliability & Security",
      url: "https://cloud.google.com/architecture/framework",
      isFree: true,
      rating: 4.7,
      estimatedHours: "18h"
    }
  ];

  // Combine default with roadmap resources
  const roadmapResources: ResourceItem[] = (roadmap?.resource_aggregator || []).map((r, idx) => ({
    id: `rm-${idx}`,
    title: r.topic,
    type: (r.resource_type.includes('Course') ? 'Course' : r.resource_type.includes('Doc') ? 'Documentation' : 'Interactive') as any,
    topic: r.topic,
    url: r.direct_url,
    isFree: true
  }));

  const allResources = [...roadmapResources, ...defaultResources];

  const filteredResources = allResources.filter(r => {
    const matchesCategory = activeFilter === 'All' || r.type === activeFilter;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.topic.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="forest" size="sm">Knowledge Base</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Curated Canonical Material
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl font-bold text-[var(--text-primary)]">
            Curated Engineering Resource Hub
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            High-signal books, official engineering documentation, and university courses. No fluff.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl shrink-0">
          {(['All', 'Documentation', 'Course', 'Interactive', 'Book'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab 
                  ? 'bg-[#C66E4E] text-white shadow-xs' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Filter resources by topic, system, or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#829A91]/40"
        />
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => {
          const isBookmarked = bookmarkedMap[res.id];
          return (
            <Card key={res.id} className="p-5 space-y-4 hover:border-[#829A91] transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      res.type === 'Documentation' ? 'forest' : 
                      res.type === 'Course' ? 'terracotta' : 
                      res.type === 'Book' ? 'gold' : 'sage'
                    } size="sm">
                      {res.type}
                    </Badge>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      {res.isFree ? "Free Resource" : "Paid Book/Platform"}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBookmark(res.id)}
                    className="text-[var(--text-muted)] hover:text-[#C66E4E] cursor-pointer"
                    title={isBookmarked ? "Remove bookmark" : "Save bookmark"}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#C66E4E] text-[#C66E4E]' : ''}`} />
                  </button>
                </div>

                <h3 className="font-bold text-base text-[var(--text-primary)] leading-snug">
                  {res.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Topic: <strong className="text-[var(--text-primary)]">{res.topic}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs">
                {res.estimatedHours && (
                  <span className="text-[var(--text-muted)] font-mono">
                    Est. {res.estimatedHours}
                  </span>
                )}
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[#C66E4E] hover:underline ml-auto"
                >
                  Access Resource <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
