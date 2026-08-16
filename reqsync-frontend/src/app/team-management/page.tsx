'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  History,
  Loader2,
  RefreshCcw,
  Sparkles,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import {
  getAllProjects
} from '@/lib/project-api';

import {
  getLatestRequirementExtraction
} from '@/lib/requirement-api';

import {
  addProjectMember,
  getBusinessAnalystSuitability,
  getProjectMembers,
  getTechnicalTeamSuitability,
  removeProjectMember,
  type BASuitabilityResponse,
  type ProjectMemberResponse,
  type TechnicalTeamSuitabilityResponse
} from '@/lib/team-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


type CandidateRole =
  | 'BUSINESS_ANALYST'
  | 'DEVELOPER'
  | 'QA_ENGINEER';


interface SuitabilityCandidate {
  userId: number;

  firstName: string;

  lastName: string;

  email: string;

  role: CandidateRole;

  suitabilityScore: number;

  confidence: string;

  historicalProjectCount: number;

  historyAvailable: boolean;

  reason: string;

  matchedRequirementCount?: number;
}


const ROLE_LABELS:
Record<CandidateRole, string> = {
  BUSINESS_ANALYST:
    'Business Analyst',

  DEVELOPER:
    'Developer',

  QA_ENGINEER:
    'QA Engineer',
};


