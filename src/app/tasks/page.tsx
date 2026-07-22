'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Task } from '@/store/projectStore';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Calendar,
  GitPullRequest,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Send,
  GitBranch,
  ShieldCheck,
  User,
  ArrowRight,
  Clipboard,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

// Form validation schema for creating a new task
const taskSchema = z.object({
  title: z.string().min(5, { message: 'Task description must be at least 5 characters' }),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: z.enum(['To Do', 'In Progress', 'Ready for QA', 'Done']),
  relatedStory: z.string().min(1, { message: 'Must link to a user story' }),
  assignee: z.string().min(2, { message: 'Assignee name is required' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function Tasks() {
  const [mounted, setMounted] = useState(false);
  const tasks = useProjectStore((state) => state.tasks);
  const userStories = useProjectStore((state) => state.userStories);
  const requirements = useProjectStore((state) => state.requirements);
  const currentUser = useProjectStore((state) => state.currentUser);
  const addTask = useProjectStore((state) => state.addTask);
  const updateTask = useProjectStore((state) => state.updateTask);
  const submitTaskImplementation = useProjectStore((state) => state.submitTaskImplementation);
  const submitTaskQaReview = useProjectStore((state) => state.submitTaskQaReview);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Forms for Developer & QA workflow
  const [githubLink, setGithubLink] = useState('');
  const [devNotes, setDevNotes] = useState('');
  const [qaComments, setQaComments] = useState('');
  
  // Simulation Helper: Lets the user simulate being a Developer or QA Engineer to test both workflows
  const [simulatedRole, setSimulatedRole] = useState<'Developer' | 'QA Engineer'>('Developer');

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      priority: 'Medium',
      status: 'To Do',
      relatedStory: '',
      assignee: 'John Doe',
      dueDate: new Date().toISOString().split('T')[0],
    }
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const onSubmit = (data: TaskFormValues) => {
    addTask({
      title: data.title,
      priority: data.priority,
      status: data.status,
      relatedStory: data.relatedStory,
      assignee: data.assignee,
      dueDate: data.dueDate,
    });
    reset();
    setIsModalOpen(false);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Done': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Ready for QA': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Find details for the selected task
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const linkedStory = selectedTask ? userStories.find(us => us.id === selectedTask.relatedStory) : null;
  const linkedReq = linkedStory ? requirements.find(r => r.id === linkedStory.relatedReq) : null;

  // Handles developer implementation submission
  const handleDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !githubLink.trim() || !devNotes.trim()) return;
    submitTaskImplementation(selectedTaskId, githubLink.trim(), devNotes.trim());
    setGithubLink('');
    setDevNotes('');
  };

  // Handles QA Engineer validation review
  const handleQaReview = (passed: boolean) => {
    if (!selectedTaskId || !qaComments.trim()) return;
    submitTaskQaReview(
      selectedTaskId,
      qaComments.trim(),
      passed,
      currentUser?.name || 'Emily Davis'
    );
    setQaComments('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full relative">
      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex justify-between items-center pb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Tasks</h1>
              <p className="text-xs text-slate-500">Development and testing tasks mapped to requirements flow</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-6 border-b border-slate-100">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.8 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.8 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready for QA">Ready for QA</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority Filter */}
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
          </div>

          {/* Table list */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Task Name</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Related Story</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No matching tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr 
                      key={task.id} 
                      onClick={() => setSelectedTaskId(task.id)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-3 font-bold text-slate-900">{task.id}</td>
                      <td className="py-4 px-3 font-medium text-slate-800 hover:text-blue-600 transition-colors">{task.title}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-semibold ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-semibold text-blue-600">
                        <span className="hover:underline">{task.relatedStory}</span>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-600">{task.assignee}</td>
                      <td className="py-4 px-3 text-slate-500 font-medium">{task.dueDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer pagination */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-400 mt-6">
          <span>Showing 1 to {filteredTasks.length} of {tasks.length} tasks</span>
          <div className="flex gap-1.5">
            <button className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border border-blue-500 rounded-lg bg-blue-600 text-white font-semibold">1</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedTaskId && selectedTask && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-end z-45"
          onClick={() => setSelectedTaskId(null)}
        >
          <div 
            className="bg-slate-50 w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedTask.id}</span>
                <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedTask.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedTaskId(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Scroll Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Task Meta details */}
              <div className="grid grid-cols-3 gap-4 bg-white border border-slate-150 p-4.5 rounded-2xl">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Assignee</span>
                  <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                      {selectedTask.assignee.charAt(0)}
                    </div>
                    <span>{selectedTask.assignee}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Due Date</span>
                  <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{selectedTask.dueDate}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Status</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] border font-bold ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Traceability Context */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1">
                  <GitBranch className="w-4.5 h-4.5 text-blue-600" />
                  E2E Traceability Tree
                </h3>

                <div className="bg-slate-900 text-slate-200 border border-slate-950 p-4.5 rounded-2xl space-y-3 font-sans">
                  {/* Vis chain */}
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-500">
                    <span className="text-blue-400">Requirement</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                    <span className="text-indigo-400">User Story</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                    <span className="text-teal-400 text-opacity-90">Task</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="text-blue-400">[{linkedReq?.id || 'REQ'}]</span>
                    <span>➔</span>
                    <span className="text-indigo-400">[{linkedStory?.id || 'US'}]</span>
                    <span>➔</span>
                    <span className="text-teal-400">[{selectedTask.id}]</span>
                  </div>

                  {linkedReq ? (
                    <div className="pt-2 border-t border-slate-800 space-y-2.5">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-500">Linked Requirement: {linkedReq.title}</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{linkedReq.description}</p>
                      </div>
                      
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-500">Validation Acceptance Criteria</div>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-[10px] text-slate-400">
                          {linkedReq.acceptanceCriteria.map((criteria, idx) => (
                            <li key={idx}>{criteria}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 italic pt-2 border-t border-slate-800">
                      No linked requirement trace found for this task.
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Role Switcher for prototype testing */}
              <div className="border border-slate-200 bg-white p-3 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Simulate role for workspace testing:</span>
                <div className="flex border border-slate-100 bg-slate-50 p-0.5 rounded-lg">
                  <button 
                    onClick={() => setSimulatedRole('Developer')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                      simulatedRole === 'Developer' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-500'
                    }`}
                  >
                    Developer
                  </button>
                  <button 
                    onClick={() => setSimulatedRole('QA Engineer')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                      simulatedRole === 'QA Engineer' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-500'
                    }`}
                  >
                    QA Tester
                  </button>
                </div>
              </div>

              {/* DEVELOPER WORKSPACE */}
              {simulatedRole === 'Developer' ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <GitPullRequest className="w-4.5 h-4.5 text-slate-700" />
                    Developer Submission Workspace
                  </h3>

                  {selectedTask.implementationDetails ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 text-xs leading-normal">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Submitted Implementation</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          QA PENDING
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-[9px] font-bold uppercase text-slate-400">GitHub Branch / PR Link</div>
                        <a 
                          href={selectedTask.implementationDetails.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-medium hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {selectedTask.implementationDetails.githubLink}
                        </a>
                      </div>

                      <div>
                        <div className="text-[9px] font-bold uppercase text-slate-400">Implementation Notes</div>
                        <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">{selectedTask.implementationDetails.notes}</p>
                      </div>

                      <div className="text-[9px] font-bold text-slate-400 text-right uppercase">
                        Submitted at {selectedTask.implementationDetails.submittedAt}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleDevSubmit} className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">GitHub PR or Repository Link</label>
                        <input
                          type="url"
                          required
                          value={githubLink}
                          onChange={(e) => setGithubLink(e.target.value)}
                          placeholder="e.g. https://github.com/company/repo/pull/45"
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Implementation Notes</label>
                        <textarea
                          rows={3}
                          required
                          value={devNotes}
                          onChange={(e) => setDevNotes(e.target.value)}
                          placeholder="Provide details about implemented methods, dependencies added, and self-checks conducted against criteria"
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit for QA Review</span>
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* QA ENGINEER WORKSPACE */
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                    QA Review & Verification Panel
                  </h3>

                  {!selectedTask.implementationDetails ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 italic">
                      QA reviewer module is locked. Awaiting developer implementation submission.
                    </div>
                  ) : selectedTask.qaReview ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 text-xs leading-normal">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verification History</span>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                          selectedTask.qaReview.status === 'Approved' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {selectedTask.qaReview.status}
                        </span>
                      </div>

                      <div>
                        <div className="text-[9px] font-bold uppercase text-slate-400">Review Comments & Feedback</div>
                        <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">{selectedTask.qaReview.comments}</p>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase pt-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          <span>Reviewed by {selectedTask.qaReview.reviewer}</span>
                        </div>
                        <div>
                          {selectedTask.qaReview.reviewedAt}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4">
                      {/* Show developer notes side-by-side for comparison */}
                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150 text-[11px] text-slate-600 space-y-1">
                        <div className="font-bold text-slate-700">Developer Notes:</div>
                        <p className="italic font-medium">&quot;{selectedTask.implementationDetails.notes}&quot;</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">QA Audit Comments</label>
                        <textarea
                          rows={3}
                          required
                          value={qaComments}
                          onChange={(e) => setQaComments(e.target.value)}
                          placeholder="Evaluate the code against the baseline criteria. Log testing results, coverage gaps, or bug logs."
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleQaReview(false)}
                          className="flex items-center justify-center gap-1.5 border border-rose-200 hover:border-rose-300 bg-rose-50/50 hover:bg-rose-50 text-rose-700 rounded-xl py-3 text-xs font-bold transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Fail & Request Changes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQaReview(true)}
                          className="flex items-center justify-center gap-1.5 border border-emerald-250 hover:border-emerald-350 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 rounded-xl py-3 text-xs font-bold transition-all shadow-md shadow-emerald-500/5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Complete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Create Task</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Task Description</label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="e.g. Set up JWT middleware validation"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {errors.title && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.title.message}</span>}
                </div>

                {/* Linked User Story */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Link to Agile User Story</label>
                  <select
                    {...register('relatedStory')}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">Select User Story</option>
                    {userStories.map((story) => (
                      <option key={story.id} value={story.id}>
                        {story.id} - {story.title.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                  {errors.relatedStory && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.relatedStory.message}</span>}
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                    <select
                      {...register('status')}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Ready for QA">Ready for QA</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>

                {/* Assignee & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assignee</label>
                    <input
                      type="text"
                      {...register('assignee')}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    {errors.assignee && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.assignee.message}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Due Date</label>
                    <input
                      type="date"
                      {...register('dueDate')}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    {errors.dueDate && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.dueDate.message}</span>}
                  </div>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
