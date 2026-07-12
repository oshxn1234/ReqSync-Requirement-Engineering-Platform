'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore, AppUser } from '@/store/projectStore';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  UserCog, 
  ShieldAlert, 
  Check, 
  Mail, 
  Key, 
  Plus, 
  ArrowLeft,
  X
} from 'lucide-react';

export default function UserManagement() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const currentUser = useProjectStore((state) => state.currentUser);
  const users = useProjectStore((state) => state.users);
  const createUserAccount = useProjectStore((state) => state.createUserAccount);
  const updateUserRole = useProjectStore((state) => state.updateUserRole);
  const deleteUserAccount = useProjectStore((state) => state.deleteUserAccount);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AppUser['role']>('Developer');
  const [skills, setSkills] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Role Access Protection
  const isAuthorized = currentUser?.role === 'Project Manager' || currentUser?.role === 'CEO';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-6">
        <div className="p-4 bg-rose-50 rounded-full text-rose-600">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Denied</h2>
          <p className="text-slate-500 text-sm">
            Only Project Managers and the CEO have permission to manage team accounts and assign system roles.
          </p>
        </div>
        <button
          onClick={() => router.replace('/dashboard')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    const created = createUserAccount(name, email, password, role, skills);
    if (created) {
      setSuccess(`User account for ${name} successfully created!`);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('Developer');
      setSkills('');
      setShowAddForm(false);
      
      // Auto fade out alert
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError('A user account with this email address already exists.');
    }
  };

  const handleRoleChange = (userId: string, newRole: AppUser['role']) => {
    updateUserRole(userId, newRole);
    setSuccess('User role updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      setError('You cannot delete your own account while logged in.');
      return;
    }
    if (confirm('Are you sure you want to delete this user account? They will lose login access immediately.')) {
      deleteUserAccount(userId);
      setSuccess('User account deleted.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            <span>User Account Management</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Create new credentials, assign functional roles, and audit platform workspace access.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancel Add User' : 'Create New Account'}</span>
        </button>
      </div>

      {/* Notifications alerts */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold animate-fade-in">
          <Check className="w-4.5 h-4.5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 rounded-xl text-xs font-bold animate-fade-in">
          <ShieldAlert className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Add User Modal / Form overlay */}
      {showAddForm && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md animate-fade-in space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Create Account Credentials
          </h2>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice Cooper"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice@company.com"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Login Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Key className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AppUser['role'])}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Project Manager">Project Manager</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Developer">Developer</option>
                  <option value="QA Engineer">QA Engineer</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Professional Skills</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Docker, Business Analysis (comma-separated)"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save New User</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users grid list */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Workspace Users ({users.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => {
            const isMe = user.id === currentUser?.id;
            
            return (
              <div 
                key={user.id} 
                className={`flex flex-col justify-between p-5 bg-white border rounded-2xl shadow-xs transition-all duration-200 ${
                  isMe ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-blue-600 uppercase shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800 truncate">{user.name}</span>
                      {isMe && (
                        <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">
                          You
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    
                    <div className="pt-2">
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">System Role</label>
                      
                      {/* Only show selector if not self, or if PM/CEO needs to reassign */}
                      <select
                        value={user.role}
                        disabled={isMe && user.role === 'CEO'} // CEO cannot downgrade themselves
                        onChange={(e) => handleRoleChange(user.id, e.target.value as AppUser['role'])}
                        className="text-[10px] font-semibold bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg py-1 px-2.5 text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="CEO">CEO</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Business Analyst">Business Analyst</option>
                        <option value="Developer">Developer</option>
                        <option value="QA Engineer">QA Engineer</option>
                      </select>
                    </div>

                    {user.skills && (
                      <div className="pt-2">
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Skills</label>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {user.skills.split(',').map((skill, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-3 mt-4">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isMe}
                    className={`flex items-center gap-1 text-[10px] font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 transition-all ${
                      isMe 
                        ? 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed'
                        : 'text-slate-400 border-slate-200 hover:border-rose-200 hover:text-rose-600 cursor-pointer bg-white'
                    }`}
                    title={isMe ? 'Cannot delete logged in user' : 'Delete user'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
