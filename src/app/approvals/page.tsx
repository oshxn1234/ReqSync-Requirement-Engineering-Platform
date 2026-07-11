'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Approval } from '@/store/projectStore';
import { FileCheck, Check, X, Clock, User, Calendar, Filter } from 'lucide-react';

export default function ApprovalsPage() {
  const [mounted, setMounted] = useState(false);
  const approvals = useProjectStore((state) => state.approvals);
  const approveApproval = useProjectStore((state) => state.approveApproval);
  const rejectApproval = useProjectStore((state) => state.rejectApproval);

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Requirement' | 'Baseline' | 'Change Request'>('All');

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

  // Filter approvals based on status tab and type select
  const filteredApprovals = approvals.filter((app) => {
    const statusMatches = activeTab === 'All' || app.status === activeTab;
    const typeMatches = typeFilter === 'All' || app.type === typeFilter;
    return statusMatches && typeMatches;
  });

  const getStatusColor = (status: Approval['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: Approval['status']) => {
    switch (status) {
      case 'Approved':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'Rejected':
        return <X className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getTypeColor = (type: Approval['type']) => {
    switch (type) {
      case 'Requirement':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Baseline':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const pendingCount = approvals.filter((a) => a.status === 'Pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'Approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'Rejected').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6.5 h-6.5 text-blue-600" />
            Requirement & Governance Approvals
          </h1>
          <p className="text-slate-500 text-sm">Review, approve, or reject critical changes, requirement designs, and baselines.</p>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Action</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{pendingCount}</span>
            <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">Awaiting review</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Requests</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{approvedCount}</span>
            <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">Merged</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected / Archived</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{rejectedCount}</span>
            <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-semibold">Declined</span>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs">
        {/* Status Tab buttons */}
        <div className="flex border border-slate-100 bg-slate-50/50 p-1 rounded-xl shrink-0">
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.8 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Type select filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 px-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="All">All Types</option>
            <option value="Requirement">Requirement Updates</option>
            <option value="Baseline">Baselines</option>
            <option value="Change Request">Change Requests</option>
          </select>
        </div>
      </div>

      {/* Main Approvals list */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
            No approval requests found matching the current criteria.
          </div>
        ) : (
          filteredApprovals.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{app.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getTypeColor(app.type)}`}>
                    {app.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] border flex items-center gap-1 font-semibold ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {app.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug break-words">{app.title}</h3>

                <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Requested by {app.requestedBy}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Requested on {app.requestedOn}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons if Pending */}
              {app.status === 'Pending' && (
                <div className="flex gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => rejectApproval(app.id)}
                    className="flex items-center gap-1 border border-rose-200 hover:border-rose-300 bg-rose-50/50 hover:bg-rose-50 text-rose-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => approveApproval(app.id)}
                    className="flex items-center gap-1 border border-emerald-200 hover:border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
