'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/projectStore';
import Sidebar from './sidebar';
import Header from './header';

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

  // Otherwise, show standard layout with sidebar & header
  return (
    <div className="h-full bg-slate-50 text-slate-900 flex overflow-hidden font-sans w-full">
      <Sidebar />
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-grow overflow-y-auto p-8 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
