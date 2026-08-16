'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from 'react';

import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileText,
  FolderKanban,
  Loader2,
  RefreshCcw,
  Send,
  ShieldAlert,
  UserRound,
  Users
} from 'lucide-react';

import {
  getAllProjects
} from '@/lib/project-api';

import {
  getProjectUserStories,
  type UserStoryResponse
} from '@/lib/user-story-api';

import {
  createDeveloperTask,
  getProjectMembers,
  type DeveloperTaskPriority,
  type DeveloperTaskResponse,
  type ProjectMemberResponse
} from '@/lib/task-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


export default function TaskAssignmentPage() {

  /* =========================================================
     AUTH
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const isProjectManager =
    currentUser?.role ===
    'Project Manager';


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


  /* =========================================================
     BACKEND DATA
     ========================================================= */

  const [
    userStories,
    setUserStories
  ] =
    useState<
      UserStoryResponse[]
    >([]);


  const [
    projectMembers,
    setProjectMembers
  ] =
    useState<
      ProjectMemberResponse[]
    >([]);


  /* =========================================================
     FORM
     ========================================================= */

  const [
    selectedUserStoryId,
    setSelectedUserStoryId
  ] =
    useState<number | null>(
      null
    );


  const [
    selectedDeveloperId,
    setSelectedDeveloperId
  ] =
    useState<number | null>(
      null
    );


  const [
    title,
    setTitle
  ] =
    useState('');


  const [
    description,
    setDescription
  ] =
    useState('');


  const [
    priority,
    setPriority
  ] =
    useState<DeveloperTaskPriority>(
      'MEDIUM'
    );


  /* =========================================================
     CREATED TASK
     ========================================================= */

  const [
    createdTask,
    setCreatedTask
  ] =
    useState<
      DeveloperTaskResponse |
      null
    >(null);


  /* =========================================================
     LOADING
     ========================================================= */

  const [
    projectsLoading,
    setProjectsLoading
  ] =
    useState(true);


  const [
    dataLoading,
    setDataLoading
  ] =
    useState(false);


  const [
    assigning,
    setAssigning
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
     ACTIVE DEVELOPERS

     Only developers already assigned to this project.
     ========================================================= */

  const developers =
    useMemo(
      () =>
        projectMembers.filter(
          (
            member:
              ProjectMemberResponse
          ) =>
            member.role ===
              'DEVELOPER' &&
            member.active
        ),

      [
        projectMembers
      ]
    );


  /* =========================================================
     REVIEWED STORIES

     Tasks should be created from finalized/reviewed stories.

     User stories that are not yet reviewed remain visible
     in the information section but cannot be assigned.
     ========================================================= */

  const reviewedStories =
    useMemo(
      () =>
        userStories.filter(
          (
            story:
              UserStoryResponse
          ) =>
            story.reviewed
        ),

      [
        userStories
      ]
    );


  const pendingReviewStories =
    useMemo(
      () =>
        userStories.filter(
          (
            story:
              UserStoryResponse
          ) =>
            !story.reviewed
        ),

      [
        userStories
      ]
    );


  /* =========================================================
     SELECTED USER STORY
     ========================================================= */

  const selectedUserStory =
    useMemo(
      () => {

        if (
          selectedUserStoryId ===
          null
        ) {

          return null;
        }


        return (
          reviewedStories.find(
            (
              story:
                UserStoryResponse
            ) =>
              story.id ===
              selectedUserStoryId
          ) ??
          null
        );
      },

      [
        reviewedStories,
        selectedUserStoryId
      ]
    );


  /* =========================================================
     SELECTED DEVELOPER
     ========================================================= */

  const selectedDeveloper =
    useMemo(
      () => {

        if (
          selectedDeveloperId ===
          null
        ) {

          return null;
        }


        return (
          developers.find(
            (
              developer:
                ProjectMemberResponse
            ) =>
              developer.userId ===
              selectedDeveloperId
          ) ??
          null
        );
      },

      [
        developers,
        selectedDeveloperId
      ]
    );


  /* =========================================================
     LOAD PROJECTS
     ========================================================= */

  const loadProjects =
    useCallback(
      async () => {

        try {

          setProjectsLoading(
            true
          );

          setError(
            null
          );


          const response =
            await getAllProjects();


          setProjects(
            response
          );

        } catch (error) {

          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load projects.'
          );

        } finally {

          setProjectsLoading(
            false
          );
        }
      },

      [
        setProjects
      ]
    );


  /* =========================================================
     LOAD PROJECT DATA
     ========================================================= */

  const loadProjectData =
    useCallback(
      async (
        projectId: number
      ) => {

        try {

          setDataLoading(
            true
          );

          setError(
            null
          );


          const [
            storiesResponse,
            membersResponse
          ] =
            await Promise.all([

              getProjectUserStories(
                projectId
              ),

              getProjectMembers(
                projectId
              ),
            ]);


          setUserStories(
            storiesResponse
          );


          setProjectMembers(
            membersResponse
          );

        } catch (error) {

          setUserStories(
            []
          );

          setProjectMembers(
            []
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load project task assignment data.'
          );

        } finally {

          setDataLoading(
            false
          );
        }
      },

      []
    );


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(
    () => {

      if (
        !isProjectManager
      ) {

        return;
      }


      void loadProjects();

    },
    [
      isProjectManager,
      loadProjects
    ]
  );


  /* =========================================================
     PROJECT CHANGED
     ========================================================= */

  useEffect(
    () => {

      setUserStories(
        []
      );

      setProjectMembers(
        []
      );

      setSelectedUserStoryId(
        null
      );

      setSelectedDeveloperId(
        null
      );

      setTitle(
        ''
      );

      setDescription(
        ''
      );

      setPriority(
        'MEDIUM'
      );

      setCreatedTask(
        null
      );

      setSuccess(
        null
      );

      setError(
        null
      );


      if (
        selectedProjectId ===
        null
      ) {

        return;
      }


      void loadProjectData(
        selectedProjectId
      );

    },
    [
      selectedProjectId,
      loadProjectData
    ]
  );


  /* =========================================================
     USER STORY CHANGED

     Pre-fill task information from the story.
     ========================================================= */

  useEffect(
    () => {

      if (
        !selectedUserStory
      ) {

        setTitle(
          ''
        );

        setDescription(
          ''
        );

        return;
      }


      setTitle(
        selectedUserStory.title
      );


      setDescription(
        [
          selectedUserStory.story,
          '',
          `Source Requirement: ${selectedUserStory.sourceRequirementCode}`
        ].join(
          '\n'
        )
      );


      setPriority(
        normalizePriority(
          selectedUserStory.priority
        )
      );

    },
    [
      selectedUserStory
    ]
  );


  /* =========================================================
     ASSIGN TASK
     ========================================================= */

  const handleAssignTask =
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

      setCreatedTask(
        null
      );


      if (
        selectedProjectId ===
        null
      ) {

        setError(
          'Please select a project.'
        );

        return;
      }


      if (
        !selectedUserStory
      ) {

        setError(
          'Please select a reviewed user story.'
        );

        return;
      }


      if (
        !selectedDeveloper
      ) {

        setError(
          'Please select a developer.'
        );

        return;
      }


      if (
        !title.trim()
      ) {

        setError(
          'Task title is required.'
        );

        return;
      }


      if (
        !description.trim()
      ) {

        setError(
          'Task description is required.'
        );

        return;
      }


      try {

        setAssigning(
          true
        );


        const response =
          await createDeveloperTask({

            /*
             * Requirement is automatically derived
             * from the selected User Story.
             */
            requirementId:
              selectedUserStory.sourceRequirementId,

            userStoryId:
              selectedUserStory.id,

            assignedDeveloperId:
              selectedDeveloper.userId,

            title:
              title.trim(),

            description:
              description.trim(),

            priority,
          });


        setCreatedTask(
          response
        );


        setSuccess(
          `Task #${response.id} was assigned to ${selectedDeveloper.firstName} ${selectedDeveloper.lastName}.`
        );


        /*
         * Keep project selected but clear assignment form.
         */
        setSelectedUserStoryId(
          null
        );

        setSelectedDeveloperId(
          null
        );

        setTitle(
          ''
        );

        setDescription(
          ''
        );

        setPriority(
          'MEDIUM'
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to assign developer task.'
        );

      } finally {

        setAssigning(
          false
        );
      }
    };


  /* =========================================================
     ACCESS CONTROL
     ========================================================= */

  if (
    !isProjectManager
  ) {

    return (

      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-6">

        <div className="p-4 bg-rose-50 rounded-full text-rose-600">

          <ShieldAlert className="w-12 h-12" />

        </div>


        <div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">

            Access Denied

          </h2>


          <p className="text-sm text-slate-500 mt-2">

            Only Project Managers can assign development tasks.

          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (

    <div className="max-w-7xl mx-auto space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">

            <ClipboardList className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">

              Task Assignment

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Assign development work from reviewed user stories to project developers.

            </p>

          </div>

        </div>


        <button
          type="button"
          disabled={
            selectedProjectId ===
              null ||
            dataLoading
          }
          onClick={
            () => {

              if (
                selectedProjectId !==
                null
              ) {

                void loadProjectData(
                  selectedProjectId
                );
              }
            }
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >

          <RefreshCcw
            className={
              `w-4 h-4 ${
                dataLoading
                  ? 'animate-spin'
                  : ''
              }`
            }
          />

          Refresh

        </button>

      </div>


      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {success && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">

          <CheckCircle2 className="w-5 h-5 shrink-0" />

          <div>

            <p className="text-sm font-bold">

              Task Assigned

            </p>

            <p className="text-xs mt-1">

              {success}

            </p>

          </div>

        </div>

      )}


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

          <AlertCircle className="w-5 h-5 shrink-0" />

          <div>

            <p className="text-sm font-bold">

              Unable to assign task

            </p>

            <p className="text-xs mt-1">

              {error}

            </p>

          </div>

        </div>

      )}


      {/* =====================================================
          PROJECT SELECTOR
          ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5">

        <div className="flex flex-col md:flex-row md:items-center gap-4">

          <div className="flex items-center gap-3 shrink-0">

            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">

              <FolderKanban className="w-5 h-5 text-indigo-600" />

            </div>


            <div>

              <p className="text-xs font-bold text-slate-900">

                Project

              </p>

              <p className="text-[10px] text-slate-400">

                Select the project where development work will be assigned.

              </p>

            </div>

          </div>


          <div className="flex-1">

            {projectsLoading ? (

              <div className="flex items-center gap-2 text-xs text-slate-500">

                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />

                Loading projects...

              </div>

            ) : (

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
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
              >

                <option value="">

                  Select a project

                </option>


                {projects.map(
                  (
                    project
                  ) => (

                    <option
                      key={
                        project.id
                      }
                      value={
                        project.id
                      }
                    >

                      Project #
                      {project.projectNumber}
                      {' - '}
                      {project.name}

                    </option>

                  )
                )}

              </select>

            )}

          </div>

        </div>


        {selectedProject && (

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs">

            <div>

              <span className="text-slate-400">

                Project:

              </span>{' '}

              <span className="font-bold text-slate-700">

                {selectedProject.name}

              </span>

            </div>


            <div>

              <span className="text-slate-400">

                Project Manager:

              </span>{' '}

              <span className="font-bold text-slate-700">

                {selectedProject.projectManagerName ||
                  'Not assigned'}

              </span>

            </div>


            <div>

              <span className="text-slate-400">

                Available Developers:

              </span>{' '}

              <span className="font-bold text-slate-700">

                {developers.length}

              </span>

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          NO PROJECT
          ===================================================== */}

      {!projectsLoading &&
        selectedProjectId ===
          null && (

        <div className="min-h-[350px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

          <FolderKanban className="w-10 h-10 text-slate-300" />

          <h2 className="text-sm font-bold text-slate-800 mt-4">

            Select a project

          </h2>

          <p className="text-xs text-slate-500 mt-1">

            Select a project before assigning development tasks.

          </p>

        </div>

      )}


      {/* =====================================================
          DATA LOADING
          ===================================================== */}

      {selectedProjectId !==
        null &&
        dataLoading && (

        <div className="min-h-[350px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />

          <p className="text-xs text-slate-500 mt-3">

            Loading project team and user stories...

          </p>

        </div>

      )}


      {/* =====================================================
          TASK ASSIGNMENT AREA
          ===================================================== */}

      {selectedProjectId !==
        null &&
        !dataLoading && (

        <>

          {/* =================================================
              SUMMARY
              ================================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <SummaryCard
              title="User Stories"
              value={
                userStories.length
              }
              icon={
                <FileText className="w-4 h-4" />
              }
            />


            <SummaryCard
              title="Reviewed Stories"
              value={
                reviewedStories.length
              }
              icon={
                <CheckCircle2 className="w-4 h-4" />
              }
              valueClass="text-emerald-600"
            />


            <SummaryCard
              title="Pending Review"
              value={
                pendingReviewStories.length
              }
              icon={
                <AlertCircle className="w-4 h-4" />
              }
              valueClass="text-amber-600"
            />


            <SummaryCard
              title="Developers"
              value={
                developers.length
              }
              icon={
                <Code2 className="w-4 h-4" />
              }
            />

          </div>


          {/* =================================================
              NO REVIEWED STORIES
              ================================================= */}

          {reviewedStories.length ===
            0 ? (

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">

              <div className="flex items-start gap-3">

                <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />


                <div>

                  <p className="text-sm font-bold text-amber-800">

                    No reviewed user stories available

                  </p>


                  <p className="text-xs text-amber-700 mt-1">

                    The Business Analyst must review generated user stories before the Project Manager assigns development tasks.

                  </p>

                </div>

              </div>

            </div>

          ) : null}


          {/* =================================================
              NO DEVELOPERS
              ================================================= */}

          {developers.length ===
            0 ? (

            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">

              <div className="flex items-start gap-3">

                <Users className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />


                <div>

                  <p className="text-sm font-bold text-rose-800">

                    No developers assigned to this project

                  </p>


                  <p className="text-xs text-rose-700 mt-1">

                    Add at least one Developer through Team Management before assigning development tasks.

                  </p>

                </div>

              </div>

            </div>

          ) : null}


          {/* =================================================
              ASSIGNMENT
              ================================================= */}

          {reviewedStories.length >
            0 &&
            developers.length >
              0 && (

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">

              {/* ===============================================
                  FORM
                  =============================================== */}

              <form
                onSubmit={
                  handleAssignTask
                }
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >

                <div className="p-5 border-b border-slate-100">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

                      <ClipboardList className="w-5 h-5 text-blue-600" />

                    </div>


                    <div>

                      <h2 className="font-extrabold text-slate-900">

                        Create Development Task

                      </h2>


                      <p className="text-xs text-slate-500 mt-1">

                        Link a reviewed user story to a developer.

                      </p>

                    </div>

                  </div>

                </div>


                <div className="p-6 space-y-5">

                  {/* USER STORY */}

                  <div>

                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      User Story *

                    </label>


                    <select
                      value={
                        selectedUserStoryId ??
                        ''
                      }
                      onChange={
                        (
                          event
                        ) => {

                          const value =
                            event.target.value;


                          setSelectedUserStoryId(
                            value
                              ? Number(
                                  value
                                )
                              : null
                          );
                        }
                      }
                      className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-blue-500"
                      required
                    >

                      <option value="">

                        Select reviewed user story

                      </option>


                      {reviewedStories.map(
                        (
                          story:
                            UserStoryResponse
                        ) => (

                          <option
                            key={
                              story.id
                            }
                            value={
                              story.id
                            }
                          >

                            {story.code}
                            {' - '}
                            {story.title}

                          </option>

                        )
                      )}

                    </select>

                  </div>


                  {/* SOURCE REQUIREMENT */}

                  <div>

                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      Source Requirement

                    </label>


                    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">

                      {selectedUserStory ? (

                        <div className="flex items-center gap-3">

                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />


                          <div>

                            <p className="text-xs font-black text-blue-600">

                              {selectedUserStory.sourceRequirementCode}

                            </p>


                            <p className="text-[10px] text-slate-400 mt-0.5">

                              Requirement ID:
                              {' '}
                              {selectedUserStory.sourceRequirementId}

                            </p>

                          </div>

                        </div>

                      ) : (

                        <p className="text-xs text-slate-400">

                          Select a user story first.

                        </p>

                      )}

                    </div>

                  </div>


                  {/* DEVELOPER */}

                  <div>

                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      Assign Developer *

                    </label>


                    <select
                      value={
                        selectedDeveloperId ??
                        ''
                      }
                      onChange={
                        (
                          event
                        ) => {

                          const value =
                            event.target.value;


                          setSelectedDeveloperId(
                            value
                              ? Number(
                                  value
                                )
                              : null
                          );
                        }
                      }
                      className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-blue-500"
                      required
                    >

                      <option value="">

                        Select developer

                      </option>


                      {developers.map(
                        (
                          developer:
                            ProjectMemberResponse
                        ) => (

                          <option
                            key={
                              developer.userId
                            }
                            value={
                              developer.userId
                            }
                          >

                            {developer.firstName}
                            {' '}
                            {developer.lastName}
                            {' - '}
                            {developer.email}

                          </option>

                        )
                      )}

                    </select>

                  </div>


                  {/* TITLE */}

                  <div>

                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      Task Title *

                    </label>


                    <input
                      type="text"
                      value={
                        title
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setTitle(
                            event.target.value
                          )
                      }
                      placeholder="Implement secure login functionality"
                      className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-blue-500"
                      required
                    />

                  </div>


                  {/* DESCRIPTION */}

                  <div>

                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      Task Description *

                    </label>


                    <textarea
                      rows={7}
                      value={
                        description
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setDescription(
                            event.target.value
                          )
                      }
                      placeholder="Describe the implementation work..."
                      className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-xs resize-y focus:outline-none focus:border-blue-500"
                      required
                    />

                  </div>


                  {/* PRIORITY */}

                  <div>

                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      Priority *

                    </label>


                    <select
                      value={
                        priority
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setPriority(
                            event.target.value as
                              DeveloperTaskPriority
                          )
                      }
                      className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-blue-500"
                    >

                      <option value="CRITICAL">

                        Critical

                      </option>

                      <option value="HIGH">

                        High

                      </option>

                      <option value="MEDIUM">

                        Medium

                      </option>

                      <option value="LOW">

                        Low

                      </option>

                    </select>

                  </div>


                  {/* SUBMIT */}

                  <div className="pt-2">

                    <button
                      type="submit"
                      disabled={
                        assigning ||
                        !selectedUserStory ||
                        !selectedDeveloper
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {assigning ? (

                        <Loader2 className="w-4 h-4 animate-spin" />

                      ) : (

                        <Send className="w-4 h-4" />

                      )}


                      {assigning
                        ? 'Assigning Task...'
                        : 'Assign Task to Developer'}

                    </button>

                  </div>

                </div>

              </form>


              {/* ===============================================
                  ASSIGNMENT PREVIEW
                  =============================================== */}

              <div className="space-y-5">

                <div className="bg-slate-900 text-white rounded-2xl overflow-hidden">

                  <div className="p-5 border-b border-slate-800">

                    <h2 className="font-extrabold">

                      Assignment Preview

                    </h2>


                    <p className="text-xs text-slate-400 mt-1">

                      Review the task relationship before assigning it.

                    </p>

                  </div>


                  <div className="p-5 space-y-4">

                    <PreviewItem
                      icon={
                        <FolderKanban className="w-4 h-4" />
                      }
                      title="Project"
                      value={
                        selectedProject?.name ||
                        'Not selected'
                      }
                    />


                    <PreviewItem
                      icon={
                        <FileText className="w-4 h-4" />
                      }
                      title="User Story"
                      value={
                        selectedUserStory
                          ? `${selectedUserStory.code} - ${selectedUserStory.title}`
                          : 'Not selected'
                      }
                    />


                    <PreviewItem
                      icon={
                        <FileText className="w-4 h-4" />
                      }
                      title="Requirement"
                      value={
                        selectedUserStory?.sourceRequirementCode ||
                        'Not selected'
                      }
                    />


                    <PreviewItem
                      icon={
                        <UserRound className="w-4 h-4" />
                      }
                      title="Developer"
                      value={
                        selectedDeveloper
                          ? `${selectedDeveloper.firstName} ${selectedDeveloper.lastName}`
                          : 'Not selected'
                      }
                    />


                    <PreviewItem
                      icon={
                        <AlertCircle className="w-4 h-4" />
                      }
                      title="Priority"
                      value={
                        formatValue(
                          priority
                        )
                      }
                    />

                  </div>

                </div>


                {/* CREATED TASK */}

                {createdTask && (

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                    <div className="flex items-start gap-3">

                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />


                      <div>

                        <p className="text-sm font-bold text-emerald-800">

                          Task #{createdTask.id}

                        </p>


                        <p className="text-xs text-emerald-700 mt-1">

                          {createdTask.title}

                        </p>


                        <div className="mt-3">

                          <span className="inline-flex px-2 py-1 rounded-full bg-white/70 text-[10px] font-bold text-emerald-700">

                            {formatValue(
                              createdTask.status
                            )}

                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>

          )}

        </>

      )}

    </div>
  );
}


/* =========================================================
   SUMMARY
   ========================================================= */

function SummaryCard({
  title,
  value,
  icon,
  valueClass =
    'text-slate-900'
}: {
  title:
    string;

  value:
    number;

  icon:
    React.ReactNode;

  valueClass?:
    string;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center justify-between">

        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">

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


/* =========================================================
   PREVIEW
   ========================================================= */

function PreviewItem({
  icon,
  title,
  value
}: {
  icon:
    React.ReactNode;

  title:
    string;

  value:
    string;
}) {

  return (

    <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

      <div className="flex items-center gap-2 text-slate-500">

        {icon}


        <p className="text-[9px] uppercase tracking-wider font-bold">

          {title}

        </p>

      </div>


      <p className="text-xs text-slate-200 font-semibold mt-2 break-words">

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   PRIORITY NORMALIZER

   User Story priority and Developer Task priority use
   the same values, but normalize defensively.
   ========================================================= */

function normalizePriority(
  value:
    string
): DeveloperTaskPriority {

  switch (
    value
  ) {

    case 'CRITICAL':

      return 'CRITICAL';


    case 'HIGH':

      return 'HIGH';


    case 'LOW':

      return 'LOW';


    default:

      return 'MEDIUM';
  }
}


/* =========================================================
   FORMAT
   ========================================================= */

function formatValue(
  value:
    string
) {

  return value
    .replaceAll(
      '_',
      ' '
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character.toUpperCase()
    );
}