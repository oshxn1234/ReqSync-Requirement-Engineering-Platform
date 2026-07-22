'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, UmlClass, UmlRelationship, UmlDiagramVersion } from '@/store/projectStore';
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  GitMerge, 
  FileText, 
  ArrowRight, 
  Download, 
  Eye, 
  RotateCw, 
  Network, 
  X, 
  RefreshCw, 
  Layers, 
  GitCompare, 
  Code, 
  Check,
  Code2,
  Calendar,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function UmlWorkspacePage() {
  const [mounted, setMounted] = useState(false);

  const requirements = useProjectStore((state) => state.requirements);
  const baselines = useProjectStore((state) => state.baselines);
  const umlDiagramVersions = useProjectStore((state) => state.umlDiagramVersions);
  const currentUmlDiagram = useProjectStore((state) => state.currentUmlDiagram);
  const currentUser = useProjectStore((state) => state.currentUser);

  // Store Actions
  const generateUmlFromRequirements = useProjectStore((state) => state.generateUmlFromRequirements);
  const addUmlClass = useProjectStore((state) => state.addUmlClass);
  const updateUmlClass = useProjectStore((state) => state.updateUmlClass);
  const deleteUmlClass = useProjectStore((state) => state.deleteUmlClass);
  const addUmlRelationship = useProjectStore((state) => state.addUmlRelationship);
  const deleteUmlRelationship = useProjectStore((state) => state.deleteUmlRelationship);
  const commitUmlToBaseline = useProjectStore((state) => state.commitUmlToBaseline);

  // Local state
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'canvas' | 'compare'>('canvas');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'mermaid' | 'plantuml'>('mermaid');
  const [copied, setCopied] = useState(false);

  // Commit Baseline Modal
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [selectedBaseline, setSelectedBaseline] = useState('');
  const [commitDesc, setCommitDesc] = useState('');

  // Edit Class Modal
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<UmlClass | null>(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [classAttrInput, setClassAttrInput] = useState('');
  const [classMethodInput, setClassMethodInput] = useState('');

  // Add Class Modal
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  // Add Relationship Modal
  const [showAddRelModal, setShowAddRelModal] = useState(false);
  const [relSource, setRelSource] = useState('');
  const [relTarget, setRelTarget] = useState('');
  const [relType, setRelType] = useState<UmlRelationship['type']>('Association');

  // Comparison State
  const [compareWithVersion, setCompareWithVersion] = useState<string>('v1.0');

  useEffect(() => {
    setMounted(true);
    // Auto-select first baseline if exists
    if (baselines.length > 0) {
      setSelectedBaseline(baselines[0].version);
    }
  }, [baselines]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Trigger AI generation
  const handleAiGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateUmlFromRequirements();
      setIsGenerating(false);
    }, 1500);
  };

  // Export Code Formatting
  const getMermaidCode = () => {
    let code = "classDiagram\n";
    currentUmlDiagram.classes.forEach(c => {
      code += `  class ${c.name} {\n`;
      c.attributes.forEach(attr => {
        code += `    +${attr}\n`;
      });
      c.methods.forEach(method => {
        code += `    +${method}\n`;
      });
      code += `  }\n`;
    });
    currentUmlDiagram.relationships.forEach(r => {
      const src = currentUmlDiagram.classes.find(c => c.id === r.sourceClassId)?.name || 'Unknown';
      const tgt = currentUmlDiagram.classes.find(c => c.id === r.targetClassId)?.name || 'Unknown';
      let relSymbol = "-->";
      if (r.type === 'Inheritance') relSymbol = "--|>";
      if (r.type === 'Composition') relSymbol = "*--";
      if (r.type === 'Aggregation') relSymbol = "o--";
      if (r.type === 'Dependency') relSymbol = "..>";
      code += `  ${src} ${relSymbol} ${tgt} : ${r.type}\n`;
    });
    return code;
  };

  const getPlantUmlCode = () => {
    let code = "@startuml\n\n";
    currentUmlDiagram.classes.forEach(c => {
      code += `class ${c.name} {\n`;
      c.attributes.forEach(attr => {
        code += `  +${attr}\n`;
      });
      c.methods.forEach(method => {
        code += `  +${method}\n`;
      });
      code += `}\n\n`;
    });
    currentUmlDiagram.relationships.forEach(r => {
      const src = currentUmlDiagram.classes.find(c => c.id === r.sourceClassId)?.name || 'Unknown';
      const tgt = currentUmlDiagram.classes.find(c => c.id === r.targetClassId)?.name || 'Unknown';
      let relSymbol = "-->";
      if (r.type === 'Inheritance') relSymbol = "--|>";
      if (r.type === 'Composition') relSymbol = "*--";
      if (r.type === 'Aggregation') relSymbol = "o--";
      if (r.type === 'Dependency') relSymbol = "..>";
      code += `${src} ${relSymbol} ${tgt} : ${r.type}\n`;
    });
    code += "\n@enduml";
    return code;
  };

  const copyToClipboard = () => {
    const text = exportFormat === 'mermaid' ? getMermaidCode() : getPlantUmlCode();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add Custom Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addUmlClass(newClassName.trim());
    setNewClassName('');
    setShowAddClassModal(false);
  };

  // Edit Class Modal open
  const openEditClassModal = (c: UmlClass) => {
    setEditingClass(c);
    setClassNameInput(c.name);
    setClassAttrInput(c.attributes.join('\n'));
    setClassMethodInput(c.methods.join('\n'));
    setShowEditClassModal(true);
  };

  // Save Class Edit
  const handleSaveClassEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const attributes = classAttrInput.split('\n').map(a => a.trim()).filter(Boolean);
    const methods = classMethodInput.split('\n').map(m => m.trim()).filter(Boolean);

    updateUmlClass(editingClass.id, {
      name: classNameInput.trim(),
      attributes,
      methods
    });

    setShowEditClassModal(false);
    setEditingClass(null);
  };

  // Add Relationship
  const handleCreateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relSource || !relTarget || relSource === relTarget) return;
    addUmlRelationship(relSource, relTarget, relType);
    setShowAddRelModal(false);
    setRelSource('');
    setRelTarget('');
  };

  // Save baseline snapshot link
  const handleCommitBaseline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBaseline || !commitDesc.trim()) return;
    commitUmlToBaseline(selectedBaseline, commitDesc);
    setShowCommitModal(false);
    setCommitDesc('');
  };

  // Compare UML logic
  const selectedVersionData = umlDiagramVersions.find(v => v.baselineVersion === compareWithVersion) || umlDiagramVersions[0];

  const getUmlDiffs = () => {
    if (!selectedVersionData) return { added: [], removed: [], modified: [] };
    const currentClasses = currentUmlDiagram.classes;
    const oldClasses = selectedVersionData.classes;

    const added = currentClasses.filter(c => !oldClasses.some(o => o.name === c.name)).map(c => c.name);
    const removed = oldClasses.filter(o => !currentClasses.some(c => c.name === o.name)).map(o => o.name);
    const modified: string[] = [];

    currentClasses.forEach(c => {
      const match = oldClasses.find(o => o.name === c.name);
      if (match) {
        const attrDiff = c.attributes.some(a => !match.attributes.includes(a)) || match.attributes.some(a => !c.attributes.includes(a));
        const methodDiff = c.methods.some(m => !match.methods.includes(m)) || match.methods.some(m => !c.methods.includes(m));
        if (attrDiff || methodDiff) {
          modified.push(c.name);
        }
      }
    });

    return { added, removed, modified };
  };

  const diffs = getUmlDiffs();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold uppercase animate-pulse">AI Engineering Studio</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">
            <Network className="w-6.5 h-6.5 text-blue-600 animate-pulse" />
            AI-Assisted UML Design Workspace
          </h1>
          <p className="text-slate-500 text-sm">Automatically generate class structures from requirements and refine designs collaboratively.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Engineering...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate from Specs</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-slate-500" />
            <span>Export Code</span>
          </button>

          <button
            onClick={() => setShowCommitModal(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4.5 h-4.5 text-teal-400" />
            <span>Commit Snapshot</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveWorkspaceTab('canvas')}
          className={`px-5 py-3 border-b-2 text-xs font-bold transition-all flex items-center gap-2 ${
            activeWorkspaceTab === 'canvas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interactive Diagram Arena</span>
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('compare')}
          className={`px-5 py-3 border-b-2 text-xs font-bold transition-all flex items-center gap-2 ${
            activeWorkspaceTab === 'compare'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Version Comparison Diff</span>
        </button>
      </div>

      {activeWorkspaceTab === 'canvas' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* Main Visual UML Canvas */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-3xl p-6 relative min-h-[550px] shadow-inner flex flex-col justify-between overflow-hidden">
            {/* Grid background layer */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

            <div className="relative z-10 flex justify-between items-center pb-4 border-b border-slate-900">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Design Canvas
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Class
                </button>
                <button
                  onClick={() => setShowAddRelModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Relationship
                </button>
              </div>
            </div>

            {/* Visual Class Card Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 py-8 flex-grow">
              {currentUmlDiagram.classes.length === 0 ? (
                <div className="col-span-3 flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-3">
                  <Network className="w-12 h-12 text-slate-700" />
                  <p className="text-xs">No classes in current design. Click generate to construct classes from specs.</p>
                </div>
              ) : (
                currentUmlDiagram.classes.map((cls) => (
                  <div 
                    key={cls.id} 
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl hover:border-blue-500/50 transition-all group"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
                      <span className="font-extrabold text-xs text-white tracking-wide uppercase">{cls.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditClassModal(cls)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                          title="Edit Class attributes & methods"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteUmlClass(cls.id)}
                          className="p-1 hover:bg-slate-800 text-rose-400 rounded transition-colors cursor-pointer"
                          title="Delete class"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {/* Attributes */}
                    <div className="p-3 border-b border-slate-800/50 space-y-1">
                      <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Attributes</div>
                      {cls.attributes.length === 0 ? (
                        <div className="text-[10px] text-slate-600 italic">No attributes</div>
                      ) : (
                        cls.attributes.map((attr, idx) => (
                          <div key={idx} className="text-[10px] text-slate-300 font-mono font-medium truncate">{attr}</div>
                        ))
                      )}
                    </div>
                    {/* Methods */}
                    <div className="p-3 bg-slate-900/40 flex-grow space-y-1">
                      <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Methods</div>
                      {cls.methods.length === 0 ? (
                        <div className="text-[10px] text-slate-600 italic">No methods</div>
                      ) : (
                        cls.methods.map((m, idx) => (
                          <div key={idx} className="text-[10px] text-blue-400 font-mono font-medium truncate">{m}</div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom info banner */}
            <div className="relative z-10 border-t border-slate-900 pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-bold tracking-wide gap-3">
              <span>ACTIVE SCHEMA CONTAINS: {currentUmlDiagram.classes.length} CLASSES, {currentUmlDiagram.relationships.length} CONNECTIONS</span>
              <span className="flex items-center gap-1 text-slate-400"><InfoBoxIcon /> Click class actions edit icons to add attributes & methods instantly</span>
            </div>
          </div>

          {/* Relationship Sidebar Manager */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4 flex-grow">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-3 border-b border-slate-100">
                Relationship Matrix
              </h3>
              
              {currentUmlDiagram.relationships.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  No relationships established.
                </div>
              ) : (
                <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1.5 scrollbar-thin">
                  {currentUmlDiagram.relationships.map((rel) => {
                    const src = currentUmlDiagram.classes.find(c => c.id === rel.sourceClassId)?.name || 'Unknown';
                    const tgt = currentUmlDiagram.classes.find(c => c.id === rel.targetClassId)?.name || 'Unknown';
                    return (
                      <div key={rel.id} className="border border-slate-150 p-2.5 rounded-xl text-[11px] hover:border-slate-350 transition-colors flex items-center justify-between gap-3 bg-slate-50/50">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 font-semibold text-slate-800">
                            <span>{src}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{tgt}</span>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50/80 border border-blue-100 px-1.5 py-0.5 rounded w-fit mt-1">
                            {rel.type}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteUmlRelationship(rel.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer shrink-0"
                          title="Remove link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddRelModal(true)}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold transition-all shadow-xs cursor-pointer mt-4 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Relationship</span>
            </button>
          </div>
        </div>
      ) : (
        /* Version Comparison Diff Mode */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Baseline Difference Analyzer</h2>
              <p className="text-xs text-slate-400 mt-1">Select a stored requirement baseline version snapshot to compare with current active design.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Compare With:</span>
              <select
                value={compareWithVersion}
                onChange={(e) => setCompareWithVersion(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 px-3.5 py-2 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                {umlDiagramVersions.length === 0 ? (
                  <option value="">No snapshots found</option>
                ) : (
                  umlDiagramVersions.map((ver) => (
                    <option key={ver.baselineVersion} value={ver.baselineVersion}>
                      {ver.version} ({ver.baselineVersion})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {!selectedVersionData ? (
            <div className="text-center py-20 text-slate-400 italic text-xs">
              No historical UML diagram snapshots exist yet for baseline comparison. Commit a snapshot to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Added */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Added Classes ({diffs.added.length})</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">NEW</span>
                </div>
                <div className="mt-4 space-y-2">
                  {diffs.added.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No new classes added</p>
                  ) : (
                    diffs.added.map(name => (
                      <div key={name} className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white border border-emerald-100 px-3 py-2 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>{name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modified */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Modified Classes ({diffs.modified.length})</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold font-mono">EDIT</span>
                </div>
                <div className="mt-4 space-y-2">
                  {diffs.modified.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No modified classes</p>
                  ) : (
                    diffs.modified.map(name => (
                      <div key={name} className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white border border-amber-100 px-3 py-2 rounded-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                        <span>{name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Removed */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Removed Classes ({diffs.removed.length})</span>
                  <span className="text-[9px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">DEL</span>
                </div>
                <div className="mt-4 space-y-2">
                  {diffs.removed.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No classes removed</p>
                  ) : (
                    diffs.removed.map(name => (
                      <div key={name} className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white border border-rose-100 px-3 py-2 rounded-xl line-through">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span>{name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Code Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Export UML Class Diagram</h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex border border-slate-100 bg-slate-50/50 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setExportFormat('mermaid')}
                  className={`px-4 py-1.8 rounded-lg text-xs font-bold transition-all ${
                    exportFormat === 'mermaid'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Mermaid Layout
                </button>
                <button
                  onClick={() => setExportFormat('plantuml')}
                  className={`px-4 py-1.8 rounded-lg text-xs font-bold transition-all ${
                    exportFormat === 'plantuml'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  PlantUML Format
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-slate-200 font-mono text-xs p-5 rounded-2xl overflow-x-auto max-h-[300px] border border-slate-900 leading-relaxed scrollbar-thin">
                  {exportFormat === 'mermaid' ? getMermaidCode() : getPlantUmlCode()}
                </pre>
                
                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white px-3 py-1.8 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-slate-300" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="text-[10px] text-slate-400 leading-normal bg-slate-50 rounded-xl p-3 border border-slate-100">
                You can copy the code snippet above to paste directly into your code repository, documentation systems, or Mermaid Live editor.
              </div>
            </div>

            <div className="px-6 py-4.5 border-t border-slate-100 flex justify-end gap-3.5 bg-slate-50">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commit baseline snapshot Modal */}
      {showCommitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Commit UML to Baseline Snapshot</h3>
              <button 
                onClick={() => setShowCommitModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCommitBaseline}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Requirement Baseline</label>
                  <select
                    value={selectedBaseline}
                    onChange={(e) => setSelectedBaseline(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {baselines.map((b) => (
                      <option key={b.version} value={b.version}>
                        {b.version} - {b.description.substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Commit Description</label>
                  <textarea
                    rows={3}
                    value={commitDesc}
                    onChange={(e) => setCommitDesc(e.target.value)}
                    placeholder="Describe this diagram freeze (e.g. Core accounts and entities frozen in sync with baseline)"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="px-6 py-4.5 border-t border-slate-100 flex justify-end gap-3.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowCommitModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Commit Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditClassModal && editingClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Edit UML Class: {editingClass.name}</h3>
              <button 
                onClick={() => {
                  setShowEditClassModal(false);
                  setEditingClass(null);
                }}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveClassEdit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Class Name</label>
                  <input
                    type="text"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Attributes (One per line)</label>
                  <textarea
                    rows={4}
                    value={classAttrInput}
                    onChange={(e) => setClassAttrInput(e.target.value)}
                    placeholder="e.g. balance: number"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-850 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Methods (One per line)</label>
                  <textarea
                    rows={4}
                    value={classMethodInput}
                    onChange={(e) => setClassMethodInput(e.target.value)}
                    placeholder="e.g. deposit(amount: number): boolean"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-850 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="px-6 py-4.5 border-t border-slate-100 flex justify-end gap-3.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditClassModal(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Add Custom UML Class</h3>
              <button 
                onClick={() => setShowAddClassModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateClass}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Class Name</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. AuditLog"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="px-6 py-4.5 border-t border-slate-100 flex justify-end gap-3.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Relationship Modal */}
      {showAddRelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Connect UML Classes</h3>
              <button 
                onClick={() => setShowAddRelModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateRelationship}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Source Class</label>
                  <select
                    value={relSource}
                    onChange={(e) => setRelSource(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select Source Class</option>
                    {currentUmlDiagram.classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Class</label>
                  <select
                    value={relTarget}
                    onChange={(e) => setRelTarget(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                    required
                  >
                    <option value="">Select Target Class</option>
                    {currentUmlDiagram.classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Relationship Type</label>
                  <select
                    value={relType}
                    onChange={(e) => setRelType(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Association">Association</option>
                    <option value="Inheritance">Inheritance (Extends)</option>
                    <option value="Composition">Composition</option>
                    <option value="Aggregation">Aggregation</option>
                    <option value="Dependency">Dependency</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4.5 border-t border-slate-100 flex justify-end gap-3.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAddRelModal(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Establish Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBoxIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
