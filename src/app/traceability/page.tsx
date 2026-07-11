'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Requirement, UserStory, Task } from '@/store/projectStore';
import { GitMerge, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Play, HelpCircle, FileText, Users, CheckSquare, Search } from 'lucide-react';

export default function TraceabilityPage() {
  const [mounted, setMounted] = useState(false);
  
  const requirements = useProjectStore((state) => state.requirements);
  const userStories = useProjectStore((state) => state.userStories);
  const tasks = useProjectStore((state) => state.tasks);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'flow'>('matrix');
  const [selectedReqId, setSelectedReqId] = useState<string>('REQ-128');

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

  // Filter requirements by search
  const filteredReqs = requirements.filter(
    (req) =>
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to find mapped User Stories for a Requirement
  const getMappedStories = (reqId: string) => {
    return userStories.filter((story) => story.relatedReq === reqId);
  };

  // Helper to find mapped Tasks for a User Story
  const getMappedTasks = (storyId: string) => {
    return tasks.filter((task) => task.relatedStory === storyId);
  };

  // Simulated QA Test Cases for a Requirement
  const getMockTestCases = (reqId: string) => {
    switch (reqId) {
      case 'REQ-128':
        return [
          { id: 'TC-128-01', title: 'Validate valid credentials login flow', status: 'Passed' },
          { id: 'TC-128-02', title: 'Verify SSL certificate enforcement', status: 'Passed' },
          { id: 'TC-128-03', title: 'Validate lockout policy after 5 retries', status: 'Passed' },
          { id: 'TC-128-04', title: 'Verify login response speed limits', status: 'Failed' },
        ];
      case 'REQ-127':
        return [
          { id: 'TC-127-01', title: 'Internal account balance update validations', status: 'Passed' },
          { id: 'TC-127-02', title: 'External wire gateway routing security checks', status: 'Passed' },
          { id: 'TC-127-03', title: 'Trigger transaction notification alerts', status: 'Pending' },
        ];
      case 'REQ-126':
        return [
          { id: 'TC-126-01', title: 'Dashboard charts rendering accuracy', status: 'Passed' },
          { id: 'TC-126-02', title: 'Responsive dashboard viewport tests', status: 'Passed' },
        ];
      default:
        return [
          { id: `TC-${reqId.split('-')[1]}-01`, title: 'Core validation check', status: 'Passed' },
          { id: `TC-${reqId.split('-')[1]}-02`, title: 'Integration audit run', status: 'Pending' },
        ];
    }
  };

  const getQaStatusColor = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Selected requirement for Flow view
  const selectedReq = requirements.find((r) => r.id === selectedReqId) || requirements[0];
  const flowStories = selectedReq ? getMappedStories(selectedReq.id) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <GitMerge className="w-6.5 h-6.5 text-blue-600 rotate-90" />
            Traceability & QA Matrix
          </h1>
          <p className="text-slate-500 text-sm">Track how requirements link to user stories, execution tasks, and testing verification states.</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border border-slate-200 bg-white p-1 rounded-xl shadow-3xs shrink-0 self-end">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-4 py-1.8 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'matrix' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trace Matrix
          </button>
          <button
            onClick={() => setViewMode('flow')}
            className={`px-4 py-1.8 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'flow' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Interactive Flow
          </button>
        </div>
      </div>

      {/* Main Container */}
      {viewMode === 'matrix' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter requirements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.8 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Showing {filteredReqs.length} specifications trace map
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-100 rounded-xl">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-1/4">Requirement</th>
                  <th className="py-3 px-4 w-1/4">User Stories</th>
                  <th className="py-3 px-4 w-1/4">Development Tasks</th>
                  <th className="py-3 px-4 w-1/4">QA Reviews / Test Runs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredReqs.map((req) => {
                  const mappedStories = getMappedStories(req.id);
                  const testCases = getMockTestCases(req.id);
                  
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Req cell */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{req.id}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[9px] border ${
                              req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>{req.status}</span>
                          </div>
                          <p className="font-semibold text-slate-800 leading-snug">{req.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-2">{req.description}</p>
                        </div>
                      </td>

                      {/* Stories cell */}
                      <td className="py-4 px-4 align-top">
                        {mappedStories.length === 0 ? (
                          <span className="text-slate-300 italic text-[11px]">No mapped user stories</span>
                        ) : (
                          <div className="space-y-2">
                            {mappedStories.map((story) => (
                              <div key={story.id} className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-700 text-[10px]">{story.id}</span>
                                  <span className="text-[9px] bg-slate-100 px-1.5 rounded">{story.priority}</span>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-1 leading-snug font-medium line-clamp-2">{story.title}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Tasks cell */}
                      <td className="py-4 px-4 align-top">
                        {mappedStories.length === 0 ? (
                          <span className="text-slate-300 italic text-[11px]">-</span>
                        ) : (
                          <div className="space-y-2">
                            {mappedStories.map((story) => {
                              const storyTasks = getMappedTasks(story.id);
                              if (storyTasks.length === 0) return null;
                              return storyTasks.map((task) => (
                                <div key={task.id} className="p-2 border border-slate-100 rounded-lg bg-white shadow-3xs flex items-start gap-1.5 justify-between">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-slate-700 text-[10px]">{task.id}</span>
                                      <span className={`text-[8px] px-1 rounded ${
                                        task.status === 'Done' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                      }`}>{task.status}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-medium truncate mt-0.5">{task.title}</p>
                                  </div>
                                </div>
                              ));
                            })}
                          </div>
                        )}
                      </td>

                      {/* QA Cell */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1.5">
                            <span className="font-bold">QA Coverage ({testCases.length})</span>
                            <span className="font-semibold text-emerald-600">
                              {Math.round((testCases.filter(t => t.status === 'Passed').length / testCases.length) * 100)}% Pass
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            {testCases.map((tc) => (
                              <div key={tc.id} className="flex items-center justify-between gap-2 p-1.5 border border-slate-100 bg-slate-50/30 rounded">
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-500 text-[9px] block leading-none mb-0.5">{tc.id}</span>
                                  <p className="text-[10px] text-slate-700 font-medium truncate leading-tight">{tc.title}</p>
                                </div>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] border font-bold ${getQaStatusColor(tc.status)}`}>
                                  {tc.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Interactive Flow chart view */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          {/* Spec selection list */}
          <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Requirement</h3>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {requirements.map((req) => (
                <button
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedReqId === req.id
                      ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-semibold'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-[10px] text-slate-400 mb-0.5">{req.id}</div>
                  <div className="truncate font-semibold">{req.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Flow Canvas */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                End-to-End Traced Graph: {selectedReq.id}
              </h3>

              {/* Graphical nodes chain */}
              <div className="flex flex-col gap-6 items-center py-6 bg-slate-50/40 border border-slate-100 rounded-2xl relative overflow-hidden">
                {/* Background grid markings */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-35" />

                {/* Level 1: Requirement */}
                <div className="relative z-10 w-80 bg-white border border-blue-200 shadow-sm p-4 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">Requirement Spec</span>
                    <h4 className="text-xs font-extrabold text-slate-900 truncate leading-snug">{selectedReq.id}: {selectedReq.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{selectedReq.description}</p>
                  </div>
                </div>

                <div className="w-0.5 h-6 bg-slate-200 relative z-10" />

                {/* Level 2: User Stories */}
                <div className="relative z-10 flex flex-wrap gap-4 justify-center max-w-full px-6">
                  {flowStories.length === 0 ? (
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-400 italic">
                      No linked User Stories found
                    </div>
                  ) : (
                    flowStories.map((story) => {
                      const storyTasks = getMappedTasks(story.id);

                      return (
                        <div key={story.id} className="flex flex-col items-center gap-4">
                          <div className="w-72 bg-white border border-indigo-200 shadow-sm p-3.5 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                              <Users className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wide">User Story</span>
                              <h5 className="text-xs font-extrabold text-slate-800 truncate leading-snug">{story.id}</h5>
                              <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal">{story.title}</p>
                            </div>
                          </div>

                          <div className="w-0.5 h-4 bg-slate-200" />

                          {/* Level 3: Tasks */}
                          <div className="flex flex-col gap-2">
                            {storyTasks.length === 0 ? (
                              <div className="w-48 text-center p-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] text-slate-400 italic">
                                No mapped dev tasks
                              </div>
                            ) : (
                              storyTasks.map((task) => (
                                <div key={task.id} className="w-56 bg-white border border-slate-200 shadow-2xs p-2.5 rounded-lg flex items-center gap-2.5">
                                  <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-800 text-[10px] leading-none">{task.id}</span>
                                      <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded">{task.status}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate leading-normal mt-0.5">{task.title}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* QA Test executions footer */}
            <div className="border-t border-slate-100 pt-6 mt-8 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                QA Test Verification Suite
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getMockTestCases(selectedReq.id).map((tc) => (
                  <div key={tc.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">{tc.id}</span>
                      <h5 className="text-xs font-bold text-slate-700 truncate leading-tight">{tc.title}</h5>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] border font-bold shrink-0 ${getQaStatusColor(tc.status)}`}>
                      {tc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
