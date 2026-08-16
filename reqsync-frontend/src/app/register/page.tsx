'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Building,
  Mail,
  Lock,
  User,
  ShieldAlert,
  Award,
  ShieldCheck,
  Phone,
  MapPin,
} from 'lucide-react';
import { registerBusiness } from '@/lib/business-api';

function splitFullName(
  value: string
): { firstName: string; lastName: string } | null {
  const parts = value.trim().split(/\s+/);

  if (parts.length < 2) {
    return null;
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  const [ceoName, setCeoName] = useState('');
  const [ceoEmail, setCeoEmail] = useState('');
  const [ceoPassword, setCeoPassword] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const router = useRouter();

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !companyName ||
      !regNumber ||
      !businessEmail ||
      !ceoName ||
      !ceoEmail ||
      !ceoPassword ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    const ceo = splitFullName(ceoName);

    if (!ceo) {
      setError('Please enter the CEO first name and last name.');
      return;
    }

    const admin = splitFullName(adminName);

    if (!admin) {
      setError('Please enter the System Admin first name and last name.');
      return;
    }

    if (ceoPassword.length < 8) {
      setError('CEO password must contain at least 8 characters.');
      return;
    }

    if (adminPassword.length < 8) {
      setError('System Admin password must contain at least 8 characters.');
      return;
    }

    if (
      ceoEmail.trim().toLowerCase() ===
      adminEmail.trim().toLowerCase()
    ) {
      setError(
        'CEO and System Admin must use different email addresses.'
      );
      return;
    }

    setLoading(true);

    try {
      await registerBusiness({
        businessName: companyName.trim(),
        registrationNumber: regNumber.trim(),
        businessEmail: businessEmail.trim(),
        businessPhone: businessPhone.trim(),
        businessAddress: companyAddress.trim(),
        ceoFirstName: ceo.firstName,
        ceoLastName: ceo.lastName,
        ceoEmail: ceoEmail.trim(),
        ceoPassword,
        adminFirstName: admin.firstName,
        adminLastName: admin.lastName,
        adminEmail: adminEmail.trim(),
        adminPassword,
      });

      router.replace('/login');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during registration.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    'w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors';

  const iconInputClassName =
    'w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative text-white">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

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
          <Link
            href="/login"
            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2 flex items-center gap-2">
                <Building className="w-4.5 h-4.5 text-blue-500" />

                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Company Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Registered Company Name *
                  </label>

                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex FinTech LLC"
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="regNumber"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Registration / Tax ID *
                  </label>

                  <input
                    id="regNumber"
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. TX-98218-A"
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="businessEmail"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Business Email *
                  </label>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>

                    <input
                      id="businessEmail"
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="info@company.com"
                      className={iconInputClassName}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="businessPhone"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Business Phone
                  </label>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Phone className="w-4 h-4" />
                    </span>

                    <input
                      id="businessPhone"
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="+94 11 234 5678"
                      className={iconInputClassName}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="companyAddress"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Business Address
                  </label>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </span>

                    <input
                      id="companyAddress"
                      type="text"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="e.g. 100 Main Street, Colombo"
                      className={iconInputClassName}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="border-b border-slate-800 pb-2 flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-blue-500" />

                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  CEO Account Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="ceoName"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
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
                      className={iconInputClassName}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ceoEmail"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Work Email *
                  </label>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>

                    <input
                      id="ceoEmail"
                      type="email"
                      value={ceoEmail}
                      onChange={(e) => setCeoEmail(e.target.value)}
                      placeholder="ceo@company.com"
                      className={iconInputClassName}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ceoPassword"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Choose Password *
                  </label>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>

                    <input
                      id="ceoPassword"
                      type="password"
                      value={ceoPassword}
                      onChange={(e) => setCeoPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      className={iconInputClassName}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="border-b border-slate-800 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />

                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  System Admin Account Information
                </h3>
              </div>

              <p className="text-[11px] text-slate-500">
                The System Admin can create and manage employees such as Project Managers, Business Analysts, Developers, and QA Engineers.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="adminName"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    System Admin Full Name *
                  </label>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <User className="w-4 h-4" />
                    </span>

                    <input
                      id="adminName"
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Daniel Perera"
                      className={iconInputClassName}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="adminEmail"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Work Email *
                  </label>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>

                    <input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className={iconInputClassName}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="adminPassword"
                    className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Choose Password *
                  </label>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>

                    <input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      className={iconInputClassName}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 leading-relaxed">
              By clicking &quot;Complete Business Registration&quot;, you agree to create a corporate division workspace on the ReqSync requirement management platform.
            </div>

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