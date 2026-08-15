'use client';

import {
  type FormEvent,
  useEffect,
  useState,
  useSyncExternalStore
} from 'react';

import { useRouter } from 'next/navigation';

import { useProjectStore } from '@/store/projectStore';

import {
  createEmployee,
  getEmployees,
  type BackendEmployeeRole,
  type EmployeeResponse
} from '@/lib/user-api';

import {
  Users,
  UserPlus,
  ShieldAlert,
  Check,
  Mail,
  Key,
  Plus,
  ArrowLeft,
  X
} from 'lucide-react';


const ROLE_LABELS: Record<BackendEmployeeRole, string> = {
  PROJECT_MANAGER: 'Project Manager',
  BUSINESS_ANALYST: 'Business Analyst',
  DEVELOPER: 'Developer',
  QA_ENGINEER: 'QA Engineer',
};


export default function UserManagement() {
  const router = useRouter();

  const currentUser =
    useProjectStore(
      (state) => state.currentUser
    );

  const mounted =
    useSyncExternalStore(
      () => () => {},
      () => true,
      () => false
    );

  const [employees, setEmployees] =
    useState<EmployeeResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [firstName, setFirstName] =
    useState('');

  const [lastName, setLastName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [role, setRole] =
    useState<BackendEmployeeRole>(
      'DEVELOPER'
    );

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');


  useEffect(
    () => {
      if (
        !mounted ||
        currentUser?.role !== 'System Admin'
      ) {
        return;
      }

      let cancelled = false;

      const loadEmployees = async () => {
        try {
          const response =
            await getEmployees();

          if (!cancelled) {
            setEmployees(response);
            setError('');
          }
        } catch (error) {
          if (!cancelled) {
            setError(
              error instanceof Error
                ? error.message
                : 'Unable to load employee accounts.'
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      void loadEmployees();

      return () => {
        cancelled = true;
      };
    },
    [
      mounted,
      currentUser?.role
    ]
  );


  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }


  const isAuthorized =
    currentUser?.role === 'System Admin';


  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-6">
        <div className="p-4 bg-rose-50 rounded-full text-rose-600">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Access Denied
          </h2>

          <p className="text-slate-500 text-sm">
            Only System Administrators can manage employee accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.replace('/dashboard')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }


  const handleAddUser =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError('');
      setSuccess('');

      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        !password
      ) {
        setError(
          'Please fill in all required fields.'
        );

        return;
      }

      if (password.length < 8) {
        setError(
          'Password must contain at least 8 characters.'
        );

        return;
      }

      setSaving(true);

      try {
        const created =
          await createEmployee({
            firstName:
              firstName.trim(),

            lastName:
              lastName.trim(),

            email:
              email.trim(),

            password,

            role,
          });

        setEmployees(
          (current) => [
            created,
            ...current
          ]
        );

        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setRole('DEVELOPER');
        setShowAddForm(false);

        setSuccess(
          `User account for ${created.firstName} ${created.lastName} was successfully created.`
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to create employee account.'
        );
      } finally {
        setSaving(false);
      }
    };


  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            <span>User Account Management</span>
          </h1>

          <p className="text-slate-500 text-sm">
            Create and view employee accounts for your business.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm(
              (current) => !current
            );

            setError('');
            setSuccess('');
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          {showAddForm ? (
            <X className="w-4 h-4" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}

          <span>
            {showAddForm
              ? 'Cancel Add User'
              : 'Create New Account'}
          </span>
        </button>
      </div>


      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold">
          <Check className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}


      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 rounded-xl text-xs font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}


      {showAddForm && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">

          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Create Employee Account
          </h2>

          <form
            onSubmit={handleAddUser}
            className="space-y-4"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  First Name *
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(
                      event.target.value
                    )
                  }
                  placeholder="Daniel"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>


              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Last Name *
                </label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(
                      event.target.value
                    )
                  }
                  placeholder="Perera"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>


              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address *
                </label>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="employee@company.com"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>


              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Login Password *
                </label>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Key className="w-3.5 h-3.5" />
                  </span>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Minimum 8 characters"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>


              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Assigned Role *
                </label>

                <select
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target.value as BackendEmployeeRole
                    )
                  }
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="PROJECT_MANAGER">
                    Project Manager
                  </option>

                  <option value="BUSINESS_ANALYST">
                    Business Analyst
                  </option>

                  <option value="DEVELOPER">
                    Developer
                  </option>

                  <option value="QA_ENGINEER">
                    QA Engineer
                  </option>
                </select>
              </div>
            </div>


            <div className="flex justify-end pt-2">

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}

                <span>
                  {saving
                    ? 'Creating Account...'
                    : 'Save New User'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}


      <div className="space-y-4">

        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active Employees ({employees.length})
        </h3>


        {loading ? (
          <div className="flex items-center justify-center min-h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />

            <p className="text-sm font-semibold text-slate-700">
              No employee accounts yet.
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Create the first employee account using the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {employees.map((employee) => {
              const fullName =
                `${employee.firstName} ${employee.lastName}`.trim();

              const initials =
                `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
                  .toUpperCase();

              return (
                <div
                  key={employee.id}
                  className="flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-xs"
                >

                  <div className="flex items-start gap-4">

                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-blue-600 uppercase shrink-0">
                      {initials}
                    </div>


                    <div className="space-y-1 min-w-0 flex-1">

                      <div className="flex items-center gap-2 flex-wrap">

                        <span className="text-sm font-bold text-slate-800 truncate">
                          {fullName}
                        </span>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            employee.enabled &&
                            !employee.accountLocked
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {employee.enabled &&
                          !employee.accountLocked
                            ? 'Active'
                            : 'Restricted'}
                        </span>
                      </div>


                      <p className="text-xs text-slate-400 truncate">
                        {employee.email}
                      </p>


                      <div className="pt-3">

                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          System Role
                        </label>

                        <span className="inline-flex text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-700">
                          {ROLE_LABELS[employee.role]}
                        </span>
                      </div>


                      <div className="pt-3 text-[10px] text-slate-400">
                        Created:{' '}
                        {new Date(
                          employee.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}