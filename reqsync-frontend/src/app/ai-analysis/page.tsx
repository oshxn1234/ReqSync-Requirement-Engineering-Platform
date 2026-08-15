'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Requirement, UserStory, Task } from '@/store/projectStore';
import { useBackendProjectStore } from '@/store/backendProjectStore';
import {
  analyzeRequirementCompleteness,
  getProjectRequirements,
  type RequirementCompletenessResponse,
  type RequirementSummaryResponse,
} from '@/lib/completeness-api';
import { Sparkles, BrainCircuit, Activity, FileText, CheckCircle2, Users, Zap, AlertTriangle, Printer, RotateCw, Plus } from 'lucide-react';

export default function AiAnalysisPage() {
  const [mounted, setMounted] = useState(false);

  const requirements = useProjectStore((state) => state.requirements);
  const addRequirement = useProjectStore((state) => state.addRequirement);
  const addUserStory = useProjectStore((state) => state.addUserStory);
  const addTask = useProjectStore((state) => state.addTask);
  const settings = useProjectStore((state) => state.settings);
  const currentUser = useProjectStore((state) => state.currentUser);
  const selectedBackendProjectId = useBackendProjectStore((state) => state.selectedProjectId);

  // States
  const [activeTab, setActiveTab] = useState<'notes' | 'quality' | 'suitability' | 'srs'>('notes');

  // Real backend completeness state
  const [backendRequirements, setBackendRequirements] = useState<RequirementSummaryResponse[]>([]);
  const [selectedBackendRequirementId, setSelectedBackendRequirementId] = useState<number | null>(null);
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const [requirementsError, setRequirementsError] = useState<string | null>(null);

  const [completenessResult, setCompletenessResult] = useState<RequirementCompletenessResponse | null>(null);
  const [completenessLoading, setCompletenessLoading] = useState(false);
  const [completenessError, setCompletenessError] = useState<string | null>(null);

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

  // Load real requirements for the selected backend project
  useEffect(() => {
    if (!mounted) return;

    const loadRequirements = async () => {
      try {
        setRequirementsLoading(true);
        setRequirementsError(null);

        const projectId = selectedBackendProjectId ?? 1;
        const response = await getProjectRequirements(projectId);

        setBackendRequirements(response);
        setCompletenessResult(null);
        setCompletenessError(null);

        if (response.length > 0) {
          setSelectedBackendRequirementId((currentId) => {
            if (currentId && response.some((req) => req.id === currentId)) {
              return currentId;
            }
            return response[0].id;
          });
        } else {
          setSelectedBackendRequirementId(null);
        }
      } catch (error) {
        setBackendRequirements([]);
        setSelectedBackendRequirementId(null);
        setCompletenessResult(null);
        setRequirementsError(
          error instanceof Error
            ? error.message
            : 'Unable to load requirements from the backend.'
        );
      } finally {
        setRequirementsLoading(false);
      }
    };

    void loadRequirements();
  }, [mounted, selectedBackendProjectId]);

  // Run the real completeness analysis for the selected requirement
  useEffect(() => {
    if (!mounted || activeTab !== 'quality' || selectedBackendRequirementId === null) {
      return;
    }

    let cancelled = false;

    const runAnalysis = async () => {
      try {
        setCompletenessLoading(true);
        setCompletenessError(null);

        const response = await analyzeRequirementCompleteness(
          selectedBackendRequirementId
        );

        if (!cancelled) {
          setCompletenessResult(response);
        }
      } catch (error) {
        if (!cancelled) {
          setCompletenessResult(null);
          setCompletenessError(
            error instanceof Error
              ? error.message
              : 'Requirement completeness analysis failed.'
          );
        }
      } finally {
        if (!cancelled) {
          setCompletenessLoading(false);
        }
      }
    };

    void runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [mounted, activeTab, selectedBackendRequirementId]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const selectedBackendRequirement =
    backendRequirements.find((req) => req.id === selectedBackendRequirementId) ??
    backendRequirements[0] ??
    null;

  const formatEnum = (value: string | null | undefined) => {
    if (!value) return '-';

    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const criterionScore = (criterionName: string) => {
    const criterion = completenessResult?.criteria?.find(
      (item) => item.criterion === criterionName
    );

    if (!criterion) return 0;
    if (criterion.status === 'PASS') return 100;
    if (criterion.status === 'PARTIAL') return 50;
    return 0;
  };

  const rerunCompletenessAnalysis = async () => {
    if (selectedBackendRequirementId === null) return;

    try {
      setCompletenessLoading(true);
      setCompletenessError(null);

      const response = await analyzeRequirementCompleteness(
        selectedBackendRequirementId
      );

      setCompletenessResult(response);
    } catch (error) {
      setCompletenessResult(null);
      setCompletenessError(
        error instanceof Error
          ? error.message
          : 'Requirement completeness analysis failed.'
      );
    } finally {
      setCompletenessLoading(false);
    }
  };

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
            {/* Left requirement select list - REAL BACKEND DATA */}
            <div className="lg:col-span-1 border border-slate-200 p-4.5 rounded-xl space-y-3 shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Requirement
              </h3>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {requirementsLoading && (
                  <div className="p-4 text-xs text-slate-500 text-center">
                    <RotateCw className="w-4 h-4 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading requirements...
                  </div>
                )}

                {requirementsError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    <div className="font-bold mb-1">Unable to load requirements</div>
                    {requirementsError}
                  </div>
                )}

                {!requirementsLoading &&
                  !requirementsError &&
                  backendRequirements.length === 0 && (
                    <div className="p-4 text-xs text-slate-500 text-center">
                      No requirements found for this project.
                    </div>
                  )}

                {backendRequirements.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => {
                      setSelectedBackendRequirementId(req.id);
                      setCompletenessResult(null);
                      setCompletenessError(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedBackendRequirementId === req.id
                        ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-semibold shadow-2xs'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-slate-400 mb-0.5">
                      {req.code}
                    </div>
                    <div className="truncate font-semibold">{req.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right completeness analysis view - REAL BACKEND RESULT */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {selectedBackendRequirement?.code ?? 'No Requirement'} Audit Analysis
                </span>

                <h3 className="text-base font-bold text-slate-900 leading-normal">
                  {selectedBackendRequirement?.title ?? 'Select a requirement'}
                </h3>

                {selectedBackendRequirement && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
                      {formatEnum(selectedBackendRequirement.type)}
                    </span>

                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                      {formatEnum(selectedBackendRequirement.priority)}
                    </span>

                    <span className="text-[9px] bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-full font-bold">
                      {formatEnum(selectedBackendRequirement.status)}
                    </span>
                  </div>
                )}
              </div>

              {completenessLoading && (
                <div className="min-h-[360px] border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                  <RotateCw className="w-7 h-7 animate-spin text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-800 mt-3">
                    Running completeness analysis...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    ReqSync is analyzing the selected requirement with the backend AI service.
                  </p>
                </div>
              )}

              {!completenessLoading && completenessError && (
                <div className="border border-rose-200 bg-rose-50 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-rose-800">
                        Completeness analysis failed
                      </h4>
                      <p className="text-xs text-rose-700 mt-1 break-words">
                        {completenessError}
                      </p>
                      <button
                        onClick={() => void rerunCompletenessAnalysis()}
                        className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!completenessLoading &&
                !completenessError &&
                completenessResult && (
                  <>
                    {/* Completeness score + AI suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500" />
                          Completeness Vectors
                        </h4>

                        <div className="flex items-center justify-around gap-4">
                          <div className="relative w-20 h-20 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke="#f1f5f9"
                                strokeWidth="6.5"
                                fill="transparent"
                              />
                              <circle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke={
                                  completenessResult.completenessScore >= 85
                                    ? '#10b981'
                                    : completenessResult.completenessScore >= 60
                                      ? '#f59e0b'
                                      : '#ef4444'
                                }
                                strokeWidth="6.5"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 32}`}
                                strokeDashoffset={`${
                                  2 *
                                  Math.PI *
                                  32 *
                                  (1 - completenessResult.completenessScore / 100)
                                }`}
                                strokeLinecap="round"
                              />
                            </svg>

                            <div className="absolute inset-0 flex items-center justify-center font-black text-slate-800 text-sm">
                              {completenessResult.completenessScore}%
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[11px] font-medium text-slate-600 flex-1">
                            <div className="flex justify-between">
                              <span>Actor</span>
                              <span className="font-bold text-slate-800">
                                {criterionScore('ACTOR')}%
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Testability</span>
                              <span className="font-bold text-slate-800">
                                {criterionScore('TESTABILITY')}%
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Consistency</span>
                              <span className="font-bold text-slate-800">
                                {criterionScore('CONSISTENCY')}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                              completenessResult.status === 'COMPLETE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : completenessResult.status === 'NEEDS_IMPROVEMENT'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {formatEnum(completenessResult.status)}
                          </span>

                          <button
                            onClick={() => void rerunCompletenessAnalysis()}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold"
                          >
                            Re-run Analysis
                          </button>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          AI Action Recommendations
                        </h4>

                        <ul className="space-y-2 text-xs leading-normal">
                          {(completenessResult.suggestions ?? []).length === 0 && (
                            <li className="flex gap-2 items-start bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl font-medium text-emerald-700">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>No additional improvement suggestions were returned.</span>
                            </li>
                          )}

                          {(completenessResult.suggestions ?? []).map((suggestion, index) => (
                            <li
                              key={index}
                              className="flex gap-2 items-start bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-medium text-slate-600"
                            >
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Real semantic coverage checks from backend */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-rose-500" />
                        Semantic Coverage & Gap Validation
                      </h4>

                      {(completenessResult.coverageChecks ?? []).length === 0 ? (
                        <div className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl">
                          No potential requirement gaps required semantic coverage validation.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(completenessResult.coverageChecks ?? []).map((check, index) => (
                            <div
                              key={`${check.topic}-${index}`}
                              className="bg-slate-50 border border-slate-100 p-3 rounded-xl"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  {check.topic}
                                </span>
                                <span
                                  className={`w-fit text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                    check.status === 'COVERED'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : check.status === 'PARTIALLY_COVERED'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  {formatEnum(check.status)}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                                {check.reason}
                              </p>

                              {check.relatedRequirementCode && (
                                <p className="text-[10px] text-blue-600 font-bold mt-1.5">
                                  Related: {check.relatedRequirementCode}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold">
                            Covered
                          </span>
                          <span className="text-lg font-black text-emerald-700">
                            {
                              (completenessResult.coverageChecks ?? []).filter(
                                (check) => check.status === 'COVERED'
                              ).length
                            }
                          </span>
                        </div>

                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold">
                            Partial
                          </span>
                          <span className="text-lg font-black text-amber-700">
                            {
                              (completenessResult.coverageChecks ?? []).filter(
                                (check) => check.status === 'PARTIALLY_COVERED'
                              ).length
                            }
                          </span>
                        </div>

                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold">
                            Missing
                          </span>
                          <span className="text-lg font-black text-rose-700">
                            {
                              (completenessResult.coverageChecks ?? []).filter(
                                (check) => check.status === 'MISSING'
                              ).length
                            }
                          </span>
                        </div>

                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold">
                            Confirmed Gaps
                          </span>
                          <span className="text-lg font-black text-slate-800">
                            {(completenessResult.confirmedMissing ?? []).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed real backend criteria */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        Detailed Completeness Criteria
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(completenessResult.criteria ?? []).map((criterion, index) => (
                          <div
                            key={`${criterion.criterion}-${index}`}
                            className="bg-slate-50 border border-slate-100 p-3 rounded-xl"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-extrabold text-slate-800">
                                {formatEnum(criterion.criterion)}
                              </span>

                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                  criterion.status === 'PASS'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : criterion.status === 'PARTIAL'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {formatEnum(criterion.status)}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                              {criterion.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              {!completenessLoading &&
                !completenessError &&
                !completenessResult &&
                selectedBackendRequirement && (
                  <div className="min-h-[300px] border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                    <Activity className="w-8 h-8 text-blue-400" />
                    <h4 className="text-sm font-bold text-slate-800 mt-3">
                      Ready for completeness analysis
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Select a requirement to run the backend AI completeness analysis.
                    </p>
                  </div>
                )}
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