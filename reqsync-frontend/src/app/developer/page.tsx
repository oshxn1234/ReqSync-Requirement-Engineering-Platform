'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Code2,
  ExternalLink,
  FileCode2,
  FileText,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  History,
  Loader2,
  Play,
  RefreshCcw,
  Search,
  Send,
  ShieldAlert,
  Timer,
  X
} from 'lucide-react';

import {
  getDeveloperTaskSubmissions,
  getMyDeveloperTasks,
  submitDeveloperWork,
  updateDeveloperTaskStatus,
  type DeveloperSubmissionResponse,
  type DeveloperTaskResponse,
  type DeveloperTaskStatus
} from '@/lib/developer-api';

import {
  useProjectStore
} from '@/store/projectStore';


export default function DeveloperWorkspacePage() {

  /* =========================================================
     AUTH
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const isDeveloper =
    currentUser?.role ===
    'Developer';


  /* =========================================================
     TASK DATA
     ========================================================= */

  const [
    tasks,
    setTasks
  ] =
    useState<
      DeveloperTaskResponse[]
    >([]);


  const [
    selectedTaskId,
    setSelectedTaskId
  ] =
    useState<number | null>(
      null
    );


  const [
    submissions,
    setSubmissions
  ] =
    useState<
      DeveloperSubmissionResponse[]
    >([]);


  /* =========================================================
     LOADING
     ========================================================= */

  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    submissionsLoading,
    setSubmissionsLoading
  ] =
    useState(false);


  const [
    statusUpdating,
    setStatusUpdating
  ] =
    useState(false);


  const [
    submitting,
    setSubmitting
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
     FILTERS
     ========================================================= */

  const [
    searchQuery,
    setSearchQuery
  ] =
    useState('');


  const [
    statusFilter,
    setStatusFilter
  ] =
    useState<
      DeveloperTaskStatus |
      'ALL'
    >('ALL');


  /* =========================================================
     SUBMISSION MODAL
     ========================================================= */

  const [
    submissionOpen,
    setSubmissionOpen
  ] =
    useState(false);


  const [
    implementationNotes,
    setImplementationNotes
  ] =
    useState('');


  const [
    githubBranch,
    setGithubBranch
  ] =
    useState('');


  const [
    pullRequestUrl,
    setPullRequestUrl
  ] =
    useState('');


  const [
    commitHash,
    setCommitHash
  ] =
    useState('');


  /* =========================================================
     SELECTED TASK
     ========================================================= */

  const selectedTask =
    useMemo(
      () => {

        if (
          tasks.length ===
          0
        ) {

          return null;
        }


        if (
          selectedTaskId ===
          null
        ) {

          return tasks[0];
        }


        return (
          tasks.find(
            (task) =>
              task.id ===
              selectedTaskId
          ) ??
          tasks[0]
        );
      },

      [
        tasks,
        selectedTaskId
      ]
    );


  /* =========================================================
     FILTERED TASKS
     ========================================================= */

  const filteredTasks =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        return tasks.filter(
          (task) => {

            const matchesSearch =
              !query ||

              task.title
                .toLowerCase()
                .includes(
                  query
                ) ||

              task.description
                .toLowerCase()
                .includes(
                  query
                ) ||

              String(
                task.id
              ).includes(
                query
              );


            const matchesStatus =
              statusFilter ===
                'ALL' ||
              task.status ===
                statusFilter;


            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },

      [
        tasks,
        searchQuery,
        statusFilter
      ]
    );


  /* =========================================================
     COUNTS
     ========================================================= */

  const todoCount =
    tasks.filter(
      (task) =>
        task.status ===
        'TODO'
    ).length;


  const inProgressCount =
    tasks.filter(
      (task) =>
        task.status ===
        'IN_PROGRESS' ||
        task.status ===
        'CHANGES_REQUESTED'
    ).length;


  const qaCount =
    tasks.filter(
      (task) =>
        task.status ===
          'READY_FOR_QA' ||
        task.status ===
          'QA_IN_PROGRESS'
    ).length;


  const completedCount =
    tasks.filter(
      (task) =>
        task.status ===
        'COMPLETED'
    ).length;


  /* =========================================================
     LOAD TASKS
     ========================================================= */

  const loadTasks =
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
            await getMyDeveloperTasks();


          setTasks(
            response
          );


          if (
            response.length >
            0
          ) {

            setSelectedTaskId(
              (
                current
              ) => {

                const exists =
                  response.some(
                    (task) =>
                      task.id ===
                      current
                  );


                return exists
                  ? current
                  : response[0].id;
              }
            );

          } else {

            setSelectedTaskId(
              null
            );
          }

        } catch (error) {

          setTasks(
            []
          );


          setSelectedTaskId(
            null
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load your developer tasks.'
          );

        } finally {

          setLoading(
            false
          );
        }
      },

      []
    );


  /* =========================================================
     LOAD SUBMISSIONS
     ========================================================= */

  const loadSubmissions =
    useCallback(
      async (
        taskId:
          number
      ) => {

        try {

          setSubmissionsLoading(
            true
          );


          const response =
            await getDeveloperTaskSubmissions(
              taskId
            );


          setSubmissions(
            response
          );

        } catch (error) {

          setSubmissions(
            []
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load task submissions.'
          );

        } finally {

          setSubmissionsLoading(
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
        !isDeveloper
      ) {

        return;
      }


      void loadTasks();

    },
    [
      isDeveloper,
      loadTasks
    ]
  );


  /* =========================================================
     SELECTED TASK CHANGED
     ========================================================= */

  useEffect(
    () => {

      setSubmissions(
        []
      );


      if (
        selectedTaskId ===
        null
      ) {

        return;
      }


      void loadSubmissions(
        selectedTaskId
      );

    },
    [
      selectedTaskId,
      loadSubmissions
    ]
  );


  /* =========================================================
     START TASK
     ========================================================= */

  const handleStartTask =
    async () => {

      if (
        !selectedTask
      ) {

        return;
      }


      try {

        setStatusUpdating(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        const updated =
          await updateDeveloperTaskStatus(
            selectedTask.id,
            'IN_PROGRESS'
          );


        updateTaskInState(
          updated
        );


        setSuccess(
          `Task #${updated.id} is now in progress.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to start the task.'
        );

      } finally {

        setStatusUpdating(
          false
        );
      }
    };


  /* =========================================================
     SUBMIT DEVELOPMENT WORK
     ========================================================= */

  const handleSubmitWork =
    async () => {

      if (
        !selectedTask
      ) {

        return;
      }


      if (
        !implementationNotes.trim()
      ) {

        setError(
          'Implementation notes are required.'
        );

        return;
      }


      try {

        setSubmitting(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        await submitDeveloperWork(
          selectedTask.id,
          {
            implementationNotes:
              implementationNotes.trim(),

            githubBranch:
              githubBranch.trim() ||
              undefined,

            pullRequestUrl:
              pullRequestUrl.trim() ||
              undefined,

            commitHash:
              commitHash.trim() ||
              undefined,
          }
        );


        /*
         * Submission backend automatically
         * changes the task to READY_FOR_QA.
         */
        const refreshedTasks =
          await getMyDeveloperTasks();


        setTasks(
          refreshedTasks
        );


        const updatedTask =
          refreshedTasks.find(
            (task) =>
              task.id ===
              selectedTask.id
          );


        if (
          updatedTask
        ) {

          setSelectedTaskId(
            updatedTask.id
          );
        }


        await loadSubmissions(
          selectedTask.id
        );


        setImplementationNotes(
          ''
        );

        setGithubBranch(
          ''
        );

        setPullRequestUrl(
          ''
        );

        setCommitHash(
          ''
        );

        setSubmissionOpen(
          false
        );


        setSuccess(
          'Development work submitted successfully and is now ready for QA.'
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to submit development work.'
        );

      } finally {

        setSubmitting(
          false
        );
      }
    };


  /* =========================================================
     UPDATE TASK IN STATE
     ========================================================= */

  const updateTaskInState =
    (
      updated:
        DeveloperTaskResponse
    ) => {

      setTasks(
        (
          current
        ) =>
          current.map(
            (task) =>
              task.id ===
              updated.id
                ? updated
                : task
          )
      );
    };


  /* =========================================================
     FORMAT
     ========================================================= */

  const formatStatus =
    (
      value:
        string
    ) =>
      value
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
     ACCESS CONTROL
     ========================================================= */

  if (
    !isDeveloper
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

            The Developer Workspace is only available to Developer accounts.

          </p>

        </div>

      </div>
    );
  }


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="max-w-7xl mx-auto space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">

            <Code2 className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              Developer Workspace

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              View assigned development tasks, submit completed work and track QA progress.

            </p>

          </div>

        </div>


        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            () =>
              void loadTasks()
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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

          Refresh Tasks

        </button>

      </div>


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
          ERROR
          ===================================================== */}

      {error && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

          <AlertCircle className="w-5 h-5 shrink-0" />


          <div>

            <p className="text-sm font-bold">

              Request failed

            </p>


            <p className="text-xs mt-1">

              {error}

            </p>

          </div>

        </div>

      )}


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      {!loading && (

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <SummaryCard
            title="To Do"
            value={
              todoCount
            }
            icon={
              <CircleDot className="w-4 h-4" />
            }
          />


          <SummaryCard
            title="In Progress"
            value={
              inProgressCount
            }
            icon={
              <Timer className="w-4 h-4" />
            }
          />


          <SummaryCard
            title="QA Review"
            value={
              qaCount
            }
            icon={
              <FileCode2 className="w-4 h-4" />
            }
          />


          <SummaryCard
            title="Completed"
            value={
              completedCount
            }
            icon={
              <CheckCircle2 className="w-4 h-4" />
            }
          />

        </div>

      )}


      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading ? (

        <div className="min-h-[420px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />


          <p className="text-xs text-slate-500 mt-3">

            Loading your tasks...

          </p>

        </div>

      ) : tasks.length ===
        0 ? (

        /* ===================================================
           EMPTY
           =================================================== */

        <div className="min-h-[420px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">

            <Code2 className="w-7 h-7 text-blue-400" />

          </div>


          <h2 className="text-base font-bold text-slate-800 mt-4">

            No development tasks assigned

          </h2>


          <p className="text-sm text-slate-500 mt-2 max-w-md">

            You do not currently have any development tasks assigned to your account.

          </p>

        </div>

      ) : (

        <>

          {/* =================================================
              FILTERS
              ================================================= */}

          <div className="bg-white border border-slate-200 rounded-2xl p-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

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
                  placeholder="Search development tasks..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500"
                />

              </div>


              <select
                value={
                  statusFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setStatusFilter(
                      event.target.value as
                        DeveloperTaskStatus |
                        'ALL'
                    )
                }
                className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
              >

                <option value="ALL">
                  All Statuses
                </option>

                <option value="TODO">
                  To Do
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="READY_FOR_QA">
                  Ready for QA
                </option>

                <option value="QA_IN_PROGRESS">
                  QA In Progress
                </option>

                <option value="CHANGES_REQUESTED">
                  Changes Requested
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

              </select>

            </div>

          </div>


          {/* =================================================
              TASK LIST + DETAILS
              ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-6">

            {/* ===============================================
                TASK LIST
                =============================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden self-start">

              <div className="p-5 border-b border-slate-100">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="font-extrabold text-slate-900">

                      My Tasks

                    </h2>


                    <p className="text-xs text-slate-500 mt-1">

                      {filteredTasks.length}
                      {' '}
                      {filteredTasks.length ===
                      1
                        ? 'task'
                        : 'tasks'}
                      {' '}
                      shown

                    </p>

                  </div>

                </div>

              </div>


              <div className="divide-y divide-slate-100">

                {filteredTasks.length ===
                0 ? (

                  <div className="p-10 text-center text-sm text-slate-400">

                    No matching tasks found.

                  </div>

                ) : (

                  filteredTasks.map(
                    (
                      task
                    ) => (

                      <button
                        key={
                          task.id
                        }
                        type="button"
                        onClick={
                          () =>
                            setSelectedTaskId(
                              task.id
                            )
                        }
                        className={
                          `w-full text-left p-5 transition-colors ${
                            selectedTask?.id ===
                            task.id
                              ? 'bg-blue-50/60'
                              : 'hover:bg-slate-50'
                          }`
                        }
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <span className="text-xs font-black text-blue-600">

                                TASK-
                                {task.id}

                              </span>


                              <TaskStatusBadge
                                status={
                                  task.status
                                }
                              />


                              <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">

                                {task.priority}

                              </span>

                            </div>


                            <h3 className="font-bold text-slate-900 mt-2">

                              {task.title}

                            </h3>


                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">

                              {task.description}

                            </p>


                            <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-slate-400">

                              <span>

                                Requirement #
                                {task.requirementId}

                              </span>


                              <span>

                                Story #
                                {task.userStoryId}

                              </span>

                            </div>

                          </div>


                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />

                        </div>

                      </button>

                    )
                  )

                )}

              </div>

            </div>


            {/* ===============================================
                TASK DETAIL
                =============================================== */}

            <div className="space-y-5 self-start">

              {selectedTask && (

                <>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                    <div className="p-5 border-b border-slate-100">

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <p className="text-xs font-black text-blue-600">

                            TASK-
                            {selectedTask.id}

                          </p>


                          <h2 className="font-extrabold text-slate-900 mt-1">

                            {selectedTask.title}

                          </h2>

                        </div>


                        <TaskStatusBadge
                          status={
                            selectedTask.status
                          }
                        />

                      </div>

                    </div>


                    <div className="p-5 space-y-5">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">

                          Description

                        </p>


                        <p className="text-sm text-slate-700 leading-relaxed mt-2">

                          {selectedTask.description}

                        </p>

                      </div>


                      <div className="grid grid-cols-2 gap-3">

                        <DetailItem
                          title="Requirement"
                          value={
                            `#${selectedTask.requirementId}`
                          }
                        />


                        <DetailItem
                          title="User Story"
                          value={
                            `#${selectedTask.userStoryId}`
                          }
                        />


                        <DetailItem
                          title="Priority"
                          value={
                            selectedTask.priority
                          }
                        />


                        <DetailItem
                          title="Status"
                          value={
                            formatStatus(
                              selectedTask.status
                            )
                          }
                        />

                      </div>


                      {/* =====================================
                          ACTION AREA
                          ===================================== */}

                      {selectedTask.status ===
                        'TODO' && (

                        <button
                          type="button"
                          disabled={
                            statusUpdating
                          }
                          onClick={
                            () =>
                              void handleStartTask()
                          }
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
                        >

                          {statusUpdating ? (

                            <Loader2 className="w-4 h-4 animate-spin" />

                          ) : (

                            <Play className="w-4 h-4" />

                          )}

                          Start Development

                        </button>

                      )}


                      {(selectedTask.status ===
                        'IN_PROGRESS' ||
                        selectedTask.status ===
                          'CHANGES_REQUESTED') && (

                        <button
                          type="button"
                          onClick={
                            () =>
                              setSubmissionOpen(
                                true
                              )
                          }
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                        >

                          <Send className="w-4 h-4" />

                          {selectedTask.status ===
                          'CHANGES_REQUESTED'
                            ? 'Resubmit Work'
                            : 'Submit Development Work'}

                        </button>

                      )}


                      {selectedTask.status ===
                        'READY_FOR_QA' && (

                        <StatusMessage
                          title="Waiting for QA Review"
                          message="Your submission is ready for a QA Engineer to review."
                        />

                      )}


                      {selectedTask.status ===
                        'QA_IN_PROGRESS' && (

                        <StatusMessage
                          title="QA Review In Progress"
                          message="A QA Engineer is currently reviewing this implementation."
                        />

                      )}


                      {selectedTask.status ===
                        'CHANGES_REQUESTED' && (

                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">

                          <p className="text-xs font-bold text-amber-800">

                            Changes Requested

                          </p>


                          <p className="text-[11px] text-amber-700 mt-1">

                            Review the QA feedback, update your implementation and submit a new version.

                          </p>

                        </div>

                      )}


                      {selectedTask.status ===
                        'COMPLETED' && (

                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">

                          <div className="flex items-start gap-2">

                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />


                            <div>

                              <p className="text-xs font-bold text-emerald-800">

                                Task Completed

                              </p>


                              <p className="text-[11px] text-emerald-700 mt-1">

                                This development task has completed its development and QA workflow.

                              </p>

                            </div>

                          </div>

                        </div>

                      )}

                    </div>

                  </div>


                  {/* =========================================
                      SUBMISSION HISTORY
                      ========================================= */}

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                    <div className="p-5 border-b border-slate-100">

                      <div className="flex items-center gap-2">

                        <History className="w-4 h-4 text-indigo-600" />


                        <h2 className="font-extrabold text-slate-900">

                          Submission History

                        </h2>

                      </div>


                      <p className="text-xs text-slate-500 mt-1">

                        Previous development submissions for this task.

                      </p>

                    </div>


                    <div className="p-5">

                      {submissionsLoading ? (

                        <div className="py-10 flex justify-center">

                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />

                        </div>

                      ) : submissions.length ===
                        0 ? (

                        <div className="py-10 text-center">

                          <FileText className="w-8 h-8 text-slate-300 mx-auto" />


                          <p className="text-xs font-semibold text-slate-600 mt-3">

                            No submissions yet

                          </p>


                          <p className="text-[10px] text-slate-400 mt-1">

                            Your development submissions will appear here.

                          </p>

                        </div>

                      ) : (

                        <div className="space-y-3">

                          {submissions
                            .slice()
                            .reverse()
                            .map(
                              (
                                submission,
                                index
                              ) => (

                                <SubmissionCard
                                  key={
                                    submission.id
                                  }
                                  submission={
                                    submission
                                  }
                                  number={
                                    submissions.length -
                                    index
                                  }
                                />

                              )
                            )}

                        </div>

                      )}

                    </div>

                  </div>

                </>

              )}

            </div>

          </div>

        </>

      )}


      {/* =====================================================
          SUBMISSION MODAL
          ===================================================== */}

      {submissionOpen &&
        selectedTask && (

        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* HEADER */}

            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600">

                  TASK-
                  {selectedTask.id}

                </p>


                <h3 className="text-sm font-extrabold text-slate-800 mt-1">

                  {selectedTask.status ===
                  'CHANGES_REQUESTED'
                    ? 'Resubmit Development Work'
                    : 'Submit Development Work'}

                </h3>

              </div>


              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={
                  () =>
                    setSubmissionOpen(
                      false
                    )
                }
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* BODY */}

            <div className="p-6 overflow-y-auto space-y-5">

              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">

                  Implementation Notes *

                </label>


                <textarea
                  rows={
                    7
                  }
                  value={
                    implementationNotes
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setImplementationNotes(
                        event.target.value
                      )
                  }
                  placeholder="Describe what was implemented, technical decisions, files changed, testing performed, or anything QA should know."
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-xl resize-y focus:outline-none focus:border-blue-500"
                />


                <p className="text-[10px] text-slate-400 mt-1">

                  This field is required by the backend.

                </p>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">

                    <GitBranch className="w-3.5 h-3.5" />

                    GitHub Branch

                  </label>


                  <input
                    type="text"
                    value={
                      githubBranch
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setGithubBranch(
                          event.target.value
                        )
                    }
                    placeholder="feature/user-login"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />

                </div>


                <div>

                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">

                    <GitCommitHorizontal className="w-3.5 h-3.5" />

                    Commit Hash

                  </label>


                  <input
                    type="text"
                    value={
                      commitHash
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setCommitHash(
                          event.target.value
                        )
                    }
                    placeholder="a1b2c3d"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />

                </div>

              </div>


              <div>

                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">

                  <GitPullRequest className="w-3.5 h-3.5" />

                  Pull Request URL

                </label>


                <input
                  type="url"
                  value={
                    pullRequestUrl
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setPullRequestUrl(
                        event.target.value
                      )
                  }
                  placeholder="https://github.com/organization/repository/pull/25"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />

              </div>

            </div>


            {/* FOOTER */}

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">

              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={
                  () =>
                    setSubmissionOpen(
                      false
                    )
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >

                Cancel

              </button>


              <button
                type="button"
                disabled={
                  submitting ||
                  !implementationNotes.trim()
                }
                onClick={
                  () =>
                    void handleSubmitWork()
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {submitting ? (

                  <Loader2 className="w-4 h-4 animate-spin" />

                ) : (

                  <Send className="w-4 h-4" />

                )}

                {submitting
                  ? 'Submitting...'
                  : selectedTask.status ===
                    'CHANGES_REQUESTED'
                    ? 'Resubmit to QA'
                    : 'Submit to QA'}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   SUMMARY CARD
   ========================================================= */

function SummaryCard({
  title,
  value,
  icon
}: {
  title: string;
  value: number;
  icon:
    React.ReactNode;
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


      <p className="text-3xl font-black text-slate-900 mt-2">

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   DETAIL ITEM
   ========================================================= */

function DetailItem({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

        {title}

      </p>


      <p className="text-xs font-bold text-slate-700 mt-1">

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   TASK STATUS BADGE
   ========================================================= */

function TaskStatusBadge({
  status
}: {
  status:
    DeveloperTaskStatus;
}) {

  let style =
    'bg-slate-100 text-slate-700';


  if (
    status ===
    'IN_PROGRESS'
  ) {

    style =
      'bg-blue-50 text-blue-700';

  } else if (
    status ===
      'READY_FOR_QA' ||
    status ===
      'QA_IN_PROGRESS'
  ) {

    style =
      'bg-indigo-50 text-indigo-700';

  } else if (
    status ===
    'CHANGES_REQUESTED'
  ) {

    style =
      'bg-amber-50 text-amber-700';

  } else if (
    status ===
    'COMPLETED'
  ) {

    style =
      'bg-emerald-50 text-emerald-700';

  } else if (
    status ===
    'CANCELLED'
  ) {

    style =
      'bg-rose-50 text-rose-700';
  }


  return (

    <span
      className={
        `inline-flex px-2 py-1 rounded-full text-[9px] font-bold ${style}`
      }
    >

      {status
        .replaceAll(
          '_',
          ' '
        )}

    </span>
  );
}


/* =========================================================
   STATUS MESSAGE
   ========================================================= */

function StatusMessage({
  title,
  message
}: {
  title: string;
  message: string;
}) {

  return (

    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">

      <p className="text-xs font-bold text-indigo-800">

        {title}

      </p>


      <p className="text-[11px] text-indigo-700 mt-1">

        {message}

      </p>

    </div>
  );
}


/* =========================================================
   SUBMISSION CARD
   ========================================================= */

function SubmissionCard({
  submission,
  number
}: {
  submission:
    DeveloperSubmissionResponse;
  number:
    number;
}) {

  return (

    <div className="rounded-xl border border-slate-200 p-4">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-bold text-slate-800">

            Submission #
            {number}

          </p>


          <p className="text-[10px] text-slate-400 mt-1">

            ID #
            {submission.id}

          </p>

        </div>


        <SubmissionStatusBadge
          status={
            submission.status
          }
        />

      </div>


      <div className="mt-4">

        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

          Implementation Notes

        </p>


        <p className="text-xs text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">

          {submission.implementationNotes}

        </p>

      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

        {submission.githubBranch && (

          <SubmissionInfo
            icon={
              <GitBranch className="w-3.5 h-3.5" />
            }
            title="Branch"
            value={
              submission.githubBranch
            }
          />

        )}


        {submission.commitHash && (

          <SubmissionInfo
            icon={
              <GitCommitHorizontal className="w-3.5 h-3.5" />
            }
            title="Commit"
            value={
              submission.commitHash
            }
          />

        )}

      </div>


      {submission.pullRequestUrl && (

        <a
          href={
            submission.pullRequestUrl
          }
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs font-bold text-blue-600 hover:bg-blue-50"
        >

          <span className="flex items-center gap-2">

            <GitPullRequest className="w-4 h-4" />

            Open Pull Request

          </span>


          <ExternalLink className="w-3.5 h-3.5" />

        </a>

      )}

    </div>
  );
}


/* =========================================================
   SUBMISSION INFO
   ========================================================= */

function SubmissionInfo({
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

    <div className="rounded-xl bg-slate-50 p-3">

      <div className="flex items-center gap-1.5 text-slate-400">

        {icon}


        <p className="text-[9px] uppercase tracking-wider font-bold">

          {title}

        </p>

      </div>


      <p className="text-[11px] font-semibold text-slate-700 mt-1 break-all">

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   SUBMISSION STATUS BADGE
   ========================================================= */

function SubmissionStatusBadge({
  status
}: {
  status:
    DeveloperSubmissionResponse['status'];
}) {

  let style =
    'bg-blue-50 text-blue-700';


  if (
    status ===
    'QA_IN_PROGRESS'
  ) {

    style =
      'bg-indigo-50 text-indigo-700';

  } else if (
    status ===
    'CHANGES_REQUESTED'
  ) {

    style =
      'bg-amber-50 text-amber-700';

  } else if (
    status ===
    'APPROVED'
  ) {

    style =
      'bg-emerald-50 text-emerald-700';
  }


  return (

    <span
      className={
        `inline-flex px-2 py-1 rounded-full text-[9px] font-bold ${style}`
      }
    >

      {status
        .replaceAll(
          '_',
          ' '
        )}

    </span>
  );
}