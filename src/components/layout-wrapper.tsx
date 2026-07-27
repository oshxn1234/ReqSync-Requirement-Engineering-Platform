'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/projectStore';
import Sidebar from './sidebar';
import Header from './header';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const rolePaths: Record<string, string[]> = {
  '/user-management': ['CEO', 'Project Manager'],
  '/requirements': ['Project Manager', 'Business Analyst', 'Stakeholder'],
  '/user-stories': ['Project Manager', 'Business Analyst'],
  '/tasks': ['Project Manager', 'Developer', 'QA Engineer'],
  '/uml-workspace': ['Business Analyst'],
  '/approvals': ['CEO', 'Project Manager', 'Business Analyst', 'Stakeholder'],
  '/baselines': ['CEO', 'Project Manager', 'Stakeholder'],
  '/traceability': ['Business Analyst', 'Developer', 'QA Engineer'],
  '/ai-analysis': ['Business Analyst'],
  '/reports': ['CEO', 'Project Manager', 'QA Engineer', 'Stakeholder'],
  '/knowledge-vault': ['CEO', 'Business Analyst'],
};

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const currentUser = useProjectStore((state) => state.currentUser);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isPublicPath = pathname === '/' || pathname === '/login' || pathname === '/register';

    if (!currentUser && !isPublicPath) {
      router.replace('/login');
    } else if (currentUser && isPublicPath) {
      router.replace('/dashboard');
    }
  }, [currentUser, pathname, mounted, router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const isPublicPath = pathname === '/' || pathname === '/login' || pathname === '/register';

  // If visiting login, register or home, show only clean content
  if (isPublicPath) {
    return <div className="w-full min-h-screen overflow-y-auto">{children}</div>;
  }

  // Check if route is authorized
  let isAuthorized = true;
  let requiredRoles: string[] = [];
  for (const [route, allowedRoles] of Object.entries(rolePaths)) {
    if (pathname === route || pathname?.startsWith(`${route}/`)) {
      if (currentUser && !allowedRoles.includes(currentUser.role)) {
        isAuthorized = false;
        requiredRoles = allowedRoles;
      }
      break;
    }
  }

  // Otherwise, show standard layout with sidebar & header
  return (
    <div className="h-full bg-slate-50 text-slate-900 flex overflow-hidden font-sans w-full">
      <Sidebar />
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-grow overflow-y-auto p-8 scrollbar-thin">
          {isAuthorized ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-6 animate-fade-in">
              <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100 shadow-sm animate-pulse">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Denied</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your account role (<span className="font-semibold text-slate-800">{currentUser?.role}</span>) does not have permission to access the <span className="font-semibold font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{pathname}</span> page.
                </p>
                {requiredRoles.length > 0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    Authorized roles: {requiredRoles.join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
