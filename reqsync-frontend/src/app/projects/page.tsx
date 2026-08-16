'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
  UserRound,
  UserRoundCog
} from 'lucide-react';

import {
  useRouter
} from 'next/navigation';

import {
  assignProjectManager,
  createProject,
  deleteProject,
  getAllProjects,
  updateProject,
  type ProjectResponse
} from '@/lib/project-api';

import {
  getEmployeesByRole,
  type EmployeeResponse
} from '@/lib/user-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


export default function ProjectsPage() {

  const router =
    useRouter();


  /* =========================================================
     AUTH
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const isCEO =
    currentUser?.role ===
    'CEO';


  /* =========================================================
     PROJECT STORE
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


  const upsertProject =
    useBackendProjectStore(
      (state) =>
        state.upsertProject
    );


  const removeProject =
    useBackendProjectStore(
      (state) =>
        state.removeProject
    );


  /* =========================================================
     CREATE PROJECT FORM
     ========================================================= */

  const [
    name,
    setName
  ] =
    useState('');


  const [
    description,
    setDescription
  ] =
    useState('');


  /* =========================================================
     PAGE STATE
     ========================================================= */

  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    creating,
    setCreating
  ] =
    useState(false);


  const [
    deletingId,
    setDeletingId
  ] =
    useState<number | null>(
      null
    );


  /*
   * Project currently being marked completed.
   */
  const [
    completingProjectId,
    setCompletingProjectId
  ] =
    useState<number | null>(
      null
    );


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
     PROJECT MANAGER STATE
     ========================================================= */

  const [
    projectManagers,
    setProjectManagers
  ] =
    useState<EmployeeResponse[]>(
      []
    );


  const [
    managersLoading,
    setManagersLoading
  ] =
    useState(false);


  const [
    managerSelections,
    setManagerSelections
  ] =
    useState<
      Record<
        number,
        number | ''
      >
    >({});


  const [
    assigningProjectId,
    setAssigningProjectId
  ] =
    useState<number | null>(
      null
    );


  /* =========================================================
     LOAD PROJECTS
     ========================================================= */

  const loadProjects =
    useCallback(
      async () => {

        setError(
          null
        );


        try {

          setLoading(
            true
          );


          const response =
            await getAllProjects();


          setProjects(
            response
          );


          /*
           * Populate dropdown selections from
           * currently assigned PMs.
           */
          const selections:
            Record<
              number,
              number | ''
            > = {};


          response.forEach(
            (project) => {

              selections[
                project.id
              ] =
                project.projectManagerId ??
                '';
            }
          );


          setManagerSelections(
            selections
          );

        } catch (error) {

          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load projects.'
          );

        } finally {

          setLoading(
            false
          );
        }
      },

      [
        setProjects
      ]
    );


  /* =========================================================
     LOAD PROJECT MANAGERS

     CEO ONLY
     ========================================================= */

  const loadProjectManagers =
    useCallback(
      async () => {

        if (
          !isCEO
        ) {

          return;
        }


        try {

          setManagersLoading(
            true
          );


          const response =
            await getEmployeesByRole(
              'PROJECT_MANAGER'
            );


          setProjectManagers(
            response.filter(
              (employee) =>
                employee.enabled &&
                !employee.accountLocked
            )
          );

        } catch (error) {

          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load Project Managers.'
          );

        } finally {

          setManagersLoading(
            false
          );
        }
      },

      [
        isCEO
      ]
    );


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(
    () => {

      void loadProjects();

    },
    [
      loadProjects
    ]
  );


  useEffect(
    () => {

      if (
        isCEO
      ) {

        void loadProjectManagers();
      }

    },
    [
      isCEO,
      loadProjectManagers
    ]
  );


  /* =========================================================
     CREATE PROJECT
     ========================================================= */

  const handleCreateProject =
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
        !isCEO
      ) {

        setError(
          'Only the CEO can create projects.'
        );

        return;
      }


      if (
        !name.trim()
      ) {

        setError(
          'Project name is required.'
        );

        return;
      }


      try {

        setCreating(
          true
        );


        const createdProject =
          await createProject({

            name:
              name.trim(),

            description:
              description.trim(),
          });


        upsertProject(
          createdProject
        );


        selectProject(
          createdProject.id
        );


        setManagerSelections(
          (current) => ({
            ...current,

            [createdProject.id]:
              createdProject.projectManagerId ??
              ''
          })
        );


        setName(
          ''
        );

        setDescription(
          ''
        );


        setSuccess(
          `Project "${createdProject.name}" created successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Project creation failed.'
        );

      } finally {

        setCreating(
          false
        );
      }
    };


  /* =========================================================
     ASSIGN PROJECT MANAGER

     CEO ONLY
     ========================================================= */

  const handleAssignProjectManager =
    async (
      project:
        ProjectResponse
    ) => {

      if (
        !isCEO
      ) {

        setError(
          'Only the CEO can assign a Project Manager.'
        );

        return;
      }


      const managerId =
        managerSelections[
          project.id
        ];


      if (
        !managerId
      ) {

        setError(
          'Please select a Project Manager first.'
        );

        return;
      }


      try {

        setAssigningProjectId(
          project.id
        );


        setError(
          null
        );


        setSuccess(
          null
        );


        const updatedProject =
          await assignProjectManager(
            project.id,
            Number(
              managerId
            )
          );


        /*
         * Update frontend store using
         * backend response.
         */
        upsertProject(
          updatedProject
        );


        setManagerSelections(
          (current) => ({
            ...current,

            [project.id]:
              updatedProject.projectManagerId ??
              ''
          })
        );


        setSuccess(
          `${updatedProject.projectManagerName ?? 'Project Manager'} was assigned to "${updatedProject.name}".`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to assign Project Manager.'
        );

      } finally {

        setAssigningProjectId(
          null
        );
      }
    };


  /* =========================================================
     COMPLETE PROJECT

     CEO ONLY
     ========================================================= */

  const handleCompleteProject =
    async (
      project:
        ProjectResponse
    ) => {

      if (
        !isCEO
      ) {

        setError(
          'Only the CEO can complete projects.'
        );

        return;
      }


      /*
       * Do nothing if already completed.
       */
      if (
        project.status ===
        'COMPLETED'
      ) {

        return;
      }


      const confirmed =
        window.confirm(
          `Mark project "${project.name}" as completed?`
        );


      if (
        !confirmed
      ) {

        return;
      }


      try {

        setCompletingProjectId(
          project.id
        );


        setError(
          null
        );


        setSuccess(
          null
        );


        /*
         * PUT /api/projects/{projectId}
         *
         * {
         *   status: "COMPLETED"
         * }
         */
        const updatedProject =
          await updateProject(
            project.id,
            {
              status:
                'COMPLETED',
            }
          );


        /*
         * Use the response returned from Spring Boot.
         */
        upsertProject(
          updatedProject
        );


        setSuccess(
          `Project "${updatedProject.name}" was marked as completed successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to complete project.'
        );

      } finally {

        setCompletingProjectId(
          null
        );
      }
    };


  /* =========================================================
     DELETE PROJECT
     ========================================================= */

  const handleDelete =
    async (
      project:
        ProjectResponse
    ) => {

      if (
        !isCEO
      ) {

        setError(
          'Only the CEO can delete projects.'
        );

        return;
      }


      const confirmed =
        window.confirm(
          `Delete project "${project.name}"?`
        );


      if (
        !confirmed
      ) {

        return;
      }


      try {

        setDeletingId(
          project.id
        );


        setError(
          null
        );


        setSuccess(
          null
        );


        await deleteProject(
          project.id
        );


        removeProject(
          project.id
        );


        setSuccess(
          `Project "${project.name}" deleted successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to delete project.'
        );

      } finally {

        setDeletingId(
          null
        );
      }
    };


  /* =========================================================
     USE PROJECT
     ========================================================= */

  const handleUseProject =
    (
      projectId:
        number
    ) => {

      selectProject(
        projectId
      );


      /*
       * CEO does not need requirement extraction
       * as their immediate workflow.
       *
       * PM moves to Team Management.
       */
      if (
        currentUser?.role ===
        'Project Manager'
      ) {

        router.push(
          '/team-management'
        );

        return;
      }


      router.push(
        '/projects'
      );
    };


  /* =========================================================
     FORMAT STATUS
     ========================================================= */

  const formatStatus =
    (
      status:
        string
    ) =>
      status
        .replaceAll(
          '_',
          ' '
        )
        .toLowerCase()
        .replace(
          /\b\w/g,
          (character) =>
            character.toUpperCase()
        );


  /* =========================================================
     STATUS COLOR
     ========================================================= */

  const getStatusStyle =
    (
      status:
        string
    ) => {

      switch (
        status
      ) {

        case 'ACTIVE':

          return (
            'bg-emerald-100 text-emerald-700'
          );


        case 'PLANNING':

          return (
            'bg-blue-100 text-blue-700'
          );


        case 'ON_HOLD':

          return (
            'bg-amber-100 text-amber-700'
          );


        case 'COMPLETED':

          return (
            'bg-indigo-100 text-indigo-700'
          );


        case 'CANCELLED':

          return (
            'bg-rose-100 text-rose-700'
          );


        default:

          return (
            'bg-slate-100 text-slate-600'
          );
      }
    };


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="max-w-7xl mx-auto space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">

            <FolderKanban className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              Projects

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              {isCEO
                ? 'Create projects, assign Project Managers and complete finished projects.'
                : 'View assigned projects and continue project setup.'}

            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={
            () =>
              void loadProjects()
          }
          disabled={
            loading
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
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

          Refresh Projects

        </button>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

          <AlertCircle className="w-5 h-5 shrink-0" />


          <p className="text-sm">

            {error}

          </p>

        </div>

      )}


      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {success && (

        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">

          <CheckCircle2 className="w-5 h-5 shrink-0" />


          <p className="text-sm font-semibold">

            {success}

          </p>

        </div>

      )}


      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div
        className={
          isCEO
            ? 'grid grid-cols-1 lg:grid-cols-3 gap-6'
            : 'grid grid-cols-1 gap-6'
        }
      >

        {/* ===================================================
            CREATE PROJECT - CEO ONLY
            =================================================== */}

        {isCEO && (

          <form
            onSubmit={
              handleCreateProject
            }
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 self-start"
          >

            <div>

              <h2 className="font-extrabold text-slate-900">

                Create Project

              </h2>


              <p className="text-xs text-slate-500 mt-1">

                Create a new project for your organization.

              </p>

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1.5">

                Project Name

              </label>


              <input
                type="text"
                value={
                  name
                }
                onChange={
                  (event) =>
                    setName(
                      event.target.value
                    )
                }
                placeholder="Enter project name"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              />

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 mb-1.5">

                Description

              </label>


              <textarea
                rows={8}
                value={
                  description
                }
                onChange={
                  (event) =>
                    setDescription(
                      event.target.value
                    )
                }
                placeholder="Describe the project..."
                className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm resize-y focus:outline-none focus:border-blue-500 focus:bg-white"
              />

            </div>


            <button
              type="submit"
              disabled={
                creating
              }
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold"
            >

              {creating ? (

                <>

                  <Loader2 className="w-4 h-4 animate-spin" />

                  Creating...

                </>

              ) : (

                <>

                  <Plus className="w-4 h-4" />

                  Create Project

                </>

              )}

            </button>

          </form>

        )}


        {/* ===================================================
            PROJECT LIST
            =================================================== */}

        <div
          className={
            isCEO
              ? 'lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden'
              : 'bg-white border border-slate-200 rounded-2xl overflow-hidden'
          }
        >

          <div className="p-5 border-b border-slate-100">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-extrabold text-slate-900">

                  Projects

                </h2>


                <p className="text-xs text-slate-500 mt-1">

                  Projects loaded from ReqSync.

                </p>

              </div>


              {!loading && (

                <span className="text-xs font-bold text-slate-500">

                  {projects.length}{' '}

                  {projects.length ===
                  1
                    ? 'Project'
                    : 'Projects'}

                </span>

              )}

            </div>

          </div>


          {loading ? (

            <div className="min-h-72 flex items-center justify-center">

              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />

            </div>

          ) : projects.length ===
            0 ? (

            <div className="min-h-72 flex flex-col items-center justify-center text-center">

              <FolderKanban className="w-10 h-10 text-slate-300" />


              <p className="text-sm font-bold text-slate-700 mt-3">

                No projects found

              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {projects.map(
                (project) => (

                  <div
                    key={
                      project.id
                    }
                    className={
                      `p-5 ${
                        selectedProjectId ===
                        project.id
                          ? 'bg-blue-50/60'
                          : 'hover:bg-slate-50'
                      }`
                    }
                  >

                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

                      {/* =====================================
                          PROJECT DETAILS
                          ===================================== */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-xs font-black text-blue-600">

                            Project #
                            {project.projectNumber}

                          </span>


                          <span
                            className={
                              `text-[10px] font-bold px-2 py-1 rounded-full ${
                                getStatusStyle(
                                  project.status
                                )
                              }`
                            }
                          >

                            {formatStatus(
                              project.status
                            )}

                          </span>


                          {selectedProjectId ===
                            project.id && (

                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">

                              SELECTED

                            </span>

                          )}

                        </div>


                        <h3 className="font-extrabold text-slate-900 mt-2">

                          {project.name}

                        </h3>


                        <p className="text-xs text-slate-500 mt-1 max-w-xl">

                          {project.description ||
                            'No description provided.'}

                        </p>


                        {/* ===================================
                            CURRENT PM
                            =================================== */}

                        <div className="flex items-center gap-2 mt-4">

                          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">

                            <UserRound className="w-3.5 h-3.5 text-indigo-600" />

                          </div>


                          <div>

                            <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">

                              Project Manager

                            </p>


                            <p
                              className={
                                `text-xs font-semibold ${
                                  project.projectManagerName
                                    ? 'text-slate-700'
                                    : 'text-amber-600'
                                }`
                              }
                            >

                              {project.projectManagerName ||
                                'Not assigned'}

                            </p>

                          </div>

                        </div>


                        {/* ===================================
                            CEO PM ASSIGNMENT
                            =================================== */}

                        {isCEO && (

                          <div className="mt-4 max-w-md rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">

                            <div className="flex items-center gap-2 mb-2">

                              <UserRoundCog className="w-4 h-4 text-indigo-600" />


                              <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-700">

                                Assign Project Manager

                              </p>

                            </div>


                            <div className="flex flex-col sm:flex-row gap-2">

                              <select
                                value={
                                  managerSelections[
                                    project.id
                                  ] ??
                                  ''
                                }
                                disabled={
                                  managersLoading ||
                                  assigningProjectId ===
                                    project.id ||
                                  project.status ===
                                    'COMPLETED'
                                }
                                onChange={
                                  (event) => {

                                    const value =
                                      event.target.value;


                                    setManagerSelections(
                                      (current) => ({
                                        ...current,

                                        [project.id]:
                                          value
                                            ? Number(
                                                value
                                              )
                                            : ''
                                      })
                                    );
                                  }
                                }
                                className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg bg-white text-xs text-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                              >

                                <option value="">

                                  Select Project Manager

                                </option>


                                {projectManagers.map(
                                  (manager) => (

                                    <option
                                      key={
                                        manager.id
                                      }
                                      value={
                                        manager.id
                                      }
                                    >

                                      {manager.firstName}{' '}
                                      {manager.lastName}
                                      {' - '}
                                      {manager.email}

                                    </option>

                                  )
                                )}

                              </select>


                              <button
                                type="button"
                                disabled={
                                  !managerSelections[
                                    project.id
                                  ] ||
                                  assigningProjectId ===
                                    project.id ||
                                  project.status ===
                                    'COMPLETED'
                                }
                                onClick={
                                  () =>
                                    void handleAssignProjectManager(
                                      project
                                    )
                                }
                                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                              >

                                {assigningProjectId ===
                                project.id ? (

                                  <Loader2 className="w-4 h-4 animate-spin" />

                                ) : project.projectManagerId ? (

                                  'Reassign'

                                ) : (

                                  'Assign'

                                )}

                              </button>

                            </div>


                            {managersLoading && (

                              <p className="text-[10px] text-indigo-500 mt-2">

                                Loading Project Managers...

                              </p>

                            )}

                          </div>

                        )}


                        <p className="text-[10px] text-slate-400 mt-3">

                          Created{' '}

                          {new Date(
                            project.createdAt
                          ).toLocaleDateString()}

                        </p>

                      </div>


                      {/* =====================================
                          ACTIONS
                          ===================================== */}

                      <div className="flex flex-wrap items-center gap-2 shrink-0">

                        {/* PM ONLY WORKFLOW BUTTON */}

                        {!isCEO && (

                          <button
                            type="button"
                            onClick={
                              () =>
                                handleUseProject(
                                  project.id
                                )
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                          >

                            {selectedProjectId ===
                            project.id
                              ? 'Continue'
                              : 'Manage Team'}

                            <ArrowRight className="w-4 h-4" />

                          </button>

                        )}


                        {/* =================================
                            CEO COMPLETE PROJECT
                            ================================= */}

                        {isCEO &&
                          project.status !==
                            'COMPLETED' && (

                          <button
                            type="button"
                            disabled={
                              completingProjectId ===
                                project.id ||
                              deletingId ===
                                project.id
                            }
                            onClick={
                              () =>
                                void handleCompleteProject(
                                  project
                                )
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Mark Project Complete"
                          >

                            {completingProjectId ===
                            project.id ? (

                              <Loader2 className="w-4 h-4 animate-spin" />

                            ) : (

                              <CheckCircle2 className="w-4 h-4" />

                            )}


                            {completingProjectId ===
                            project.id
                              ? 'Completing...'
                              : 'Mark Complete'}

                          </button>

                        )}


                        {/* =================================
                            COMPLETED INDICATOR
                            ================================= */}

                        {isCEO &&
                          project.status ===
                            'COMPLETED' && (

                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">

                            <CheckCircle2 className="w-4 h-4" />

                            Completed

                          </div>

                        )}


                        {/* CEO DELETE */}

                        {isCEO && (

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                                project.id ||
                              completingProjectId ===
                                project.id
                            }
                            onClick={
                              () =>
                                void handleDelete(
                                  project
                                )
                            }
                            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                            title="Delete Project"
                          >

                            {deletingId ===
                            project.id ? (

                              <Loader2 className="w-4 h-4 animate-spin" />

                            ) : (

                              <Trash2 className="w-4 h-4" />

                            )}

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}