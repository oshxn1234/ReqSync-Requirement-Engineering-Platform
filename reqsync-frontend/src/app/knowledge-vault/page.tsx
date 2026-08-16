'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, KnowledgeItem } from '@/store/projectStore';
import { useBackendProjectStore } from '@/store/backendProjectStore';
import { getKnowledgeVault } from '@/lib/knowledge-api';
import { getProjectSrsVersions, getSrsById, SrsDocumentDto } from '@/lib/srs-api';
import SrsDocumentView from '@/components/srs-document-view';
import { Database, Search, Plus, BookOpen, FileText, CheckCircle2, ShieldAlert, Cpu, RotateCw, X, Users, Sparkles, Eye, FolderKanban, LayoutGrid, Layers } from 'lucide-react';

const CATEGORY_OPTIONS = ['All', 'Requirements', 'Decisions', 'Lessons Learned', 'QA Findings', 'Templates'] as const;

const CATEGORY_FILTER_ICONS: Record<(typeof CATEGORY_OPTIONS)[number], React.ReactNode> = {
  All: <Layers className="w-4 h-4 text-slate-500" />,
  Requirements: <FileText className="w-4 h-4 text-blue-600" />,
  Decisions: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  'Lessons Learned': <BookOpen className="w-4 h-4 text-purple-600" />,
  'QA Findings': <ShieldAlert className="w-4 h-4 text-rose-600" />,
  Templates: <LayoutGrid className="w-4 h-4 text-amber-600" />,
};

