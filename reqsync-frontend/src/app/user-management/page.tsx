'use client';

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  UserPlus,
  Users,
  X
} from 'lucide-react';

import {
  createEmployee,
  getEmployees,
  type BackendEmployeeRole,
  type EmployeeResponse
} from '@/lib/user-api';

import {
  useProjectStore
} from '@/store/projectStore';


const ROLE_LABELS:
Record<
  BackendEmployeeRole,
  string
> = {

  PROJECT_MANAGER:
    'Project Manager',

  BUSINESS_ANALYST:
    'Business Analyst',

  DEVELOPER:
    'Developer',

  QA_ENGINEER:
    'QA Engineer',
};


export default function UserManagementPage() {

  /* =========================================================
     AUTH
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const isSystemAdmin =
    currentUser?.role ===
    'System Admin';


  /* =========================================================
     DATA
     ========================================================= */

  const [
    employees,
    setEmployees
  ] =
    useState<
      EmployeeResponse[]
    >([]);


  /* =========================================================
     FORM
     ========================================================= */

  const [
    showCreateForm,
    setShowCreateForm
  ] =
    useState(false);


  const [
    firstName,
    setFirstName
  ] =
    useState('');


  const [
    lastName,
    setLastName
  ] =
    useState('');


  const [
    email,
    setEmail
  ] =
    useState('');


  const [
    password,
    setPassword
  ] =
    useState('');


  const [
    showPassword,
    setShowPassword
  ] =
    useState(false);


  const [
    role,
    setRole
  ] =
    useState<BackendEmployeeRole>(
      'DEVELOPER'
    );


  /* =========================================================
     FILTERS
     ========================================================= */

  const [
    searchQuery,
    setSearchQuery
  ] =
    useState('');


  const [
    roleFilter,
    setRoleFilter
  ] =
    useState<
      BackendEmployeeRole |
      'ALL'
    >('ALL');


  /* =========================================================
     LOADING
     ========================================================= */

  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    saving,
    setSaving
  ] =
    useState(false);


  /* =========================================================
     FEEDBACK
     ========================================================= */

  const [
    error,
    setError
  ] =
    useState<string | null>(
      null
    );


  const [
    success,
    setSuccess
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
              : 'Unable to load employee accounts.'
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
     FILTER
     ========================================================= */

  const filteredEmployees =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        return employees.filter(
          (
            employee
          ) => {

            const name =
              `${employee.firstName} ${employee.lastName}`
                .toLowerCase();


            const matchesSearch =
              !query ||
              name.includes(
                query
              ) ||
              employee.email
                .toLowerCase()
                .includes(
                  query
                );


            const matchesRole =
              roleFilter ===
                'ALL' ||
              employee.role ===
                roleFilter;


            return (
              matchesSearch &&
              matchesRole
            );
          }
        );
      },

      [
        employees,
        searchQuery,
        roleFilter
      ]
    );


  /* =========================================================
     CREATE EMPLOYEE
     ========================================================= */

  const handleCreateEmployee =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      setError(
        null
      );

      setSuccess(
        null
      );


      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        !password
      ) {

        setError(
          'Please complete all required fields.'
        );

        return;
      }


      if (
        password.length <
        8
      ) {

        setError(
          'Password must contain at least 8 characters.'
        );

        return;
      }


      try {

        setSaving(
          true
        );


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
          (
            current
          ) => [
            created,
            ...current,
          ]
        );


        setFirstName(
          ''
        );

        setLastName(
          ''
        );

        setEmail(
          ''
        );

        setPassword(
          ''
        );

        setRole(
          'DEVELOPER'
        );

        setShowPassword(
          false
        );

        setShowCreateForm(
          false
        );


        setSuccess(
          `${created.firstName} ${created.lastName} was registered successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to register employee.'
        );

      } finally {

        setSaving(
          false
        );
      }
    };


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

            Only System Administrators can create and manage employee accounts.

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

          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">

            <Users className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              Employee Management

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Register employee accounts and assign their ReqSync roles.

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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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


          <button
            type="button"
            onClick={
              () => {

                setShowCreateForm(
                  (
                    current
                  ) =>
                    !current
                );

                setError(
                  null
                );

                setSuccess(
                  null
                );
              }
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
          >

            {showCreateForm ? (

              <X className="w-4 h-4" />

            ) : (

              <UserPlus className="w-4 h-4" />

            )}


            {showCreateForm
              ? 'Cancel'
              : 'Add Employee'}

          </button>

        </div>

      </div>


      {/* SUCCESS */}

      {success && (

        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">

          <CheckCircle2 className="w-5 h-5 shrink-0" />

          <p className="text-sm font-semibold">

            {success}

          </p>

        </div>

      )}


      {/* ERROR */}

      {error && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

          <AlertCircle className="w-5 h-5 shrink-0" />

          <p className="text-sm">

            {error}

          </p>

        </div>

      )}


      {/* CREATE FORM */}

      {showCreateForm && (

        <div className="bg-slate-900 rounded-2xl border border-slate-800 text-white overflow-hidden">

          <div className="p-5 border-b border-slate-800">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">

                <UserPlus className="w-5 h-5 text-blue-400" />

              </div>


              <div>

                <h2 className="font-extrabold">

                  Register Employee

                </h2>


                <p className="text-xs text-slate-400 mt-1">

                  Create login credentials and assign a system role.

                </p>

              </div>

            </div>

          </div>


          <form
            onSubmit={
              handleCreateEmployee
            }
            className="p-6"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* FIRST NAME */}

              <FormField
                label="First Name"
              >

                <input
                  type="text"
                  value={
                    firstName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setFirstName(
                        event.target.value
                      )
                  }
                  placeholder="John"
                  className={darkInputClass}
                  required
                />

              </FormField>


              {/* LAST NAME */}

              <FormField
                label="Last Name"
              >

                <input
                  type="text"
                  value={
                    lastName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setLastName(
                        event.target.value
                      )
                  }
                  placeholder="Perera"
                  className={darkInputClass}
                  required
                />

              </FormField>


              {/* EMAIL */}

              <FormField
                label="Work Email"
              >

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />


                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setEmail(
                          event.target.value
                        )
                    }
                    placeholder="employee@company.com"
                    className={`${darkInputClass} pl-10`}
                    required
                  />

                </div>

              </FormField>


              {/* PASSWORD */}

              <FormField
                label="Initial Password"
              >

                <div className="relative">

                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />


                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      password
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setPassword(
                          event.target.value
                        )
                    }
                    placeholder="Minimum 8 characters"
                    className={`${darkInputClass} pl-10 pr-10`}
                    required
                  />


                  <button
                    type="button"
                    onClick={
                      () =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >

                    {showPassword ? (

                      <EyeOff className="w-4 h-4" />

                    ) : (

                      <Eye className="w-4 h-4" />

                    )}

                  </button>

                </div>

              </FormField>


              {/* ROLE */}

              <FormField
                label="Employee Role"
              >

                <select
                  value={
                    role
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setRole(
                        event.target.value as
                          BackendEmployeeRole
                      )
                  }
                  className={darkInputClass}
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

              </FormField>

            </div>


            <div className="flex justify-end mt-6">

              <button
                type="submit"
                disabled={
                  saving
                }
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
              >

                {saving ? (

                  <Loader2 className="w-4 h-4 animate-spin" />

                ) : (

                  <Plus className="w-4 h-4" />

                )}


                {saving
                  ? 'Creating Account...'
                  : 'Create Employee Account'}

              </button>

            </div>

          </form>

        </div>

      )}


      {/* FILTERS */}

      <div className="bg-white border border-slate-200 rounded-2xl p-4">

        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />


            <input
              type="text"
              value={
                searchQuery
              }
              onChange={
                (
                  event
                ) =>
                  setSearchQuery(
                    event.target.value
                  )
              }
              placeholder="Search employees by name or email..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-blue-500"
            />

          </div>


          <select
            value={
              roleFilter
            }
            onChange={
              (
                event
              ) =>
                setRoleFilter(
                  event.target.value as
                    BackendEmployeeRole |
                    'ALL'
                )
            }
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
          >

            <option value="ALL">

              All Roles

            </option>


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


      {/* EMPLOYEE LIST */}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        <div className="p-5 border-b border-slate-100">

          <h2 className="font-extrabold text-slate-900">

            Employees

          </h2>


          <p className="text-xs text-slate-500 mt-1">

            {filteredEmployees.length}
            {' '}
            {filteredEmployees.length ===
            1
              ? 'employee'
              : 'employees'}
            {' '}
            shown

          </p>

        </div>


        {loading ? (

          <div className="min-h-[300px] flex items-center justify-center">

            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />

          </div>

        ) : filteredEmployees.length ===
          0 ? (

          <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-10">

            <Users className="w-10 h-10 text-slate-300" />


            <p className="text-sm font-bold text-slate-700 mt-4">

              No employees found

            </p>


            <p className="text-xs text-slate-400 mt-1">

              Add employees using the Add Employee button.

            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">

                  <th className="px-5 py-3">

                    Employee

                  </th>

                  <th className="px-5 py-3">

                    Role

                  </th>

                  <th className="px-5 py-3">

                    Status

                  </th>

                  <th className="px-5 py-3">

                    Created

                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredEmployees.map(
                  (
                    employee
                  ) => {

                    const fullName =
                      `${employee.firstName} ${employee.lastName}`
                        .trim();


                    const initials =
                      `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
                        .toUpperCase();


                    const active =
                      employee.enabled &&
                      !employee.accountLocked;


                    return (

                      <tr
                        key={
                          employee.id
                        }
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xs">

                              {initials}

                            </div>


                            <div>

                              <p className="text-sm font-bold text-slate-800">

                                {fullName}

                              </p>


                              <p className="text-xs text-slate-400 mt-0.5">

                                {employee.email}

                              </p>

                            </div>

                          </div>

                        </td>


                        <td className="px-5 py-4">

                          <span className="inline-flex px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">

                            {ROLE_LABELS[
                              employee.role
                            ]}

                          </span>

                        </td>


                        <td className="px-5 py-4">

                          <span
                            className={
                              `inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                active
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`
                            }
                          >

                            {active
                              ? 'Active'
                              : employee.accountLocked
                                ? 'Locked'
                                : 'Disabled'}

                          </span>

                        </td>


                        <td className="px-5 py-4 text-xs text-slate-500">

                          {formatDate(
                            employee.createdAt
                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}


const darkInputClass =
  'w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500';


function FormField({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {

  return (

    <div>

      <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-2">

        {label} *

      </label>

      {children}

    </div>
  );
}


function formatDate(
  value: string
) {

  if (
    !value
  ) {

    return '-';
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;
  }


  return date.toLocaleDateString();
}