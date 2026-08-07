'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { BarChart3, TrendingUp, ShieldAlert, Award, FileText, Settings, User, Clock, ArrowUpRight } from 'lucide-react';

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const requirements = useProjectStore((state) => state.requirements);
  const userStories = useProjectStore((state) => state.userStories);
  const tasks = useProjectStore((state) => state.tasks);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // 1. Calculate status distributions dynamically
  const totalReqs = requirements.length;
  const approvedReqs = requirements.filter(r => r.status === 'Approved').length;
  const inReviewReqs = requirements.filter(r => r.status === 'In Review').length;
  const inProgressReqs = requirements.filter(r => r.status === 'In Progress').length;
  const draftReqs = requirements.filter(r => r.status === 'Draft').length;

  const approvedPercent = Math.round((approvedReqs / totalReqs) * 100) || 0;
  const inReviewPercent = Math.round((inReviewReqs / totalReqs) * 100) || 0;
  const inProgressPercent = Math.round((inProgressReqs / totalReqs) * 100) || 0;
  const draftPercent = Math.round((draftReqs / totalReqs) * 100) || 0;

  // 2. Priority distribution
  const highPriorityCount = requirements.filter(r => r.priority === 'High').length;
  const mediumPriorityCount = requirements.filter(r => r.priority === 'Medium').length;
  const lowPriorityCount = requirements.filter(r => r.priority === 'Low').length;

  // 3. Average completeness score
  const avgCompleteness = Math.round(
    requirements.reduce((acc, r) => acc + r.completeness, 0) / totalReqs
  ) || 0;

  // 4. Mapped Trace coverage percentages
  const reqsWithStories = requirements.filter(
    (req) => userStories.some((story) => story.relatedReq === req.id)
  ).length;
  const traceCoverage = Math.round((reqsWithStories / totalReqs) * 100) || 0;

  // Recent changes log
  const auditLogs = [
    { action: "Requirement Approved", item: "REQ-128: User Authentication updated to active baseline", user: "Sarah Johnson", time: "1 hour ago", color: "bg-emerald-500" },
    { action: "Baseline lock created", item: "Baseline v1.3 index locked successfully", user: "Michael Brown", time: "3 hours ago", color: "bg-blue-500" },
    { action: "QA Review Failed", item: "REQ-128 test TC-12 login response time latency", user: "Emily Davis", time: "5 hours ago", color: "bg-rose-500" },
    { action: "Requirement Created", item: "REQ-124: Bill Payments draft written", user: "Sarah Johnson", time: "Yesterday", color: "bg-purple-500" },
    { action: "Task completed", item: "T-234 Dashboard UI Layout completed", user: "John Doe", time: "2 days ago", color: "bg-slate-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6.5 h-6.5 text-blue-600" />
            Reporting & Quality Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Visualize project execution coverage, requirement health scores, and release audit timelines.</p>
        </div>
      </div>

      {/* Numerical Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Specifications</span>
            <span className="text-2xl font-black text-slate-900">{totalReqs}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Trace Matrix</span>
            <span className="text-2xl font-black text-slate-900">{traceCoverage}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Completeness</span>
            <span className="text-2xl font-black text-slate-900">{avgCompleteness}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Dev Tasks</span>
            <span className="text-2xl font-black text-slate-900">{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* Graphical charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Status Distribution Horizontal bar */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-5 md:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirement Status Proportions</h3>
          
          <div className="space-y-4">
            {/* Stacked horizontal bar */}
            <div className="w-full h-7 rounded-xl overflow-hidden flex shadow-2xs border border-slate-100/80">
              {approvedPercent > 0 && <div className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${approvedPercent}%` }} title={`Approved: ${approvedPercent}%`}>{approvedPercent}%</div>}
              {inProgressPercent > 0 && <div className="bg-blue-500 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${inProgressPercent}%` }} title={`In Progress: ${inProgressPercent}%`}>{inProgressPercent}%</div>}
              {inReviewPercent > 0 && <div className="bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${inReviewPercent}%` }} title={`In Review: ${inReviewPercent}%`}>{inReviewPercent}%</div>}
              {draftPercent > 0 && <div className="bg-slate-400 h-full flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${draftPercent}%` }} title={`Draft: ${draftPercent}%`}>{draftPercent}%</div>}
            </div>

            {/* Labels and legends */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold pt-2 text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span>Approved: {approvedReqs}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                <span>In Progress: {inProgressReqs}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span>In Review: {inReviewReqs}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                <span>Draft: {draftReqs}</span>
              </div>
            </div>
          </div>

          {/* Priorities vertical bars */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority Distribution</h4>
            <div className="grid grid-cols-3 gap-6 items-end h-32 pt-4">
              {/* High */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{highPriorityCount}</span>
                <div className="w-full bg-rose-500 rounded-t-lg transition-all" style={{ height: `${(highPriorityCount / totalReqs) * 80}px` }} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">High</span>
              </div>
              {/* Medium */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{mediumPriorityCount}</span>
                <div className="w-full bg-amber-500 rounded-t-lg transition-all" style={{ height: `${(mediumPriorityCount / totalReqs) * 80}px` }} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Medium</span>
              </div>
              {/* Low */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{lowPriorityCount}</span>
                <div className="w-full bg-slate-400 rounded-t-lg transition-all" style={{ height: `${(lowPriorityCount / totalReqs) * 80}px` }} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Average Completeness Dial gauge */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs flex flex-col justify-between items-center gap-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start">Audit Health Index</h3>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG circle track and fill */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
              <circle 
                cx="88" 
                cy="88" 
                r="70" 
                stroke="#3b82f6" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - avgCompleteness / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900">{avgCompleteness}%</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-1">Avg Completeness</span>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 leading-normal font-medium max-w-[200px]">
            Average clarity and consistency check metrics across all requirements. Target is &gt;95%.
          </p>
        </div>
      </div>

      {/* Project Audit Logs Timeline */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Governance Audit Trail</h3>
        
        <div className="space-y-4">
          {auditLogs.map((log, index) => (
            <div key={index} className="flex gap-4 items-start text-xs font-medium text-slate-700">
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${log.color} ring-4 ring-white shadow-xs mt-1.5`} />
                {index < auditLogs.length - 1 && <div className="w-0.5 h-10 bg-slate-100 mt-2" />}
              </div>

              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="flex justify-between items-center gap-4">
                  <span className="font-extrabold text-slate-900 text-xs">{log.action}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {log.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal truncate">{log.item}</p>
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>By {log.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