export default function KnowledgeVaultPage() {
  const [mounted, setMounted] = useState(false);
  const knowledgeVault = useProjectStore((state) => state.knowledgeVault);
  const addKnowledge = useProjectStore((state) => state.addKnowledge);

  const selectedProjectId = useBackendProjectStore((state) => state.selectedProjectId);

  const [remoteKnowledge, setRemoteKnowledge] = useState<KnowledgeItem[] | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  // Generated documents state
  const [generatedDocs, setGeneratedDocs] = useState<SrsDocumentDto[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  // Document viewer modal state
  const [viewDoc, setViewDoc] = useState<SrsDocumentDto | null>(null);
  const [viewDocLoading, setViewDocLoading] = useState(false);
  const [viewDocError, setViewDocError] = useState<string | null>(null);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'Requirement' | 'Domain' | 'Technology'>('Requirement');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Requirements' | 'Decisions' | 'Lessons Learned' | 'QA Findings' | 'Templates'>('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Requirements' | 'Decisions' | 'Lessons Learned' | 'QA Findings' | 'Templates'>('Lessons Learned');
  const [newProject, setNewProject] = useState('Online Banking System');

  // Vault Analysis scan states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string[] | null>(null);

  const projectId = selectedProjectId ?? 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      setRemoteError(null);
      try {
        const items = await getKnowledgeVault();
        setRemoteKnowledge(items as any);
      } catch (err: any) {
        setRemoteError(err?.message ?? 'Unable to load remote knowledge');
        setRemoteKnowledge(null);
      }
    })();
  }, [mounted]);

  // Load every generated document (SRS) for the selected project
  useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        setDocsLoading(true);
        setDocsError(null);
        const docs = await getProjectSrsVersions(projectId);
        setGeneratedDocs(docs);
      } catch (err: any) {
        setDocsError(err?.message ?? 'Unable to load generated documents');
        setGeneratedDocs([]);
      } finally {
        setDocsLoading(false);
      }
    })();
  }, [mounted, projectId]);

  const openDocument = async (srsId: number) => {
    try {
      setViewDocLoading(true);
      setViewDocError(null);
      const doc = await getSrsById(srsId);
      setViewDoc(doc);
    } catch (err: any) {
      setViewDocError(err?.message ?? 'Unable to load document');
      setViewDoc(null);
    } finally {
      setViewDocLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const sourceList = remoteKnowledge ?? knowledgeVault;

  // Filter vault items
  const filteredVault = sourceList.filter((item) => {
    const term = searchQuery.toLowerCase();
    if (!term) {
      return categoryFilter === 'All' || item.category === categoryFilter;
    }
    
    let matchesSearch = false;
    if (searchMode === 'Domain') {
      matchesSearch = item.project.toLowerCase().includes(term);
    } else if (searchMode === 'Technology') {
      matchesSearch = item.title.toLowerCase().includes(term) || 
                      (term === 'next.js' && item.title.includes('SRS')) ||
                      (term === 'security' && item.title.includes('MFA')) ||
                      (term === 'mfa' && item.title.includes('MFA'));
    } else {
      matchesSearch = item.title.toLowerCase().includes(term);
    }
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addKnowledge({
      title: newTitle,
      category: newCategory,
      project: newProject,
    });

    setNewTitle('');
    setIsModalOpen(false);
  };

  const handleRunScanAnalysis = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanResult([
        "COMPLIANCE DETECTED: Standard template (SRS Template v3.0) applied successfully.",
        "GOVERNANCE AUDIT WARNING: 2-Factor Authentication decisions require OTP validation compliance (Reference decision: K-02).",
        "SECURITY RECOMMENDATION: Account Lockout after 5 retries matches standard security policy rules (Reference QA Lesson: K-04).",
      ]);
      setIsScanning(false);
    }, 1500);
  };

  const getCategoryIcon = (category: KnowledgeItem['category']) => {
    switch (category) {
      case 'Requirements':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Decisions':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Lessons Learned':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'QA Findings':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Database className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryColor = (category: KnowledgeItem['category']) => {
    switch (category) {
      case 'Requirements':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Decisions':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Lessons Learned':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'QA Findings':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Database className="w-6.5 h-6.5 text-blue-600" />
            Knowledge Vault
          </h1>
          <p className="text-slate-500 text-sm">Reusable knowledge from all <span className="font-bold text-slate-600">completed</span> projects across your business. Not limited to the current project.</p>
        </div>

        <div className="flex gap-2 self-end md:self-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vault Resource</span>
          </button>
        </div>
      </div>
      {remoteError && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          Backend knowledge service not available: using local vault data.
        </div>
      )}

      {/* Knowledge Vault Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Similar Projects</span>
          <span className="text-lg font-extrabold text-slate-900 mt-2">3 Matched</span>
          <span className="text-[9px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">✓ High Similarity</span>
        </div>
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lessons Learned</span>
          <span className="text-lg font-extrabold text-slate-900 mt-2">12 Logged</span>
          <span className="text-[9px] text-blue-600 font-semibold mt-1">From OBS & Portal</span>
        </div>
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reusable Requirements</span>
          <span className="text-lg font-extrabold text-slate-900 mt-2">8 Available</span>
          <span className="text-[9px] text-purple-600 font-semibold mt-1">Fully Validated</span>
        </div>
        <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Templates</span>
          <span className="text-lg font-extrabold text-slate-900 mt-2">4 Ready</span>
          <span className="text-[9px] text-slate-500 font-semibold mt-1">ISO & Agile Specs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Search & Filter side panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Analysis Scanning Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold tracking-wide text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4.5 h-4.5 text-blue-400" />
              Vault Compliance Analysis
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
              Run compliance checks on the current requirements specification against the historical Lessons Learned and Templates registry.
            </p>
            <button
              onClick={handleRunScanAnalysis}
              disabled={isScanning}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isScanning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Vault...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4.5 h-4.5" />
                  <span>Execute Compliance Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Compliance Scan results */}
          {scanResult && (
            <div className="border border-slate-200 bg-white p-5 rounded-2xl shadow-3xs space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Scan Results
              </h4>
              <div className="space-y-2">
                {scanResult.map((res, index) => (
                  <div
                    key={index}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-600 leading-relaxed font-semibold"
                  >
                    {res}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Documents panel */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-blue-600" />
              Generated Documents
            </h3>

            {docsLoading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 py-2">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                Loading documents...
              </div>
            )}

            {docsError && (
              <p className="text-[10px] text-rose-500 font-semibold">{docsError}</p>
            )}

            {!docsLoading && !docsError && generatedDocs.length === 0 && (
              <p className="text-[11px] text-slate-400 font-medium">
                No generated documents for this project yet.
              </p>
            )}

            {!docsLoading && !docsError && generatedDocs.length > 0 && (
              <div className="space-y-2">
                {generatedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-700 truncate">
                        SRS v{doc.version} - {doc.projectName}
                      </div>
                      <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
                        {doc.status} • {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => openDocument(doc.id)}
                      className="p-1.5 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all cursor-pointer shrink-0"
                      title="View document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter panel */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Categories</h3>
            
            <div className="flex flex-col gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-600 font-semibold'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="shrink-0">{CATEGORY_FILTER_ICONS[cat]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Team Recommendations Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-3 border-b border-slate-100 flex items-center gap-1.5 font-bold">
              <Users className="w-4.5 h-4.5 text-indigo-600 font-bold" />
              Team Recommendations
            </h3>
            
            <div className="space-y-4 text-[11px]">
              <div>
                <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">Historical Teams</span>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="font-bold text-slate-700">Team Alpha (Auth Suite)</div>
                  <div className="text-slate-500 font-medium leading-relaxed">Sarah Johnson (BA) • John Doe (Dev) • Emily Davis (QA)</div>
                </div>
              </div>

              <div>
                <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">Best Performing Teams</span>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="font-bold text-slate-700">Core Engine Sync (98% Delivery)</div>
                  <div className="text-slate-500 font-medium leading-relaxed">Michael Brown (PM) • John Doe (Dev) • Emily Davis (QA)</div>
                </div>
              </div>

              <div>
                <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">AI Recommendation</span>
                <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5">
                  <div className="font-bold text-indigo-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    Optimal Allocation
                  </div>
                  <p className="text-slate-600 leading-normal font-medium">Matching skill-sets to project scope, we recommend:</p>
                  <div className="text-indigo-900 font-semibold">• Sarah J. (Elicitation Lead)</div>
                  <div className="text-indigo-900 font-semibold">• John D. (Development)</div>
                  <div className="text-indigo-900 font-semibold">• Emily D. (Lead QA Verification)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Search Input & Vault database lists */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="space-y-2.5">
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Search Index:</span>
              {(['Requirement', 'Domain', 'Technology'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    searchMode === mode
                      ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  By {mode}
                </button>
              ))}
            </div>
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  searchMode === 'Domain'
                    ? "Search by project domain (e.g., Banking, FinTech, E-Commerce)..."
                    : searchMode === 'Technology'
                    ? "Search by stacks (e.g., Next.js, SMS OTP, REST API, SSL)..."
                    : "Search specifications database by requirement query..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-3xs"
              />
            </div>
          </div>

          {/* List items */}
          <div className="space-y-3">
            {filteredVault.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{item.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{item.project}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.title}</h4>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-semibold">{item.date}</span>
                  {(item as any).referenceType === 'SRS' && (item as any).referenceId && (
                    <button
                      onClick={() => openDocument((item as any).referenceId)}
                      className="p-2 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all cursor-pointer"
                      title="View generated document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <div className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                    {getCategoryIcon(item.category)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Add Vault Resource</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddKnowledge} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Resource Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SSL Cipher Suites Policy rules"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Lessons Learned">Lessons Learned</option>
                  <option value="Requirements">Requirements Template</option>
                  <option value="Decisions">Architectural Decision</option>
                  <option value="QA Findings">QA Finding</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Source / Project Name</label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="e.g. General, OBS-2026"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
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
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-wide truncate">
                  {viewDoc.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Version {viewDoc.version} • {viewDoc.status} • {new Date(viewDoc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setViewDoc(null)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewDocLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-600 py-10 justify-center">
                <RotateCw className="w-4 h-4 animate-spin" /> Loading document...
              </div>
            )}

            {viewDocError && (
              <div className="p-6 text-sm text-rose-600">{viewDocError}</div>
            )}

            {!viewDocLoading && !viewDocError && (
              <div className="p-6 overflow-y-auto flex-grow scrollbar-thin">
                <SrsDocumentView document={viewDoc} projectCode={`PRJ-${viewDoc.projectId}`} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
