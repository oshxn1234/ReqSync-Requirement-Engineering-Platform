'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useRouter } from 'next/navigation';
import { Building, Folder, Users, UserPlus, Trash2, Save, Plus, Check, ShieldAlert, Sparkles, AlertTriangle, ArrowRight, CheckCircle2, BrainCircuit, User, Lock, BellRing, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const settings = useProjectStore((state) => state.settings);
  const updateSettings = useProjectStore((state) => state.updateSettings);
  const currentUser = useProjectStore((state) => state.currentUser);
  const updateProfile = useProjectStore((state) => state.updateProfile);
  const logout = useProjectStore((state) => state.logout);
  const router = useRouter();
  
  const isCeo = currentUser?.role === 'CEO';
  const isPm = currentUser?.role === 'Project Manager';

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

  // Profile states
  const [profileName, setProfileName] = useState('');
  const [profileSkills, setProfileSkills] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Notification Preferences
  const [notifEmailAlerts, setNotifEmailAlerts] = useState(true);
  const [notifNewProject, setNotifNewProject] = useState(true);
  const [notifTaskAssigned, setNotifTaskAssigned] = useState(true);
  const [notifReqUpdated, setNotifReqUpdated] = useState(true);
  const [notifQaFeedback, setNotifQaFeedback] = useState(true);

  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'project' | 'team'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New States for AI Suitability Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [suitabilityScore, setSuitabilityScore] = useState(0);
  const [recommendationAccepted, setRecommendationAccepted] = useState(false);
  const [recommendedReplacement, setRecommendedReplacement] = useState<{name: string, role: string, email: string, skills: string} | null>(null);

  const handleAnalyzeSuitability = () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setTimeout(() => {
      setSuitabilityScore(89);
      setRecommendedReplacement({
        name: "Emily Davis",
        role: "QA Engineer",
        email: "emily.d@company.com",
        skills: "Unit Testing, E2E Testing, Automation, Security Auditing"
      });
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const acceptRecommendation = () => {
    if (recommendedReplacement) {
      const updatedMembers = [...teamMembers, recommendedReplacement];
      setTeamMembers(updatedMembers);
      updateSettings({ teamMembers: updatedMembers });
      setRecommendationAccepted(true);
      setSuitabilityScore(96);
    }
  };

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
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileSkills(currentUser.skills || '');
    }
  }, [settings, currentUser]);

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

  const handleSaveProfileInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    updateProfile(currentUser.id, profileName, profileSkills);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleSavePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setPassError('');
    setPassSuccess(false);

    if (currentUser.password && currentPassword !== currentUser.password) {
      setPassError('Current password verification failed.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters.');
      return;
    }

    updateProfile(currentUser.id, currentUser.name, currentUser.skills || '', newPassword);
    setPassSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassSuccess(false), 3000);
  };

  const handleSaveNotifPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTriggerLogout = () => {
    logout();
    router.replace('/login');
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
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs gap-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile & Settings</span>
        </button>
        {isCeo && (
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
        )}
        {(isCeo || isPm) && (
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
        )}
        {(isCeo || isPm) && (
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
        )}
      </div>

      {/* Forms content card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {activeTab === 'profile' && currentUser && (
          <div className="p-6 space-y-8 divide-y divide-slate-100">
            {/* View/Edit Profile */}
            <form onSubmit={handleSaveProfileInfo} className="space-y-4">
              <div className="flex justify-between items-center pb-2">
                <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                {profileSuccess && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4.5 h-4.5" /> Profile updated successfully!
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 bg-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Work Email</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-400 bg-slate-50 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">System Access Role</label>
                  <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-500" />
                    {currentUser.role}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Professional Skills</label>
                  <input
                    type="text"
                    value={profileSkills}
                    onChange={(e) => setProfileSkills(e.target.value)}
                    placeholder="e.g. Next.js, agile, requirements design"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Profile Info
                </button>
              </div>
            </form>

            {/* Change Password */}
            <form onSubmit={handleSavePasswordChange} className="pt-6 space-y-4">
              <div className="flex justify-between items-center pb-2">
                <h2 className="text-base font-bold text-slate-900">Change System Password</h2>
                {passSuccess && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4.5 h-4.5" /> Password changed successfully!
                  </span>
                )}
                {passError && (
                  <span className="text-xs text-rose-600 font-bold">
                    ⚠️ {passError}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>

            {/* Notification Preferences */}
            <form onSubmit={handleSaveNotifPrefs} className="pt-6 space-y-4">
              <div className="pb-2">
                <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Toggle notification types you would like to receive in your dashboard feed and via email alerts.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={notifEmailAlerts}
                    onChange={(e) => setNotifEmailAlerts(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Email Alerts</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Forward all priority alerts directly to your registered email address</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={notifNewProject}
                    onChange={(e) => setNotifNewProject(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">New Project Alerts</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Receive notifications when a new enterprise workspace is initialized</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={notifTaskAssigned}
                    onChange={(e) => setNotifTaskAssigned(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Task Assignments</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Receive alerts as soon as a story task is assigned or reassigned to you</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={notifReqUpdated}
                    onChange={(e) => setNotifReqUpdated(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Requirement Updates</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Get notifications when specification parameters, user stories, or scope change</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={notifQaFeedback}
                    onChange={(e) => setNotifQaFeedback(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">QA Feedback & Audits</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Receive notifications when tasks fail QA audits or change baseline status</span>
                  </div>
                </label>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Notification Preferences
                </button>
              </div>
            </form>

            {/* Logout Panel */}
            <div className="pt-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Revoke Session & Exit</h2>
                <p className="text-xs text-slate-500 mt-0.5">Securely clear your active project session parameters and logout from the system environment.</p>
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={handleTriggerLogout}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout from Session</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
            {/* NEW SECTION: Selected Team Members Summary */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide">Selected Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamMembers.map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-blue-700 text-xs uppercase">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{member.name}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">{member.role}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <p className="text-xs text-slate-500 italic md:col-span-2">No team members selected. Please add them in the Team Members tab first.</p>
                )}
              </div>
            </div>

            {/* NEW SECTION: Knowledge Vault Team Suitability Analysis */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Knowledge Vault Team Suitability Analysis
              </h3>
              
              {!analysisComplete && !isAnalyzing && (
                <button
                  type="button"
                  onClick={handleAnalyzeSuitability}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>Analyze Team Suitability</span>
                </button>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 border border-slate-200 rounded-2xl bg-slate-50">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-500 animate-pulse">Running AI match algorithms against Knowledge Vault...</p>
                </div>
              )}

              {analysisComplete && (
                <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-3xs space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke={suitabilityScore >= 90 ? '#10b981' : '#3b82f6'} 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - suitabilityScore / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-800">{suitabilityScore}%</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Match</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Historical Project Matches</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          <span className="block font-semibold text-slate-700">Banking App 2025</span>
                          <span className="text-[10px] text-emerald-600 font-bold">92% similarity</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                          <span className="block font-semibold text-slate-700">Core Finance Module</span>
                          <span className="text-[10px] text-emerald-600 font-bold">85% similarity</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Team Member Evaluation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamMembers.map(m => (
                        <div key={m.email} className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-slate-800">{m.name}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                              {m.role === 'CEO' || m.role.includes('Manager') ? '92%' : '85%'} Match
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Experience: {m.role === 'CEO' ? 'Extensive executive experience.' : 'Past projects match current technical requirements.'}<br/>
                            Strengths: {m.skills?.split(',')[0] || 'Domain Expertise'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!recommendationAccepted && recommendedReplacement && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-full shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-amber-900">Missing Key Expertise</p>
                        <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">
                          The current team lacks a dedicated QA role with testing automation experience, which was critical in similar past projects. We recommend adding <strong>{recommendedReplacement.name}</strong> ({recommendedReplacement.role}) to boost your score to 96%.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={acceptRecommendation}
                        className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
                      >
                        Accept Recommendation
                      </button>
                    </div>
                  )}
                  {recommendationAccepted && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-[11px] font-medium text-emerald-800">
                        Recommendation applied. QA expertise fulfilled by Emily Davis. Team Suitability Score optimized.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={!analysisComplete}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Create Project</span>
                {analysisComplete && <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] ml-1">Score: {suitabilityScore}%</span>}
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
