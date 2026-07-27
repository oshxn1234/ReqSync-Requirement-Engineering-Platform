'use client';

import { Bell, Search, Settings, HelpCircle, ChevronDown, CheckCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const settings = useProjectStore((state) => state.settings);
  const approvals = useProjectStore((state) => state.approvals);
  const toggleSidebar = useProjectStore((state) => state.toggleSidebar);
  const isSidebarOpen = useProjectStore((state) => state.isSidebarOpen);
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState<'system' | 'approvals'>('system');

  const mockNotifications = [
    { id: '1', title: 'Task Assigned', desc: 'Task "Configure MFA login hooks" has been assigned to John Doe.', type: 'Task Assigned', date: '10m ago' },
    { id: '2', title: 'Requirement Updated', desc: 'Requirement "REQ-128 session timeout check" was modified by Sarah Johnson.', type: 'Requirement Updated', date: '1h ago' },
    { id: '3', title: 'AI Generation Completed', desc: 'AI successfully extracted 2 new requirements from recent meeting notes.', type: 'AI Generation Completed', date: '3h ago' },
    { id: '4', title: 'Approval Request', desc: 'Baseline v1.0 snapshot requires validation approval.', type: 'Approval Request', date: '5h ago' },
    { id: '5', title: 'QA Feedback', desc: 'QA verification completed on "Login security checks". All audits passed.', type: 'QA Feedback', date: 'Yesterday' },
    { id: '6', title: 'New Project Created', desc: 'Project "Online Banking System" initialized by CEO.', type: 'New Project', date: '2 days ago' },
    { id: '7', title: 'Deadline Reminder', desc: 'Submit API baseline documentation due in 24 hours.', type: 'Deadline Reminder', date: 'Tomorrow' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-slate-800">Online Banking System</div>
        </div>
      </header>
    );
  }

  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-30 shadow-xs">
      {/* Project Selector */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
          aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5.5 h-5.5 transition-transform duration-200" />
          ) : (
            <PanelLeftOpen className="w-5.5 h-5.5 transition-transform duration-200" />
          )}
        </button>
        <div className="relative group">
          <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-slate-800 transition-colors">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Project: {settings.projectName}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
          
          {/* Mock Dropdown items */}
          <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 py-1.5 text-sm text-slate-700">
            <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Project</div>
            <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 font-medium flex items-center justify-between">
              <span>{settings.projectName}</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">{settings.projectCode}</span>
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-400 cursor-not-allowed">
              <span>E-Commerce Portal</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">ECO-2025</span>
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-400 cursor-not-allowed">
              <span>HR Management System</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">HR-2026</span>
            </button>
          </div>
        </div>
      </div>

      {/* Center/Right controls */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-64 max-md:hidden">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requirements, tasks..."
            className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {/* Notifications Notification bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all relative"
            >
              <Bell className="w-5.5 h-5.5" />
              {pendingApprovals.length > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-85 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 text-slate-800 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-widest">Notification Centre</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                
                {/* Notification Centre Tabs */}
                <div className="flex border-b border-slate-100 px-2 mt-2 bg-slate-50/50">
                  <button 
                    onClick={() => setActiveNotificationTab('system')}
                    className={`flex-1 text-center py-2 text-[10px] font-bold border-b-2 transition-all ${
                      activeNotificationTab === 'system' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Updates ({mockNotifications.length})
                  </button>
                  <button 
                    onClick={() => setActiveNotificationTab('approvals')}
                    className={`flex-1 text-center py-2 text-[10px] font-bold border-b-2 transition-all ${
                      activeNotificationTab === 'approvals' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Approvals ({pendingApprovals.length})
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {activeNotificationTab === 'system' ? (
                    mockNotifications.map((notif) => (
                      <div key={notif.id} className="block px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[10px] font-extrabold text-slate-800 truncate uppercase tracking-wider">{notif.title}</span>
                              <span className="text-[9px] text-slate-400 font-semibold shrink-0">{notif.date}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5 leading-normal font-medium">{notif.desc}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : pendingApprovals.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-400 text-xs">
                      No pending approval alerts
                    </div>
                  ) : (
                    pendingApprovals.map((app) => (
                      <Link
                        key={app.id}
                        href="/approvals"
                        onClick={() => setShowNotifications(false)}
                        className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-800 leading-normal line-clamp-2">{app.title}</span>
                            <span className="text-[10px] text-slate-450 mt-1 font-semibold">Requested by {app.requestedBy}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                  <Link 
                    href={activeNotificationTab === 'approvals' ? "/approvals" : "/dashboard"}
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    {activeNotificationTab === 'approvals' ? "View All Approvals" : "Go to Dashboard"}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/settings" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
            <Settings className="w-5.5 h-5.5" />
          </Link>
          
          <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
            <HelpCircle className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
