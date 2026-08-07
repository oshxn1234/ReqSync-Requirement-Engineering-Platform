'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Task, Requirement } from '@/store/projectStore';
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
  Sparkles,
  Users,
  Building,
  Folder,
  Calendar,
  Briefcase,
  GitMerge,
  Cpu,
  Bookmark,
  Bug,
  LayoutDashboard,
  ShieldCheck,
  Check,
  ArrowRight,
  Send,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const requirements = useProjectStore((state) => state.requirements);
  const approvals = useProjectStore((state) => state.approvals);
  const currentUser = useProjectStore((state) => state.currentUser);
  const tasks = useProjectStore((state) => state.tasks);
  const settings = useProjectStore((state) => state.settings);
  const approveApproval = useProjectStore((state) => state.approveApproval);
  const rejectApproval = useProjectStore((state) => state.rejectApproval);

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

  // Calculate dynamic stats
  const totalRequirements = 121 + requirements.length;
  const approvedReqs = requirements.filter(r => r.status === 'Approved').length;
  const approvedCount = 95 + approvedReqs;
  const approvedPercentage = Math.round((approvedCount / totalRequirements) * 100);
  const inProgressReqs = requirements.filter(r => r.status === 'In Progress').length;
  const inProgressCount = 22 + inProgressReqs;

  const role = currentUser?.role || 'Developer';

  // ----------------------------------------------------
  // 1. CEO DASHBOARD RENDERER
  // ----------------------------------------------------
  if (role === 'CEO') {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-indigo-600" />
            <span>Administrator & Executive Portal</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name}</span>. Overseeing company, departments, and corporate projects.
          </p>
        </div>

        {/* Corporate KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Folder className="w-5 h-5" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">3</span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" />Stable</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">across 2 corporate units</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Headcount</span>
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Users className="w-5 h-5" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{useProjectStore.getState().users.length}</span>
              <span className="text-xs font-semibold text-blue-500">+2 this month</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">all roles authorized</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Clock className="w-5 h-5" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{approvals.filter(a => a.status === 'Pending').length}</span>
              <span className="text-xs font-medium text-amber-600">Action required</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">requirements & baselines</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Success</span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">94.2%</span>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" />+1.4%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">quality threshold met</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Cost Savings</span>
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Cpu className="w-5 h-5" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950">$1,450</span>
              <span className="text-xs font-bold text-purple-500">Active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">engineering optimization</p>
          </div>
        </div>

        {/* Corporate Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Departments */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Corporate Departments</h3>
              <Link href="/user-management" className="text-xs font-bold text-indigo-600 hover:underline">Manage Employees</Link>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Engineering / Implementation</span>
                  <span className="text-slate-400">Developers & Tech Leads</span>
                </div>
                <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-bold">12 Employees</span>
              </div>
              <div className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Product Management & PMO</span>
                  <span className="text-slate-400">Project Managers & Product Owners</span>
                </div>
                <span className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full font-bold">4 Employees</span>
              </div>
              <div className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Business Analysis & Design</span>
                  <span className="text-slate-400">Requirements Engineering & BAs</span>
                </div>
                <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-bold">5 Employees</span>
              </div>
              <div className="py-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Quality Assurance & Compliance</span>
                  <span className="text-slate-400">QA Engineers & Auditors</span>
                </div>
                <span className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full font-bold">3 Employees</span>
              </div>
            </div>
          </div>

          {/* AI Usage stats */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Engineering Stats</span>
            </h3>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Requirement Elicitation</span>
                  <span className="text-slate-800">452 runs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">UML Auto-Generation</span>
                  <span className="text-slate-800">128 runs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Impact Analysis Simulation</span>
                  <span className="text-slate-800">92 runs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Total AI Tokens:</span>
                <span>4.8M / 10M Limit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Active Projects */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">Corporate Project Monitoring</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">{settings.projectName}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Active</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">{settings.description}</p>
              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-slate-100">
                <span>Code: {settings.projectCode}</span>
                <span>Team Size: {settings.teamMembers.length}</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 opacity-60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">E-Commerce Platform</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">Archived</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">Next-generation customer shopping portal with AI search recommendation engine.</p>
              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-slate-100">
                <span>Code: ECO-2025</span>
                <span>Team Size: 8</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 opacity-60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">HR Portal Upgrade</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase">Pending</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">Employee self-service and corporate payroll integration module.</p>
              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-slate-100">
                <span>Code: HRP-2026</span>
                <span>Team Size: --</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. PROJECT MANAGER DASHBOARD
  // ----------------------------------------------------
  if (role === 'Project Manager') {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <span>Project Management Console</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name}</span>. Managing timelines, workload, team roles, and approvals.
          </p>
        </div>

        {/* PM KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Projects</span>
            <span className="text-3xl font-black text-slate-900 block mt-2">1</span>
            <p className="text-[10px] text-slate-400 mt-1">Online Banking System</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Tasks</span>
            <span className="text-3xl font-black text-slate-900 block mt-2">{tasks.filter(t => t.status !== 'Done').length}</span>
            <p className="text-[10px] text-emerald-500 mt-1">3 Completed recently</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
            <span className="text-3xl font-black text-slate-900 block mt-2 text-amber-600">{approvals.filter(a => a.status === 'Pending').length}</span>
            <p className="text-[10px] text-slate-400 mt-1">Requirement & Baselines</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timeline Progress</span>
            <span className="text-3xl font-black text-slate-900 block mt-2">78%</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2"><div className="bg-blue-600 h-full rounded-full" style={{ width: '78%' }} /></div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Workload</span>
            <span className="text-3xl font-black text-slate-900 block mt-2">Optimal</span>
            <p className="text-[10px] text-slate-400 mt-1">Allocated correctly</p>
          </div>
        </div>

        {/* PM Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workload list */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Team Workload & Assignment</h3>
              <Link href="/settings" className="text-xs font-bold text-blue-600 hover:underline">Analyze Recommendation</Link>
            </div>
            <div className="space-y-4">
              {settings.teamMembers.map((m) => {
                const count = tasks.filter(t => t.assignee.toLowerCase().includes(m.name.split(' ')[0].toLowerCase())).length;
                return (
                  <div key={m.email} className="flex items-center justify-between text-xs">
                    <div className="w-1/3">
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-slate-400">{m.role}</span>
                    </div>
                    <div className="w-1/3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{count} tasks</span>
                    </div>
                    <div className="w-1/3 flex items-center justify-end gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${count > 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(count * 33, 100)}%` }} />
                      </div>
                      <span className="font-bold text-slate-600">{Math.min(count * 33, 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action queue approvals */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Pending Team Approvals</h3>
            <div className="space-y-3">
              {approvals.filter(a => a.status === 'Pending').slice(0, 3).map((app) => (
                <div key={app.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 truncate pr-2">{app.title}</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded shrink-0">{app.type}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Requested by {app.requestedBy} on {app.requestedOn}</p>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button 
                      onClick={() => approveApproval(app.id)} 
                      className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded hover:bg-emerald-700 cursor-pointer"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => rejectApproval(app.id)} 
                      className="bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1 rounded hover:bg-rose-700 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {approvals.filter(a => a.status === 'Pending').length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No approvals pending in queue.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. BUSINESS ANALYST DASHBOARD
  // ----------------------------------------------------
  if (role === 'Business Analyst') {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-500" />
            <span>BA Requirements Studio</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name}</span>. Eliciting requirements, modeling UML workspace, and checking completeness.
          </p>
        </div>

        {/* BA KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Requirements</span>
            <span className="text-3xl font-black text-slate-900 block mt-2">{requirements.length}</span>
            <p className="text-[10px] text-slate-400 mt-1">functional & non-functional</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Meeting Schedule</span>
            <span className="text-3xl font-black text-slate-900 block mt-2">3 Today</span>
            <p className="text-[10px] text-indigo-500 mt-1">Elicitation workshops</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completeness Checks</span>
            <span className="text-3xl font-black text-slate-900 block mt-2 text-emerald-600">88.5%</span>
            <p className="text-[10px] text-slate-400 mt-1">average AI clarity score</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Analysis</span>
            <span className="text-3xl font-black text-slate-900 block mt-2 text-amber-500">{requirements.filter(r => r.status === 'Draft').length}</span>
            <p className="text-[10px] text-slate-400 mt-1">requires completeness audit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meeting schedule planner */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-indigo-600" />
                <span>Today's Meeting Calendar</span>
              </h3>
              <button className="text-xs font-bold text-indigo-600 hover:underline">Schedule Meeting</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 text-xs">
                <div className="w-20 text-slate-400 font-semibold shrink-0">09:30 AM</div>
                <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="font-bold text-slate-900 block">Stakeholder Alignment Sync</span>
                  <p className="text-slate-500 mt-0.5">Review OBS transfer limit parameters and compliance guidelines with client representative.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-xs">
                <div className="w-20 text-slate-400 font-semibold shrink-0">11:00 AM</div>
                <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="font-bold text-slate-900 block">MFA Requirement Elicitation Workshop</span>
                  <p className="text-slate-500 mt-0.5">Elicit multi-factor validation flows for payment approvals. Generate draft criteria with engineering team.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-xs">
                <div className="w-20 text-slate-400 font-semibold shrink-0">03:30 PM</div>
                <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="font-bold text-slate-900 block">UML Class Map Verification</span>
                  <p className="text-slate-500 mt-0.5">Verify domain schemas for Transactions and Accounts. Export final SVG and PlantUML models.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick launch panel */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">AI Engineering Studio</h3>
            <div className="space-y-3 pt-1">
              <Link href="/requirements" className="flex items-center justify-between p-3 border border-slate-100 hover:border-blue-200 rounded-xl bg-slate-50 hover:bg-white transition-all text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Generate Requirements</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/uml-workspace" className="flex items-center justify-between p-3 border border-slate-100 hover:border-blue-200 rounded-xl bg-slate-50 hover:bg-white transition-all text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-blue-500" />
                  <span>Model Class Diagrams</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/ai-analysis" className="flex items-center justify-between p-3 border border-slate-100 hover:border-blue-200 rounded-xl bg-slate-50 hover:bg-white transition-all text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  <span>Completeness Analysis</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4. DEVELOPER DASHBOARD
  // ----------------------------------------------------
  if (role === 'Developer') {
    const devTasks = tasks.filter(t => t.assignee === 'John Doe');
    const toDoTasks = devTasks.filter(t => t.status === 'To Do');
    const inProgressTasks = devTasks.filter(t => t.status === 'In Progress');
    const readyForQaTasks = devTasks.filter(t => t.status === 'Ready for QA');
    const doneTasks = devTasks.filter(t => t.status === 'Done');

    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-7 h-7 text-emerald-600 animate-pulse" />
            <span>Developer Workspace Dashboard</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name}</span>. Implement assigned features, link PR branches, and track requirement traces.
          </p>
        </div>

        {/* Developer KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Assigned Tasks</span>
            <span className="text-3xl font-black text-slate-900 block mt-2">{devTasks.length}</span>
            <p className="text-[10px] text-slate-400 mt-1">{toDoTasks.length} pending start</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tasks In Progress</span>
            <span className="text-3xl font-black text-slate-900 block mt-2 text-blue-600">{inProgressTasks.length}</span>
            <p className="text-[10px] text-slate-400 mt-1">focused code sprints</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Tasks</span>
            <span className="text-3xl font-black text-slate-900 block mt-2 text-emerald-600">{doneTasks.length}</span>
            <p className="text-[10px] text-slate-400 mt-1">all acceptance criteria met</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notifications</span>
            <span className="text-3xl font-black text-slate-900 block mt-2 text-rose-500">2</span>
            <p className="text-[10px] text-slate-400 mt-1">requirement modifications</p>
          </div>
        </div>

        {/* Developer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dev Task list */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">My Active Workspace Tasks</h3>
              <Link href="/tasks" className="text-xs font-bold text-emerald-600 hover:underline">Submit PR / Implementation</Link>
            </div>
            
            <div className="space-y-3">
              {devTasks.map((t) => (
                <div key={t.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-950">{t.id}</span>
                      <span className="text-slate-800 font-semibold">{t.title}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{t.status}</span>
                  </div>
                  <Link href="/tasks" className="px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50 rounded-lg shadow-3xs flex items-center gap-1">
                    <span>Code workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
              {devTasks.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No tasks currently assigned.</p>
              )}
            </div>
          </div>

          {/* Traceability panel */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2">
              <GitMerge className="w-4.5 h-4.5 text-blue-500" />
              <span>Traceability Quick Reference</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ensure implementation logic matches the structured UML classes in your current branch:
            </p>
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="text-xs bg-slate-900 text-slate-300 p-3.5 rounded-xl space-y-2 font-mono">
                <span className="text-blue-400 block font-bold">Class User:</span>
                <span className="block text-[10px]">• login(): boolean</span>
                <span className="block text-[10px]">• logout(): boolean</span>
                <span className="block text-[10px]">• verifyCredentials(): boolean</span>
              </div>
              <Link href="/traceability" className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all block">
                Open Traceability Workspace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 5. QA ENGINEER DASHBOARD
  // ----------------------------------------------------
  if (role === 'QA Engineer') {
    const pendingQaTasks = tasks.filter(t => t.status === 'Ready for QA');

    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-600 animate-pulse" />
            <span>QA Verification Console</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name}</span>. Perform compliance verification, log defect severity, and review code links.
          </p>
        </div>

        {/* QA KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending QA Reviews</span>
            <span className="text-3xl font-black text-amber-500 block mt-2">{pendingQaTasks.length}</span>
            <p className="text-[10px] text-slate-400 mt-1">requirements compliance checks</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved Reviews</span>
            <span className="text-3xl font-black text-emerald-600 block mt-2">18</span>
            <p className="text-[10px] text-slate-400 mt-1">passed testing baseline</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Failed Reviews / Rejections</span>
            <span className="text-3xl font-black text-rose-500 block mt-2">3</span>
            <p className="text-[10px] text-slate-400 mt-1">requires changes from developer</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requirement Coverage</span>
            <span className="text-3xl font-black text-indigo-600 block mt-2">82%</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2"><div className="bg-indigo-600 h-full rounded-full" style={{ width: '82%' }} /></div>
          </div>
        </div>

        {/* QA Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Review Queue */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">QA Active Verification Queue</h3>
              <Link href="/tasks" className="text-xs font-bold text-purple-600 hover:underline">Verify Tasks</Link>
            </div>

            <div className="space-y-3">
              {pendingQaTasks.map((t) => (
                <div key={t.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-950">{t.id}</span>
                      <span className="text-slate-800 font-semibold">{t.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Assigned developer: {t.assignee}</span>
                  </div>
                  <Link href="/tasks" className="bg-purple-600 text-white hover:bg-purple-700 font-bold text-[10px] px-3.5 py-2 rounded-lg cursor-pointer">
                    Verify Code
                  </Link>
                </div>
              ))}
              {pendingQaTasks.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">All development submissions verified. Queue is clean!</p>
              )}
            </div>
          </div>

          {/* Active Defects */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2">
              <Bug className="w-4.5 h-4.5 text-rose-500" />
              <span>Active Defect Summary</span>
            </h3>
            <div className="divide-y divide-slate-100">
              <div className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">BUG-042: MFA OTP Fail</span>
                  <span className="text-[10px] text-slate-400">Linked requirement: REQ-128</span>
                </div>
                <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">Critical</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">BUG-039: Dashboard latency</span>
                  <span className="text-[10px] text-slate-400">Linked requirement: REQ-126</span>
                </div>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">Medium</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">BUG-035: Balance update lag</span>
                  <span className="text-[10px] text-slate-400">Linked requirement: REQ-127</span>
                </div>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">Medium</span>
              </div>
            </div>
            <button className="w-full text-center py-2 border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-xs">
              Log New Defect
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 6. STAKEHOLDER / CLIENT DASHBOARD
  // ----------------------------------------------------
  if (role === 'Stakeholder') {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-teal-600" />
            <span>Stakeholder Governance Dashboard</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser?.name}</span>. Reviewing project milestones, approving requirements, and downloading SRS documentation.
          </p>
        </div>

        {/* Stakeholder KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Health</span>
            <span className="text-3xl font-black text-emerald-600 block mt-2">HEALTHY</span>
            <p className="text-[10px] text-slate-400 mt-1">all milestones on track</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
            <span className="text-3xl font-black text-amber-500 block mt-2">{approvals.filter(a => a.status === 'Pending').length}</span>
            <p className="text-[10px] text-slate-400 mt-1">action required</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Milestones Completed</span>
            <span className="text-3xl font-black text-slate-900 block mt-2">3 / 5</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2"><div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} /></div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recent Releases</span>
            <span className="text-3xl font-black text-blue-600 block mt-2">v1.3</span>
            <p className="text-[10px] text-slate-400 mt-1">active baseline snapshot</p>
          </div>
        </div>

        {/* Stakeholder Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requirement approvals */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Review & Approve Requirements</h3>
              <Link href="/approvals" className="text-xs font-bold text-teal-600 hover:underline">View All Governance</Link>
            </div>
            
            <div className="space-y-4">
              {approvals.filter(a => a.status === 'Pending').slice(0, 3).map((app) => (
                <div key={app.id} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{app.title}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{app.type}</span>
                  </div>
                  <p className="text-xs text-slate-500">Requested by {app.requestedBy} | Date: {app.requestedOn}</p>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button"
                      onClick={() => approveApproval(app.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Approve Requirement
                    </button>
                    <button 
                      type="button"
                      onClick={() => rejectApproval(app.id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {approvals.filter(a => a.status === 'Pending').length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-8">No requirements pending review.</p>
              )}
            </div>
          </div>

          {/* Stakeholder Documents */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Governance Documents</h3>
            <div className="space-y-3 pt-1">
              <Link href="/requirements" className="flex items-center justify-between p-3 border border-slate-100 hover:border-blue-200 rounded-xl bg-slate-50 hover:bg-white transition-all text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Software Requirements (SRS)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/baselines" className="flex items-center justify-between p-3 border border-slate-100 hover:border-blue-200 rounded-xl bg-slate-50 hover:bg-white transition-all text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-indigo-500" />
                  <span>Release Milestones & Baselines</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (should not happen)
  return null;
}
