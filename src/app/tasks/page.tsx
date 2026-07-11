'use client';

import { useEffect, useState } from 'react';
import { useProjectStore, Task } from '@/store/projectStore';
import { Search, Plus, Trash2, Edit2, X, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(5, { message: 'Task description must be at least 5 characters' }),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  relatedStory: z.string().min(1, { message: 'Must link to a user story' }),
  assignee: z.string().min(2, { message: 'Assignee name is required' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function Tasks() {
  const [mounted, setMounted] = useState(false);
  const tasks = useProjectStore((state) => state.tasks);
  const userStories = useProjectStore((state) => state.userStories);
  const addTask = useProjectStore((state) => state.addTask);
  const updateTask = useProjectStore((state) => state.updateTask);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full">
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
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-3 font-bold text-slate-900">{task.id}</td>
                      <td className="py-4 px-3 font-medium text-slate-800">{task.title}</td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-semibold text-blue-600">
                        <Link href="/user-stories" className="hover:underline">
                          {task.relatedStory}
                        </Link>
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
