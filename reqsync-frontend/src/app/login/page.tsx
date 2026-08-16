'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore, type AppUser } from '@/store/projectStore';
import Link from 'next/link';
import { Sparkles, ArrowRight, Mail, Lock, UserCheck, AlertCircle } from 'lucide-react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
type BackendRole =
  | 'SYSTEM_ADMIN'
  | 'CEO'
  | 'PROJECT_MANAGER'
  | 'BUSINESS_ANALYST'
  | 'DEVELOPER'
  | 'QA_ENGINEER';

interface BackendAuthResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: BackendRole;
  token: string;
  message: string;
}

const BACKEND_ROLE_TO_FRONTEND_ROLE: Record<BackendRole, AppUser['role']> = {
  SYSTEM_ADMIN: 'System Admin',
  CEO: 'CEO',
  PROJECT_MANAGER: 'Project Manager',
  BUSINESS_ANALYST: 'Business Analyst',
  DEVELOPER: 'Developer',
  QA_ENGINEER: 'QA Engineer',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const setAuthenticatedUser = useProjectStore((state) => state.setAuthenticatedUser);
  const router = useRouter();


  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password.');
      }

      const auth = (await response.json()) as BackendAuthResponse;

      if (!auth.token) {
        throw new Error('Authentication token was not returned.');
      }

      const role = BACKEND_ROLE_TO_FRONTEND_ROLE[auth.role];

      if (!role) {
        throw new Error('Unsupported account role.');
      }

      localStorage.setItem('reqsync_token', auth.token);

      setAuthenticatedUser({
        id: String(auth.id),
        name: `${auth.firstName} ${auth.lastName}`.trim(),
        email: auth.email,
        role,
      });

      router.replace('/dashboard');
    } catch (error) {
      localStorage.removeItem('reqsync_token');

      setError(
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative text-white">
      {/* Background radial overlays */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
            ReqSync
          </span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Or{' '}
          <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline">
            register a new business
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Remember & Forget */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                <input type="checkbox" className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer" />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-blue-400 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-b-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-6 bg-slate-900/60 border border-slate-900/80 p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            Quick-Fill Seeded Accounts
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Click any account below to autofill details. Seeded password is <code className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded">password123</code>.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('ceo@reqsync.com')}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500 transition-colors text-[10px] flex flex-col cursor-pointer"
            >
              <span className="font-bold text-white">Chief Executive</span>
              <span className="text-rose-400 font-medium">CEO</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('michael@reqsync.com')}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500 transition-colors text-[10px] flex flex-col cursor-pointer"
            >
              <span className="font-bold text-white">Michael Brown</span>
              <span className="text-blue-400 font-medium">Project Manager</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sarah@reqsync.com')}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500 transition-colors text-[10px] flex flex-col cursor-pointer"
            >
              <span className="font-bold text-white">Sarah Johnson</span>
              <span className="text-amber-400 font-medium">Business Analyst</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('john@reqsync.com')}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500 transition-colors text-[10px] flex flex-col cursor-pointer"
            >
              <span className="font-bold text-white">John Doe</span>
              <span className="text-emerald-400 font-medium">Developer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('emily@reqsync.com')}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500 transition-colors text-[10px] flex flex-col cursor-pointer"
            >
              <span className="font-bold text-white">Emily Davis</span>
              <span className="text-purple-400 font-medium">QA Engineer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('alice@reqsync.com')}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500 transition-colors text-[10px] flex flex-col cursor-pointer"
            >
              <span className="font-bold text-white">Alice Smith</span>
              <span className="text-teal-400 font-medium">Stakeholder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
