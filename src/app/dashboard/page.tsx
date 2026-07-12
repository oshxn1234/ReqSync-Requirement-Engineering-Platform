'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const requirements = useProjectStore((state) => state.requirements);
  const approvals = useProjectStore((state) => state.approvals);
  const currentUser = useProjectStore((state) => state.currentUser);
  
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

  // Calculate stats dynamically based on store content
  const baseReqCount = 121; // Offset to match mockup counts
  const totalRequirements = baseReqCount + requirements.length;
  
  const approvedReqs = requirements.filter(r => r.status === 'Approved').length;
  const approvedCount = 95 + approvedReqs;
  const approvedPercentage = Math.round((approvedCount / totalRequirements) * 100);

  const inProgressReqs = requirements.filter(r => r.status === 'In Progress').length;
  const inProgressCount = 22 + inProgressReqs;

  const draftReqs = requirements.filter(r => r.status === 'Draft').length;
  const inReviewReqs = requirements.filter(r => r.status === 'In Review').length;

  const totalInReview = 21 + inReviewReqs;
  const totalDraft = 31 + draftReqs;

  // Pie slice calculations for Conic Gradient
  const approvedDeg = (approvedCount / totalRequirements) * 360;
  const inReviewDeg = (totalInReview / totalRequirements) * 360;
  const draftDeg = (totalDraft / totalRequirements) * 360;

  // Color gradient string
  const conicGradientStyle = {
    background: `conic-gradient(
      #3b82f6 0deg ${draftDeg}deg, 
      #f59e0b ${draftDeg}deg ${draftDeg + inReviewDeg}deg, 
      #10b981 ${draftDeg + inReviewDeg}deg 360deg
    )`
  };

  // Mock list of risk items
  const riskRequirements = [
    { id: 'REQ-089', title: 'Two-Factor Authentication', risk: 'High', color: 'bg-rose-100 text-rose-800' },
    { id: 'REQ-102', title: 'Transaction Limits Validation', risk: 'High', color: 'bg-rose-100 text-rose-800' },
    { id: 'REQ-115', title: 'External Bank Integration', risk: 'Medium', color: 'bg-amber-100 text-amber-800' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm md:text-base">
          Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}</span>! Here&apos;s what&apos;s happening with your project.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirements</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalRequirements}</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +12%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">from last week</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{approvedCount}</span>
            <span className="text-xs font-medium text-slate-500">{approvedPercentage}% of total</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${approvedPercentage}%` }} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{inProgressCount}</span>
            <span className="text-xs font-medium text-slate-500">
              {Math.round((inProgressCount / totalRequirements) * 100)}% of total
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full" 
              style={{ width: `${Math.round((inProgressCount / totalRequirements) * 100)}%` }} 
            />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QA Reviewed</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">67</span>
            <span className="text-xs font-medium text-slate-500">52% of total</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '52%' }} />
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Issues</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">14</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              -8%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">from last week</p>
        </div>
      </div>

      {/* Middle Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirement Progress Donut */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">Requirement Progress</h3>
          <div className="flex justify-center items-center py-6">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center" style={conicGradientStyle}>
              {/* Inner Cutout */}
              <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-slate-800">{totalRequirements}</span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mt-2">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Draft</span>
              </div>
              <span className="text-sm font-bold text-slate-800 mt-1">{totalDraft} ({Math.round(totalDraft / totalRequirements * 100)}%)</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>In Review</span>
              </div>
              <span className="text-sm font-bold text-slate-800 mt-1">{totalInReview} ({Math.round(totalInReview / totalRequirements * 100)}%)</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Approved</span>
              </div>
              <span className="text-sm font-bold text-slate-800 mt-1">{approvedCount} ({Math.round(approvedCount / totalRequirements * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* Trackability Coverage Radial Ring */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">Traceability Coverage</h3>
          
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-36 h-36">
              {/* SVG circular track */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="60" 
                  stroke="#10b981" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - 0.82)}`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner absolute content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3.5xl font-black text-slate-800">82%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Good</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center max-w-[220px]">
              Well done! Keep maintaining traceability.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
            <div className="text-center">
              <span className="text-xs text-slate-400 font-medium">Unlinked Requirements</span>
              <div className="text-lg font-bold text-slate-800 mt-1">23</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Unlinked Tasks</span>
              <div className="text-lg font-bold text-slate-800 mt-1">17</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center pb-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Recent Activity</h3>
            <Link href="/requirements" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2 scrollbar-thin">
            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">A</div>
              <div className="flex flex-col min-w-0">
                <span className="text-slate-700">
                  <span className="font-semibold text-slate-900">REQ-128 User Authentication</span> approved by <span className="font-medium text-slate-800">John Doe</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-1">3 hours ago</span>
              </div>
            </div>
            
            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">M</div>
              <div className="flex flex-col min-w-0">
                <span className="text-slate-700">
                  <span className="font-semibold text-slate-900">REQ-127 Fund Transfer</span> modified by <span className="font-medium text-slate-800">Sarah Johnson</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-1">4 hours ago</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">B</div>
              <div className="flex flex-col min-w-0">
                <span className="text-slate-700">
                  Baseline <span className="font-semibold text-slate-900">v1.3</span> snapshot created by <span className="font-medium text-slate-800">Michael Brown</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-1">1 day ago</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-normal">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-bold">Q</div>
              <div className="flex flex-col min-w-0">
                <span className="text-slate-700">
                  QA Review completed for <span className="font-semibold text-slate-900">REQ-105</span> by <span className="font-medium text-slate-800">Emily Davis</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-1">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Widgets: AI Insights, Project Health, Top Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">AI Insights</h3>
            </div>
            
            <div className="space-y-3.5">
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">5 requirements may be incomplete</p>
                  <Link href="/ai-analysis" className="text-[10px] font-bold text-blue-600 hover:underline mt-1.5 inline-block">
                    View details &rarr;
                  </Link>
                </div>
              </div>

              <div className="p-3 bg-rose-50/50 border border-rose-200/60 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">3 high-impact risks identified</p>
                  <Link href="/ai-analysis" className="text-[10px] font-bold text-blue-600 hover:underline mt-1.5 inline-block">
                    View details &rarr;
                  </Link>
                </div>
              </div>

              <div className="p-3 bg-blue-50/40 border border-blue-200/50 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">12 potential duplicate specifications found</p>
                  <Link href="/ai-analysis" className="text-[10px] font-bold text-blue-600 hover:underline mt-1.5 inline-block">
                    View details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link href="/ai-analysis" className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5">
              <span>Launch Complete AI Check</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Project Health (Custom Radar representation) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">Project Health</h3>
          
          {/* SVG Radar Visual */}
          <div className="flex justify-center items-center py-4">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Concentric grid lines */}
                <circle cx="50" cy="50" r="45" stroke="#f1f5f9" strokeWidth="1" fill="none" />
                <circle cx="50" cy="50" r="30" stroke="#f1f5f9" strokeWidth="1" fill="none" />
                <circle cx="50" cy="50" r="15" stroke="#f1f5f9" strokeWidth="1" fill="none" />
                
                {/* Axis lines */}
                <line x1="50" y1="5" x2="50" y2="95" stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
                
                {/* Target Poly (dashed grey) */}
                <polygon points="50,15 80,50 50,85 20,50" stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1" fill="none" />
                
                {/* Current Poly (solid blue-green fill) */}
                <polygon points="50,22 75,50 50,78 25,50" stroke="#2563eb" strokeWidth="1.5" fill="rgba(37, 99, 235, 0.15)" />
                
                {/* Axis Labels */}
                <text x="50" y="10" textAnchor="middle" className="text-[6px] font-bold fill-slate-400">Collaboration</text>
                <text x="94" y="52" textAnchor="end" className="text-[6px] font-bold fill-slate-400">Traceability</text>
                <text x="50" y="93" textAnchor="middle" className="text-[6px] font-bold fill-slate-400">Timeliness</text>
                <text x="6" y="52" textAnchor="start" className="text-[6px] font-bold fill-slate-400">Quality</text>
              </svg>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="w-2.5 h-1 border-t-2 border-dashed border-slate-400" />
              <span>Target</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-2.5 h-2 rounded bg-blue-600/30 border border-blue-600" />
              <span>Current</span>
            </div>
          </div>
        </div>

        {/* Top Risk Requirements */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wide pb-4">Top Risk Requirements</h3>
            
            <div className="divide-y divide-slate-100">
              {riskRequirements.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-900">{req.id}</span>
                    <span className="text-xs text-slate-500 truncate mt-0.5">{req.title}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${req.color}`}>
                    {req.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2">
            <Link href="/requirements" className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5">
              <span>View All Requirements</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
