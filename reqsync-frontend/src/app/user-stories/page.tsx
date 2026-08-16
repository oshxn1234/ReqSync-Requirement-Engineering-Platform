'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit2,
  FileCheck2,
  FileText,
  FolderKanban,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserRound,
  X,
  XCircle
} from 'lucide-react';

import {
  ApiError
} from '@/lib/api-client';

import {
  getAllProjects
} from '@/lib/project-api';

import {
  getProjectRequirements,
  type RequirementSummaryResponse
} from '@/lib/completeness-api';

import {
  getProjectApprovals,
  type ApprovalResponse
} from '@/lib/approval-api';

import {
  deleteUserStory,
  generateUserStories,
  getProjectUserStories,
  updateUserStory,
  type UserStoryResponse
} from '@/lib/user-story-api';

import type {
  RequirementPriority
} from '@/lib/requirement-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


export default function UserStoriesPage() {

  /* =========================================================
     AUTH
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const isBusinessAnalyst =
    currentUser?.role ===
    'Business Analyst';


  const isProjectManager =
    currentUser?.role ===
    'Project Manager';


  const canViewPage =
    isBusinessAnalyst ||
    isProjectManager;


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
     REQUIREMENTS
     ========================================================= */

  const [
    requirements,
    setRequirements
  ] =
    useState<
      RequirementSummaryResponse[]
    >([]);


  /* =========================================================
     APPROVALS
     ========================================================= */

  const [
    approvals,
    setApprovals
  ] =
    useState<
      ApprovalResponse[]
    >([]);


  /* =========================================================
     USER STORIES
     ========================================================= */

  const [
    stories,
    setStories
  ] =
    useState<
      UserStoryResponse[]
    >([]);


  const [
    selectedStoryId,
    setSelectedStoryId
  ] =
    useState<number | null>(
      null
    );


  /* =========================================================
     LOADING STATES
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
    generating,
    setGenerating
  ] =
    useState(false);


  const [
    saving,
    setSaving
  ] =
    useState(false);


  const [
    deletingId,
    setDeletingId
  ] =
    useState<number | null>(
      null
    );


  const [
    reviewingId,
    setReviewingId
  ] =
    useState<number | null>(
      null
    );


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
    reviewFilter,
    setReviewFilter
  ] =
    useState<
      'ALL' |
      'REVIEWED' |
      'PENDING'
    >('ALL');


  const [
    priorityFilter,
    setPriorityFilter
  ] =
    useState<
      RequirementPriority |
      'ALL'
    >('ALL');


  /* =========================================================
     EDIT MODAL
     ========================================================= */

  const [
    editOpen,
    setEditOpen
  ] =
    useState(false);


  const [
    editTitle,
    setEditTitle
  ] =
    useState('');


  const [
    editActor,
    setEditActor
  ] =
    useState('');


  const [
    editGoal,
    setEditGoal
  ] =
    useState('');


  const [
    editBenefit,
    setEditBenefit
  ] =
    useState('');


  const [
    editPriority,
    setEditPriority
  ] =
    useState<RequirementPriority>(
      'MEDIUM'
    );


  const [
    editAcceptanceCriteria,
    setEditAcceptanceCriteria
  ] =
    useState('');


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
        ) ?? null,

      [
        projects,
        selectedProjectId
      ]
    );


  /* =========================================================
     APPROVAL MAP

     Maps:
     REQ-001 -> latest approval record
     ========================================================= */

  const latestApprovalByRequirement =
    useMemo(
      () => {

        const map =
          new Map<
            string,
            ApprovalResponse
          >();


        approvals
          .filter(
            (
              approval:
                ApprovalResponse
            ) =>
              approval.type ===
              'Requirement'
          )
          .forEach(
            (
              approval:
                ApprovalResponse
            ) => {

              const match =
                approval.title.match(
                  /REQ-\d+/i
                );


              if (
                match
              ) {

                map.set(
                  match[0].toUpperCase(),
                  approval
                );
              }
            }
          );


        return map;
      },

      [
        approvals
      ]
    );


  /* =========================================================
     APPROVED REQUIREMENTS

     Requirement is considered approved if:

     1. Requirement status = APPROVED
        OR
     2. Latest approval record = Approved
     ========================================================= */

  const approvedRequirements =
    useMemo(
      () =>
        requirements.filter(
          (
            requirement:
              RequirementSummaryResponse
          ) => {

            const approval =
              latestApprovalByRequirement.get(
                requirement.code.toUpperCase()
              );


            return (
              requirement.status ===
                'APPROVED' ||

              approval?.status ===
                'Approved'
            );
          }
        ),

      [
        requirements,
        latestApprovalByRequirement
      ]
    );


  /* =========================================================
     REJECTED REQUIREMENTS

     Rejected requirements do NOT block generation.
     They should simply be excluded by the backend generator.
     ========================================================= */

  const rejectedRequirements =
    useMemo(
      () =>
        requirements.filter(
          (
            requirement:
              RequirementSummaryResponse
          ) => {

            if (
              requirement.status ===
              'REJECTED'
            ) {

              return true;
            }


            const approval =
              latestApprovalByRequirement.get(
                requirement.code.toUpperCase()
              );


            return (
              approval?.status ===
              'Rejected'
            );
          }
        ),

      [
        requirements,
        latestApprovalByRequirement
      ]
    );


  /* =========================================================
     PENDING REQUIREMENTS

     Neither approved nor rejected.
     They also do NOT block generation.
     ========================================================= */

  const pendingRequirements =
    useMemo(
      () =>
        requirements.filter(
          (
            requirement:
              RequirementSummaryResponse
          ) => {

            const approved =
              approvedRequirements.some(
                (
                  item:
                    RequirementSummaryResponse
                ) =>
                  item.id ===
                  requirement.id
              );


            const rejected =
              rejectedRequirements.some(
                (
                  item:
                    RequirementSummaryResponse
                ) =>
                  item.id ===
                  requirement.id
              );


            return (
              !approved &&
              !rejected
            );
          }
        ),

      [
        requirements,
        approvedRequirements,
        rejectedRequirements
      ]
    );


  /* =========================================================
     GENERATION RULE

     IMPORTANT CHANGE:

     Generation is allowed when AT LEAST ONE
     requirement is approved.

     Rejected and pending requirements do NOT
     block generation.
     ========================================================= */

  const canGenerate =
    approvedRequirements.length >
    0;


  /* =========================================================
     SELECTED STORY
     ========================================================= */

  const selectedStory =
    useMemo(
      () => {

        if (
          stories.length ===
          0
        ) {

          return null;
        }


        if (
          selectedStoryId ===
          null
        ) {

          return stories[0];
        }


        return (
          stories.find(
            (
              story:
                UserStoryResponse
            ) =>
              story.id ===
              selectedStoryId
          ) ??
          stories[0]
        );
      },

      [
        stories,
        selectedStoryId
      ]
    );


  /* =========================================================
     FILTERED STORIES
     ========================================================= */

  const filteredStories =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        return stories.filter(
          (
            story:
              UserStoryResponse
          ) => {

            const matchesSearch =
              !query ||

              story.code
                .toLowerCase()
                .includes(
                  query
                ) ||

              story.title
                .toLowerCase()
                .includes(
                  query
                ) ||

              story.story
                .toLowerCase()
                .includes(
                  query
                ) ||

              story.sourceRequirementCode
                .toLowerCase()
                .includes(
                  query
                );


            const matchesReview =
              reviewFilter ===
                'ALL' ||

              (
                reviewFilter ===
                  'REVIEWED' &&
                story.reviewed
              ) ||

              (
                reviewFilter ===
                  'PENDING' &&
                !story.reviewed
              );


            const matchesPriority =
              priorityFilter ===
                'ALL' ||
              story.priority ===
                priorityFilter;


            return (
              matchesSearch &&
              matchesReview &&
              matchesPriority
            );
          }
        );
      },

      [
        stories,
        searchQuery,
        reviewFilter,
        priorityFilter
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
        projectId:
          number
      ) => {

        try {

          setDataLoading(
            true
          );

          setError(
            null
          );


          const [
            storyResult,
            requirementResult,
            approvalResult
          ] =
            await Promise.allSettled([

              getProjectUserStories(
                projectId
              ),

              getProjectRequirements(
                projectId
              ),

              getProjectApprovals(
                projectId
              ),
            ]);


          /* ===============================================
             USER STORIES
             =============================================== */

          if (
            storyResult.status ===
            'fulfilled'
          ) {

            const loadedStories =
              storyResult.value;


            setStories(
              loadedStories
            );


            if (
              loadedStories.length >
              0
            ) {

              setSelectedStoryId(
                (
                  current:
                    number |
                    null
                ) => {

                  const exists =
                    loadedStories.some(
                      (
                        story:
                          UserStoryResponse
                      ) =>
                        story.id ===
                        current
                    );


                  return exists
                    ? current
                    : loadedStories[0].id;
                }
              );

            } else {

              setSelectedStoryId(
                null
              );
            }

          } else {

            const reason =
              storyResult.reason;


            if (
              reason instanceof ApiError &&
              reason.status ===
                403
            ) {

              setStories(
                []
              );

              setSelectedStoryId(
                null
              );

            } else {

              throw reason;
            }
          }


          /* ===============================================
             REQUIREMENTS
             =============================================== */

          if (
            requirementResult.status ===
            'fulfilled'
          ) {

            setRequirements(
              requirementResult.value
            );

          } else {

            const reason =
              requirementResult.reason;


            if (
              reason instanceof ApiError &&
              reason.status ===
                403
            ) {

              setRequirements(
                []
              );

            } else {

              throw reason;
            }
          }


          /* ===============================================
             APPROVALS
             =============================================== */

          if (
            approvalResult.status ===
            'fulfilled'
          ) {

            setApprovals(
              approvalResult.value
            );

          } else {

            const reason =
              approvalResult.reason;


            if (
              reason instanceof ApiError &&
              reason.status ===
                403
            ) {

              setApprovals(
                []
              );

            } else {

              throw reason;
            }
          }

        } catch (error) {

          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load user story data.'
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
        !canViewPage
      ) {

        return;
      }


      void loadProjects();

    },
    [
      canViewPage,
      loadProjects
    ]
  );


  /* =========================================================
     PROJECT CHANGE
     ========================================================= */

  useEffect(
    () => {

      setStories(
        []
      );

      setRequirements(
        []
      );

      setApprovals(
        []
      );

      setSelectedStoryId(
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
     GENERATE USER STORIES

     We only require ONE approved requirement.

     IMPORTANT:
     Backend must filter to APPROVED requirements.
     ========================================================= */

  const handleGenerate =
    async () => {

      if (
        selectedProjectId ===
        null
      ) {

        return;
      }


      if (
        !isBusinessAnalyst
      ) {

        setError(
          'Only Business Analysts can generate user stories.'
        );

        return;
      }


      if (
        requirements.length ===
        0
      ) {

        setError(
          'No requirements are available for this project.'
        );

        return;
      }


      /*
       * ONLY RULE:
       * At least one approved requirement.
       */
      if (
        approvedRequirements.length ===
        0
      ) {

        setError(
          'At least one approved requirement is required before generating user stories.'
        );

        return;
      }


      try {

        setGenerating(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        /*
         * Backend endpoint receives projectId.
         *
         * Backend MUST select only APPROVED
         * requirements before calling Gemini.
         */
        const generated =
          await generateUserStories(
            selectedProjectId
          );


        /*
         * Reload stored stories.
         */
        const refreshed =
          await getProjectUserStories(
            selectedProjectId
          );


        setStories(
          refreshed
        );


        if (
          refreshed.length >
          0
        ) {

          setSelectedStoryId(
            refreshed[0].id
          );
        }


        if (
          generated.length >
          0
        ) {

          setSuccess(
            `${generated.length} ${
              generated.length ===
              1
                ? 'user story was'
                : 'user stories were'
            } generated from approved requirements.`
          );

        } else {

          setSuccess(
            'User story generation completed.'
          );
        }

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to generate user stories.'
        );

      } finally {

        setGenerating(
          false
        );
      }
    };


  /* =========================================================
     OPEN EDIT
     ========================================================= */

  const openEditModal =
    (
      story:
        UserStoryResponse
    ) => {

      if (
        !isBusinessAnalyst
      ) {

        return;
      }


      setEditTitle(
        story.title
      );

      setEditActor(
        story.actor
      );

      setEditGoal(
        story.goal
      );

      setEditBenefit(
        story.benefit
      );

      setEditPriority(
        story.priority
      );

      setEditAcceptanceCriteria(
        story.acceptanceCriteria
          .join(
            '\n'
          )
      );


      setEditOpen(
        true
      );
    };


  /* =========================================================
     SAVE EDIT
     ========================================================= */

  const handleSaveEdit =
    async () => {

      if (
        !selectedStory
      ) {

        return;
      }


      if (
        !editTitle.trim() ||
        !editActor.trim() ||
        !editGoal.trim() ||
        !editBenefit.trim()
      ) {

        setError(
          'Title, actor, goal and benefit are required.'
        );

        return;
      }


      const criteria =
        editAcceptanceCriteria

          .split(
            '\n'
          )

          .map(
            (
              criterion
            ) =>
              criterion.trim()
          )

          .filter(
            Boolean
          );


      if (
        criteria.length ===
        0
      ) {

        setError(
          'At least one acceptance criterion is required.'
        );

        return;
      }


      try {

        setSaving(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        const updated =
          await updateUserStory(
            selectedStory.id,
            {
              title:
                editTitle.trim(),

              actor:
                editActor.trim(),

              goal:
                editGoal.trim(),

              benefit:
                editBenefit.trim(),

              priority:
                editPriority,

              acceptanceCriteria:
                criteria,
            }
          );


        setStories(
          (
            current:
              UserStoryResponse[]
          ) =>
            current.map(
              (
                story:
                  UserStoryResponse
              ) =>
                story.id ===
                updated.id
                  ? updated
                  : story
            )
        );


        setEditOpen(
          false
        );


        setSuccess(
          `${updated.code} updated successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to update user story.'
        );

      } finally {

        setSaving(
          false
        );
      }
    };


  /* =========================================================
     REVIEW STATUS
     ========================================================= */

  const handleToggleReviewed =
    async (
      story:
        UserStoryResponse
    ) => {

      if (
        !isBusinessAnalyst
      ) {

        return;
      }


      try {

        setReviewingId(
          story.id
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        const updated =
          await updateUserStory(
            story.id,
            {
              reviewed:
                !story.reviewed,
            }
          );


        setStories(
          (
            current:
              UserStoryResponse[]
          ) =>
            current.map(
              (
                item:
                  UserStoryResponse
              ) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            )
        );


        setSuccess(
          updated.reviewed

            ? `${updated.code} marked as reviewed.`

            : `${updated.code} marked as pending review.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to update review status.'
        );

      } finally {

        setReviewingId(
          null
        );
      }
    };


  /* =========================================================
     DELETE
     ========================================================= */

  const handleDelete =
    async (
      story:
        UserStoryResponse
    ) => {

      if (
        !isBusinessAnalyst
      ) {

        return;
      }


      const confirmed =
        window.confirm(
          `Delete ${story.code} - "${story.title}"?`
        );


      if (
        !confirmed
      ) {

        return;
      }


      try {

        setDeletingId(
          story.id
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        await deleteUserStory(
          story.id
        );


        const remaining =
          stories.filter(
            (
              item:
                UserStoryResponse
            ) =>
              item.id !==
              story.id
          );


        setStories(
          remaining
        );


        if (
          selectedStoryId ===
          story.id
        ) {

          setSelectedStoryId(
            remaining.length >
            0

              ? remaining[0].id

              : null
          );
        }


        setSuccess(
          `${story.code} deleted successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to delete user story.'
        );

      } finally {

        setDeletingId(
          null
        );
      }
    };


  /* =========================================================
     FORMAT
     ========================================================= */

  const formatEnum =
    (
      value:
        string |
        null |
        undefined
    ) => {

      if (
        !value
      ) {

        return '-';
      }


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
    };


  /* =========================================================
     ACCESS
     ========================================================= */

  if (
    !canViewPage
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

            User Stories can only be accessed by Business Analysts and Project Managers.

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

          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">

            <BookOpenCheck className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">

              User Stories

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Generate and review Agile user stories from approved requirements.

            </p>

          </div>

        </div>


        <div className="flex items-center gap-2">

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
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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


          {isBusinessAnalyst && (

            <button
              type="button"
              disabled={
                generating ||
                selectedProjectId ===
                  null ||
                !canGenerate
              }
              onClick={
                () =>
                  void handleGenerate()
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {generating ? (

                <Loader2 className="w-4 h-4 animate-spin" />

              ) : (

                <Sparkles className="w-4 h-4" />

              )}

              {generating
                ? 'Generating...'
                : 'Generate User Stories'}

            </button>

          )}

        </div>

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
          PROJECT SELECTOR
          ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5">

        <div className="flex flex-col md:flex-row md:items-center gap-4">

          <div className="flex items-center gap-3 shrink-0">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

              <FolderKanban className="w-5 h-5 text-blue-600" />

            </div>


            <div>

              <p className="text-xs font-bold text-slate-900">

                Project

              </p>

              <p className="text-[10px] text-slate-400">

                Select the project whose user stories you want to manage.

              </p>

            </div>

          </div>


          <div className="flex-1">

            {projectsLoading ? (

              <div className="flex items-center gap-2">

                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />

                <span className="text-xs text-slate-500">

                  Loading projects...

                </span>

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

                Status:

              </span>{' '}

              <span className="font-bold text-slate-700">

                {formatEnum(
                  selectedProject.status
                )}

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

            Select a project before viewing or generating user stories.

          </p>

        </div>

      )}


      {/* =====================================================
          LOADING
          ===================================================== */}

      {selectedProjectId !==
        null &&
        dataLoading && (

        <div className="min-h-[350px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />

          <p className="text-xs text-slate-500 mt-3">

            Loading user stories...

          </p>

        </div>

      )}


      {/* =====================================================
          PROJECT DATA
          ===================================================== */}

      {selectedProjectId !==
        null &&
        !dataLoading && (

        <>

          {/* =================================================
              SUMMARY
              ================================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

            <SummaryCard
              title="Total Requirements"
              value={
                requirements.length
              }
              icon={
                <FileText className="w-4 h-4" />
              }
            />


            <SummaryCard
              title="Approved"
              value={
                approvedRequirements.length
              }
              icon={
                <FileCheck2 className="w-4 h-4" />
              }
              valueClass="text-emerald-600"
            />


            <SummaryCard
              title="Pending"
              value={
                pendingRequirements.length
              }
              icon={
                <AlertCircle className="w-4 h-4" />
              }
              valueClass="text-amber-600"
            />


            <SummaryCard
              title="Rejected"
              value={
                rejectedRequirements.length
              }
              icon={
                <XCircle className="w-4 h-4" />
              }
              valueClass="text-rose-600"
            />


            <SummaryCard
              title="Generated Stories"
              value={
                stories.length
              }
              icon={
                <BookOpenCheck className="w-4 h-4" />
              }
            />

          </div>


          {/* =================================================
              GENERATION READINESS
              ================================================= */}

          {requirements.length ===
            0 ? (

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">

              <div className="flex items-start gap-3">

                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />


                <div>

                  <p className="text-sm font-bold text-amber-800">

                    No requirements available

                  </p>


                  <p className="text-xs text-amber-700 mt-1">

                    Requirements must first be extracted and approved before user stories can be generated.

                  </p>


                  <Link
                    href="/requirements"
                    className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-amber-800 hover:underline"
                  >

                    Open Requirements

                    <ChevronRight className="w-3.5 h-3.5" />

                  </Link>

                </div>

              </div>

            </div>

          ) : approvedRequirements.length ===
            0 ? (

            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5">

              <div className="flex items-start gap-3">

                <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />


                <div>

                  <p className="text-sm font-bold text-blue-800">

                    No approved requirements yet

                  </p>


                  <p className="text-xs text-blue-700 mt-1">

                    At least one requirement must be approved before user stories can be generated.

                  </p>


                  <Link
                    href="/requirements"
                    className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-blue-700 hover:underline"
                  >

                    Review Requirements

                    <ChevronRight className="w-3.5 h-3.5" />

                  </Link>

                </div>

              </div>

            </div>

          ) : (

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">

              <div className="flex items-start gap-3">

                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />


                <div className="flex-1">

                  <p className="text-sm font-bold text-emerald-800">

                    Ready for User Story generation

                  </p>


                  <p className="text-xs text-emerald-700 mt-1">

                    {approvedRequirements.length}
                    {' '}
                    approved
                    {' '}
                    {approvedRequirements.length ===
                    1
                      ? 'requirement is'
                      : 'requirements are'}
                    {' '}
                    ready for generation.

                  </p>


                  {pendingRequirements.length >
                    0 && (

                    <p className="text-[11px] text-amber-700 mt-2">

                      {pendingRequirements.length}
                      {' '}
                      pending
                      {' '}
                      {pendingRequirements.length ===
                      1
                        ? 'requirement will'
                        : 'requirements will'}
                      {' '}
                      be ignored until approved.

                    </p>

                  )}


                  {rejectedRequirements.length >
                    0 && (

                    <p className="text-[11px] text-rose-700 mt-1">

                      {rejectedRequirements.length}
                      {' '}
                      rejected
                      {' '}
                      {rejectedRequirements.length ===
                      1
                        ? 'requirement will'
                        : 'requirements will'}
                      {' '}
                      be excluded from generation.

                    </p>

                  )}

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              FILTERS
              ================================================= */}

          {stories.length >
            0 && (

            <div className="bg-white border border-slate-200 rounded-2xl p-4">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

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
                    placeholder="Search user stories..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500"
                  />

                </div>


                <select
                  value={
                    reviewFilter
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setReviewFilter(
                        event.target.value as
                          'ALL' |
                          'REVIEWED' |
                          'PENDING'
                      )
                  }
                  className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                >

                  <option value="ALL">

                    All Review Statuses

                  </option>

                  <option value="PENDING">

                    Pending Review

                  </option>

                  <option value="REVIEWED">

                    Reviewed

                  </option>

                </select>


                <select
                  value={
                    priorityFilter
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setPriorityFilter(
                        event.target.value as
                          RequirementPriority |
                          'ALL'
                      )
                  }
                  className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                >

                  <option value="ALL">

                    All Priorities

                  </option>

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

            </div>

          )}


          {/* =================================================
              EMPTY STORIES
              ================================================= */}

          {stories.length ===
            0 ? (

            <div className="min-h-[360px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">

                <BookOpenCheck className="w-7 h-7 text-indigo-400" />

              </div>


              <h2 className="text-base font-bold text-slate-800 mt-4">

                No user stories generated yet

              </h2>


              <p className="text-sm text-slate-500 mt-2 max-w-md">

                User stories will be generated only from approved requirements.

              </p>


              {isBusinessAnalyst &&
                canGenerate && (

                <button
                  type="button"
                  disabled={
                    generating
                  }
                  onClick={
                    () =>
                      void handleGenerate()
                  }
                  className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50"
                >

                  {generating ? (

                    <Loader2 className="w-4 h-4 animate-spin" />

                  ) : (

                    <Sparkles className="w-4 h-4" />

                  )}

                  Generate User Stories

                </button>

              )}

            </div>

          ) : (

            /* =================================================
               STORIES
               ================================================= */

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-6">

              {/* ===============================================
                  STORY LIST
                  =============================================== */}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden self-start">

                <div className="p-5 border-b border-slate-100">

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="font-extrabold text-slate-900">

                        Generated User Stories

                      </h2>


                      <p className="text-xs text-slate-500 mt-1">

                        {filteredStories.length}
                        {' '}
                        {filteredStories.length ===
                        1
                          ? 'story'
                          : 'stories'}
                        {' '}
                        shown

                      </p>

                    </div>


                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">

                      {
                        stories.filter(
                          (
                            story:
                              UserStoryResponse
                          ) =>
                            story.reviewed
                        ).length
                      }

                      {' Reviewed'}

                    </span>

                  </div>

                </div>


                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">

                        <th className="px-4 py-3">

                          Story

                        </th>

                        <th className="px-4 py-3">

                          Requirement

                        </th>

                        <th className="px-4 py-3">

                          Priority

                        </th>

                        <th className="px-4 py-3">

                          Review

                        </th>

                        <th className="px-4 py-3" />

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {filteredStories.length ===
                      0 ? (

                        <tr>

                          <td
                            colSpan={5}
                            className="px-4 py-12 text-center text-sm text-slate-400"
                          >

                            No matching user stories found.

                          </td>

                        </tr>

                      ) : (

                        filteredStories.map(
                          (
                            story:
                              UserStoryResponse
                          ) => (

                            <tr
                              key={
                                story.id
                              }
                              onClick={
                                () =>
                                  setSelectedStoryId(
                                    story.id
                                  )
                              }
                              className={
                                `cursor-pointer transition-colors ${
                                  selectedStory?.id ===
                                  story.id
                                    ? 'bg-indigo-50/60'
                                    : 'hover:bg-slate-50'
                                }`
                              }
                            >

                              <td className="px-4 py-4 min-w-[270px]">

                                <div className="flex items-start gap-3">

                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-700 shrink-0">

                                    US

                                  </div>


                                  <div>

                                    <p className="text-xs font-black text-indigo-600">

                                      {story.code}

                                    </p>


                                    <p className="text-sm font-bold text-slate-800 mt-1">

                                      {story.title}

                                    </p>


                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">

                                      {story.story}

                                    </p>

                                  </div>

                                </div>

                              </td>


                              <td className="px-4 py-4 align-top">

                                <Link
                                  href="/requirements"
                                  onClick={
                                    (
                                      event
                                    ) =>
                                      event.stopPropagation()
                                  }
                                  className="text-xs font-bold text-blue-600 hover:underline"
                                >

                                  {story.sourceRequirementCode}

                                </Link>

                              </td>


                              <td className="px-4 py-4 align-top">

                                <PriorityBadge
                                  priority={
                                    story.priority
                                  }
                                />

                              </td>


                              <td className="px-4 py-4 align-top">

                                <ReviewBadge
                                  reviewed={
                                    story.reviewed
                                  }
                                />

                              </td>


                              <td className="px-4 py-4">

                                <ChevronRight className="w-4 h-4 text-slate-400" />

                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>


              {/* ===============================================
                  STORY DETAILS
                  =============================================== */}

              <div className="space-y-5 self-start">

                {selectedStory && (

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                    <div className="p-5 border-b border-slate-100">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-2">

                            <span className="text-xs font-black text-indigo-600">

                              {selectedStory.code}

                            </span>


                            <ReviewBadge
                              reviewed={
                                selectedStory.reviewed
                              }
                            />

                          </div>


                          <h2 className="font-extrabold text-slate-900 mt-2">

                            {selectedStory.title}

                          </h2>

                        </div>


                        {isBusinessAnalyst && (

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={
                                () =>
                                  openEditModal(
                                    selectedStory
                                  )
                              }
                              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              title="Edit Story"
                            >

                              <Edit2 className="w-4 h-4" />

                            </button>


                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                selectedStory.id
                              }
                              onClick={
                                () =>
                                  void handleDelete(
                                    selectedStory
                                  )
                              }
                              className="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                              title="Delete Story"
                            >

                              {deletingId ===
                              selectedStory.id ? (

                                <Loader2 className="w-4 h-4 animate-spin" />

                              ) : (

                                <Trash2 className="w-4 h-4" />

                              )}

                            </button>

                          </div>

                        )}

                      </div>

                    </div>


                    <div className="p-5 space-y-5">

                      {/* USER STORY */}

                      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">

                        <p className="text-[9px] uppercase font-bold text-indigo-500">

                          User Story

                        </p>


                        <p className="text-sm font-semibold text-indigo-900 mt-2 leading-relaxed">

                          {selectedStory.story}

                        </p>

                      </div>


                      {/* ACTOR */}

                      <StoryDetailItem
                        icon={
                          <UserRound className="w-4 h-4" />
                        }
                        title="Actor"
                        value={
                          selectedStory.actor
                        }
                      />


                      {/* GOAL */}

                      <StoryDetailItem
                        icon={
                          <Check className="w-4 h-4" />
                        }
                        title="Goal"
                        value={
                          selectedStory.goal
                        }
                      />


                      {/* BENEFIT */}

                      <StoryDetailItem
                        icon={
                          <Sparkles className="w-4 h-4" />
                        }
                        title="Benefit"
                        value={
                          selectedStory.benefit
                        }
                      />


                      {/* METADATA */}

                      <div className="grid grid-cols-2 gap-3">

                        <SmallDetail
                          title="Source Requirement"
                          value={
                            selectedStory.sourceRequirementCode
                          }
                        />


                        <SmallDetail
                          title="Priority"
                          value={
                            formatEnum(
                              selectedStory.priority
                            )
                          }
                        />

                      </div>


                      {/* ACCEPTANCE CRITERIA */}

                      <div>

                        <div className="flex items-center gap-2">

                          <FileCheck2 className="w-4 h-4 text-emerald-600" />


                          <p className="text-xs font-bold text-slate-800">

                            Acceptance Criteria

                          </p>

                        </div>


                        <div className="space-y-2 mt-3">

                          {selectedStory.acceptanceCriteria.map(
                            (
                              criterion:
                                string,
                              index:
                                number
                            ) => (

                              <div
                                key={
                                  `${selectedStory.id}-${index}`
                                }
                                className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                              >

                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">

                                  <Check className="w-3 h-3" />

                                </div>


                                <p className="text-xs text-slate-700">

                                  {criterion}

                                </p>

                              </div>

                            )
                          )}

                        </div>

                      </div>


                      {/* REVIEW BUTTON */}

                      {isBusinessAnalyst && (

                        <button
                          type="button"
                          disabled={
                            reviewingId ===
                            selectedStory.id
                          }
                          onClick={
                            () =>
                              void handleToggleReviewed(
                                selectedStory
                              )
                          }
                          className={
                            `w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold disabled:opacity-50 ${
                              selectedStory.reviewed
                                ? 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`
                          }
                        >

                          {reviewingId ===
                          selectedStory.id ? (

                            <Loader2 className="w-4 h-4 animate-spin" />

                          ) : (

                            <CheckCircle2 className="w-4 h-4" />

                          )}

                          {selectedStory.reviewed
                            ? 'Mark as Pending Review'
                            : 'Mark as Reviewed'}

                        </button>

                      )}

                    </div>

                  </div>

                )}

              </div>

            </div>

          )}

        </>

      )}


      {/* =====================================================
          EDIT MODAL
          ===================================================== */}

      {editOpen &&
        selectedStory && (

        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* HEADER */}

            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">

              <div>

                <p className="text-xs font-black text-indigo-600">

                  {selectedStory.code}

                </p>


                <h3 className="text-sm font-extrabold text-slate-800 mt-1">

                  Edit User Story

                </h3>

              </div>


              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  () =>
                    setEditOpen(
                      false
                    )
                }
                className="p-2 text-slate-400 hover:text-slate-700"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* BODY */}

            <div className="p-6 overflow-y-auto space-y-4">

              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">

                  Title

                </label>


                <input
                  type="text"
                  value={
                    editTitle
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditTitle(
                        event.target.value
                      )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />

              </div>


              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">

                  Actor

                </label>


                <input
                  type="text"
                  value={
                    editActor
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditActor(
                        event.target.value
                      )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />

              </div>


              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">

                  Goal

                </label>


                <textarea
                  rows={3}
                  value={
                    editGoal
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditGoal(
                        event.target.value
                      )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs resize-y focus:outline-none focus:border-blue-500"
                />

              </div>


              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">

                  Benefit

                </label>


                <textarea
                  rows={3}
                  value={
                    editBenefit
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditBenefit(
                        event.target.value
                      )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs resize-y focus:outline-none focus:border-blue-500"
                />

              </div>


              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">

                  Priority

                </label>


                <select
                  value={
                    editPriority
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditPriority(
                        event.target.value as
                          RequirementPriority
                      )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs"
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


              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">

                  Acceptance Criteria

                </label>


                <textarea
                  rows={7}
                  value={
                    editAcceptanceCriteria
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditAcceptanceCriteria(
                        event.target.value
                      )
                  }
                  placeholder="One acceptance criterion per line"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs resize-y focus:outline-none focus:border-blue-500"
                />

              </div>

            </div>


            {/* FOOTER */}

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  () =>
                    setEditOpen(
                      false
                    )
                }
                className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50"
              >

                Cancel

              </button>


              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  () =>
                    void handleSaveEdit()
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >

                {saving && (

                  <Loader2 className="w-4 h-4 animate-spin" />

                )}

                {saving
                  ? 'Saving...'
                  : 'Save Changes'}

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
  icon,
  valueClass =
    'text-slate-900'
}: {
  title:
    string;

  value:
    number;

  icon:
    ReactNode;

  valueClass?:
    string;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center justify-between">

        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">

          {title}

        </p>


        <div className="text-indigo-600">

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
   PRIORITY BADGE
   ========================================================= */

function PriorityBadge({
  priority
}: {
  priority:
    RequirementPriority;
}) {

  const style =
    priority ===
      'CRITICAL'

      ? 'bg-rose-50 text-rose-700'

      : priority ===
        'HIGH'

        ? 'bg-orange-50 text-orange-700'

        : priority ===
          'MEDIUM'

          ? 'bg-amber-50 text-amber-700'

          : 'bg-slate-50 text-slate-600';


  return (

    <span
      className={
        `px-2 py-1 rounded-full text-[9px] font-bold ${style}`
      }
    >

      {priority}

    </span>
  );
}


/* =========================================================
   REVIEW BADGE
   ========================================================= */

function ReviewBadge({
  reviewed
}: {
  reviewed:
    boolean;
}) {

  return (

    <span
      className={
        `px-2 py-1 rounded-full text-[9px] font-bold ${
          reviewed
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
        }`
      }
    >

      {reviewed
        ? 'Reviewed'
        : 'Pending Review'}

    </span>
  );
}


/* =========================================================
   DETAIL ITEM
   ========================================================= */

function StoryDetailItem({
  icon,
  title,
  value
}: {
  icon:
    ReactNode;

  title:
    string;

  value:
    string;
}) {

  return (

    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-slate-400">

        {icon}


        <p className="text-[9px] uppercase tracking-wider font-bold">

          {title}

        </p>

      </div>


      <p className="text-xs text-slate-700 mt-2 leading-relaxed">

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   SMALL DETAIL
   ========================================================= */

function SmallDetail({
  title,
  value
}: {
  title:
    string;

  value:
    string;
}) {

  return (

    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-[9px] uppercase font-bold text-slate-400">

        {title}

      </p>


      <p className="text-xs font-bold text-slate-700 mt-1">

        {value}

      </p>

    </div>
  );
}