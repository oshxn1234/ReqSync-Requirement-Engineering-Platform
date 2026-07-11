'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, KnowledgeItem } from '@/store/projectStore';
import { Database, Search, Plus, Filter, BookOpen, FileText, CheckCircle2, ShieldAlert, Cpu, RotateCw, X } from 'lucide-react';

export default function KnowledgeVaultPage() {
  const [mounted, setMounted] = useState(false);
  const knowledgeVault = useProjectStore((state) => state.knowledgeVault);
  const addKnowledge = useProjectStore((state) => state.addKnowledge);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Requirements' | 'Decisions' | 'Lessons Learned' | 'QA Findings' | 'Templates'>('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Requirements' | 'Decisions' | 'Lessons Learned' | 'QA Findings' | 'Templates'>('Lessons Learned');
  const [newProject, setNewProject] = useState('Online Banking System');

  // Vault Analysis scan states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string[] | null>(null);

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

  // Filter vault items
  const filteredVault = knowledgeVault.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.project.toLowerCase().includes(searchQuery.toLowerCase());
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
          <p className="text-slate-500 text-sm">Access architectural patterns, governance compliance checklists, standards, and lessons learned database.</p>
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

          {/* Category Filter panel */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Categories</h3>
            
            <div className="flex flex-col gap-1.5">
              {(['All', 'Requirements', 'Decisions', 'Lessons Learned', 'QA Findings', 'Templates'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    categoryFilter === cat
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-600 font-semibold'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Search Input & Vault database lists */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search specifications database by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-blue-500"
            />
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
    </div>
  );
}
