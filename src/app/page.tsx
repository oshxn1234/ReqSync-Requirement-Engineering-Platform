'use client';

import Link from 'next/link';
import { Sparkles, BrainCircuit, ShieldCheck, GitMerge, FileText, ArrowRight, HelpCircle } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Landing Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              ReqSync
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
            >
              Register Business
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-blue-400 font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Requirement Engineering & Governance</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mx-auto">
          Sync Requirements, <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
            Automate Engineering Governance
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
          The ultimate platform for software project managers, BAs, and engineers to collaborate, analyze with AI, trace dependencies, and achieve automated baseline approvals.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link 
            href="/register" 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <span>Register Your Business</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white px-8 py-4 rounded-xl text-base font-bold transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Access Dashboard</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <section className="mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Card 1 */}
          <div className="bg-slate-900/40 border border-slate-900 p-6.5 rounded-2xl backdrop-blur-sm hover:border-slate-800/80 transition-all hover:translate-y-[-4px] duration-300">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mt-5">Requirements Elicitation</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Author and organize functional and non-functional requirements with customizable versioning and rich metadata.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/40 border border-slate-900 p-6.5 rounded-2xl backdrop-blur-sm hover:border-slate-800/80 transition-all hover:translate-y-[-4px] duration-300">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl w-fit">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mt-5">AI Co-Pilot Analysis</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Verify requirement completeness, calculate ambiguity ratings, and receive corrective insights instantly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/40 border border-slate-900 p-6.5 rounded-2xl backdrop-blur-sm hover:border-slate-800/80 transition-all hover:translate-y-[-4px] duration-300">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit">
              <GitMerge className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mt-5">Dynamic Traceability</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Trace requirements to user stories and execution tasks. Map and analyze change impact dependencies seamlessly.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/40 border border-slate-900 p-6.5 rounded-2xl backdrop-blur-sm hover:border-slate-800/80 transition-all hover:translate-y-[-4px] duration-300">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mt-5">Structured Baselines</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Set immutable project baselines and manage multi-role governance approvals for requirement amendments.
            </p>
          </div>
        </section>

        {/* Informative / Trust section */}
        <section className="mt-28 border-t border-slate-900 pt-16 flex flex-col md:flex-row gap-8 items-center justify-between text-left">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-white tracking-tight">Structured Corporate Alignment</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              ReqSync helps organizations register corporate divisions, structure software requirements correctly, and maintain complete audit logging for regulatory standards.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-900 text-center">
              <div className="text-3xl font-black text-blue-500">100%</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Traceability</div>
            </div>
            <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-900 text-center">
              <div className="text-3xl font-black text-teal-400">92%</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">AI Match Score</div>
            </div>
            <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-900 text-center">
              <div className="text-3xl font-black text-indigo-400">10ms</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">Baseline Sync</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 text-slate-500 text-xs py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 ReqSync. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
