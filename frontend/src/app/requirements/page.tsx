'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Requirement } from '@/store/projectStore';
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Eye, 
  Sparkles, 
  Check, 
  X, 
  ChevronRight, 
  Calendar, 
  ShieldAlert, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

// Form validation schema
const reqSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  type: z.enum(['Functional', 'Non-Functional', 'Technical']),
  priority: z.enum(['High', 'Medium', 'Low']),
  owner: z.string().min(2, { message: 'Owner name must be specified' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  acceptanceCriteria: z.string().optional(),
});

type ReqFormValues = z.infer<typeof reqSchema>;

export default function Requirements() {
  const [mounted, setMounted] = useState(false);
  const requirements = useProjectStore((state) => state.requirements);
  const addRequirement = useProjectStore((state) => state.addRequirement);
  const deleteRequirement = useProjectStore((state) => state.deleteRequirement);
  
  // Selection & Details panel state
  const [selectedReqId, setSelectedReqId] = useState<string | null>('REQ-128');
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'acceptance' | 'history'>('details');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReqFormValues>({
    resolver: zodResolver(reqSchema),
    defaultValues: {
      title: '',
      type: 'Functional',
      priority: 'Medium',
      owner: 'Sarah Johnson',
      description: '',
      acceptanceCriteria: '',
    }
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Selected requirement details
  const selectedReq = requirements.find(r => r.id === selectedReqId) || requirements[0];

  // Apply filters
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;
    const matchesType = typeFilter === 'All' || req.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const onSubmit = (data: ReqFormValues) => {
    // Parse criteria from lines
    const parsedCriteria = data.acceptanceCriteria 
      ? data.acceptanceCriteria.split('\n').filter(line => line.trim() !== '')
      : ['Criteria validation pending'];

    addRequirement({
      title: data.title,
      type: data.type,
      priority: data.priority,
      owner: data.owner,
      description: data.description,
      acceptanceCriteria: parsedCriteria,
      status: 'Draft',
    });
    
    reset();
    setIsModalOpen(false);
  };

  const getStatusColor = (status: Requirement['status']) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Review': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: Requirement['priority']) => {
    switch (priority) {
      case 'High': return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full max-w-7xl mx-auto items-stretch">
      {/* List Column */}
      <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          {/* Header section */}
          <div className="flex justify-between items-center pb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Requirements</h1>
              <p className="text-xs text-slate-500">Manage and track software requirements</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Requirement</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pb-6 border-b border-slate-100">
            {/* Search */}
            <div className="relative md:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.8 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            
            {/* Status */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="In Review">In Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="All">All Types</option>
                <option value="Functional">Functional</option>
                <option value="Non-Functional">Non-Functional</option>
                <option value="Technical">Technical</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {filteredRequirements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No matching requirements found
                    </td>
                  </tr>
                ) : (
                  filteredRequirements.map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => setSelectedReqId(req.id)}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer border-l-2 ${
                        selectedReqId === req.id ? 'bg-blue-50/40 border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <td className="py-3.5 px-3 font-bold text-slate-900">{req.id}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-800">{req.title}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getPriorityColor(req.priority)}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{req.type}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-600">{req.owner}</td>
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedReqId(req.id)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteRequirement(req.id)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer pagination */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-400 mt-6">
          <span>Showing 1 to {filteredRequirements.length} of {requirements.length} entries</span>
          <div className="flex gap-1.5">
            <button className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border border-blue-500 rounded-lg bg-blue-600 text-white font-semibold">1</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      {selectedReq && (
        <div className="w-full lg:w-96 shrink-0 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-6">
            {/* Header detail */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">{selectedReq.id}</span>
                  <span className={`px-2 py-0.2 rounded-full text-[9px] border ${getStatusColor(selectedReq.status)}`}>
                    {selectedReq.status}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1.5">{selectedReq.title}</h2>
              </div>
            </div>

            {/* AI Completeness Indicator */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">AI Completeness</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 leading-normal">
                    This requirement is well-defined.
                  </span>
                  <Link 
                    href="/ai-analysis" 
                    className="text-[10px] font-bold text-blue-600 hover:underline mt-2 flex items-center gap-0.5"
                  >
                    View detailed analysis
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                
                {/* Visual completion ring */}
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="5.5" fill="transparent" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="26" 
                      stroke="#10b981" 
                      strokeWidth="5.5" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - selectedReq.completeness / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-slate-800 text-xs">
                    {selectedReq.completeness}%
                  </div>
                </div>
              </div>
            </div>

            {/* Specification Panel Tabs */}
            <div>
              <div className="flex border-b border-slate-100 gap-3 text-xs font-semibold">
                <button 
                  onClick={() => setActiveDetailTab('details')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeDetailTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Details
                </button>
                <button 
                  onClick={() => setActiveDetailTab('acceptance')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeDetailTab === 'acceptance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Acceptance Criteria
                </button>
                <button 
                  onClick={() => setActiveDetailTab('history')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeDetailTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Overview
                </button>
              </div>

              {/* Tab Contents */}
              <div className="pt-4 text-xs leading-relaxed text-slate-600">
                {activeDetailTab === 'details' && (
                  <div className="space-y-4">
                    <p className="text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100/60 font-normal">
                      {selectedReq.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400 block font-medium">Type</span>
                        <span className="font-semibold text-slate-700">{selectedReq.type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Priority</span>
                        <span className="font-semibold text-slate-700">{selectedReq.priority}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Owner</span>
                        <span className="font-semibold text-slate-700">{selectedReq.owner}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Version</span>
                        <span className="font-semibold text-slate-700">v{selectedReq.version}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'acceptance' && (
                  <ul className="space-y-2.5">
                    {selectedReq.acceptanceCriteria.map((criteria, index) => (
                      <li key={index} className="flex gap-2 items-start text-[11px]">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeDetailTab === 'history' && (
                  <div className="space-y-3.5">
                    <div className="flex gap-3 text-[11px]">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-slate-400">Created On</span>
                        <span className="font-semibold text-slate-700">{selectedReq.createdAt}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 text-[11px]">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-slate-400">Last Modified</span>
                        <span className="font-semibold text-slate-700">{selectedReq.updatedAt}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-[11px]">
                      <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-slate-400">Linked Modules Impact</span>
                        <span className="font-semibold text-slate-700">{selectedReq.affectedReqs} affected files</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
            <Link 
              href="/ai-analysis" 
              className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 w-full border border-indigo-200/50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Verify Impact & Completeness</span>
            </Link>
          </div>
        </div>
      )}

      {/* Creation Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Create Software Requirement</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Requirement Title</label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="e.g. Password Expiry Limit"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {errors.title && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.title.message}</span>}
                </div>

                {/* Type */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                  <select
                    {...register('type')}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Non-Functional">Non-Functional</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Owner */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Specification Owner</label>
                  <input
                    type="text"
                    {...register('owner')}
                    placeholder="e.g. Sarah Johnson"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {errors.owner && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.owner.message}</span>}
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Functional Description</label>
                  <textarea
                    rows={3}
                    {...register('description')}
                    placeholder="Describe how this feature should work..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {errors.description && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.description.message}</span>}
                </div>

                {/* Acceptance Criteria */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Acceptance Criteria (one per line)</label>
                  <textarea
                    rows={3}
                    {...register('acceptanceCriteria')}
                    placeholder="User shall be able to...&#10;System shall log...&#10;Validation triggers..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Submit Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