export default function TeamManagementPage() {

  const router =
    useRouter();


  /* =========================================================
     AUTHENTICATED USER
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
     TEAM STATE
     ========================================================= */

  const [
    members,
    setMembers
  ] =
    useState<
      ProjectMemberResponse[]
    >([]);


  const [
    selectedRole,
    setSelectedRole
  ] =
    useState<
      CandidateRole |
      ''
    >('');


  const [
    candidates,
    setCandidates
  ] =
    useState<
      SuitabilityCandidate[]
    >([]);


  const [
    selectedCandidateId,
    setSelectedCandidateId
  ] =
    useState<number | null>(
      null
    );


  /* =========================================================
     REQUIREMENT STATE
     ========================================================= */

  const [
    requirementsAvailable,
    setRequirementsAvailable
  ] =
    useState(false);


  const [
    requirementCheckLoading,
    setRequirementCheckLoading
  ] =
    useState(false);


  /* =========================================================
     LOADING STATE
     ========================================================= */

  const [
    projectsLoading,
    setProjectsLoading
  ] =
    useState(true);


  const [
    membersLoading,
    setMembersLoading
  ] =
    useState(false);


  const [
    suitabilityLoading,
    setSuitabilityLoading
  ] =
    useState(false);


  const [
    addingMember,
    setAddingMember
  ] =
    useState(false);


  const [
    removingUserId,
    setRemovingUserId
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
    suitabilityError,
    setSuitabilityError
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
     SELECTED CANDIDATE
     ========================================================= */

  const selectedCandidate =
    useMemo(
      () =>
        candidates.find(
          (candidate) =>
            candidate.userId ===
            selectedCandidateId
        ) ?? null,

      [
        candidates,
        selectedCandidateId
      ]
    );


  /* =========================================================
     CURRENT TEAM COUNTS
     ========================================================= */

  const businessAnalystCount =
    members.filter(
      (member) =>
        member.role ===
        'BUSINESS_ANALYST'
    ).length;


  const developerCount =
    members.filter(
      (member) =>
        member.role ===
        'DEVELOPER'
    ).length;


  const qaCount =
    members.filter(
      (member) =>
        member.role ===
        'QA_ENGINEER'
    ).length;


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

          setError(null);


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
     LOAD TEAM MEMBERS
     ========================================================= */

  const loadMembers =
    useCallback(
      async (
        projectId: number
      ) => {

        try {

          setMembersLoading(
            true
          );

          setError(null);


          const response =
            await getProjectMembers(
              projectId
            );


          setMembers(
            response
          );

        } catch (error) {

          setMembers(
            []
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load project members.'
          );

        } finally {

          setMembersLoading(
            false
          );
        }
      },

      []
    );


  /* =========================================================
     CHECK REQUIREMENT EXTRACTION
     ========================================================= */

  const checkRequirements =
    useCallback(
      async (
        projectId: number
      ) => {

        try {

          setRequirementCheckLoading(
            true
          );


          const extraction =
            await getLatestRequirementExtraction(
              projectId
            );


          const available =
            extraction.status ===
              'COMPLETED' &&
            extraction.requirementCount >
              0;


          setRequirementsAvailable(
            available
          );

        } catch {

          /*
           * If latest extraction does not exist,
           * requirements are treated as unavailable.
           */
          setRequirementsAvailable(
            false
          );

        } finally {

          setRequirementCheckLoading(
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

      void loadProjects();

    },
    [
      loadProjects
    ]
  );


  /* =========================================================
     PROJECT CHANGED
     ========================================================= */

  useEffect(
    () => {

      setSelectedRole('');

      setCandidates([]);

      setSelectedCandidateId(
        null
      );

      setSuitabilityError(
        null
      );

      setSuccess(
        null
      );

      setRequirementsAvailable(
        false
      );


      if (
        selectedProjectId ===
        null
      ) {

        setMembers([]);

        return;
      }


      void loadMembers(
        selectedProjectId
      );


      void checkRequirements(
        selectedProjectId
      );

    },
    [
      selectedProjectId,
      loadMembers,
      checkRequirements
    ]
  );


  /* =========================================================
     SUITABILITY ANALYSIS
     ========================================================= */

  const analyzeCandidates =
    async (
      role:
        CandidateRole
    ) => {

      if (
        selectedProjectId ===
        null
      ) {

        return;
      }


      /*
       * Developer and QA are strictly unavailable
       * before requirement extraction.
       */
      if (
        (
          role ===
            'DEVELOPER' ||
          role ===
            'QA_ENGINEER'
        ) &&
        !requirementsAvailable
      ) {

        setSuitabilityError(
          'Developer and QA Engineer suitability becomes available only after project requirements have been extracted.'
        );

        setCandidates([]);

        setSelectedCandidateId(
          null
        );

        return;
      }


      try {

        setSuitabilityLoading(
          true
        );

        setSuitabilityError(
          null
        );

        setCandidates([]);

        setSelectedCandidateId(
          null
        );


        let rankedCandidates:
          SuitabilityCandidate[] =
          [];


        /* ===================================================
           BUSINESS ANALYST SUITABILITY
           =================================================== */

        if (
          role ===
          'BUSINESS_ANALYST'
        ) {

          const response:
            BASuitabilityResponse[] =
            await getBusinessAnalystSuitability(
              selectedProjectId
            );


          rankedCandidates =
            response.map(
              (candidate) => ({

                userId:
                  candidate.userId,

                firstName:
                  candidate.firstName,

                lastName:
                  candidate.lastName,

                email:
                  candidate.email,

                role:
                  'BUSINESS_ANALYST',

                suitabilityScore:
                  candidate.suitabilityScore,

                confidence:
                  candidate.confidence,

                historicalProjectCount:
                  candidate.historicalProjectCount,

                historyAvailable:
                  candidate.historyAvailable,

                reason:
                  candidate.reason,
              })
            );

        } else {

          /* =================================================
             DEVELOPER / QA SUITABILITY
             ================================================= */

          const response:
            TechnicalTeamSuitabilityResponse[] =
            await getTechnicalTeamSuitability(
              selectedProjectId
            );


          rankedCandidates =
            response

              .filter(
                (candidate) =>
                  candidate.role ===
                  role
              )

              .map(
                (candidate) => ({

                  userId:
                    candidate.userId,

                  firstName:
                    candidate.firstName,

                  lastName:
                    candidate.lastName,

                  email:
                    candidate.email,

                  role:
                    candidate.role,

                  suitabilityScore:
                    candidate.suitabilityScore,

                  confidence:
                    candidate.confidence,

                  historicalProjectCount:
                    candidate.historicalProjectCount,

                  historyAvailable:
                    candidate.historyAvailable,

                  matchedRequirementCount:
                    candidate.matchedRequirementCount,

                  reason:
                    candidate.reason,
                })
              );
        }


        /*
         * Highest suitability always appears first.
         */
        rankedCandidates.sort(
          (
            first,
            second
          ) =>
            second.suitabilityScore -
            first.suitabilityScore
        );


        /*
         * Remove employees who are already members.
         */
        const existingMemberIds =
          new Set(
            members.map(
              (member) =>
                member.userId
            )
          );


        const availableCandidates =
          rankedCandidates.filter(
            (candidate) =>
              !existingMemberIds.has(
                candidate.userId
              )
          );


        setCandidates(
          availableCandidates
        );


        /*
         * Automatically select the best match.
         */
        if (
          availableCandidates.length >
          0
        ) {

          setSelectedCandidateId(
            availableCandidates[0].userId
          );
        }

      } catch (error) {

        setCandidates([]);

        setSelectedCandidateId(
          null
        );


        setSuitabilityError(
          error instanceof Error
            ? error.message
            : 'Unable to calculate employee suitability.'
        );

      } finally {

        setSuitabilityLoading(
          false
        );
      }
    };


  /* =========================================================
     ROLE CHANGED
     ========================================================= */

  const handleRoleChange =
    (
      role:
        CandidateRole |
        ''
    ) => {

      setSelectedRole(
        role
      );

      setCandidates([]);

      setSelectedCandidateId(
        null
      );

      setSuitabilityError(
        null
      );

      setSuccess(
        null
      );


      if (!role) {

        return;
      }


      void analyzeCandidates(
        role
      );
    };


  /* =========================================================
     ADD TEAM MEMBER
     ========================================================= */

  const handleAddMember =
    async () => {

      if (
        selectedProjectId ===
          null ||
        selectedCandidate ===
          null
      ) {

        return;
      }


      try {

        setAddingMember(
          true
        );

        setError(null);

        setSuccess(null);


        const added =
          await addProjectMember(
            selectedProjectId,
            selectedCandidate.userId
          );


        /*
         * Reload the real member list so the backend
         * remains the source of truth.
         */
        await loadMembers(
          selectedProjectId
        );


        setCandidates(
          (current) =>
            current.filter(
              (candidate) =>
                candidate.userId !==
                added.userId
            )
        );


        setSelectedCandidateId(
          null
        );


        setSuccess(
          `${added.firstName} ${added.lastName} was added to the project team.`
        );


        /*
         * Re-run ranking after team changes.
         */
        if (
          selectedRole
        ) {

          await analyzeCandidates(
            selectedRole
          );
        }

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to add project member.'
        );

      } finally {

        setAddingMember(
          false
        );
      }
    };


  /* =========================================================
     REMOVE TEAM MEMBER
     ========================================================= */

  const handleRemoveMember =
    async (
      member:
        ProjectMemberResponse
    ) => {

      if (
        selectedProjectId ===
        null
      ) {

        return;
      }


      const confirmed =
        window.confirm(
          `Remove ${member.firstName} ${member.lastName} from this project?`
        );


      if (!confirmed) {

        return;
      }


      try {

        setRemovingUserId(
          member.userId
        );

        setError(null);

        setSuccess(null);


        await removeProjectMember(
          selectedProjectId,
          member.userId
        );


        await loadMembers(
          selectedProjectId
        );


        setSuccess(
          `${member.firstName} ${member.lastName} was removed from the project team.`
        );


        if (
          selectedRole
        ) {

          await analyzeCandidates(
            selectedRole
          );
        }

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to remove project member.'
        );

      } finally {

        setRemovingUserId(
          null
        );
      }
    };


  /* =========================================================
     FORMAT ROLE
     ========================================================= */

  const formatRole =
    (
      role: string
    ) =>
      role

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
    !isProjectManager
  ) {

    return (

      <div className="max-w-lg mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">

        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">

          <Users className="w-7 h-7 text-rose-600" />

        </div>


        <h1 className="text-xl font-extrabold text-slate-900 mt-4">

          Project Manager Access Required

        </h1>


        <p className="text-sm text-slate-500 mt-2">

          Project teams can only be managed by the assigned Project Manager.

        </p>


        <button
          type="button"
          onClick={
            () =>
              router.replace(
                '/dashboard'
              )
          }
          className="mt-5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
        >

          Return to Dashboard

        </button>

      </div>
    );
  }


  return (

    <div className="max-w-7xl mx-auto space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">

            <Users className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">

              Team Management

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Build project teams using AI-assisted employee suitability ranking.

            </p>

          </div>

        </div>


        <button
          type="button"
          disabled={
            selectedProjectId ===
              null ||
            membersLoading
          }
          onClick={
            () => {

              if (
                selectedProjectId !==
                null
              ) {

                void loadMembers(
                  selectedProjectId
                );

                void checkRequirements(
                  selectedProjectId
                );
              }
            }
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-50"
        >

          <RefreshCcw
            className={
              `w-4 h-4 ${
                membersLoading
                  ? 'animate-spin'
                  : ''
              }`
            }
          />

          Refresh Team

        </button>

      </div>


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
          PROJECT SELECTION
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

                Select the project team to manage.

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
                  (event) => {

                    const value =
                      event.target.value;


                    selectProject(
                      value
                        ? Number(value)
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

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2">

            <div className="text-xs">

              <span className="text-slate-400">

                Project:

              </span>{' '}

              <span className="font-bold text-slate-700">

                {selectedProject.name}

              </span>

            </div>


            <div className="text-xs">

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


      {/* =====================================================
          NO PROJECT
          ===================================================== */}

      {selectedProjectId ===
        null && (

        <div className="min-h-[320px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center">

          <FolderKanban className="w-10 h-10 text-slate-300" />


          <h2 className="text-sm font-bold text-slate-800 mt-4">

            Select a project

          </h2>


          <p className="text-xs text-slate-500 mt-1">

            Choose a project before managing its team.

          </p>

        </div>
      )}


      {selectedProjectId !==
        null && (

        <>

          {/* =================================================
              TEAM SETUP PROGRESS
              ================================================= */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-sm font-bold text-slate-900">

                  Team Setup Progress

                </h2>


                <p className="text-xs text-slate-500 mt-1">

                  Developer and QA assignment becomes available after requirement extraction.

                </p>

              </div>


              {requirementCheckLoading && (

                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />

              )}

            </div>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">

              {/* BA */}

              <ProgressItem
                completed={
                  businessAnalystCount >
                  0
                }
                title="Business Analyst"
                description={
                  businessAnalystCount >
                  0
                    ? `${businessAnalystCount} assigned`
                    : 'Required before extraction'
                }
              />


              {/* REQUIREMENTS */}

              <ProgressItem
                completed={
                  requirementsAvailable
                }
                title="Requirements"
                description={
                  requirementsAvailable
                    ? 'Extraction completed'
                    : 'Not extracted yet'
                }
              />


              {/* DEVELOPERS */}

              <ProgressItem
                completed={
                  developerCount >
                  0
                }
                locked={
                  !requirementsAvailable
                }
                title="Developers"
                description={
                  !requirementsAvailable
                    ? 'Locked until extraction'
                    : developerCount >
                      0
                      ? `${developerCount} assigned`
                      : 'Ready for assignment'
                }
              />


              {/* QA */}

              <ProgressItem
                completed={
                  qaCount >
                  0
                }
                locked={
                  !requirementsAvailable
                }
                title="QA Engineers"
                description={
                  !requirementsAvailable
                    ? 'Locked until extraction'
                    : qaCount >
                      0
                      ? `${qaCount} assigned`
                      : 'Ready for assignment'
                }
              />

            </div>

          </div>


          {/* =================================================
              TEAM AREA
              ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">

            {/* ===============================================
                ADD MEMBER
                =============================================== */}

            <div className="space-y-5">

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">

                <div>

                  <div className="flex items-center gap-2">

                    <UserPlus className="w-4 h-4 text-blue-600" />


                    <h2 className="text-sm font-bold text-slate-900">

                      Add Team Member

                    </h2>

                  </div>


                  <p className="text-xs text-slate-500 mt-1">

                    Select a role and ReqSync will rank eligible employees automatically.

                  </p>

                </div>


                {/* ===========================================
                    WORKFLOW NOTICE
                    =========================================== */}

                {!requirementsAvailable &&
                  !requirementCheckLoading && (

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                    <div className="flex items-start gap-3">

                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />


                      <div>

                        <p className="text-xs font-bold text-blue-800">

                          Initial Team Setup

                        </p>


                        <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">

                          Requirements have not been extracted yet. Only a Business Analyst can currently be assigned.

                        </p>


                        <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">

                          Developer and QA Engineer suitability will unlock automatically after requirement extraction is completed.

                        </p>

                      </div>

                    </div>

                  </div>
                )}


                {/* ===========================================
                    ROLE SELECT
                    =========================================== */}

                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">

                    Team Role

                  </label>


                  <select
                    value={
                      selectedRole
                    }
                    disabled={
                      requirementCheckLoading
                    }
                    onChange={
                      (event) =>
                        handleRoleChange(
                          event.target.value as
                            CandidateRole |
                            ''
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                  >

                    <option value="">

                      Select employee role

                    </option>


                    <option value="BUSINESS_ANALYST">

                      Business Analyst

                    </option>


                    {requirementsAvailable && (

                      <>
                        <option value="DEVELOPER">

                          Developer

                        </option>


                        <option value="QA_ENGINEER">

                          QA Engineer

                        </option>
                      </>
                    )}

                  </select>

                </div>


                {/* ===========================================
                    SUITABILITY LOADING
                    =========================================== */}

                {suitabilityLoading && (

                  <div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-slate-50 border border-slate-100">

                    <div className="w-9 h-9 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />


                    <div className="flex items-center gap-1.5 mt-3">

                      <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />


                      <p className="text-xs font-bold text-slate-600">

                        Calculating suitability...

                      </p>

                    </div>


                    <p className="text-[10px] text-slate-400 mt-1 text-center px-4">

                      Evaluating employee experience and project relevance.

                    </p>

                  </div>
                )}


                {/* ===========================================
                    SUITABILITY ERROR
                    =========================================== */}

                {suitabilityError &&
                  !suitabilityLoading && (

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <div className="flex items-start gap-2">

                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />


                      <div>

                        <p className="text-xs font-bold text-amber-800">

                          Suitability unavailable

                        </p>


                        <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">

                          {suitabilityError}

                        </p>

                      </div>

                    </div>

                  </div>
                )}


                {/* ===========================================
                    RANKED EMPLOYEE DROPDOWN
                    =========================================== */}

                {selectedRole &&
                  !suitabilityLoading &&
                  !suitabilityError && (

                  <div>

                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">

                      Recommended Employees

                    </label>


                    {candidates.length ===
                    0 ? (

                      <div className="text-xs text-slate-500 border border-slate-200 bg-slate-50 rounded-xl p-4">

                        No available employees were found for this role.

                      </div>

                    ) : (

                      <div className="relative">

                        <select
                          value={
                            selectedCandidateId ??
                            ''
                          }
                          onChange={
                            (event) =>
                              setSelectedCandidateId(
                                event.target.value
                                  ? Number(
                                      event.target.value
                                    )
                                  : null
                              )
                          }
                          className="w-full appearance-none text-xs px-3.5 py-3 pr-10 border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:border-blue-500"
                        >

                          {candidates.map(
                            (
                              candidate,
                              index
                            ) => (

                              <option
                                key={
                                  candidate.userId
                                }
                                value={
                                  candidate.userId
                                }
                              >

                                {index === 0
                                  ? '★ '
                                  : ''}

                                {candidate.firstName}{' '}
                                {candidate.lastName}
                                {' — '}
                                {Math.round(
                                  candidate.suitabilityScore
                                )}
                                % Match

                              </option>
                            )
                          )}

                        </select>


                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                      </div>
                    )}

                  </div>
                )}


                {/* ===========================================
                    CANDIDATE ANALYSIS
                    =========================================== */}

                {selectedCandidate &&
                  !suitabilityLoading && (

                  <CandidateAnalysis
                    candidate={
                      selectedCandidate
                    }
                  />
                )}


                {/* ===========================================
                    ADD BUTTON
                    =========================================== */}

                {selectedCandidate && (

                  <button
                    type="button"
                    disabled={
                      addingMember
                    }
                    onClick={
                      () =>
                        void handleAddMember()
                    }
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                  >

                    {addingMember ? (

                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />

                        Adding Member...
                      </>

                    ) : (

                      <>
                        <UserPlus className="w-4 h-4" />

                        Add to Project Team
                      </>

                    )}

                  </button>
                )}

              </div>

            </div>


            {/* ===============================================
                CURRENT TEAM
                =============================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden self-start">

              <div className="p-5 border-b border-slate-100">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <h2 className="text-sm font-bold text-slate-900">

                      Project Team

                    </h2>


                    <p className="text-xs text-slate-500 mt-1">

                      Employees currently assigned to this project.

                    </p>

                  </div>


                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">

                    {members.length}{' '}

                    {members.length === 1
                      ? 'Member'
                      : 'Members'}

                  </span>

                </div>

              </div>


              {membersLoading ? (

                <div className="min-h-[300px] flex items-center justify-center">

                  <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />

                </div>

              ) : members.length ===
                0 ? (

                <div className="min-h-[300px] flex flex-col items-center justify-center text-center px-6">

                  <Users className="w-10 h-10 text-slate-300" />


                  <p className="text-sm font-bold text-slate-700 mt-3">

                    No team members assigned

                  </p>


                  <p className="text-xs text-slate-400 mt-1">

                    Add a Business Analyst to begin project setup.

                  </p>

                </div>

              ) : (

                <div className="divide-y divide-slate-100">

                  {members.map(
                    (member) => {

                      const initials =
                        `${member.firstName.charAt(
                          0
                        )}${member.lastName.charAt(
                          0
                        )}`.toUpperCase();


                      return (

                        <div
                          key={
                            member.membershipId
                          }
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                        >

                          <div className="flex items-start gap-3 min-w-0">

                            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-xs shrink-0">

                              {initials}

                            </div>


                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="text-sm font-bold text-slate-800">

                                  {member.firstName}{' '}
                                  {member.lastName}

                                </p>


                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">

                                  {formatRole(
                                    member.role
                                  )}

                                </span>


                                {member.active && (

                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">

                                    Active

                                  </span>
                                )}

                              </div>


                              <p className="text-xs text-slate-400 mt-1">

                                {member.email}

                              </p>


                              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">

                                <History className="w-3 h-3" />

                                Assigned{' '}

                                {new Date(
                                  member.assignedAt
                                ).toLocaleDateString()}

                              </div>

                            </div>

                          </div>


                          <button
                            type="button"
                            disabled={
                              removingUserId ===
                              member.userId
                            }
                            onClick={
                              () =>
                                void handleRemoveMember(
                                  member
                                )
                            }
                            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50 self-end sm:self-center transition-colors"
                            title="Remove team member"
                          >

                            {removingUserId ===
                            member.userId ? (

                              <Loader2 className="w-4 h-4 animate-spin" />

                            ) : (

                              <Trash2 className="w-4 h-4" />

                            )}

                          </button>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </div>

        </>
      )}

    </div>
  );
}


/* =========================================================
   TEAM SETUP PROGRESS ITEM
   ========================================================= */

function ProgressItem({
  completed,
  locked = false,
  title,
  description
}: {
  completed: boolean;
  locked?: boolean;
  title: string;
  description: string;
}) {

  return (

    <div
      className={
        `rounded-xl border p-4 ${
          completed
            ? 'bg-emerald-50 border-emerald-200'
            : locked
              ? 'bg-slate-50 border-slate-200 opacity-70'
              : 'bg-blue-50 border-blue-200'
        }`
      }
    >

      <div className="flex items-center gap-2">

        <div
          className={
            `w-6 h-6 rounded-full flex items-center justify-center ${
              completed
                ? 'bg-emerald-600 text-white'
                : locked
                  ? 'bg-slate-200 text-slate-500'
                  : 'bg-blue-600 text-white'
            }`
          }
        >

          {completed ? (

            <CheckCircle2 className="w-4 h-4" />

          ) : locked ? (

            <span className="text-[10px] font-black">
              ×
            </span>

          ) : (

            <span className="text-[10px] font-black">
              •
            </span>

          )}

        </div>


        <p
          className={
            `text-xs font-bold ${
              completed
                ? 'text-emerald-800'
                : locked
                  ? 'text-slate-600'
                  : 'text-blue-800'
            }`
          }
        >

          {title}

        </p>

      </div>


      <p className="text-[10px] text-slate-500 mt-2">

        {description}

      </p>

    </div>
  );
}


/* =========================================================
   CANDIDATE SUITABILITY CARD
   ========================================================= */

function CandidateAnalysis({
  candidate
}: {
  candidate:
    SuitabilityCandidate;
}) {

  const score =
    Math.round(
      candidate.suitabilityScore
    );


  let textColor =
    'text-amber-700';

  let background =
    'bg-amber-50';

  let border =
    'border-amber-200';

  let progress =
    'bg-amber-500';


  if (
    score >= 85
  ) {

    textColor =
      'text-emerald-700';

    background =
      'bg-emerald-50';

    border =
      'border-emerald-200';

    progress =
      'bg-emerald-500';

  } else if (
    score >= 65
  ) {

    textColor =
      'text-blue-700';

    background =
      'bg-blue-50';

    border =
      'border-blue-200';

    progress =
      'bg-blue-500';
  }


  return (

    <div
      className={
        `rounded-2xl border p-4 ${background} ${border}`
      }
    >

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <BrainCircuit className={`w-4 h-4 ${textColor}`} />


            <p className={`text-xs font-bold ${textColor}`}>

              Suitability Analysis

            </p>

          </div>


          <p className="text-sm font-extrabold text-slate-800 mt-2">

            {candidate.firstName}{' '}
            {candidate.lastName}

          </p>


          <p className="text-[10px] text-slate-500 mt-0.5">

            {ROLE_LABELS[
              candidate.role
            ]}
            {' · '}
            {candidate.email}

          </p>

        </div>


        <div className="text-right shrink-0">

          <p className={`text-2xl font-black ${textColor}`}>

            {score}%

          </p>


          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

            Suitability

          </p>

        </div>

      </div>


      {/* SCORE BAR */}

      <div className="mt-4 h-2 rounded-full bg-white/70 overflow-hidden">

        <div
          className={`h-full rounded-full ${progress}`}
          style={{
            width:
              `${Math.max(
                0,
                Math.min(
                  score,
                  100
                )
              )}%`
          }}
        />

      </div>


      {/* INFORMATION */}

      <div className="grid grid-cols-2 gap-3 mt-4">

        <div className="bg-white/70 rounded-xl p-3">

          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

            Confidence

          </p>


          <p className="text-xs font-bold text-slate-700 mt-1">

            {candidate.confidence ||
              '-'}

          </p>

        </div>


        <div className="bg-white/70 rounded-xl p-3">

          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

            Past Projects

          </p>


          <p className="text-xs font-bold text-slate-700 mt-1">

            {candidate.historicalProjectCount}

          </p>

        </div>

      </div>


      {candidate.matchedRequirementCount !==
        undefined && (

        <div className="bg-white/70 rounded-xl p-3 mt-3">

          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

            Matching Requirements

          </p>


          <p className="text-xs font-bold text-slate-700 mt-1">

            {candidate.matchedRequirementCount}

          </p>

        </div>
      )}


      {/* REASON */}

      {candidate.reason && (

        <div className="mt-4 pt-4 border-t border-black/5">

          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

            Why this employee is recommended

          </p>


          <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">

            {candidate.reason}

          </p>

        </div>
      )}


      {candidate.historyAvailable ? (

        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-semibold text-emerald-700">

          <CheckCircle2 className="w-3.5 h-3.5" />

          Historical project evidence available

        </div>

      ) : (

        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-semibold text-amber-700">

          <AlertCircle className="w-3.5 h-3.5" />

          Limited historical evidence available

        </div>
      )}

    </div>
  );
}