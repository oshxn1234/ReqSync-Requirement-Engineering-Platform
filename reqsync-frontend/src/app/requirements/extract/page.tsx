'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderKanban,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

import {
  useRouter
} from 'next/navigation';

import {
  getAllProjects,
  type ProjectResponse
} from '@/lib/project-api';

import {
  extractRequirements,
  getLatestRequirementExtraction,
  type ExtractedRequirement,
  type RequirementExtractionResponse
} from '@/lib/requirement-api';

import {
  getProjectMembers
} from '@/lib/team-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


export default function RequirementExtractionPage() {

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


  const isBusinessAnalyst =
    currentUser?.role ===
    'Business Analyst';


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
     PROJECTS AVAILABLE TO THIS BA
     ========================================================= */

  const [
    assignedProjects,
    setAssignedProjects
  ] =
    useState<ProjectResponse[]>(
      []
    );


  /* =========================================================
     EXTRACTION STATE
     ========================================================= */

  const [
    documentContent,
    setDocumentContent
  ] =
    useState('');


  const [
    result,
    setResult
  ] =
    useState<
      RequirementExtractionResponse |
      null
    >(null);


  const [
    loading,
    setLoading
  ] =
    useState(false);


  const [
    projectsLoading,
    setProjectsLoading
  ] =
    useState(true);


  const [
    latestLoading,
    setLatestLoading
  ] =
    useState(false);


  const [
    filteringProjects,
    setFilteringProjects
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
        assignedProjects.find(
          (project) =>
            project.id ===
            selectedProjectId
        ) ?? null,

      [
        assignedProjects,
        selectedProjectId
      ]
    );


  /* =========================================================
     LOAD ALL PROJECTS
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
     FILTER PROJECTS ASSIGNED TO CURRENT BA

     We use the existing project-members endpoint and
     compare the backend member userId with currentUser.id.
     ========================================================= */

  const loadAssignedProjects =
    useCallback(
      async () => {

        if (
          !isBusinessAnalyst ||
          !currentUser
        ) {

          setAssignedProjects(
            []
          );

          return;
        }


        try {

          setFilteringProjects(
            true
          );

          setError(
            null
          );


          const currentUserId =
            Number(
              currentUser.id
            );


          if (
            Number.isNaN(
              currentUserId
            )
          ) {

            setAssignedProjects(
              []
            );

            setError(
              'Unable to identify the authenticated Business Analyst.'
            );

            return;
          }


          const projectChecks =
            await Promise.allSettled(
              projects.map(
                async (
                  project
                ) => {

                  const members =
                    await getProjectMembers(
                      project.id
                    );


                  const assigned =
                    members.some(
                      (member) =>
                        member.active &&
                        member.userId ===
                        currentUserId &&
                        member.role ===
                        'BUSINESS_ANALYST'
                    );


                  return {
                    project,
                    assigned
                  };
                }
              )
            );


          const availableProjects =
            projectChecks

              .filter(
                (
                  result
                ): result is PromiseFulfilledResult<{
                  project: ProjectResponse;
                  assigned: boolean;
                }> =>
                  result.status ===
                  'fulfilled'
              )

              .filter(
                (result) =>
                  result.value.assigned
              )

              .map(
                (result) =>
                  result.value.project
              );


          setAssignedProjects(
            availableProjects
          );


          /*
           * If selected project is not available
           * to this BA, clear the selection.
           */
          if (
            selectedProjectId !==
              null &&
            !availableProjects.some(
              (project) =>
                project.id ===
                selectedProjectId
            )
          ) {

            selectProject(
              null
            );

            setResult(
              null
            );
          }

        } catch (error) {

          setAssignedProjects(
            []
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to determine Business Analyst project assignments.'
          );

        } finally {

          setFilteringProjects(
            false
          );
        }
      },

      [
        currentUser,
        isBusinessAnalyst,
        projects,
        selectedProjectId,
        selectProject
      ]
    );


  /* =========================================================
     INITIAL PROJECT LOAD
     ========================================================= */

  useEffect(
    () => {

      if (
        !isBusinessAnalyst
      ) {

        return;
      }


      void loadProjects();

    },
    [
      isBusinessAnalyst,
      loadProjects
    ]
  );


  /* =========================================================
     FILTER BA PROJECTS AFTER PROJECTS LOAD
     ========================================================= */

  useEffect(
    () => {

      if (
        !isBusinessAnalyst ||
        projectsLoading
      ) {

        return;
      }


      void loadAssignedProjects();

    },
    [
      isBusinessAnalyst,
      projectsLoading,
      loadAssignedProjects
    ]
  );


  /* =========================================================
     LOAD LATEST EXTRACTION WHEN PROJECT CHANGES
     ========================================================= */

  useEffect(
    () => {

      setResult(
        null
      );

      setSuccess(
        null
      );

      setError(
        null
      );

    },
    [
      selectedProjectId
    ]
  );


  /* =========================================================
     EXTRACT REQUIREMENTS
     ========================================================= */

  const handleExtract =
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

      setResult(
        null
      );


      if (
        !isBusinessAnalyst
      ) {

        setError(
          'Only Business Analysts can extract requirements.'
        );

        return;
      }


      if (
        selectedProjectId ===
        null
      ) {

        setError(
          'Please select a project first.'
        );

        return;
      }


      /*
       * Additional protection against manually
       * selecting a project outside the BA's assignment.
       */
      const projectIsAssigned =
        assignedProjects.some(
          (project) =>
            project.id ===
            selectedProjectId
        );


      if (
        !projectIsAssigned
      ) {

        setError(
          'You are not assigned as a Business Analyst for this project.'
        );

        return;
      }


      if (
        !documentContent.trim()
      ) {

        setError(
          'Meeting notes or document content is required.'
        );

        return;
      }


      try {

        setLoading(
          true
        );


        const response =
          await extractRequirements({

            projectId:
              selectedProjectId,

            documentContent:
              documentContent.trim(),
          });


        setResult(
          response
        );


        if (
          response.status ===
          'COMPLETED'
        ) {

          setSuccess(
            `${response.requirementCount} requirements were extracted successfully.`
          );
        }

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Requirement extraction failed.'
        );

      } finally {

        setLoading(
          false
        );
      }
    };


  /* =========================================================
     LOAD LATEST EXTRACTION
     ========================================================= */

  const handleLoadLatest =
    async () => {

      setError(
        null
      );

      setSuccess(
        null
      );


      if (
        selectedProjectId ===
        null
      ) {

        setError(
          'Please select a project first.'
        );

        return;
      }


      try {

        setLatestLoading(
          true
        );


        const response =
          await getLatestRequirementExtraction(
            selectedProjectId
          );


        setResult(
          response
        );

      } catch (error) {

        setResult(
          null
        );


        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load latest extraction.'
        );

      } finally {

        setLatestLoading(
          false
        );
      }
    };


  /* =========================================================
     FORMAT ENUM VALUE
     ========================================================= */

  const formatEnum =
    (
      value:
        string |
        null |
        undefined
    ) => {

      if (!value) {

        return '-';
      }


      return value
        .replace(
          /_/g,
          ' '
        )
        .toLowerCase()
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );
    };


  /* =========================================================
     CONFIDENCE SCORE
     ========================================================= */

  const confidenceText =
    (
      requirement:
        ExtractedRequirement
    ) => {

      if (
        requirement.confidenceScore ===
          null ||
        requirement.confidenceScore ===
          undefined
      ) {

        return '-';
      }


      const score =
        requirement.confidenceScore <=
        1

          ? requirement.confidenceScore *
            100

          : requirement.confidenceScore;


      return `${Math.round(
        score
      )}%`;
    };


  /* =========================================================
     ACCESS CONTROL
     ========================================================= */

  if (
    !isBusinessAnalyst
  ) {

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

            Requirement extraction can only be performed by the Business Analyst assigned to the project.

          </p>

        </div>


        <button
          type="button"
          onClick={
            () =>
              router.replace(
                '/dashboard'
              )
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
        >

          Return to Dashboard

        </button>

      </div>
    );
  }


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="max-w-7xl mx-auto space-y-6">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">

            <Sparkles className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">

              Requirement Extraction

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Convert stakeholder discussions, meeting notes and project information into structured software requirements.

            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={
            () =>
              void handleLoadLatest()
          }
          disabled={
            latestLoading ||
            selectedProjectId ===
              null
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >

          {latestLoading ? (

            <Loader2 className="w-4 h-4 animate-spin" />

          ) : (

            <RefreshCcw className="w-4 h-4" />

          )}

          Load Latest Extraction

        </button>

      </div>


      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {success && (

        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">

          <CheckCircle2 className="w-5 h-5 shrink-0" />


          <div className="flex-1">

            <p className="text-sm font-bold">

              Extraction Completed

            </p>


            <p className="text-xs mt-1">

              {success}

            </p>

          </div>


          <Link
            href="/requirements"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
          >

            View Requirements

            <ArrowRight className="w-4 h-4" />

          </Link>

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


            <p className="text-xs mt-1 break-words">

              {error}

            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          NO ASSIGNED PROJECTS
          ===================================================== */}

      {!projectsLoading &&
        !filteringProjects &&
        assignedProjects.length ===
          0 && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">

          <FolderKanban className="w-5 h-5 shrink-0" />


          <div>

            <p className="text-sm font-bold">

              No assigned projects

            </p>


            <p className="text-xs mt-1">

              You are not currently assigned as a Business Analyst to any project. A Project Manager must add you to a project team before requirement extraction can begin.

            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          MAIN GRID
          ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===================================================
            EXTRACTION INPUT
            =================================================== */}

        <form
          onSubmit={
            handleExtract
          }
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 self-start"
        >

          <div>

            <h2 className="font-extrabold text-slate-900">

              Extraction Input

            </h2>


            <p className="text-xs text-slate-500 mt-1">

              Select one of your assigned projects and provide stakeholder or meeting information.

            </p>

          </div>


          {/* =================================================
              PROJECT SELECT
              ================================================= */}

          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1.5">

              Project

            </label>


            {projectsLoading ||
            filteringProjects ? (

              <div className="h-11 px-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50">

                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />


                <span className="text-xs text-slate-500">

                  Loading assigned projects...

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
                        ? Number(
                            value
                          )
                        : null
                    );
                  }
                }
                disabled={
                  assignedProjects.length ===
                  0
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-60"
              >

                <option value="">

                  Select assigned project

                </option>


                {assignedProjects.map(
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


          {/* =================================================
              SELECTED PROJECT
              ================================================= */}

          {selectedProject && (

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">

              <div className="flex items-start gap-3">

                <FolderKanban className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />


                <div>

                  <p className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">

                    Selected Project

                  </p>


                  <p className="text-sm font-extrabold text-blue-900 mt-1">

                    {selectedProject.name}

                  </p>


                  <div className="space-y-1 mt-2">

                    <p className="text-xs text-blue-700">

                      Project #
                      {selectedProject.projectNumber}

                    </p>


                    <p className="text-xs text-blue-700">

                      Status:{' '}

                      {formatEnum(
                        selectedProject.status
                      )}

                    </p>


                    <p className="text-xs text-blue-700">

                      Project Manager:{' '}

                      {selectedProject.projectManagerName ||
                        'Not assigned'}

                    </p>

                  </div>

                </div>

              </div>

            </div>
          )}


          {/* =================================================
              DOCUMENT CONTENT
              ================================================= */}

          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1.5">

              Stakeholder / Meeting Information

            </label>


            <textarea
              rows={16}
              value={
                documentContent
              }
              onChange={
                (event) =>
                  setDocumentContent(
                    event.target.value
                  )
              }
              disabled={
                selectedProjectId ===
                  null
              }
              placeholder="Example:

Stakeholders discussed the need for employees to securely log in using their work email and password.

The System Administrator should be able to register employees and assign their system roles.

The CEO should be able to create projects and assign a Project Manager.

Business Analysts should review and approve extracted requirements before they are used for SRS, user story and UML generation.

The platform should respond to normal user actions within 2 seconds."
              className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 resize-y focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            />


            <div className="flex justify-between mt-2">

              <p className="text-[10px] text-slate-400">

                Paste stakeholder discussions, meeting notes, transcripts, emails or other requirement source material.

              </p>


              <p className="text-[10px] text-slate-400 shrink-0 ml-3">

                {documentContent.length}
                {' '}
                characters

              </p>

            </div>

          </div>


          {/* =================================================
              EXTRACTION BUTTON
              ================================================= */}

          <button
            type="submit"
            disabled={
              loading ||
              selectedProjectId ===
                null ||
              !documentContent.trim()
            }
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold"
          >

            {loading ? (

              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                Extracting Requirements...
              </>

            ) : (

              <>
                <Sparkles className="w-4 h-4" />

                Extract Requirements
              </>

            )}

          </button>

        </form>


        {/* ===================================================
            RESULT SIDE
            =================================================== */}

        <div className="lg:col-span-2 space-y-5">

          {!result ? (

            <div className="min-h-[500px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">

                <FileText className="w-8 h-8" />

              </div>


              <h3 className="font-extrabold text-slate-900 mt-4">

                No extraction result yet

              </h3>


              <p className="text-sm text-slate-500 mt-2 max-w-md">

                Select one of your assigned projects, enter stakeholder or meeting information, and run requirement extraction.

              </p>


              <div className="mt-5 max-w-md rounded-xl border border-indigo-100 bg-indigo-50 p-4">

                <p className="text-xs font-bold text-indigo-800">

                  What happens next?

                </p>


                <p className="text-[11px] text-indigo-700 mt-1 leading-relaxed">

                  Extracted requirements are stored as project requirements and can then be reviewed in the Requirements workspace.

                </p>

              </div>

            </div>

          ) : (

            <>

              {/* =============================================
                  RESULT SUMMARY
                  ============================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="p-5 bg-white border border-slate-200 rounded-2xl">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">

                    Extraction ID

                  </p>


                  <p className="text-2xl font-black text-slate-900 mt-2">

                    #{result.extractionId}

                  </p>

                </div>


                <div className="p-5 bg-white border border-slate-200 rounded-2xl">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">

                    Status

                  </p>


                  <div className="flex items-center gap-2 mt-2">

                    {result.status ===
                      'COMPLETED' && (

                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />

                    )}


                    {result.status ===
                      'PROCESSING' && (

                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />

                    )}


                    {result.status ===
                      'FAILED' && (

                      <AlertCircle className="w-5 h-5 text-rose-600" />

                    )}


                    <p className="text-lg font-black text-slate-900">

                      {formatEnum(
                        result.status
                      )}

                    </p>

                  </div>

                </div>


                <div className="p-5 bg-white border border-slate-200 rounded-2xl">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">

                    Requirements

                  </p>


                  <p className="text-2xl font-black text-blue-600 mt-2">

                    {result.requirementCount}

                  </p>

                </div>

              </div>


              {/* =============================================
                  RESULT TABLE
                  ============================================= */}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">

                <div className="p-5 border-b border-slate-100">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                    <div>

                      <h2 className="font-extrabold text-slate-900">

                        Extracted Requirements

                      </h2>


                      {result.message && (

                        <p className="text-xs text-slate-500 mt-1">

                          {result.message}

                        </p>

                      )}

                    </div>


                    {result.status ===
                      'COMPLETED' && (

                      <Link
                        href="/requirements"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                      >

                        Open Requirements

                        <ArrowRight className="w-4 h-4" />

                      </Link>

                    )}

                  </div>

                </div>


                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-400">

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

                        <th className="px-4 py-3">
                          Confidence
                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {result.requirements.length ===
                      0 ? (

                        <tr>

                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center text-sm text-slate-400"
                          >

                            No requirements were returned.

                          </td>

                        </tr>

                      ) : (

                        result.requirements.map(
                          (
                            requirement
                          ) => (

                            <tr
                              key={
                                requirement.id
                              }
                              className="hover:bg-slate-50/60"
                            >

                              <td className="px-4 py-4 align-top">

                                <span className="text-xs font-black text-blue-600">

                                  {requirement.code}

                                </span>

                              </td>


                              <td className="px-4 py-4 min-w-[300px]">

                                <p className="text-sm font-bold text-slate-900">

                                  {requirement.title}

                                </p>


                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">

                                  {requirement.description}

                                </p>

                              </td>


                              <td className="px-4 py-4 align-top">

                                <span className="inline-flex px-2 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700">

                                  {formatEnum(
                                    requirement.type
                                  )}

                                </span>

                              </td>


                              <td className="px-4 py-4 align-top">

                                <span
                                  className={
                                    `inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${
                                      requirement.priority ===
                                      'CRITICAL'
                                        ? 'bg-rose-50 text-rose-700'
                                        : requirement.priority ===
                                          'HIGH'
                                          ? 'bg-orange-50 text-orange-700'
                                          : requirement.priority ===
                                            'MEDIUM'
                                            ? 'bg-amber-50 text-amber-700'
                                            : 'bg-slate-100 text-slate-600'
                                    }`
                                  }
                                >

                                  {formatEnum(
                                    requirement.priority
                                  )}

                                </span>

                              </td>


                              <td className="px-4 py-4 align-top">

                                <span
                                  className={
                                    `inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${
                                      requirement.status ===
                                      'APPROVED'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : requirement.status ===
                                          'REVIEW'
                                          ? 'bg-amber-50 text-amber-700'
                                          : requirement.status ===
                                            'REJECTED'
                                            ? 'bg-rose-50 text-rose-700'
                                            : 'bg-slate-100 text-slate-700'
                                    }`
                                  }
                                >

                                  {formatEnum(
                                    requirement.status
                                  )}

                                </span>

                              </td>


                              <td className="px-4 py-4 align-top">

                                <span className="text-xs font-black text-emerald-600">

                                  {confidenceText(
                                    requirement
                                  )}

                                </span>

                              </td>

                            </tr>
                          )
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
}