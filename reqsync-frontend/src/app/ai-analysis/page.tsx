'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Requirement, UserStory, Task } from '@/store/projectStore';
import { Sparkles, BrainCircuit, Activity, FileText, CheckCircle2, ChevronRight, Download, Users, Zap, AlertTriangle, FileCheck, ArrowRight, Printer, RotateCw, Plus } from 'lucide-react';

export default function AiAnalysisPage() {
  const [mounted, setMounted] = useState(false);

  const requirements = useProjectStore((state) => state.requirements);
  const addRequirement = useProjectStore((state) => state.addRequirement);
  const updateRequirement = useProjectStore((state) => state.updateRequirement);
  const userStories = useProjectStore((state) => state.userStories);
  const addUserStory = useProjectStore((state) => state.addUserStory);
  const tasks = useProjectStore((state) => state.tasks);
  const addTask = useProjectStore((state) => state.addTask);
  const settings = useProjectStore((state) => state.settings);
  const currentUser = useProjectStore((state) => state.currentUser);

  // States
  const [activeTab, setActiveTab] = useState<'notes' | 'quality' | 'suitability' | 'srs'>('notes');
  const [selectedReqId, setSelectedReqId] = useState<string>('REQ-128');

  // Extraction State
  const [meetingNotes, setMeetingNotes] = useState(
    "Meeting Transcript - OBS Update:\n" +
    "- We need to support a new multi-factor authentication (MFA) login step for high-value transactions. Sarah Johnson will own this specification.\n" +
    "- Also, we must automatically log users out after 10 minutes of inactivity. John Doe needs to implement this background session timeout mechanism.\n" +
    "- Lastly, Emily Davis should verify the performance of the login page to ensure it loads in under 1.5 seconds under a load of 1000 users."
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    requirements: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'completeness' | 'completenessBreakdown' | 'aiSuggestions' | 'affectedReqs' | 'affectedTasks' | 'affectedStories' | 'affectedTestCases' | 'impactExplanation'>[];
    userStories: Omit<UserStory, 'id'>[];
    tasks: Omit<Task, 'id'>[];
  } | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // SRS Template state
  const [isPrinting, setIsPrinting] = useState(false);

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

  // Selected requirement metrics
  const selectedReq = requirements.find((r) => r.id === selectedReqId) || requirements[0];

  // 1. Run AI extraction simulation
  const handleExtractRequirements = () => {
    setIsExtracting(true);
    setImportSuccess(false);
    setTimeout(() => {
      setExtractedData({
        requirements: [
          {
            title: "Multi-Factor Authentication (MFA) Verification Flow",
            type: "Functional",
            priority: "High",
            owner: "Sarah Johnson",
            description: "The system shall require multi-factor authentication validation (SMS/OTP) prior to authorizing transactions exceeding $5,000.",
            acceptanceCriteria: [
              "Transaction amount checked on submit",
              "OTP generated and sent to customer registered phone number",
              "Validate OTP within 3 minutes lockout rule"
            ],
            status: "Draft"
          },
          {
            title: "Automatic Inactive Session Timeout Lockout",
            type: "Technical",
            priority: "Medium",
            owner: "John Doe",
            description: "The system shall automatically terminate user sessions and revoke access tokens after 10 minutes of continuous dashboard inactivity.",
            acceptanceCriteria: [
              "Track user mouse movements and key events",
              "Trigger warn alert at 9 minutes inactivity",
              "Enforce logout redirect and delete session cookies"
            ],
            status: "Draft"
          }
        ],
        userStories: [
          {
            title: "As a customer, I want to authenticate via OTP when sending large sums of money so my account remains secure.",
            priority: "High",
            relatedReq: "REQ-129", // Next estimated ID
            status: "To Do",
            assignee: "John Doe"
          }
        ],
        tasks: [
          {
            title: "Configure Session Idle Tracking Hooks in Main Dashboard Layout",
            priority: "Medium",
            relatedStory: "US-050",
            status: "To Do",
            assignee: "John Doe",
            dueDate: "2026-07-20"
          }
        ]
      });
      setIsExtracting(false);
    }, 1500);
  };

  const handleImportToBacklog = () => {
    if (!extractedData) return;
    
    // Add to Zustand store
    extractedData.requirements.forEach(req => addRequirement(req));
    extractedData.userStories.forEach(story => addUserStory(story));
    extractedData.tasks.forEach(task => addTask(task));

    setExtractedData(null);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 4000);
  };

  // 2. Suitability Scoring algorithm (AI simulation)
  const calculateSuitability = (member: typeof settings.teamMembers[0]) => {
    const skills = member.skills?.toLowerCase() || '';
    let score = 50; // base score
    let reason = 'General project coordination.';

    if (member.role.includes('Business Analyst') || member.role.includes('BA')) {
      if (skills.includes('requirements') || skills.includes('elicitation') || skills.includes('analysis')) {
        score = 96;
        reason = 'Perfect match for requirements capturing, writing specs, and compliance elicitation.';
      } else {
        score = 80;
        reason = 'Suitable for domain writing and stakeholder feedback.';
      }
    } else if (member.role.includes('Developer') || member.role.includes('Engineer')) {
      if (skills.includes('next.js') || skills.includes('react') || skills.includes('zustand')) {
        score = 92;
        reason = 'Excellent technical fit for client UI/API modules and state synchronization.';
      } else {
        score = 75;
        reason = 'Suitable for database schemas and middleware connections.';
      }
    } else if (member.role.includes('QA') || member.role.includes('Test')) {
      if (skills.includes('testing') || skills.includes('automation') || skills.includes('cypress')) {
        score = 94;
        reason = 'Strong fit for writing test execution plans and validating acceptance criteria.';
      } else {
        score = 78;
        reason = 'Suitable for manual validation lists and tracking test runs.';
      }
    } else if (member.role.includes('Product Manager') || member.role.includes('PM')) {
      score = 88;
      reason = 'Great match for backlog grooming, release prioritization, and milestones monitoring.';
    }

    return { score, reason };
  };

  // Auto fix completeness trigger
  const handleAutoFixClarity = (reqId: string) => {
    const r = requirements.find(req => req.id === reqId);
    if (!r) return;

    // Update quality scores
    updateRequirement(reqId, {
      completeness: 98,
      completenessBreakdown: {
        clarity: 98,
        verifiability: 95,
        quality: 98,
        conciseness: 98,
        consistency: 98
      },
      aiSuggestions: ["Requirements clarity optimized by AI auto-phrase. Clear constraints applied."]
    });
  };

  // Printable SRS View
  const handlePrintSRS = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BrainCircuit className="w-6.5 h-6.5 text-blue-600" />
            AI Intelligence Workspace
          </h1>
          <p className="text-slate-500 text-sm">Automate requirements extraction, audit quality/completeness, and run match suitability algorithms.</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'notes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Meeting Notes Extractor</span>
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'quality' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Completeness & Impact</span>
        </button>
        <button
          onClick={() => setActiveTab('suitability')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'suitability' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Suitability</span>
        </button>
        <button
          onClick={() => setActiveTab('srs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'srs' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>SRS Document Builder</span>
        </button>
      </div>

      {/* Content cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs">
        
        {/* Tab 1: Meeting Notes / AI Extraction */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">AI Requirement Extraction</h2>
              <p className="text-xs text-slate-500">Paste your meeting notes, design transcripts, or emails. The AI will extract requirements, user stories, and development tasks.</p>
            </div>

            <div className="space-y-4">
              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                readOnly={currentUser?.role === 'CEO'}
                placeholder="Paste notes here..."
                rows={8}
                className="w-full text-xs font-mono p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-80"
              />

              <div className="flex justify-end gap-3">
                {currentUser?.role !== 'CEO' && (
                  <button
                    onClick={handleExtractRequirements}
                    disabled={isExtracting || !meetingNotes.trim()}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isExtracting ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Parsing Notes...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Extract Backlog Items</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {importSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Extracted items have been successfully imported into the Requirements, User Stories, and Tasks backlogs!</span>
              </div>
            )}

            {extractedData && (
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Extracted Preview</h3>
                
                <div className="space-y-4 divide-y divide-slate-100">
                  {/* Extracted Reqs */}
                  <div className="pt-2 space-y-2">
                    <h4 className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      Extracted Requirements ({extractedData.requirements.length})
                    </h4>
                    {extractedData.requirements.map((req, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-xs text-slate-800">{req.title}</span>
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-2 rounded-full font-semibold">Draft</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal font-normal">{req.description}</p>
                        <div className="flex gap-2 pt-1.5 flex-wrap">
                          {req.acceptanceCriteria.map((ac, acidx) => (
                            <span key={acidx} className="text-[9px] bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.2 rounded font-medium">
                              AC: {ac}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Extracted Stories */}
                  <div className="pt-4 space-y-2">
                    <h4 className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5 font-bold">
                      <Users className="w-4 h-4" />
                      Extracted User Stories ({extractedData.userStories.length})
                    </h4>
                    {extractedData.userStories.map((story, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-3 rounded-xl text-xs flex justify-between items-center">
                        <span className="text-[11px] font-medium text-slate-700 leading-normal">{story.title}</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold shrink-0 ml-4">{story.priority} Priority</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                  {currentUser?.role === 'Business Analyst' && (
                    <button
                      onClick={handleImportToBacklog}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Import to Project Backlogs</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Completeness & Impact */}
        {activeTab === 'quality' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left spec select list */}
            <div className="lg:col-span-1 border border-slate-200 p-4.5 rounded-xl space-y-3 shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Requirement</h3>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {requirements.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => setSelectedReqId(req.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedReqId === req.id
                        ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-semibold shadow-2xs'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-slate-400 mb-0.5">{req.id}</div>
                    <div className="truncate font-semibold">{req.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right audit metrics view */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedReq.id} Audit Analysis</span>
                <h3 className="text-base font-bold text-slate-900 leading-normal">{selectedReq.title}</h3>
              </div>

              {/* Quality details breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Visual completion ring & scores */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Completeness Vectors
                  </h4>

                  <div className="flex items-center justify-around gap-4">
                    {/* Ring */}
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="#f1f5f9" strokeWidth="6.5" fill="transparent" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="32" 
                          stroke={selectedReq.completeness > 85 ? '#10b981' : '#f59e0b'} 
                          strokeWidth="6.5" 
                          fill="transparent" 
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - selectedReq.completeness / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-black text-slate-800 text-sm">
                        {selectedReq.completeness}%
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-medium text-slate-600 flex-1">
                      <div className="flex justify-between">
                        <span>Clarity</span>
                        <span className="font-bold text-slate-800">{selectedReq.completenessBreakdown.clarity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verifiability</span>
                        <span className="font-bold text-slate-800">{selectedReq.completenessBreakdown.verifiability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consistency</span>
                        <span className="font-bold text-slate-800">{selectedReq.completenessBreakdown.consistency}%</span>
                      </div>
                    </div>
                  </div>

                  {selectedReq.completeness < 95 && currentUser?.role !== 'CEO' && (
                    <button
                      onClick={() => handleAutoFixClarity(selectedReq.id)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Auto-Resolve Clarity Ambiguity
                    </button>
                  )}
                </div>

                {/* AI suggestion checks */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Action Recommendations
                  </h4>
                  <ul className="space-y-2 text-xs leading-normal">
                    {selectedReq.aiSuggestions.map((sug, idx) => (
                      <li key={idx} className="flex gap-2 items-start bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-medium text-slate-600">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Impact Propagation */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-500" />
                  Downstream Impact Propagation Graph
                </h4>

                <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  {selectedReq.impactExplanation}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Affected Specs</span>
                    <span className="text-lg font-black text-slate-800">{selectedReq.affectedReqs}</span>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">User Stories</span>
                    <span className="text-lg font-black text-slate-800">{selectedReq.affectedStories}</span>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Dev Tasks</span>
                    <span className="text-lg font-black text-slate-800">{selectedReq.affectedTasks}</span>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Test Cases</span>
                    <span className="text-lg font-black text-slate-800">{selectedReq.affectedTestCases}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Team Suitability */}
        {activeTab === 'suitability' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">AI Team Suitability Recommendations</h2>
              <p className="text-xs text-slate-500">Matching team members' skills matrices against the required engineering profiles dynamically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {settings.teamMembers.map((member) => {
                const suit = calculateSuitability(member);
                return (
                  <div key={member.email} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-800">{member.name}</h3>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-semibold">{member.role}</span>
                        </div>

                        {/* Suitability Badge */}
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                            suit.score > 90
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {suit.score}% Match
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {suit.reason}
                      </p>
                    </div>

                    {/* Member skills pills */}
                    {member.skills && (
                      <div className="pt-2 border-t border-slate-50 flex flex-wrap gap-1">
                        {member.skills.split(',').map((skill) => (
                          <span key={skill} className="text-[9px] bg-blue-50/50 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: SRS Generation */}
        {activeTab === 'srs' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">SRS Document Generation Workspace</h2>
                <p className="text-xs text-slate-500">Compile all approved requirements into a formal Software Requirements Specification document.</p>
              </div>

              <button
                onClick={handlePrintSRS}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Export / Print SRS</span>
              </button>
            </div>

            {/* Simulated SRS Template Container */}
            <div className="border border-slate-200 p-8 rounded-2xl shadow-xs bg-slate-50 max-h-[60vh] overflow-y-auto print:max-h-none print:bg-white print:p-0 print:border-none">
              <div className="bg-white border border-slate-200/60 p-8 max-w-3xl mx-auto space-y-12 font-sans text-slate-800 shadow-2xs print:shadow-none print:border-none">
                
                {/* Cover Page */}
                <div className="text-center py-20 space-y-6 border-b border-slate-100">
                  <span className="text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-700 px-3 py-1 rounded">
                    Software Requirements Specification (SRS)
                  </span>
                  <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-4">
                    {settings.projectName} Specs Doc
                  </h1>
                  <p className="text-xs text-slate-500">
                    Project Reference: {settings.projectCode} | Version: 1.0.0
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold pt-16">
                    Company: {settings.companyName || ' Apex Financial Technologies LLC'}<br />
                    Date Compiled: {new Date().toISOString().split('T')[0]}<br />
                    Prepared By: ReqSync AI Architect
                  </p>
                </div>

                {/* Table of Contents */}
                <div className="space-y-4 pt-6">
                  <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-1 uppercase tracking-wider">
                    Table of Contents
                  </h2>
                  <div className="space-y-1 text-xs text-slate-600 font-semibold">
                    <div className="flex justify-between border-b border-dotted border-slate-200 pb-0.5">
                      <span>1. Introduction & Project Scope</span>
                      <span>Page 2</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-200 pb-0.5">
                      <span>2. Functional Requirements Spec</span>
                      <span>Page 3</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-200 pb-0.5">
                      <span>3. Non-Functional & Technical Requirements</span>
                      <span>Page 4</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-200 pb-0.5">
                      <span>4. Traceability Index Matrix</span>
                      <span>Page 5</span>
                    </div>
                  </div>
                </div>

                {/* 1. Introduction */}
                <div className="space-y-3 pt-6">
                  <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-1">
                    1. Introduction & Project Scope
                  </h2>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    This document details the Software Requirements Specification (SRS) for the {settings.projectName} system. 
                    The objective is to establish a verified baseline of specifications, including requirements definitions, 
                    user stories mapping, and verification test outlines.
                  </p>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    {settings.description}
                  </p>
                </div>

                {/* 2. Functional Specs */}
                <div className="space-y-4 pt-6">
                  <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-1">
                    2. Functional Requirements Spec
                  </h2>
                  
                  <div className="space-y-6">
                    {requirements.filter(r => r.type === 'Functional').map(req => (
                      <div key={req.id} className="space-y-1.5 pl-3 border-l-2 border-slate-900">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-950">{req.id}: {req.title}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Status: {req.status}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal font-normal">{req.description}</p>
                        
                        <div className="pt-1.5">
                          <span className="text-[10px] font-bold text-slate-800 block mb-0.5">Acceptance Criteria:</span>
                          <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-0.5 font-medium">
                            {req.acceptanceCriteria.map((ac, acidx) => (
                              <li key={acidx}>{ac}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Non-Functional specs */}
                <div className="space-y-4 pt-6">
                  <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-1">
                    3. Non-Functional & Technical Requirements
                  </h2>
                  
                  <div className="space-y-6">
                    {requirements.filter(r => r.type !== 'Functional').map(req => (
                      <div key={req.id} className="space-y-1.5 pl-3 border-l-2 border-slate-400">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-950">{req.id}: {req.title} ({req.type})</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Status: {req.status}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal font-normal">{req.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
