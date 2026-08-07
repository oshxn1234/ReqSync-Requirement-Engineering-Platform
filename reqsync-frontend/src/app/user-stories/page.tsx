'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, UserStory } from '@/store/projectStore';
import { Search, Plus, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

// Form validation schema
const storySchema = z.object({
  title: z.string().min(5, { message: 'Story description must be at least 5 characters' }),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  relatedReq: z.string().min(1, { message: 'Must link to a requirement' }),
  assignee: z.string().min(2, { message: 'Assignee name is required' }),
});

type StoryFormValues = z.infer<typeof storySchema>;

export default function UserStories() {
  const [mounted, setMounted] = useState(false);
  const userStories = useProjectStore((state) => state.userStories);
  const requirements = useProjectStore((state) => state.requirements);
  const addUserStory = useProjectStore((state) => state.addUserStory);
  const updateUserStory = useProjectStore((state) => state.updateUserStory);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      priority: 'Medium',
      status: 'To Do',
      relatedReq: '',
      assignee: 'John Doe',
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
  const filteredStories = userStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || story.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || story.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const onSubmit = (data: StoryFormValues) => {
    addUserStory({
      title: data.title,
      priority: data.priority,
      status: data.status,
      relatedReq: data.relatedReq,
      assignee: data.assignee,
    });
    reset();
    setIsModalOpen(false);
  };

  const getStatusColor = (status: UserStory['status']) => {
    switch (status) {
      case 'Done': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: UserStory['priority']) => {
    switch (priority) {
      case 'High': return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex justify-between items-center pb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">User Stories</h1>
              <p className="text-xs text-slate-500">Agile user stories linked to system requirements</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New User Story</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-6 border-b border-slate-100">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user stories..."
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

          {/* User Stories Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Title / User Story</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Linked REQ</th>
                  <th className="py-3 px-3">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {filteredStories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No matching user stories found
                    </td>
                  </tr>
                ) : (
                  filteredStories.map((story) => (
                    <tr key={story.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-3 font-bold text-slate-900">{story.id}</td>
                      <td className="py-4 px-3 font-medium text-slate-800 max-w-sm md:max-w-md">{story.title}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusColor(story.status)}`}>
                          {story.status}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getPriorityColor(story.priority)}`}>
                          {story.priority}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <Link
                          href="/requirements"
                          className="font-bold text-blue-600 hover:underline hover:text-blue-700"
                        >
                          {story.relatedReq}
                        </Link>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-600">{story.assignee}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer pagination */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-400 mt-6">
          <span>Showing 1 to {filteredStories.length} of {userStories.length} stories</span>
          <div className="flex gap-1.5">
            <button className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border border-blue-500 rounded-lg bg-blue-600 text-white font-semibold">1</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {/* Creation Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Create User Story</h3>
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">User Story Text</label>
                  <textarea
                    rows={2.5}
                    {...register('title')}
                    placeholder="e.g. As a customer, I want to view transaction fees before transfer, so that I can decide..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {errors.title && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.title.message}</span>}
                </div>

                {/* Linked Requirement */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Link to System Requirement</label>
                  <select
                    {...register('relatedReq')}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Requirement</option>
                    {requirements.map((req) => (
                      <option key={req.id} value={req.id}>
                        {req.id} - {req.title} ({req.status})
                      </option>
                    ))}
                  </select>
                  {errors.relatedReq && <span className="text-[10px] text-rose-500 mt-1 block font-semibold">{errors.relatedReq.message}</span>}
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
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>

                {/* Assignee */}
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
                  Create Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
