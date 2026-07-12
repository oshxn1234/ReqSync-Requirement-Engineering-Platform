'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/projectStore';
import Link from 'next/link';
import { Sparkles, ArrowRight, Building, Mail, Lock, User, ShieldAlert, Award } from 'lucide-react';

export default function RegisterPage() {
  const [ceoName, setCeoName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const registerBusiness = useProjectStore((state) => state.registerBusiness);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ceoName || !email || !password || !companyName || !regNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        registerBusiness(ceoName, email, password, companyName, regNumber, companyAddress);
        setLoading(false);
        router.replace('/dashboard');
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'An error occurred during registration.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative text-white">
      {/* Background radial overlay */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 px-4">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
            ReqSync
          </span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
          Register Your Business
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        {/* Registration Card */}
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Column layout for details */}
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2 flex items-center gap-2">
                <Building className="w-4.5 h-4.5 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Company Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Registered Company Name *
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex FinTech LLC"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="regNumber" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Registration / Tax ID *
                  </label>
                  <input
                    id="regNumber"
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. TX-98218-A"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="companyAddress" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Business Address
                  </label>
                  <input
                    id="companyAddress"
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="e.g. 100 Congress Ave., Austin, TX 78701"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="border-b border-slate-800 pb-2 flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">CEO Account Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="ceoName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    CEO Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="ceoName"
                      type="text"
                      value={ceoName}
                      onChange={(e) => setCeoName(e.target.value)}
                      placeholder="e.g. Sarah Johnson"
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Work Email *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ceo@company.com"
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Choose Password *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms check */}
            <div className="text-[11px] text-slate-400 pt-2 leading-relaxed">
              By clicking "Complete Business Registration", you agree to create a corporate division workspace on the ReqSync requirement management platform.
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
                  <span>Complete Business Registration</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
