'use client';

import { Bell, Search, Settings, HelpCircle, ChevronDown, CheckCircle } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const settings = useProjectStore((state) => state.settings);
  const approvals = useProjectStore((state) => state.approvals);
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 text-slate-800 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {pendingApprovals.length} Action Needed
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {pendingApprovals.length === 0 ? (
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
                          <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-800 leading-normal line-clamp-2">{app.title}</span>
                            <span className="text-[10px] text-slate-400 mt-1">Requested by {app.requestedBy}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <div className="px-4 pt-2 border-t border-slate-100 text-center">
                  <Link 
                    href="/approvals"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View All Approvals
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
