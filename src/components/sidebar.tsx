'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CheckSquare, 
  FileCheck, 
  Milestone, 
  GitMerge, 
  BrainCircuit, 
  BarChart3, 
  Database, 
  Settings,
  Sparkles,
  UserCog,
  LogOut,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Requirements', href: '/requirements', icon: FileText },
  { name: 'User Stories', href: '/user-stories', icon: Users },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'UML Workspace', href: '/uml-workspace', icon: Network },
  { name: 'Approvals', href: '/approvals', icon: FileCheck },
  { name: 'Baselines', href: '/baselines', icon: Milestone },
  { name: 'Traceability', href: '/traceability', icon: GitMerge },
  { name: 'AI Analysis', href: '/ai-analysis', icon: BrainCircuit },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Knowledge Vault', href: '/knowledge-vault', icon: Database },
  { name: 'Project Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const currentUser = useProjectStore((state) => state.currentUser);
  const logout = useProjectStore((state) => state.logout);
  const isSidebarOpen = useProjectStore((state) => state.isSidebarOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">R</div>
            <span className="text-xl font-bold text-white tracking-wide">ReqSync</span>
          </div>
        </div>
      </aside>
    );
  }

  // If user is CEO or Project Manager, add User Management route
  const isAuthorizedToManageUsers = currentUser?.role === 'Project Manager' || currentUser?.role === 'CEO';
  const displayedNavItems = isAuthorizedToManageUsers
    ? [
        ...navItems.slice(0, 10),
        { name: 'User Management', href: '/user-management', icon: UserCog },
        ...navItems.slice(10),
      ]
    : navItems;

  return (
    <aside className={cn("bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 transition-all duration-300 relative", isSidebarOpen ? "w-64" : "w-20")}>
      {/* Brand Header */}
      <div className={cn("border-b border-slate-800 flex items-center justify-center h-16", isSidebarOpen ? "px-6 justify-start" : "px-0")}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
              <span className="text-lg font-bold text-white tracking-wide leading-none group-hover:text-blue-400 transition-colors whitespace-nowrap">ReqSync</span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1 whitespace-nowrap">RE & Gov Platform</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav List */}
      <nav className={cn("flex-1 overflow-y-auto py-6 space-y-1 scrollbar-thin", isSidebarOpen ? "px-4" : "px-2")}>
        {displayedNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <div key={item.href} className="relative group/nav">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                  isSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )} />
                {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
              {!isSidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover/nav:opacity-100 z-50 whitespace-nowrap transition-opacity">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className={cn("border-t border-slate-800 bg-slate-950/40 flex flex-col gap-3", isSidebarOpen ? "p-4" : "p-2 items-center")}>
        <div className={cn("flex items-center", isSidebarOpen ? "justify-between" : "justify-center flex-col gap-2")}>
          <div className="flex items-center gap-3 p-1 rounded-xl min-w-0">
            <div className="relative shrink-0 group/user">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md uppercase">
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              {!isSidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover/user:opacity-100 z-50 whitespace-nowrap transition-opacity">
                  {currentUser?.name || 'Guest User'}
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-xs font-bold text-white truncate">{currentUser?.name || 'Guest User'}</span>
                <span className="text-[10px] text-slate-500 truncate">{currentUser?.role || 'Viewer'}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer shrink-0 relative group/logout"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
            {!isSidebarOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover/logout:opacity-100 z-50 whitespace-nowrap transition-opacity">
                Log Out
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
