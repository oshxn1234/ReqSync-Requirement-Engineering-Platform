'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  TestTube2,
  UserCog,
  Users
} from 'lucide-react';

import {
  getEmployees,
  type EmployeeResponse
} from '@/lib/user-api';

import {
  useProjectStore
} from '@/store/projectStore';


export default function SystemAdminPage() {

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const isSystemAdmin =
    currentUser?.role ===
    'System Admin';


  const [
    employees,
    setEmployees
  ] =
    useState<
      EmployeeResponse[]
    >([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    error,
    setError
  ] =
    useState<string | null>(
      null
    );


  /* =========================================================
     LOAD EMPLOYEES
     ========================================================= */

  const loadEmployees =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError(
            null
          );


          const response =
            await getEmployees();


          setEmployees(
            response
          );

        } catch (error) {

          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load employees.'
          );

        } finally {

          setLoading(
            false
          );
        }
      },

      []
    );


  useEffect(
    () => {

      if (
        !isSystemAdmin
      ) {

        return;
      }


      void loadEmployees();

    },
    [
      isSystemAdmin,
      loadEmployees
    ]
  );


  /* =========================================================
     STATISTICS
     ========================================================= */

  const projectManagers =
    useMemo(
      () =>
        employees.filter(
          (employee) =>
            employee.role ===
            'PROJECT_MANAGER'
        ).length,

      [
        employees
      ]
    );


  const businessAnalysts =
    useMemo(
      () =>
        employees.filter(
          (employee) =>
            employee.role ===
            'BUSINESS_ANALYST'
        ).length,

      [
        employees
      ]
    );


  const developers =
    useMemo(
      () =>
        employees.filter(
          (employee) =>
            employee.role ===
            'DEVELOPER'
        ).length,

      [
        employees
      ]
    );


  const qaEngineers =
    useMemo(
      () =>
        employees.filter(
          (employee) =>
            employee.role ===
            'QA_ENGINEER'
        ).length,

      [
        employees
      ]
    );


  const activeEmployees =
    useMemo(
      () =>
        employees.filter(
          (employee) =>
            employee.enabled &&
            !employee.accountLocked
        ).length,

      [
        employees
      ]
    );


  /* =========================================================
     ACCESS CONTROL
     ========================================================= */

  if (
    !isSystemAdmin
  ) {

    return (

      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-6">

        <div className="p-4 bg-rose-50 rounded-full text-rose-600">

          <ShieldAlert className="w-12 h-12" />

        </div>


        <div>

          <h2 className="text-2xl font-extrabold text-slate-900">

            Access Denied

          </h2>


          <p className="text-sm text-slate-500 mt-2">

            This workspace is available only to System Administrators.

          </p>

        </div>

      </div>
    );
  }


  return (

    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">

            <UserCog className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              System Administration

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Manage employee accounts and monitor business users.

            </p>

          </div>

        </div>


        <div className="flex items-center gap-2">

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              () =>
                void loadEmployees()
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >

            <RefreshCcw
              className={
                `w-4 h-4 ${
                  loading
                    ? 'animate-spin'
                    : ''
                }`
              }
            />

            Refresh

          </button>


          <Link
            href="/user-management"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >

            <Users className="w-4 h-4" />

            Manage Employees

          </Link>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

          <AlertCircle className="w-5 h-5 shrink-0" />

          <p className="text-sm">

            {error}

          </p>

        </div>

      )}


      {/* LOADING */}

      {loading ? (

        <div className="min-h-[300px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />

          <p className="text-xs text-slate-500 mt-3">

            Loading employee information...

          </p>

        </div>

      ) : (

        <>

          {/* STATISTICS */}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

            <StatCard
              title="Employees"
              value={
                employees.length
              }
              icon={
                <Users className="w-4 h-4" />
              }
            />


            <StatCard
              title="Active"
              value={
                activeEmployees
              }
              icon={
                <CheckCircle2 className="w-4 h-4" />
              }
              valueClass="text-emerald-600"
            />


            <StatCard
              title="Project Managers"
              value={
                projectManagers
              }
              icon={
                <BriefcaseBusiness className="w-4 h-4" />
              }
            />


            <StatCard
              title="Developers"
              value={
                developers
              }
              icon={
                <Code2 className="w-4 h-4" />
              }
            />


            <StatCard
              title="QA Engineers"
              value={
                qaEngineers
              }
              icon={
                <TestTube2 className="w-4 h-4" />
              }
            />

          </div>


          {/* ROLE BREAKDOWN */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              <div className="p-5 border-b border-slate-100">

                <h2 className="font-extrabold text-slate-900">

                  Employee Roles

                </h2>


                <p className="text-xs text-slate-500 mt-1">

                  Current employee distribution by system role.

                </p>

              </div>


              <div className="p-5 space-y-3">

                <RoleRow
                  label="Project Managers"
                  value={
                    projectManagers
                  }
                />


                <RoleRow
                  label="Business Analysts"
                  value={
                    businessAnalysts
                  }
                />


                <RoleRow
                  label="Developers"
                  value={
                    developers
                  }
                />


                <RoleRow
                  label="QA Engineers"
                  value={
                    qaEngineers
                  }
                />

              </div>

            </div>


            {/* QUICK ACTION */}

            <div className="bg-slate-900 text-white rounded-2xl p-6">

              <div className="w-11 h-11 rounded-xl bg-blue-600/20 flex items-center justify-center">

                <UserCog className="w-5 h-5 text-blue-400" />

              </div>


              <h2 className="font-extrabold mt-5">

                Employee Account Management

              </h2>


              <p className="text-xs text-slate-400 mt-2 leading-relaxed">

                Register employees and assign their ReqSync system roles. New employees can then sign in using the account credentials created by the System Administrator.

              </p>


              <Link
                href="/user-management"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold"
              >

                <Users className="w-4 h-4" />

                Open Employee Management

              </Link>

            </div>

          </div>

        </>

      )}

    </div>
  );
}


function StatCard({
  title,
  value,
  icon,
  valueClass =
    'text-slate-900'
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueClass?: string;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center justify-between">

        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">

          {title}

        </p>


        <div className="text-blue-600">

          {icon}

        </div>

      </div>


      <p
        className={
          `text-3xl font-black mt-2 ${valueClass}`
        }
      >

        {value}

      </p>

    </div>
  );
}


function RoleRow({
  label,
  value
}: {
  label: string;
  value: number;
}) {

  return (

    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">

      <span className="text-xs font-semibold text-slate-700">

        {label}

      </span>


      <span className="text-sm font-black text-blue-600">

        {value}

      </span>

    </div>
  );
}