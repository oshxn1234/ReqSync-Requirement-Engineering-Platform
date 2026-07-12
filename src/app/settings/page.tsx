'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Building, Folder, Users, UserPlus, Trash2, Save, Plus, Check, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const settings = useProjectStore((state) => state.settings);
  const updateSettings = useProjectStore((state) => state.updateSettings);
  const currentUser = useProjectStore((state) => state.currentUser);
  const isCeo = currentUser?.role === 'CEO';

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyRegNumber, setCompanyRegNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');

  // Team member state
  const [teamMembers, setTeamMembers] = useState<typeof settings.teamMembers>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberSkills, setNewMemberSkills] = useState('');

  const [activeTab, setActiveTab] = useState<'company' | 'project' | 'team'>('company');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (settings) {
      setCompanyName(settings.companyName || '');
      setCompanyRegNumber(settings.companyRegNumber || '');
      setCompanyAddress(settings.companyAddress || '');

      setProjectName(settings.projectName || '');
      setProjectCode(settings.projectCode || '');
      setDescription(settings.description || '');
      setStartDate(settings.startDate || '');
      setEndDate(settings.endDate || '');
      setStatus(settings.status || '');
      setTeamMembers(settings.teamMembers || []);
    }
  }, [settings]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      companyRegNumber,
      companyAddress,
      projectName,
      projectCode,
      description,
      startDate,
      endDate,
      status,
      teamMembers,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberRole || !newMemberEmail) return;

    const newMember = {
      name: newMemberName,
      role: newMemberRole,
      email: newMemberEmail,
      skills: newMemberSkills || 'No skills listed'
    };

    const updatedMembers = [...teamMembers, newMember];
    setTeamMembers(updatedMembers);
    updateSettings({ teamMembers: updatedMembers });

    // Reset fields
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberEmail('');
    setNewMemberSkills('');
  };

  const handleRemoveMember = (email: string) => {
    const updatedMembers = teamMembers.filter(m => m.email !== email);
    setTeamMembers(updatedMembers);
    updateSettings({ teamMembers: updatedMembers });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Settings</h1>
          <p className="text-slate-500 text-sm">Configure company registration, project properties, and manage team members.</p>
        </div>
        
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Company Registration</span>
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'project'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Project Creation & Details</span>
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'team'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members</span>
        </button>
      </div>

      {/* Forms content card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {activeTab === 'company' && (
          <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Company Information</h2>
                {currentUser?.role !== 'CEO' && (
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Read-Only (CEO Authorization Required)
                  </span>
                )}
              </div>
              
              {!isCeo && (
                <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Authorized Access Only</p>
                    <p className="text-[11px] text-amber-700/90 mt-0.5">Only users registered under the CEO role are permitted to edit corporate business registration parameters.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company Registered Name</label>
                  <input
                    type="text"
                    value={companyName}
                    disabled={!isCeo}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corporation Ltd"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Registration / Tax ID</label>
                  <input
                    type="text"
                    value={companyRegNumber}
                    disabled={!isCeo}
                    onChange={(e) => setCompanyRegNumber(e.target.value)}
                    placeholder="e.g. REG-12345678"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Registered Address</label>
                  <input
                    type="text"
                    value={companyAddress}
                    disabled={!isCeo}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="e.g. 123 Main St, New York, NY"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>
            </div>
            
            {isCeo && (
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Company Details</span>
                </button>
              </div>
            )}
          </form>
        )}

        {activeTab === 'project' && (
          <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Project Creation & Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Core Banking Upgrade"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Project Code</label>
                  <input
                    type="text"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    placeholder="e.g. CBU-2026"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed project description..."
                    rows={4}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Project Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Project Details</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'team' && (
          <div className="p-6 space-y-6">
            {/* Add Team Member form */}
            <form onSubmit={handleAddMember} className="space-y-4 bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Add Team Member
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Alice Cooper"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Role</label>
                  <input
                    type="text"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder="e.g. Senior QA Engineer"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="e.g. alice.c@company.com"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Skills (Comma-separated for AI suitability matchmaking)</label>
                  <input
                    type="text"
                    value={newMemberSkills}
                    onChange={(e) => setNewMemberSkills(e.target.value)}
                    placeholder="e.g. Cypress, Jest, CI/CD, Penetration Testing"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>
            </form>

            {/* Members List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Team Members ({teamMembers.length})</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {teamMembers.map((member) => (
                  <div key={member.email} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-blue-200 transition-colors gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-blue-700 text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{member.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{member.role}</span>
                        </div>
                        <p className="text-xs text-slate-400">{member.email}</p>
                        {member.skills && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {member.skills.split(',').map((skill) => (
                              <span key={skill} className="text-[9px] bg-blue-50/50 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(member.email)}
                      className="p-2 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl transition-all self-end md:self-center"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
