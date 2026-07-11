'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Baseline } from '@/store/projectStore';
import { Milestone, Plus, Calendar, User, FileText, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function BaselinesPage() {
  const [mounted, setMounted] = useState(false);
  const baselines = useProjectStore((state) => state.baselines);
  const addBaseline = useProjectStore((state) => state.addBaseline);
  const requirements = useProjectStore((state) => state.requirements);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [versionInput, setVersionInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [createdByInput, setCreatedByInput] = useState('Sarah Johnson');

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

  // Count approved requirements
  const approvedReqCount = requirements.filter((r) => r.status === 'Approved').length;

  const handleSubmitBaseline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionInput || !descriptionInput) return;

    addBaseline({
      version: versionInput.startsWith('v') ? versionInput : `v${versionInput}`,
      description: descriptionInput,
      createdBy: createdByInput,
    });

    // Reset and close
    setVersionInput('');
    setDescriptionInput('');
    setIsModalOpen(false);
  };

  const getStatusColor = (status: Baseline['status']) => {
    return status === 'Active'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-slate-100 text-slate-500 border-slate-200';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Milestone className="w-6.5 h-6.5 text-blue-600" />
            Requirement Baselines
          </h1>
          <p className="text-slate-500 text-sm">Freeze and snapshot approved requirements to create signed-off project baselines.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Baseline Snapshot</span>
        </button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Stats/Status Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold tracking-wide text-slate-200">Current Scope Ready</h3>
            <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-slate-400 font-semibold">Approved Reqs</span>
              </div>
              <span className="text-2xl font-black text-white">{approvedReqCount}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Creating a baseline freezes the current {approvedReqCount} approved requirements. This provides a baseline reference index for changes.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-3.5 text-xs text-slate-600 leading-normal">
            <h4 className="font-bold text-slate-800">What is a baseline?</h4>
            <p>
              A project baseline is a signed-off snapshot of requirements representing the agreed scope for a release cycle.
            </p>
            <p className="font-semibold text-slate-700">Rules:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Only one baseline is designated as "Active" at a time.</li>
              <li>Creating a new baseline automatically supersedes previous versions.</li>
              <li>Baselines should be approved by governance boards prior to lock.</li>
            </ul>
          </div>
        </div>

        {/* Baselines history list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baseline Registry History</h3>

          <div className="space-y-4">
            {baselines.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                No baselines created yet.
              </div>
            ) : (
              baselines.map((base) => (
                <div
                  key={base.version}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs hover:border-slate-300 transition-all flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 mt-0.5">
                    {base.version}
                  </div>
                  
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{base.version} Snapshot</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(base.status)}`}>
                        {base.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-normal leading-relaxed break-words">{base.description}</p>

                    <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-50">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Created by {base.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{base.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{base.reqCount} Approved Requirements locked</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Creation Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Create Baseline Snapshot</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBaseline} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Baseline Version</label>
                <input
                  type="text"
                  value={versionInput}
                  onChange={(e) => setVersionInput(e.target.value)}
                  placeholder="e.g. v1.4"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Baseline Author</label>
                <input
                  type="text"
                  value={createdByInput}
                  onChange={(e) => setCreatedByInput(e.target.value)}
                  placeholder="Your Name"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Scope Description / Changelog</label>
                <textarea
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Detail what is included in this baseline freeze..."
                  rows={3}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-700 leading-normal flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This baseline will lock the current <strong>{approvedReqCount}</strong> approved requirements and mark the current active baseline as Superseded.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Freeze Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
