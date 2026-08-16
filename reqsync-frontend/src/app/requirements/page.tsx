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
  Activity,
  AlertCircle,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  FolderKanban,
  Lightbulb,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  XCircle
} from 'lucide-react';

import {
  ApiError
} from '@/lib/api-client';

import {
  getAllProjects
} from '@/lib/project-api';

import {
  getLatestRequirementExtraction,
  type ExtractedRequirement,
  type RequirementExtractionResponse,
  type RequirementPriority,
  type RequirementStatus,
  type RequirementType
} from '@/lib/requirement-api';

import {
  analyzeRequirementCompleteness,
  type CoverageStatus,
  type CriterionStatus,
  type RequirementCompletenessResponse
} from '@/lib/completeness-api';

import {
  approveApproval,
  createApproval,
  getProjectApprovals,
  rejectApproval,
  type ApprovalResponse
} from '@/lib/approval-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


type RequirementTab =
  | 'ACTIVE'
  | 'REJECTED';


export default function RequirementsPage() {

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
    extraction,
    setExtraction
  ] =
    useState<
      RequirementExtractionResponse |
      null
    >(null);


  const [
    selectedRequirementId,
    setSelectedRequirementId
  ] =
    useState<number | null>(
      null
    );


  const [
    noRequirementsAvailable,
    setNoRequirementsAvailable
  ] =
    useState(false);


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


  const [
    approvalLoading,
    setApprovalLoading
  ] =
    useState(false);


  const [
    decidingApproval,
    setDecidingApproval
  ] =
    useState<
      'APPROVE' |
      'REJECT' |
      null
    >(null);


  /* =========================================================
     COMPLETENESS
     ========================================================= */

  const [
    completenessResult,
    setCompletenessResult
  ] =
    useState<
      RequirementCompletenessResponse |
      null
    >(null);


  const [
    completenessLoading,
    setCompletenessLoading
  ] =
    useState(false);


  const [
    completenessError,
    setCompletenessError
  ] =
    useState<string | null>(
      null
    );


  /* =========================================================
     PAGE / FILTERS
     ========================================================= */

  const [
    activeTab,
    setActiveTab
  ] =
    useState<RequirementTab>(
      'ACTIVE'
    );


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
      RequirementStatus |
      'ALL'
    >('ALL');


  const [
    priorityFilter,
    setPriorityFilter
  ] =
    useState<
      RequirementPriority |
      'ALL'
    >('ALL');


  const [
    typeFilter,
    setTypeFilter
  ] =
    useState<
      RequirementType |
      'ALL'
    >('ALL');


  /* =========================================================
     GENERAL STATE
     ========================================================= */

  const [
    projectsLoading,
    setProjectsLoading
  ] =
    useState(true);


  const [
    requirementsLoading,
    setRequirementsLoading
  ] =
    useState(false);


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
        ) ?? null,

      [
        projects,
        selectedProjectId
      ]
    );


  /* =========================================================
     REQUIREMENT LIST
     ========================================================= */

  const requirements =
    extraction?.requirements ??
    [];


  /* =========================================================
     APPROVAL MAP
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
            (approval) =>
              approval.type ===
              'Requirement'
          )
          .forEach(
            (approval) => {

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
     REJECTED CHECK

     Current backend rejection may only reject the
     approval record, so use either:
     Requirement.status = REJECTED
     OR Approval.status = Rejected
     ========================================================= */

  const isRequirementRejected =
    useCallback(
      (
        requirement:
          ExtractedRequirement
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
      },

      [
        latestApprovalByRequirement
      ]
    );


  /* =========================================================
     ACTIVE / REJECTED
     ========================================================= */

  const activeRequirements =
    useMemo(
      () =>
        requirements.filter(
          (requirement) =>
            !isRequirementRejected(
              requirement
            )
        ),

      [
        requirements,
        isRequirementRejected
      ]
    );


  const rejectedRequirements =
    useMemo(
      () =>
        requirements.filter(
          (requirement) =>
            isRequirementRejected(
              requirement
            )
        ),

      [
        requirements,
        isRequirementRejected
      ]
    );


  const currentTabRequirements =
    activeTab ===
    'REJECTED'

      ? rejectedRequirements
      : activeRequirements;


  /* =========================================================
     SELECTED REQUIREMENT
     ========================================================= */

  const selectedRequirement =
    useMemo(
      () => {

        if (
          currentTabRequirements.length ===
          0
        ) {

          return null;
        }


        if (
          selectedRequirementId ===
          null
        ) {

          return currentTabRequirements[0];
        }


        return (
          currentTabRequirements.find(
            (requirement) =>
              requirement.id ===
              selectedRequirementId
          ) ??
          currentTabRequirements[0]
        );
      },

      [
        currentTabRequirements,
        selectedRequirementId
      ]
    );


  const selectedApproval =
    useMemo(
      () => {

        if (
          !selectedRequirement
        ) {

          return null;
        }


        return (
          latestApprovalByRequirement.get(
            selectedRequirement.code.toUpperCase()
          ) ??
          null
        );
      },

      [
        latestApprovalByRequirement,
        selectedRequirement
      ]
    );


  /* =========================================================
     PROJECT LOAD
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
     APPROVAL LOAD
     ========================================================= */

  const loadApprovals =
    useCallback(
      async (
        projectId:
          number
      ) => {

        try {

          setApprovalLoading(
            true
          );


          const response:
            ApprovalResponse[] =
            await getProjectApprovals(
              projectId
            );


          setApprovals(
            response
          );

        } catch (error) {

          setApprovals(
            []
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load approvals.'
          );

        } finally {

          setApprovalLoading(
            false
          );
        }
      },

      []
    );


  /* =========================================================
     REQUIREMENT LOAD
     ========================================================= */

  const loadRequirements =
    useCallback(
      async (
        projectId:
          number
      ) => {

        try {

          setRequirementsLoading(
            true
          );

          setError(
            null
          );

          setNoRequirementsAvailable(
            false
          );


          const response:
            RequirementExtractionResponse =
            await getLatestRequirementExtraction(
              projectId
            );


          setExtraction(
            response
          );


          if (
            !response.requirements ||
            response.requirements.length ===
              0
          ) {

            setSelectedRequirementId(
              null
            );

            setNoRequirementsAvailable(
              true
            );
          }

        } catch (error) {

          /*
           * Your current backend returns 403 when
           * no requirements exist.
           */
          if (
            error instanceof ApiError &&
            error.status ===
              403
          ) {

            setExtraction(
              null
            );

            setSelectedRequirementId(
              null
            );

            setNoRequirementsAvailable(
              true
            );

            setError(
              null
            );

            return;
          }


          setExtraction(
            null
          );

          setSelectedRequirementId(
            null
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load requirements.'
          );

        } finally {

          setRequirementsLoading(
            false
          );
        }
      },

      []
    );


  /* =========================================================
     REFRESH ALL
     ========================================================= */

  const refreshProjectData =
    useCallback(
      async (
        projectId:
          number
      ) => {

        await Promise.all([
          loadRequirements(
            projectId
          ),

          loadApprovals(
            projectId
          ),
        ]);
      },

      [
        loadRequirements,
        loadApprovals
      ]
    );


  /* =========================================================
     INITIAL
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
     PROJECT CHANGED
     ========================================================= */

  useEffect(
    () => {

      setExtraction(
        null
      );

      setApprovals(
        []
      );

      setSelectedRequirementId(
        null
      );

      setCompletenessResult(
        null
      );

      setCompletenessError(
        null
      );

      setNoRequirementsAvailable(
        false
      );

      setSuccess(
        null
      );

      setError(
        null
      );

      setActiveTab(
        'ACTIVE'
      );


      if (
        selectedProjectId ===
        null
      ) {

        return;
      }


      void refreshProjectData(
        selectedProjectId
      );

    },
    [
      selectedProjectId,
      refreshProjectData
    ]
  );


  /* =========================================================
     TAB CHANGE
     ========================================================= */

  useEffect(
    () => {

      if (
        currentTabRequirements.length >
        0
      ) {

        setSelectedRequirementId(
          currentTabRequirements[0].id
        );

      } else {

        setSelectedRequirementId(
          null
        );
      }


      setCompletenessResult(
        null
      );

      setCompletenessError(
        null
      );

    },
    [
      activeTab
    ]
  );


  /* =========================================================
     SELECTED REQUIREMENT CHANGE
     ========================================================= */

  useEffect(
    () => {

      setCompletenessResult(
        null
      );

      setCompletenessError(
        null
      );

    },
    [
      selectedRequirementId
    ]
  );


  /* =========================================================
     FILTERED REQUIREMENTS
     ========================================================= */

  const filteredRequirements =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        return currentTabRequirements.filter(
          (
            requirement:
              ExtractedRequirement
          ) => {

            const matchesSearch =
              !query ||

              requirement.code
                .toLowerCase()
                .includes(
                  query
                ) ||

              requirement.title
                .toLowerCase()
                .includes(
                  query
                ) ||

              requirement.description
                .toLowerCase()
                .includes(
                  query
                );


            const matchesStatus =
              statusFilter ===
                'ALL' ||
              requirement.status ===
                statusFilter;


            const matchesPriority =
              priorityFilter ===
                'ALL' ||
              requirement.priority ===
                priorityFilter;


            const matchesType =
              typeFilter ===
                'ALL' ||
              requirement.type ===
                typeFilter;


            return (
              matchesSearch &&
              matchesStatus &&
              matchesPriority &&
              matchesType
            );
          }
        );
      },

      [
        currentTabRequirements,
        searchQuery,
        statusFilter,
        priorityFilter,
        typeFilter
      ]
    );


  /* =========================================================
     COMPLETENESS
     ========================================================= */

  const handleAnalyzeCompleteness =
    async () => {

      if (
        !selectedRequirement
      ) {

        return;
      }


      try {

        setCompletenessLoading(
          true
        );

        setCompletenessError(
          null
        );


        const response =
          await analyzeRequirementCompleteness(
            selectedRequirement.id
          );


        setCompletenessResult(
          response
        );

      } catch (error) {

        setCompletenessError(
          error instanceof Error
            ? error.message
            : 'Unable to analyze requirement.'
        );

      } finally {

        setCompletenessLoading(
          false
        );
      }
    };


  /* =========================================================
     CREATE APPROVAL RECORD AUTOMATICALLY
     ========================================================= */

  const createRequirementApproval =
    async (
      requirement:
        ExtractedRequirement
    ): Promise<ApprovalResponse> => {

      if (
        selectedProjectId ===
        null
      ) {

        throw new Error(
          'No project selected.'
        );
      }


      const today =
        new Date()
          .toISOString()
          .split('T')[0];


      return createApproval({
        projectId:
          selectedProjectId,

        /*
         * Backend uses the REQ code in the title.
         */
        title:
          `${requirement.code} - ${requirement.title}`,

        type:
          'Requirement',

        requestedOn:
          today,
      });
    };


  /* =========================================================
     APPROVE REQUIREMENT
     ========================================================= */

  const handleApproveRequirement =
    async () => {

      if (
        !selectedRequirement ||
        selectedProjectId ===
          null
      ) {

        return;
      }


      if (
        !isBusinessAnalyst
      ) {

        setError(
          'Only Business Analysts can approve requirements.'
        );

        return;
      }


      const confirmed =
        window.confirm(
          `Approve ${selectedRequirement.code} - ${selectedRequirement.title}?`
        );


      if (
        !confirmed
      ) {

        return;
      }


      try {

        setDecidingApproval(
          'APPROVE'
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        let approval =
          selectedApproval;


        /*
         * No approval record yet.
         */
        if (
          !approval
        ) {

          approval =
            await createRequirementApproval(
              selectedRequirement
            );
        }


        if (
          approval.status ===
          'Approved'
        ) {

          setSuccess(
            `${selectedRequirement.code} is already approved.`
          );

          return;
        }


        if (
          approval.status ===
          'Rejected'
        ) {

          throw new Error(
            'This requirement has already been rejected.'
          );
        }


        /*
         * Backend approval side-effect changes
         * requirement status to APPROVED.
         */
        await approveApproval(
          approval.id
        );


        await refreshProjectData(
          selectedProjectId
        );


        setSuccess(
          `${selectedRequirement.code} approved successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to approve requirement.'
        );

      } finally {

        setDecidingApproval(
          null
        );
      }
    };


  /* =========================================================
     REJECT REQUIREMENT
     ========================================================= */

  const handleRejectRequirement =
    async () => {

      if (
        !selectedRequirement ||
        selectedProjectId ===
          null
      ) {

        return;
      }


      if (
        !isBusinessAnalyst
      ) {

        setError(
          'Only Business Analysts can reject requirements.'
        );

        return;
      }


      const confirmed =
        window.confirm(
          `Reject ${selectedRequirement.code} - ${selectedRequirement.title}?`
        );


      if (
        !confirmed
      ) {

        return;
      }


      try {

        setDecidingApproval(
          'REJECT'
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        let approval =
          selectedApproval;


        if (
          !approval
        ) {

          approval =
            await createRequirementApproval(
              selectedRequirement
            );
        }


        if (
          approval.status ===
          'Rejected'
        ) {

          setActiveTab(
            'REJECTED'
          );

          return;
        }


        if (
          approval.status ===
          'Approved'
        ) {

          throw new Error(
            'An approved requirement cannot be rejected.'
          );
        }


        await rejectApproval(
          approval.id
        );


        /*
         * Current backend may only change approval status.
         */
        await loadApprovals(
          selectedProjectId
        );


        setSuccess(
          `${selectedRequirement.code} rejected successfully.`
        );


        setActiveTab(
          'REJECTED'
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to reject requirement.'
        );

      } finally {

        setDecidingApproval(
          null
        );
      }
    };


  /* =========================================================
     HELPERS
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


  const getStatusStyle =
    (
      status:
        RequirementStatus
    ) => {

      switch (
        status
      ) {

        case 'APPROVED':

          return (
            'bg-emerald-50 text-emerald-700 border-emerald-200'
          );


        case 'REVIEW':

          return (
            'bg-amber-50 text-amber-700 border-amber-200'
          );


        case 'REJECTED':

          return (
            'bg-rose-50 text-rose-700 border-rose-200'
          );


        default:

          return (
            'bg-slate-100 text-slate-700 border-slate-200'
          );
      }
    };


  const getPriorityStyle =
    (
      priority:
        RequirementPriority
    ) => {

      switch (
        priority
      ) {

        case 'CRITICAL':

          return (
            'bg-rose-100 text-rose-700 border-rose-200'
          );


        case 'HIGH':

          return (
            'bg-orange-50 text-orange-700 border-orange-200'
          );


        case 'MEDIUM':

          return (
            'bg-amber-50 text-amber-700 border-amber-200'
          );


        default:

          return (
            'bg-slate-50 text-slate-600 border-slate-200'
          );
      }
    };


  const getTypeStyle =
    (
      type:
        RequirementType
    ) => {

      switch (
        type
      ) {

        case 'FUNCTIONAL':

          return (
            'bg-blue-50 text-blue-700 border-blue-200'
          );


        case 'NON_FUNCTIONAL':

          return (
            'bg-indigo-50 text-indigo-700 border-indigo-200'
          );


        case 'BUSINESS':

          return (
            'bg-purple-50 text-purple-700 border-purple-200'
          );


        case 'TECHNICAL':

          return (
            'bg-cyan-50 text-cyan-700 border-cyan-200'
          );


        case 'SECURITY':

          return (
            'bg-rose-50 text-rose-700 border-rose-200'
          );


        case 'PERFORMANCE':

          return (
            'bg-emerald-50 text-emerald-700 border-emerald-200'
          );


        default:

          return (
            'bg-slate-50 text-slate-700 border-slate-200'
          );
      }
    };


  /* =========================================================
     COUNTS
     ========================================================= */

  const draftCount =
    activeRequirements.filter(
      (
        requirement:
          ExtractedRequirement
      ) =>
        requirement.status ===
        'DRAFT'
    ).length;


  const reviewCount =
    activeRequirements.filter(
      (
        requirement:
          ExtractedRequirement
      ) => {

        const approval =
          latestApprovalByRequirement.get(
            requirement.code.toUpperCase()
          );


        return (
          requirement.status ===
            'REVIEW' ||
          approval?.status ===
            'Pending'
        );
      }
    ).length;


  const approvedCount =
    activeRequirements.filter(
      (
        requirement:
          ExtractedRequirement
      ) =>
        requirement.status ===
        'APPROVED'
    ).length;


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

            Requirements are available only to Business Analysts and Project Managers.

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

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">

            <FileText className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              Requirements

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Review extracted requirements, analyze completeness and approve or reject requirements.

            </p>

          </div>

        </div>


        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            disabled={
              selectedProjectId ===
                null ||
              requirementsLoading ||
              approvalLoading
            }
            onClick={
              () => {

                if (
                  selectedProjectId !==
                  null
                ) {

                  void refreshProjectData(
                    selectedProjectId
                  );
                }
              }
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-50"
          >

            <RefreshCcw
              className={
                `w-4 h-4 ${
                  requirementsLoading ||
                  approvalLoading
                    ? 'animate-spin'
                    : ''
                }`
              }
            />

            Refresh

          </button>


          {isBusinessAnalyst && (

            <Link
              href="/requirements/extract"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >

              <Sparkles className="w-4 h-4" />

              Extract Requirements

            </Link>

          )}

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


      {/* PROJECT */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5">

        <div className="flex flex-col md:flex-row md:items-center gap-4">

          <div className="flex items-center gap-3 shrink-0">

            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">

              <FolderKanban className="w-5 h-5 text-indigo-600" />

            </div>


            <div>

              <p className="text-xs font-bold text-slate-900">

                Active Project

              </p>

              <p className="text-[10px] text-slate-400">

                Requirements are loaded per project.

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
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-blue-500"
              >

                <option value="">

                  Select a project

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

                Status:

              </span>{' '}

              <span className="font-bold text-slate-700">

                {formatEnum(
                  selectedProject.status
                )}

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

          </div>

        )}

      </div>


      {/* NO PROJECT */}

      {!projectsLoading &&
        selectedProjectId ===
          null && (

        <EmptyState
          icon={
            <FolderKanban className="w-10 h-10 text-slate-300" />
          }
          title="Select a project"
          message="Choose a project before viewing its requirements."
        />

      )}


      {/* LOADING */}

      {selectedProjectId !==
        null &&
        requirementsLoading && (

        <div className="min-h-[350px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />

          <p className="text-xs text-slate-500 mt-3">

            Loading requirements...

          </p>

        </div>

      )}


      {/* NO REQUIREMENTS */}

      {selectedProjectId !==
        null &&
        !requirementsLoading &&
        noRequirementsAvailable && (

        <div className="min-h-[350px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

          <FileText className="w-10 h-10 text-indigo-300" />

          <h2 className="font-bold text-slate-800 mt-4">

            No requirements available

          </h2>

          <p className="text-sm text-slate-500 mt-2">

            Requirements have not been extracted for this project.

          </p>


          {isBusinessAnalyst && (

            <Link
              href="/requirements/extract"
              className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >

              <Sparkles className="w-4 h-4" />

              Extract Requirements

            </Link>

          )}

        </div>

      )}


      {/* MAIN WORKSPACE */}

      {selectedProjectId !==
        null &&
        !requirementsLoading &&
        extraction &&
        !noRequirementsAvailable && (

        <>

          {/* COUNTS */}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

            <SummaryCard
              title="Total"
              value={
                requirements.length
              }
            />

            <SummaryCard
              title="Draft"
              value={
                draftCount
              }
            />

            <SummaryCard
              title="In Review"
              value={
                reviewCount
              }
            />

            <SummaryCard
              title="Approved"
              value={
                approvedCount
              }
              valueClass="text-emerald-600"
            />

            <SummaryCard
              title="Rejected"
              value={
                rejectedRequirements.length
              }
              valueClass="text-rose-600"
            />

          </div>


          {/* TABS */}

          <div className="bg-white border border-slate-200 rounded-2xl p-2">

            <div className="grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={
                  () =>
                    setActiveTab(
                      'ACTIVE'
                    )
                }
                className={
                  `flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold ${
                    activeTab ===
                    'ACTIVE'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`
                }
              >

                <FileText className="w-4 h-4" />

                Active Requirements

                <span className="px-2 py-0.5 rounded-full bg-white/20">

                  {activeRequirements.length}

                </span>

              </button>


              <button
                type="button"
                onClick={
                  () =>
                    setActiveTab(
                      'REJECTED'
                    )
                }
                className={
                  `flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold ${
                    activeTab ===
                    'REJECTED'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-500 hover:bg-rose-50'
                  }`
                }
              >

                <XCircle className="w-4 h-4" />

                Rejected Requirements

                <span className="px-2 py-0.5 rounded-full bg-white/20">

                  {rejectedRequirements.length}

                </span>

              </button>

            </div>

          </div>


          {/* FILTERS */}

          <div className="bg-white border border-slate-200 rounded-2xl p-4">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

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
                  placeholder="Search requirements..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-blue-500"
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
                        RequirementStatus |
                        'ALL'
                    )
                }
                className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >

                <option value="ALL">
                  All Statuses
                </option>

                <option value="DRAFT">
                  Draft
                </option>

                <option value="REVIEW">
                  Review
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
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
                className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
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


              <select
                value={
                  typeFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setTypeFilter(
                      event.target.value as
                        RequirementType |
                        'ALL'
                    )
                }
                className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >

                <option value="ALL">
                  All Types
                </option>

                <option value="FUNCTIONAL">
                  Functional
                </option>

                <option value="NON_FUNCTIONAL">
                  Non Functional
                </option>

                <option value="BUSINESS">
                  Business
                </option>

                <option value="TECHNICAL">
                  Technical
                </option>

                <option value="SECURITY">
                  Security
                </option>

                <option value="PERFORMANCE">
                  Performance
                </option>

              </select>

            </div>

          </div>


          {/* REJECTED EMPTY */}

          {activeTab ===
            'REJECTED' &&
            rejectedRequirements.length ===
              0 ? (

            <EmptyState
              icon={
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              }
              title="No rejected requirements"
              message="No requirements have been rejected for this project."
            />

          ) : (

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-6">

              {/* TABLE */}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden self-start">

                <div className="p-5 border-b border-slate-100">

                  <h2 className="font-extrabold text-slate-900">

                    {activeTab ===
                    'REJECTED'
                      ? 'Rejected Requirements'
                      : 'Project Requirements'}

                  </h2>

                  <p className="text-xs text-slate-500 mt-1">

                    {filteredRequirements.length}
                    {' '}
                    requirements shown

                  </p>

                </div>


                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">

                        <th className="px-4 py-3">
                          Code
                        </th>

                        <th className="px-4 py-3">
                          Requirement
                        </th>

                        <th className="px-4 py-3">
                          Type
                        </th>

                        <th className="px-4 py-3">
                          Priority
                        </th>

                        <th className="px-4 py-3">
                          Status
                        </th>

                        <th className="px-4 py-3" />

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {filteredRequirements.length ===
                      0 ? (

                        <tr>

                          <td
                            colSpan={6}
                            className="px-4 py-14 text-center text-sm text-slate-400"
                          >

                            No matching requirements.

                          </td>

                        </tr>

                      ) : (

                        filteredRequirements.map(
                          (
                            requirement:
                              ExtractedRequirement
                          ) => {

                            const approval =
                              latestApprovalByRequirement.get(
                                requirement.code.toUpperCase()
                              );


                            const rejected =
                              isRequirementRejected(
                                requirement
                              );


                            return (

                              <tr
                                key={
                                  requirement.id
                                }
                                onClick={
                                  () =>
                                    setSelectedRequirementId(
                                      requirement.id
                                    )
                                }
                                className={
                                  `cursor-pointer ${
                                    selectedRequirement?.id ===
                                    requirement.id
                                      ? rejected
                                        ? 'bg-rose-50'
                                        : 'bg-blue-50'
                                      : 'hover:bg-slate-50'
                                  }`
                                }
                              >

                                <td className="px-4 py-4 align-top">

                                  <span
                                    className={
                                      `text-xs font-black ${
                                        rejected
                                          ? 'text-rose-600'
                                          : 'text-blue-600'
                                      }`
                                    }
                                  >

                                    {requirement.code}

                                  </span>

                                </td>


                                <td className="px-4 py-4 min-w-[280px]">

                                  <p className="text-sm font-bold text-slate-900">

                                    {requirement.title}

                                  </p>

                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">

                                    {requirement.description}

                                  </p>

                                </td>


                                <td className="px-4 py-4 align-top">

                                  <span
                                    className={
                                      `inline-flex px-2 py-1 rounded-full border text-[10px] font-bold ${
                                        getTypeStyle(
                                          requirement.type
                                        )
                                      }`
                                    }
                                  >

                                    {formatEnum(
                                      requirement.type
                                    )}

                                  </span>

                                </td>


                                <td className="px-4 py-4 align-top">

                                  <span
                                    className={
                                      `inline-flex px-2 py-1 rounded-full border text-[10px] font-bold ${
                                        getPriorityStyle(
                                          requirement.priority
                                        )
                                      }`
                                    }
                                  >

                                    {formatEnum(
                                      requirement.priority
                                    )}

                                  </span>

                                </td>


                                <td className="px-4 py-4 align-top">

                                  {rejected ? (

                                    <span className="inline-flex px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">

                                      Rejected

                                    </span>

                                  ) : approval?.status ===
                                    'Pending' ? (

                                    <span className="inline-flex px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">

                                      Pending Review

                                    </span>

                                  ) : (

                                    <span
                                      className={
                                        `inline-flex px-2 py-1 rounded-full border text-[10px] font-bold ${
                                          getStatusStyle(
                                            requirement.status
                                          )
                                        }`
                                      }
                                    >

                                      {formatEnum(
                                        requirement.status
                                      )}

                                    </span>

                                  )}

                                </td>


                                <td className="px-4 py-4">

                                  <ChevronRight className="w-4 h-4 text-slate-400" />

                                </td>

                              </tr>

                            );
                          }
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>


              {/* DETAILS */}

              <div className="space-y-5 self-start">

                {selectedRequirement && (

                  <>

                    <RequirementDetailsCard
                      requirement={
                        selectedRequirement
                      }
                      rejected={
                        isRequirementRejected(
                          selectedRequirement
                        )
                      }
                      formatEnum={
                        formatEnum
                      }
                      getStatusStyle={
                        getStatusStyle
                      }
                    />


                    {/* COMPLETENESS */}

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-2">

                            <BrainCircuit className="w-4 h-4 text-indigo-600" />

                            <h2 className="font-extrabold text-slate-900">

                              Completeness Analysis

                            </h2>

                          </div>

                          <p className="text-xs text-slate-500 mt-1">

                            Analyze quality and completeness using AI.

                          </p>

                        </div>


                        <button
                          type="button"
                          disabled={
                            completenessLoading
                          }
                          onClick={
                            () =>
                              void handleAnalyzeCompleteness()
                          }
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-50"
                        >

                          {completenessLoading ? (

                            <Loader2 className="w-4 h-4 animate-spin" />

                          ) : (

                            <Sparkles className="w-4 h-4" />

                          )}

                          Analyze

                        </button>

                      </div>


                      <div className="p-5">

                        {completenessLoading ? (

                          <div className="py-10 flex justify-center">

                            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />

                          </div>

                        ) : completenessError ? (

                          <div className="rounded-xl bg-rose-50 text-rose-700 p-4 text-xs">

                            {completenessError}

                          </div>

                        ) : completenessResult ? (

                          <CompletenessPanel
                            result={
                              completenessResult
                            }
                          />

                        ) : (

                          <div className="py-10 text-center">

                            <Activity className="w-7 h-7 text-indigo-300 mx-auto" />

                            <p className="text-xs font-bold text-slate-700 mt-3">

                              No analysis yet

                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">

                              Click Analyze to run completeness analysis.

                            </p>

                          </div>

                        )}

                      </div>

                    </div>


                    {/* APPROVAL */}

                    <ApprovalPanel
                      approval={
                        selectedApproval
                      }
                      requirement={
                        selectedRequirement
                      }
                      rejected={
                        isRequirementRejected(
                          selectedRequirement
                        )
                      }
                      isBusinessAnalyst={
                        isBusinessAnalyst
                      }
                      approvalLoading={
                        approvalLoading
                      }
                      deciding={
                        decidingApproval
                      }
                      onApprove={
                        handleApproveRequirement
                      }
                      onReject={
                        handleRejectRequirement
                      }
                    />

                  </>

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
   APPROVAL PANEL
   ========================================================= */

function ApprovalPanel({
  approval,
  requirement,
  rejected,
  isBusinessAnalyst,
  approvalLoading,
  deciding,
  onApprove,
  onReject
}: {
  approval:
    ApprovalResponse |
    null;

  requirement:
    ExtractedRequirement;

  rejected:
    boolean;

  isBusinessAnalyst:
    boolean;

  approvalLoading:
    boolean;

  deciding:
    'APPROVE' |
    'REJECT' |
    null;

  onApprove:
    () => Promise<void>;

  onReject:
    () => Promise<void>;
}) {

  if (
    approvalLoading
  ) {

    return (

      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex justify-center">

        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />

      </div>
    );
  }


  /* APPROVED */

  if (
    requirement.status ===
      'APPROVED' ||
    approval?.status ===
      'Approved'
  ) {

    return (

      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">

        <div className="flex items-start gap-3">

          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />

          <div className="flex-1">

            <p className="text-sm font-extrabold text-emerald-900">

              Requirement Approved

            </p>

            <p className="text-xs text-emerald-700 mt-1">

              {requirement.code} has been approved.

            </p>


            {approval && (

              <div className="grid grid-cols-2 gap-3 mt-4">

                <ApprovalDetail
                  title="Approval ID"
                  value={
                    approval.id
                  }
                />

                <ApprovalDetail
                  title="Status"
                  value="Approved"
                />

                <ApprovalDetail
                  title="Approved By"
                  value={
                    approval.decidedBy ||
                    '-'
                  }
                />

                <ApprovalDetail
                  title="Approved On"
                  value={
                    approval.decidedOn ||
                    '-'
                  }
                />

              </div>

            )}

          </div>

        </div>

      </div>
    );
  }


  /* REJECTED */

  if (
    rejected ||
    approval?.status ===
      'Rejected'
  ) {

    return (

      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">

        <div className="flex items-start gap-3">

          <XCircle className="w-6 h-6 text-rose-600 shrink-0" />

          <div className="flex-1">

            <p className="text-sm font-extrabold text-rose-900">

              Requirement Rejected

            </p>

            <p className="text-xs text-rose-700 mt-1">

              This requirement has been rejected.

            </p>


            {approval && (

              <div className="grid grid-cols-2 gap-3 mt-4">

                <ApprovalDetail
                  title="Approval ID"
                  value={
                    approval.id
                  }
                />

                <ApprovalDetail
                  title="Status"
                  value="Rejected"
                />

                <ApprovalDetail
                  title="Rejected By"
                  value={
                    approval.decidedBy ||
                    '-'
                  }
                />

                <ApprovalDetail
                  title="Rejected On"
                  value={
                    approval.decidedOn ||
                    '-'
                  }
                />

              </div>

            )}

          </div>

        </div>

      </div>
    );
  }


  /* BA DECISION */

  return (

    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      <div className="p-5 border-b border-slate-100">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

            <FileCheck2 className="w-5 h-5 text-blue-600" />

          </div>

          <div>

            <h2 className="font-extrabold text-slate-900">

              Requirement Review

            </h2>

            <p className="text-xs text-slate-500 mt-1">

              Approve or reject this requirement.

            </p>

          </div>

        </div>

      </div>


      <div className="p-5 space-y-4">

        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs font-black text-blue-600">

            {requirement.code}

          </p>

          <p className="text-sm font-bold text-slate-800 mt-1">

            {requirement.title}

          </p>

        </div>


        {approval?.status ===
          'Pending' && (

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">

            <div className="flex items-start gap-2">

              <Clock3 className="w-4 h-4 text-amber-600 mt-0.5" />

              <div>

                <p className="text-xs font-bold text-amber-800">

                  Approval record pending

                </p>

                <p className="text-[10px] text-amber-700 mt-1">

                  {approval.id}

                </p>

              </div>

            </div>

          </div>

        )}


        {isBusinessAnalyst ? (

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              disabled={
                deciding !==
                null
              }
              onClick={
                () =>
                  void onReject()
              }
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold disabled:opacity-50"
            >

              {deciding ===
              'REJECT' ? (

                <Loader2 className="w-4 h-4 animate-spin" />

              ) : (

                <XCircle className="w-4 h-4" />

              )}

              {deciding ===
              'REJECT'
                ? 'Rejecting...'
                : 'Reject Requirement'}

            </button>


            <button
              type="button"
              disabled={
                deciding !==
                null
              }
              onClick={
                () =>
                  void onApprove()
              }
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
            >

              {deciding ===
              'APPROVE' ? (

                <Loader2 className="w-4 h-4 animate-spin" />

              ) : (

                <Check className="w-4 h-4" />

              )}

              {deciding ===
              'APPROVE'
                ? 'Approving...'
                : 'Approve Requirement'}

            </button>

          </div>

        ) : (

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">

            <p className="text-xs text-slate-500">

              Only the Business Analyst can approve or reject requirements.

            </p>

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   REQUIREMENT DETAILS
   ========================================================= */

function RequirementDetailsCard({
  requirement,
  rejected,
  formatEnum,
  getStatusStyle
}: {
  requirement:
    ExtractedRequirement;

  rejected:
    boolean;

  formatEnum:
    (
      value:
        string |
        null |
        undefined
    ) => string;

  getStatusStyle:
    (
      status:
        RequirementStatus
    ) => string;
}) {

  const confidence =
    requirement.confidenceScore ===
      null

      ? null

      : requirement.confidenceScore <=
        1

        ? Math.round(
            requirement.confidenceScore *
            100
          )

        : Math.round(
            requirement.confidenceScore
          );


  return (

    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      <div className="p-5 border-b border-slate-100">

        <div className="flex items-start justify-between gap-3">

          <div>

            <p
              className={
                `text-xs font-black ${
                  rejected
                    ? 'text-rose-600'
                    : 'text-blue-600'
                }`
              }
            >

              {requirement.code}

            </p>

            <h2 className="font-extrabold text-slate-900 mt-1">

              {requirement.title}

            </h2>

          </div>


          {rejected ? (

            <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">

              Rejected

            </span>

          ) : (

            <span
              className={
                `px-2 py-1 rounded-full border text-[10px] font-bold ${
                  getStatusStyle(
                    requirement.status
                  )
                }`
              }
            >

              {formatEnum(
                requirement.status
              )}

            </span>

          )}

        </div>

      </div>


      <div className="p-5 space-y-5">

        <div>

          <p className="text-[10px] uppercase font-bold text-slate-400">

            Description

          </p>

          <p className="text-sm text-slate-700 mt-2 leading-relaxed">

            {requirement.description}

          </p>

        </div>


        <div className="grid grid-cols-2 gap-3">

          <DetailItem
            title="Type"
            value={
              formatEnum(
                requirement.type
              )
            }
          />

          <DetailItem
            title="Priority"
            value={
              formatEnum(
                requirement.priority
              )
            }
          />

          <DetailItem
            title="Status"
            value={
              formatEnum(
                requirement.status
              )
            }
          />

          <DetailItem
            title="Backend ID"
            value={
              String(
                requirement.id
              )
            }
          />

        </div>


        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-[10px] uppercase font-bold text-slate-400">

            AI Confidence

          </p>

          <p className="text-2xl font-black text-emerald-600 mt-2">

            {confidence ===
            null
              ? '-'
              : `${confidence}%`}

          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   COMPLETENESS PANEL
   ========================================================= */

function CompletenessPanel({
  result
}: {
  result:
    RequirementCompletenessResponse;
}) {

  const score =
    Math.round(
      result.completenessScore
    );


  return (

    <div className="space-y-5">

      <div className="rounded-xl bg-slate-50 p-4">

        <div className="flex justify-between items-center">

          <div>

            <p className="text-[10px] uppercase font-bold text-slate-400">

              Completeness Score

            </p>

            <p className="text-xs font-bold text-slate-700 mt-1">

              {displayValue(
                result.status
              )}

            </p>

          </div>

          <p className="text-3xl font-black text-indigo-600">

            {score}%

          </p>

        </div>

      </div>


      {result.criteria.length >
        0 && (

        <div>

          <div className="flex items-center gap-2 mb-3">

            <Target className="w-4 h-4 text-blue-600" />

            <p className="text-xs font-bold">

              Quality Criteria

            </p>

          </div>


          <div className="space-y-2">

            {result.criteria.map(
              (
                criterion,
                index
              ) => (

                <div
                  key={
                    index
                  }
                  className="border border-slate-200 rounded-xl p-3"
                >

                  <div className="flex justify-between gap-2">

                    <p className="text-xs font-bold text-slate-700">

                      {criterion.criterion}

                    </p>

                    <CriterionBadge
                      status={
                        criterion.status
                      }
                    />

                  </div>

                  <p className="text-[11px] text-slate-500 mt-2">

                    {criterion.explanation}

                  </p>

                </div>

              )
            )}

          </div>

        </div>

      )}


      {result.coverageChecks.length >
        0 && (

        <div>

          <p className="text-xs font-bold mb-3">

            Coverage

          </p>

          <div className="space-y-2">

            {result.coverageChecks.map(
              (
                coverage,
                index
              ) => (

                <div
                  key={
                    index
                  }
                  className="border border-slate-200 rounded-xl p-3"
                >

                  <div className="flex justify-between">

                    <p className="text-xs font-bold">

                      {coverage.topic}

                    </p>

                    <CoverageBadge
                      status={
                        coverage.status
                      }
                    />

                  </div>

                  <p className="text-[11px] text-slate-500 mt-2">

                    {coverage.reason}

                  </p>

                </div>

              )
            )}

          </div>

        </div>

      )}


      {result.confirmedMissing.length >
        0 && (

        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">

          <p className="text-xs font-bold text-rose-800">

            Missing Information

          </p>

          <div className="space-y-2 mt-3">

            {result.confirmedMissing.map(
              (
                item,
                index
              ) => (

                <p
                  key={
                    index
                  }
                  className="text-[11px] text-rose-700"
                >

                  • {item}

                </p>

              )
            )}

          </div>

        </div>

      )}


      {result.suggestions.length >
        0 && (

        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">

          <div className="flex items-center gap-2">

            <Lightbulb className="w-4 h-4 text-indigo-600" />

            <p className="text-xs font-bold text-indigo-800">

              Suggestions

            </p>

          </div>

          <div className="space-y-2 mt-3">

            {result.suggestions.map(
              (
                suggestion,
                index
              ) => (

                <p
                  key={
                    index
                  }
                  className="text-[11px] text-indigo-700"
                >

                  • {suggestion}

                </p>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function SummaryCard({
  title,
  value,
  valueClass =
    'text-slate-900'
}: {
  title:
    string;

  value:
    number;

  valueClass?:
    string;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-5">

      <p className="text-[10px] uppercase font-bold text-slate-400">

        {title}

      </p>

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


function DetailItem({
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


function ApprovalDetail({
  title,
  value
}: {
  title:
    string;

  value:
    string;
}) {

  return (

    <div className="rounded-xl bg-white/70 p-3">

      <p className="text-[9px] uppercase font-bold opacity-60">

        {title}

      </p>

      <p className="text-xs font-bold mt-1">

        {value}

      </p>

    </div>
  );
}


function EmptyState({
  icon,
  title,
  message
}: {
  icon:
    ReactNode;

  title:
    string;

  message:
    string;
}) {

  return (

    <div className="min-h-[350px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

      {icon}

      <h2 className="font-bold text-slate-800 mt-4">

        {title}

      </h2>

      <p className="text-sm text-slate-500 mt-2">

        {message}

      </p>

    </div>
  );
}


function CriterionBadge({
  status
}: {
  status:
    CriterionStatus;
}) {

  const style =
    status ===
      'PASS'

      ? 'bg-emerald-50 text-emerald-700'

      : status ===
        'PARTIAL'

        ? 'bg-amber-50 text-amber-700'

        : 'bg-rose-50 text-rose-700';


  return (

    <span
      className={
        `px-2 py-1 rounded-full text-[9px] font-bold ${style}`
      }
    >

      {displayValue(
        status
      )}

    </span>
  );
}


function CoverageBadge({
  status
}: {
  status:
    CoverageStatus;
}) {

  const style =
    status ===
      'COVERED'

      ? 'bg-emerald-50 text-emerald-700'

      : status ===
        'PARTIALLY_COVERED'

        ? 'bg-amber-50 text-amber-700'

        : 'bg-rose-50 text-rose-700';


  return (

    <span
      className={
        `px-2 py-1 rounded-full text-[9px] font-bold ${style}`
      }
    >

      {displayValue(
        status
      )}

    </span>
  );
}


function displayValue(
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