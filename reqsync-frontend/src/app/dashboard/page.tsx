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
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Database,
  FileCheck,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Network,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserRoundCheck,
  Users
} from 'lucide-react';

import {
  getAllProjects,
  type ProjectResponse
} from '@/lib/project-api';

import {
  getEmployees,
  type EmployeeResponse
} from '@/lib/user-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


/* =========================================================
   DASHBOARD
   ========================================================= */

export default function DashboardPage() {

  /* =========================================================
     AUTH
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const role =
    currentUser?.role;


  /* =========================================================
     BACKEND PROJECT STORE
     ========================================================= */

  const projects =
    useBackendProjectStore(
      (state) =>
        state.projects
    );


  const selectedProjectId =
    useBackendProjectStore(
      (state) =>
        state.selectedProjectId
    );


  const setProjects =
    useBackendProjectStore(
      (state) =>
        state.setProjects
    );


  const selectProject =
    useBackendProjectStore(
      (state) =>
        state.selectProject
    );


  /* =========================================================
     PAGE STATE
     ========================================================= */

  const [
    mounted,
    setMounted
  ] =
    useState(false);


  const [
    loadingProjects,
    setLoadingProjects
  ] =
    useState(true);


  const [
    projectError,
    setProjectError
  ] =
    useState<string | null>(
      null
    );


  /* =========================================================
     SYSTEM ADMIN EMPLOYEE STATE
     ========================================================= */

  const [
    employees,
    setEmployees
  ] =
    useState<EmployeeResponse[]>(
      []
    );


  const [
    employeesLoading,
    setEmployeesLoading
  ] =
    useState(false);


  const [
    employeeError,
    setEmployeeError
  ] =
    useState<string | null>(
      null
    );


  /* =========================================================
     MOUNT
     ========================================================= */

  useEffect(
    () => {

      setMounted(
        true
      );

    },
    []
  );


  /* =========================================================
     LOAD PROJECTS

     Projects are available to normal project roles.
     System Admin does not need project data on dashboard.
     ========================================================= */

  const loadProjects =
    useCallback(
      async () => {

        if (
          role ===
          'System Admin'
        ) {

          setLoadingProjects(
            false
          );

          return;
        }


        try {

          setLoadingProjects(
            true
          );


          setProjectError(
            null
          );


          const response =
            await getAllProjects();


          setProjects(
            response
          );


          /*
           * Keep current project if valid.
           *
           * Otherwise select the first project.
           */
          if (
            response.length >
            0
          ) {

            const selectionStillExists =
              response.some(
                (project) =>
                  project.id ===
                  selectedProjectId
              );


            if (
              !selectionStillExists
            ) {

              selectProject(
                response[0].id
              );
            }

          } else {

            selectProject(
              null
            );
          }

        } catch (error) {

          setProjectError(
            error instanceof Error
              ? error.message
              : 'Unable to load projects.'
          );

        } finally {

          setLoadingProjects(
            false
          );
        }
      },

      [
        role,
        selectedProjectId,
        setProjects,
        selectProject
      ]
    );


  /* =========================================================
     LOAD EMPLOYEES

     Only System Admin uses the employee API here.
     ========================================================= */

  const loadEmployees =
    useCallback(
      async () => {

        if (
          role !==
          'System Admin'
        ) {

          return;
        }


        try {

          setEmployeesLoading(
            true
          );


          setEmployeeError(
            null
          );


          const response =
            await getEmployees();


          setEmployees(
            response
          );

        } catch (error) {

          setEmployeeError(
            error instanceof Error
              ? error.message
              : 'Unable to load employees.'
          );

        } finally {

          setEmployeesLoading(
            false
          );
        }
      },

      [
        role
      ]
    );


  /* =========================================================
     INITIAL DATA LOAD
     ========================================================= */

  useEffect(
    () => {

      if (
        !mounted ||
        !role
      ) {

        return;
      }


      if (
        role ===
        'System Admin'
      ) {

        void loadEmployees();

      } else {

        void loadProjects();
      }

    },
    [
      mounted,
      role,
      loadEmployees,
      loadProjects
    ]
  );


  /* =========================================================
     SELECTED PROJECT
     ========================================================= */

  const selectedProject =
    useMemo(
      () =>
        projects.find(
          (project) =>
            project.id ===
            selectedProjectId
        ) ??
        null,

      [
        projects,
        selectedProjectId
      ]
    );


  /* =========================================================
     PROJECT COUNTS
     ========================================================= */

  const activeProjects =
    projects.filter(
      (project) =>
        project.status ===
        'ACTIVE'
    ).length;


  const planningProjects =
    projects.filter(
      (project) =>
        project.status ===
        'PLANNING'
    ).length;


  const completedProjects =
    projects.filter(
      (project) =>
        project.status ===
        'COMPLETED'
    ).length;


  const projectsWithoutManager =
    projects.filter(
      (project) =>
        !project.projectManagerId
    ).length;


  /* =========================================================
     EMPLOYEE COUNTS
     ========================================================= */

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.enabled &&
        !employee.accountLocked
    ).length;


  const lockedEmployees =
    employees.filter(
      (employee) =>
        employee.accountLocked
    ).length;


  const projectManagers =
    employees.filter(
      (employee) =>
        employee.role ===
        'PROJECT_MANAGER'
    ).length;


  const businessAnalysts =
    employees.filter(
      (employee) =>
        employee.role ===
        'BUSINESS_ANALYST'
    ).length;


  const developers =
    employees.filter(
      (employee) =>
        employee.role ===
        'DEVELOPER'
    ).length;


  const qaEngineers =
    employees.filter(
      (employee) =>
        employee.role ===
        'QA_ENGINEER'
    ).length;


  /* =========================================================
     HYDRATION
     ========================================================= */

  if (
    !mounted
  ) {

    return (

      <DashboardLoader />

    );
  }


  /* =========================================================
     NO AUTH USER
     ========================================================= */

  if (
    !currentUser
  ) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-center">

          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />


          <h2 className="text-lg font-bold text-slate-800 mt-3">

            User session unavailable

          </h2>


          <p className="text-sm text-slate-500 mt-1">

            Please sign in again.

          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     SYSTEM ADMIN DASHBOARD
     ========================================================= */

  if (
    role ===
    'System Admin'
  ) {

    return (

      <div className="max-w-7xl mx-auto space-y-6">

        <DashboardHeader
          icon={
            <UserCog className="w-6 h-6" />
          }
          iconClass="bg-teal-100 text-teal-700"
          title="System Administration"
          description={
            `Welcome back, ${currentUser.name}. Manage employee accounts and system access.`
          }
          action={
            <button
              type="button"
              disabled={
                employeesLoading
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
                    employeesLoading
                      ? 'animate-spin'
                      : ''
                  }`
                }
              />

              Refresh

            </button>
          }
        />


        {employeeError && (

          <ErrorMessage
            message={
              employeeError
            }
          />

        )}


        {employeesLoading ? (

          <DashboardLoader />

        ) : (

          <>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              <MetricCard
                title="Employee Accounts"
                value={
                  employees.length
                }
                icon={
                  <Users className="w-5 h-5" />
                }
              />


              <MetricCard
                title="Active Accounts"
                value={
                  activeEmployees
                }
                icon={
                  <CheckCircle2 className="w-5 h-5" />
                }
                valueClass="text-emerald-600"
              />


              <MetricCard
                title="Locked Accounts"
                value={
                  lockedEmployees
                }
                icon={
                  <LockKeyhole className="w-5 h-5" />
                }
                valueClass="text-rose-600"
              />


              <MetricCard
                title="Employee Roles"
                value={
                  4
                }
                icon={
                  <UserCog className="w-5 h-5" />
                }
              />

            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">

                <div className="p-5 border-b border-slate-100">

                  <h2 className="font-extrabold text-slate-900">

                    Employee Role Distribution

                  </h2>


                  <p className="text-xs text-slate-500 mt-1">

                    Current accounts registered in ReqSync.

                  </p>

                </div>


                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <RoleCount
                    label="Project Managers"
                    count={
                      projectManagers
                    }
                  />


                  <RoleCount
                    label="Business Analysts"
                    count={
                      businessAnalysts
                    }
                  />


                  <RoleCount
                    label="Developers"
                    count={
                      developers
                    }
                  />


                  <RoleCount
                    label="QA Engineers"
                    count={
                      qaEngineers
                    }
                  />

                </div>

              </div>


              <QuickActions
                title="Administration"
                actions={[
                  {
                    label:
                      'Employee Management',

                    href:
                      '/user-management',

                    icon:
                      <Users className="w-4 h-4" />,
                  },
                  {
                    label:
                      'Admin Overview',

                    href:
                      '/system-admin',

                    icon:
                      <UserCog className="w-4 h-4" />,
                  },
                ]}
              />

            </div>

          </>

        )}

      </div>
    );
  }


  /* =========================================================
     PROJECT DATA LOADING
     ========================================================= */

  if (
    loadingProjects
  ) {

    return (

      <DashboardLoader />

    );
  }


  /* =========================================================
     CEO DASHBOARD
     ========================================================= */

  if (
    role ===
    'CEO'
  ) {

    return (

      <div className="max-w-7xl mx-auto space-y-6">

        <DashboardHeader
          icon={
            <BriefcaseBusiness className="w-6 h-6" />
          }
          iconClass="bg-indigo-100 text-indigo-700"
          title="Executive Dashboard"
          description={
            `Welcome back, ${currentUser.name}. Monitor projects and project leadership.`
          }
          action={
            <RefreshButton
              loading={
                loadingProjects
              }
              onClick={
                loadProjects
              }
            />
          }
        />


        {projectError && (

          <ErrorMessage
            message={
              projectError
            }
          />

        )}


        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

          <MetricCard
            title="Projects"
            value={
              projects.length
            }
            icon={
              <FolderKanban className="w-5 h-5" />
            }
          />


          <MetricCard
            title="Active"
            value={
              activeProjects
            }
            icon={
              <Sparkles className="w-5 h-5" />
            }
            valueClass="text-blue-600"
          />


          <MetricCard
            title="Planning"
            value={
              planningProjects
            }
            icon={
              <FileText className="w-5 h-5" />
            }
            valueClass="text-amber-600"
          />


          <MetricCard
            title="Completed"
            value={
              completedProjects
            }
            icon={
              <CheckCircle2 className="w-5 h-5" />
            }
            valueClass="text-emerald-600"
          />


          <MetricCard
            title="PM Not Assigned"
            value={
              projectsWithoutManager
            }
            icon={
              <UserRoundCheck className="w-5 h-5" />
            }
            valueClass={
              projectsWithoutManager >
              0
                ? 'text-rose-600'
                : 'text-emerald-600'
            }
          />

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2">

            <ProjectList
              projects={
                projects
              }
              selectedProjectId={
                selectedProjectId
              }
              onSelect={
                selectProject
              }
            />

          </div>


          <QuickActions
            title="Executive Actions"
            actions={[
              {
                label:
                  'Manage Projects',

                href:
                  '/projects',

                icon:
                  <FolderKanban className="w-4 h-4" />,
              },
              {
                label:
                  'Team Management',

                href:
                  '/team-management',

                icon:
                  <UserRoundCheck className="w-4 h-4" />,
              },
              {
                label:
                  'View SRS',

                href:
                  '/srs',

                icon:
                  <BookOpen className="w-4 h-4" />,
              },
              {
                label:
                  'Knowledge Vault',

                href:
                  '/knowledge-vault',

                icon:
                  <Database className="w-4 h-4" />,
              },
            ]}
          />

        </div>

      </div>
    );
  }


  /* =========================================================
     PROJECT MANAGER DASHBOARD
     ========================================================= */

  if (
    role ===
    'Project Manager'
  ) {

    return (

      <RoleProjectDashboard
        currentUserName={
          currentUser.name
        }
        title="Project Manager Dashboard"
        description="Manage your project team, requirements workflow and developer task assignment."
        icon={
          <BriefcaseBusiness className="w-6 h-6" />
        }
        iconClass="bg-blue-100 text-blue-700"
        projects={
          projects
        }
        selectedProject={
          selectedProject
        }
        selectedProjectId={
          selectedProjectId
        }
        selectProject={
          selectProject
        }
        projectError={
          projectError
        }
        refresh={
          loadProjects
        }
        actions={[
          {
            label:
              'Projects',

            href:
              '/projects',

            icon:
              <FolderKanban className="w-4 h-4" />,
          },
          {
            label:
              'Team Management',

            href:
              '/team-management',

            icon:
              <Users className="w-4 h-4" />,
          },
          {
            label:
              'Requirement Approvals',

            href:
              '/approvals',

            icon:
              <FileCheck className="w-4 h-4" />,
          },
          {
            label:
              'Task Assignment',

            href:
              '/task-assignment',

            icon:
              <UserRoundCheck className="w-4 h-4" />,
          },
          {
            label:
              'User Stories',

            href:
              '/user-stories',

            icon:
              <FileText className="w-4 h-4" />,
          },
          {
            label:
              'SRS',

            href:
              '/srs',

            icon:
              <BookOpen className="w-4 h-4" />,
          },
        ]}
      />

    );
  }


  /* =========================================================
     BUSINESS ANALYST DASHBOARD
     ========================================================= */

  if (
    role ===
    'Business Analyst'
  ) {

    return (

      <RoleProjectDashboard
        currentUserName={
          currentUser.name
        }
        title="Business Analyst Dashboard"
        description="Work with project requirements, completeness analysis, user stories, SRS and UML."
        icon={
          <Sparkles className="w-6 h-6" />
        }
        iconClass="bg-amber-100 text-amber-700"
        projects={
          projects
        }
        selectedProject={
          selectedProject
        }
        selectedProjectId={
          selectedProjectId
        }
        selectProject={
          selectProject
        }
        projectError={
          projectError
        }
        refresh={
          loadProjects
        }
        actions={[
          {
            label:
              'Extract Requirements',

            href:
              '/requirements/extract',

            icon:
              <Sparkles className="w-4 h-4" />,
          },
          {
            label:
              'Requirements',

            href:
              '/requirements',

            icon:
              <FileText className="w-4 h-4" />,
          },
          {
            label:
              'Requirement Approvals',

            href:
              '/approvals',

            icon:
              <FileCheck className="w-4 h-4" />,
          },
          {
            label:
              'User Stories',

            href:
              '/user-stories',

            icon:
              <Users className="w-4 h-4" />,
          },
          {
            label:
              'SRS',

            href:
              '/srs',

            icon:
              <BookOpen className="w-4 h-4" />,
          },
          {
            label:
              'UML Workspace',

            href:
              '/uml-workspace',

            icon:
              <Network className="w-4 h-4" />,
          },
        ]}
      />

    );
  }


  /* =========================================================
     DEVELOPER DASHBOARD
     ========================================================= */

  if (
    role ===
    'Developer'
  ) {

    return (

      <RoleProjectDashboard
        currentUserName={
          currentUser.name
        }
        title="Developer Dashboard"
        description="Access development work assigned through ReqSync and supporting project documentation."
        icon={
          <Code2 className="w-6 h-6" />
        }
        iconClass="bg-emerald-100 text-emerald-700"
        projects={
          projects
        }
        selectedProject={
          selectedProject
        }
        selectedProjectId={
          selectedProjectId
        }
        selectProject={
          selectProject
        }
        projectError={
          projectError
        }
        refresh={
          loadProjects
        }
        actions={[
          {
            label:
              'Developer Workspace',

            href:
              '/developer',

            icon:
              <Code2 className="w-4 h-4" />,
          },
          {
            label:
              'User Stories',

            href:
              '/user-stories',

            icon:
              <Users className="w-4 h-4" />,
          },
          {
            label:
              'SRS',

            href:
              '/srs',

            icon:
              <BookOpen className="w-4 h-4" />,
          },
          {
            label:
              'Knowledge Vault',

            href:
              '/knowledge-vault',

            icon:
              <Database className="w-4 h-4" />,
          },
        ]}
      />

    );
  }


  /* =========================================================
     QA ENGINEER DASHBOARD
     ========================================================= */

  if (
    role ===
    'QA Engineer'
  ) {

    return (

      <RoleProjectDashboard
        currentUserName={
          currentUser.name
        }
        title="QA Engineer Dashboard"
        description="Review developer submissions and access the project information required for verification."
        icon={
          <ShieldCheck className="w-6 h-6" />
        }
        iconClass="bg-purple-100 text-purple-700"
        projects={
          projects
        }
        selectedProject={
          selectedProject
        }
        selectedProjectId={
          selectedProjectId
        }
        selectProject={
          selectProject
        }
        projectError={
          projectError
        }
        refresh={
          loadProjects
        }
        actions={[
          {
            label:
              'QA Review',

            href:
              '/qa-review',

            icon:
              <ShieldCheck className="w-4 h-4" />,
          },
          {
            label:
              'User Stories',

            href:
              '/user-stories',

            icon:
              <Users className="w-4 h-4" />,
          },
          {
            label:
              'SRS',

            href:
              '/srs',

            icon:
              <BookOpen className="w-4 h-4" />,
          },
          {
            label:
              'Knowledge Vault',

            href:
              '/knowledge-vault',

            icon:
              <Database className="w-4 h-4" />,
          },
        ]}
      />

    );
  }


  /* =========================================================
     FALLBACK
     ========================================================= */

  return (

    <div className="max-w-xl mx-auto mt-16 text-center">

      <LayoutDashboard className="w-12 h-12 text-slate-300 mx-auto" />


      <h2 className="text-lg font-bold text-slate-800 mt-4">

        Dashboard unavailable

      </h2>


      <p className="text-sm text-slate-500 mt-2">

        No dashboard has been configured for this user role.

      </p>

    </div>
  );
}


/* =========================================================
   COMMON PROJECT ROLE DASHBOARD
   ========================================================= */

function RoleProjectDashboard({
  currentUserName,
  title,
  description,
  icon,
  iconClass,
  projects,
  selectedProject,
  selectedProjectId,
  selectProject,
  projectError,
  refresh,
  actions
}: {
  currentUserName:
    string;

  title:
    string;

  description:
    string;

  icon:
    React.ReactNode;

  iconClass:
    string;

  projects:
    ProjectResponse[];

  selectedProject:
    ProjectResponse |
    null;

  selectedProjectId:
    number |
    null;

  selectProject:
    (
      id:
        number |
        null
    ) =>
      void;

  projectError:
    string |
    null;

  refresh:
    () =>
      Promise<void>;

  actions:
    DashboardAction[];
}) {

  return (

    <div className="max-w-7xl mx-auto space-y-6">

      <DashboardHeader
        icon={
          icon
        }
        iconClass={
          iconClass
        }
        title={
          title
        }
        description={
          `Welcome back, ${currentUserName}. ${description}`
        }
        action={
          <RefreshButton
            loading={
              false
            }
            onClick={
              refresh
            }
          />
        }
      />


      {projectError && (

        <ErrorMessage
          message={
            projectError
          }
        />

      )}


      {/* PROJECT SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <MetricCard
          title="Available Projects"
          value={
            projects.length
          }
          icon={
            <FolderKanban className="w-5 h-5" />
          }
        />


        <MetricCard
          title="Active Projects"
          value={
            projects.filter(
              (project) =>
                project.status ===
                'ACTIVE'
            ).length
          }
          icon={
            <Sparkles className="w-5 h-5" />
          }
          valueClass="text-blue-600"
        />


        <MetricCard
          title="Completed"
          value={
            projects.filter(
              (project) =>
                project.status ===
                'COMPLETED'
            ).length
          }
          icon={
            <CheckCircle2 className="w-5 h-5" />
          }
          valueClass="text-emerald-600"
        />

      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CURRENT PROJECT */}

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-100">

            <h2 className="font-extrabold text-slate-900">

              Current Project

            </h2>


            <p className="text-xs text-slate-500 mt-1">

              Select the project you want to work with.

            </p>

          </div>


          <div className="p-5">

            {projects.length ===
            0 ? (

              <div className="py-12 text-center">

                <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />


                <p className="text-sm font-bold text-slate-700 mt-3">

                  No projects available

                </p>

              </div>

            ) : (

              <>

                <select
                  value={
                    selectedProjectId ??
                    ''
                  }
                  onChange={
                    (
                      event
                    ) => {

                      const value =
                        event.target.value;


                      selectProject(
                        value
                          ? Number(
                              value
                            )
                          : null
                      );
                    }
                  }
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                >

                  <option value="">

                    Select project

                  </option>


                  {projects.map(
                    (project) => (

                      <option
                        key={
                          project.id
                        }
                        value={
                          project.id
                        }
                      >

                        #{project.projectNumber} - {project.name}

                      </option>

                    )
                  )}

                </select>


                {selectedProject && (

                  <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-5">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="text-xs font-black text-blue-600">

                        Project #{selectedProject.projectNumber}

                      </span>


                      <ProjectStatus
                        status={
                          selectedProject.status
                        }
                      />

                    </div>


                    <h3 className="font-extrabold text-slate-900 mt-3">

                      {selectedProject.name}

                    </h3>


                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">

                      {selectedProject.description ||
                        'No project description available.'}

                    </p>


                    <div className="mt-4 pt-4 border-t border-slate-200">

                      <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">

                        Project Manager

                      </p>


                      <p className="text-xs font-semibold text-slate-700 mt-1">

                        {selectedProject.projectManagerName ||
                          'Not assigned'}

                      </p>

                    </div>

                  </div>

                )}

              </>

            )}

          </div>

        </div>


        <QuickActions
          title="Workspace"
          actions={
            actions
          }
        />

      </div>

    </div>
  );
}


/* =========================================================
   CEO PROJECT LIST
   ========================================================= */

function ProjectList({
  projects,
  selectedProjectId,
  onSelect
}: {
  projects:
    ProjectResponse[];

  selectedProjectId:
    number |
    null;

  onSelect:
    (
      id:
        number |
        null
    ) =>
      void;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      <div className="p-5 border-b border-slate-100 flex items-center justify-between">

        <div>

          <h2 className="font-extrabold text-slate-900">

            Project Portfolio

          </h2>


          <p className="text-xs text-slate-500 mt-1">

            Current projects returned by the backend.

          </p>

        </div>


        <Link
          href="/projects"
          className="text-xs font-bold text-blue-600 hover:underline"
        >

          Manage Projects

        </Link>

      </div>


      {projects.length ===
      0 ? (

        <div className="py-14 text-center text-sm text-slate-400">

          No projects found.

        </div>

      ) : (

        <div className="divide-y divide-slate-100">

          {projects
            .slice(
              0,
              6
            )
            .map(
              (project) => (

                <button
                  key={
                    project.id
                  }
                  type="button"
                  onClick={
                    () =>
                      onSelect(
                        project.id
                      )
                  }
                  className={
                    `w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                      selectedProjectId ===
                      project.id
                        ? 'bg-blue-50/60'
                        : ''
                    }`
                  }
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-sm font-bold text-slate-900 truncate">

                        {project.name}

                      </p>


                      <p className="text-[10px] text-slate-400 mt-1">

                        #{project.projectNumber}
                        {' • '}

                        PM:{' '}

                        {project.projectManagerName ||
                          'Not assigned'}

                      </p>

                    </div>


                    <ProjectStatus
                      status={
                        project.status
                      }
                    />

                  </div>

                </button>

              )
            )}

        </div>

      )}

    </div>
  );
}


/* =========================================================
   QUICK ACTION TYPE
   ========================================================= */

interface DashboardAction {

  label:
    string;

  href:
    string;

  icon:
    React.ReactNode;
}


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function QuickActions({
  title,
  actions
}: {
  title:
    string;

  actions:
    DashboardAction[];
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-5 self-start">

      <h2 className="font-extrabold text-slate-900">

        {title}

      </h2>


      <p className="text-xs text-slate-500 mt-1">

        Open the modules relevant to your role.

      </p>


      <div className="space-y-2 mt-5">

        {actions.map(
          (action) => (

            <Link
              key={
                action.href
              }
              href={
                action.href
              }
              className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 transition-all"
            >

              <div className="flex items-center gap-3">

                <div className="text-blue-600">

                  {action.icon}

                </div>


                <span className="text-xs font-bold text-slate-700">

                  {action.label}

                </span>

              </div>


              <span className="text-slate-400">

                ›

              </span>

            </Link>

          )
        )}

      </div>

    </div>
  );
}


/* =========================================================
   HEADER
   ========================================================= */

function DashboardHeader({
  icon,
  iconClass,
  title,
  description,
  action
}: {
  icon:
    React.ReactNode;

  iconClass:
    string;

  title:
    string;

  description:
    string;

  action?:
    React.ReactNode;
}) {

  return (

    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">

      <div className="flex items-center gap-3">

        <div
          className={
            `p-2.5 rounded-xl ${iconClass}`
          }
        >

          {icon}

        </div>


        <div>

          <h1 className="text-2xl font-extrabold text-slate-900">

            {title}

          </h1>


          <p className="text-sm text-slate-500 mt-1">

            {description}

          </p>

        </div>

      </div>


      {action}

    </div>
  );
}


/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({
  title,
  value,
  icon,
  valueClass =
    'text-slate-900'
}: {
  title:
    string;

  value:
    number |
    string;

  icon:
    React.ReactNode;

  valueClass?:
    string;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-5">

      <div className="flex items-start justify-between gap-3">

        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

          {title}

        </p>


        <div className="text-blue-600">

          {icon}

        </div>

      </div>


      <p
        className={
          `text-3xl font-black mt-3 ${valueClass}`
        }
      >

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   ROLE COUNT
   ========================================================= */

function RoleCount({
  label,
  count
}: {
  label:
    string;

  count:
    number;
}) {

  return (

    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">

      <span className="text-xs font-semibold text-slate-700">

        {label}

      </span>


      <span className="text-lg font-black text-blue-600">

        {count}

      </span>

    </div>
  );
}


/* =========================================================
   PROJECT STATUS
   ========================================================= */

function ProjectStatus({
  status
}: {
  status:
    string;
}) {

  let style =
    'bg-slate-100 text-slate-600';


  if (
    status ===
    'ACTIVE'
  ) {

    style =
      'bg-blue-100 text-blue-700';
  }


  if (
    status ===
    'PLANNING'
  ) {

    style =
      'bg-amber-100 text-amber-700';
  }


  if (
    status ===
    'ON_HOLD'
  ) {

    style =
      'bg-orange-100 text-orange-700';
  }


  if (
    status ===
    'COMPLETED'
  ) {

    style =
      'bg-emerald-100 text-emerald-700';
  }


  if (
    status ===
    'CANCELLED'
  ) {

    style =
      'bg-rose-100 text-rose-700';
  }


  return (

    <span
      className={
        `inline-flex px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${style}`
      }
    >

      {status.replaceAll(
        '_',
        ' '
      )}

    </span>
  );
}


/* =========================================================
   REFRESH BUTTON
   ========================================================= */

function RefreshButton({
  loading,
  onClick
}: {
  loading:
    boolean;

  onClick:
    () =>
      Promise<void>;
}) {

  return (

    <button
      type="button"
      disabled={
        loading
      }
      onClick={
        () =>
          void onClick()
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
  );
}


/* =========================================================
   ERROR
   ========================================================= */

function ErrorMessage({
  message
}: {
  message:
    string;
}) {

  return (

    <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

      <AlertCircle className="w-5 h-5 shrink-0" />


      <p className="text-sm">

        {message}

      </p>

    </div>
  );
}


/* =========================================================
   LOADER
   ========================================================= */

function DashboardLoader() {

  return (

    <div className="flex flex-col items-center justify-center min-h-[60vh]">

      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />


      <p className="text-xs text-slate-500 mt-3">

        Loading dashboard...

      </p>

    </div>
  );
}