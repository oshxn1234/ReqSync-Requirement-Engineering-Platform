'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  FileCheck2,
  FileText,
  FolderKanban,
  GitBranch,
  Layers3,
  Loader2,
  Network,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  UserRoundCheck
} from 'lucide-react';

import {
  getAllProjects
} from '@/lib/project-api';

import {
  getProjectTraceability,
  syncExistingUserStoryTraceability,
  type ProjectTraceabilityResponse,
  type RequirementTraceabilityResponse,
  type TraceabilityArtifactResponse,
  type TraceabilityArtifactType
} from '@/lib/traceability-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


export default function TraceabilityPage() {

  /* =========================================================
     AUTH
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const canView =
    currentUser?.role ===
      'CEO' ||

    currentUser?.role ===
      'Project Manager' ||

    currentUser?.role ===
      'Business Analyst' ||

    currentUser?.role ===
      'Developer' ||

    currentUser?.role ===
      'QA Engineer';


  const canSync =
    currentUser?.role ===
      'CEO' ||

    currentUser?.role ===
      'Project Manager' ||

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
     DATA
     ========================================================= */

  const [
    traceability,
    setTraceability
  ] =
    useState<ProjectTraceabilityResponse | null>(
      null
    );


  const [
    projectsLoading,
    setProjectsLoading
  ] =
    useState(true);


  const [
    traceabilityLoading,
    setTraceabilityLoading
  ] =
    useState(false);


  const [
    syncing,
    setSyncing
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


  const [
    expandedRequirements,
    setExpandedRequirements
  ] =
    useState<number[]>(
      []
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
     LOAD PROJECTS
     ========================================================= */

  const loadProjects =
    useCallback(
      async () => {

        if (
          !canView
        ) {

          return;
        }


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


          const selectedStillExists =
            response.some(
              (project) =>
                project.id ===
                selectedProjectId
            );


          if (
            !selectedStillExists
          ) {

            if (
              response.length >
              0
            ) {

              selectProject(
                response[0].id
              );

            } else {

              selectProject(
                null
              );
            }
          }

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
        canView,
        selectedProjectId,
        setProjects,
        selectProject
      ]
    );


  /* =========================================================
     LOAD TRACEABILITY
     ========================================================= */

  const loadTraceability =
    useCallback(
      async (
        projectId: number
      ) => {

        try {

          setTraceabilityLoading(
            true
          );

          setError(
            null
          );

          setSuccess(
            null
          );


          const response =
            await getProjectTraceability(
              projectId
            );


          setTraceability(
            response
          );


          /*
           * Expand requirements that already have
           * artifacts by default.
           */
          setExpandedRequirements(
            response.requirements
              .filter(
                (requirement) =>
                  requirement.artifacts.length >
                  0
              )
              .map(
                (requirement) =>
                  requirement.requirementId
              )
          );

        } catch (error) {

          setTraceability(
            null
          );


          setExpandedRequirements(
            []
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load end-to-end traceability.'
          );

        } finally {

          setTraceabilityLoading(
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
        !canView
      ) {

        return;
      }


      void loadProjects();

    },
    [
      canView,
      loadProjects
    ]
  );


  /* =========================================================
     PROJECT CHANGE
     ========================================================= */

  useEffect(
    () => {

      setTraceability(
        null
      );

      setExpandedRequirements(
        []
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


      void loadTraceability(
        selectedProjectId
      );

    },
    [
      selectedProjectId,
      loadTraceability
    ]
  );


  /* =========================================================
     SYNC USER STORIES
     ========================================================= */

  const handleSync =
    async () => {

      if (
        selectedProjectId ===
        null ||
        !canSync
      ) {

        return;
      }


      try {

        setSyncing(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        const response =
          await syncExistingUserStoryTraceability(
            selectedProjectId
          );


        setSuccess(
          response.message
        );


        await loadTraceability(
          selectedProjectId
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to synchronize user story traceability.'
        );

      } finally {

        setSyncing(
          false
        );
      }
    };


  /* =========================================================
     EXPAND REQUIREMENT
     ========================================================= */

  const toggleRequirement =
    (
      requirementId: number
    ) => {

      setExpandedRequirements(
        (current) => {

          if (
            current.includes(
              requirementId
            )
          ) {

            return current.filter(
              (id) =>
                id !==
                requirementId
            );
          }


          return [
            ...current,
            requirementId,
          ];
        }
      );
    };


  /* =========================================================
     METRICS
     ========================================================= */

  const coveragePercentage =
    traceability &&
    traceability.approvedRequirements >
      0

      ? Math.round(
          (
            traceability.tracedRequirements /
            traceability.approvedRequirements
          ) *
          100
        )

      : 0;


  const totalArtifacts =
    traceability
      ? traceability.requirements.reduce(
          (
            total,
            requirement
          ) =>
            total +
            requirement.artifacts.length,

          0
        )

      : 0;


  /* =========================================================
     ACCESS
     ========================================================= */

  if (
    !canView
  ) {

    return (

      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">

        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">

          <ShieldAlert className="w-8 h-8 text-rose-600" />

        </div>


        <h1 className="text-xl font-extrabold text-slate-900 mt-5">

          Access Denied

        </h1>


        <p className="text-sm text-slate-500 mt-2">

          System Administrators do not have access to project traceability.

        </p>

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

          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">

            <GitBranch className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              End-to-End Traceability

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Trace approved requirements through user stories, SRS, UML and developer implementation.

            </p>

          </div>

        </div>


        <div className="flex flex-wrap items-center gap-2">

          <button
            type="button"
            disabled={
              selectedProjectId ===
                null ||
              traceabilityLoading
            }
            onClick={
              () => {

                if (
                  selectedProjectId !==
                  null
                ) {

                  void loadTraceability(
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
                  traceabilityLoading
                    ? 'animate-spin'
                    : ''
                }`
              }
            />

            Refresh

          </button>


          {canSync && (

            <button
              type="button"
              disabled={
                selectedProjectId ===
                  null ||
                syncing
              }
              onClick={
                () =>
                  void handleSync()
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >

              {syncing ? (

                <Loader2 className="w-4 h-4 animate-spin" />

              ) : (

                <Sparkles className="w-4 h-4" />

              )}


              {syncing
                ? 'Synchronizing...'
                : 'Sync Existing User Stories'}

            </button>

          )}

        </div>

      </div>


      {/* =====================================================
          INFO
          ===================================================== */}

      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">

        <div className="flex items-start gap-3">

          <Network className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />


          <div>

            <p className="text-sm font-bold text-indigo-900">

              Requirement-centered traceability

            </p>


            <p className="text-xs text-indigo-700 mt-1 leading-relaxed">

              Only approved requirements participate in end-to-end traceability. Each requirement can be linked to the downstream artifacts produced during the project lifecycle.

            </p>

          </div>

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

          <p className="text-sm">

            {error}

          </p>

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

                Select a project to inspect its traceability.

              </p>

            </div>

          </div>


          <div className="flex-1">

            {projectsLoading ? (

              <div className="flex items-center gap-2 text-xs text-slate-500">

                <Loader2 className="w-4 h-4 animate-spin" />

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

                      #{project.projectNumber} - {project.name}

                    </option>

                  )
                )}

              </select>

            )}

          </div>

        </div>


        {selectedProject && (

          <div className="mt-4 pt-4 border-t border-slate-100">

            <p className="text-xs text-slate-500">

              Selected:{' '}

              <span className="font-bold text-slate-800">

                {selectedProject.name}

              </span>

            </p>

          </div>

        )}

      </div>


      {/* =====================================================
          LOADING
          ===================================================== */}

      {selectedProjectId !==
        null &&
        traceabilityLoading && (

        <div className="min-h-[350px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

          <p className="text-xs text-slate-500 mt-3">

            Loading traceability...

          </p>

        </div>

      )}


      {/* =====================================================
          TRACEABILITY CONTENT
          ===================================================== */}

      {traceability &&
        !traceabilityLoading && (

        <>

          {/* =================================================
              SUMMARY
              ================================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

            <MetricCard
              label="Requirements"
              value={
                traceability.totalRequirements
              }
              icon={
                <FileText className="w-4 h-4" />
              }
            />


            <MetricCard
              label="Approved"
              value={
                traceability.approvedRequirements
              }
              icon={
                <FileCheck2 className="w-4 h-4" />
              }
            />


            <MetricCard
              label="Traced"
              value={
                traceability.tracedRequirements
              }
              icon={
                <GitBranch className="w-4 h-4" />
              }
            />


            <MetricCard
              label="Artifacts"
              value={
                totalArtifacts
              }
              icon={
                <Layers3 className="w-4 h-4" />
              }
            />


            <MetricCard
              label="Trace Coverage"
              value={
                `${coveragePercentage}%`
              }
              icon={
                <CheckCircle2 className="w-4 h-4" />
              }
            />

          </div>


          {/* =================================================
              TRACEABILITY PIPELINE LEGEND
              ================================================= */}

          <div className="bg-slate-900 rounded-2xl p-5">

            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">

              Traceability Lifecycle

            </p>


            <div className="flex flex-wrap items-center gap-2 mt-4">

              <PipelineNode
                icon={
                  <FileText className="w-4 h-4" />
                }
                label="Requirement"
              />

              <ChevronRight className="w-4 h-4 text-slate-600" />

              <PipelineNode
                icon={
                  <UserRoundCheck className="w-4 h-4" />
                }
                label="User Story"
              />

              <ChevronRight className="w-4 h-4 text-slate-600" />

              <PipelineNode
                icon={
                  <BookOpen className="w-4 h-4" />
                }
                label="SRS"
              />

              <ChevronRight className="w-4 h-4 text-slate-600" />

              <PipelineNode
                icon={
                  <Network className="w-4 h-4" />
                }
                label="UML"
              />

              <ChevronRight className="w-4 h-4 text-slate-600" />

              <PipelineNode
                icon={
                  <Code2 className="w-4 h-4" />
                }
                label="Developer Submission"
              />

            </div>

          </div>


          {/* =================================================
              REQUIREMENTS
              ================================================= */}

          {traceability.requirements.length ===
            0 ? (

            <div className="min-h-[330px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

              <GitBranch className="w-12 h-12 text-slate-300" />


              <h2 className="text-base font-bold text-slate-800 mt-4">

                No approved requirements available

              </h2>


              <p className="text-sm text-slate-500 mt-2 max-w-lg">

                End-to-end traceability begins after requirements are approved.

              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {traceability.requirements.map(
                (
                  requirement
                ) => (

                  <RequirementTraceabilityCard
                    key={
                      requirement.requirementId
                    }
                    requirement={
                      requirement
                    }
                    expanded={
                      expandedRequirements.includes(
                        requirement.requirementId
                      )
                    }
                    onToggle={
                      () =>
                        toggleRequirement(
                          requirement.requirementId
                        )
                    }
                  />

                )
              )}

            </div>

          )}

        </>

      )}

    </div>
  );
}


/* =========================================================
   REQUIREMENT CARD
   ========================================================= */

function RequirementTraceabilityCard({
  requirement,
  expanded,
  onToggle
}: {
  requirement:
    RequirementTraceabilityResponse;

  expanded:
    boolean;

  onToggle:
    () =>
      void;
}) {

  const grouped =
    groupArtifacts(
      requirement.artifacts
    );


  return (

    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

      <button
        type="button"
        onClick={
          onToggle
        }
        className="w-full p-5 text-left hover:bg-slate-50 transition-colors"
      >

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="text-xs font-black text-indigo-600">

                {requirement.requirementCode}

              </span>


              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold">

                {formatEnum(
                  requirement.requirementStatus
                )}

              </span>


              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold">

                {requirement.artifacts.length}
                {' '}
                {requirement.artifacts.length ===
                1
                  ? 'Artifact'
                  : 'Artifacts'}

              </span>

            </div>


            <h3 className="text-sm font-extrabold text-slate-900 mt-2">

              {requirement.requirementTitle}

            </h3>


            {requirement.sourceDocument && (

              <p className="text-[10px] text-slate-400 mt-2">

                Source: {requirement.sourceDocument}

              </p>

            )}

          </div>


          <div className="shrink-0 mt-1">

            {expanded ? (

              <ChevronDown className="w-5 h-5 text-slate-400" />

            ) : (

              <ChevronRight className="w-5 h-5 text-slate-400" />

            )}

          </div>

        </div>

      </button>


      {expanded && (

        <div className="border-t border-slate-100 p-5 bg-slate-50/50">

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

            <ArtifactColumn
              title="User Stories"
              type="USER_STORY"
              artifacts={
                grouped.USER_STORY
              }
            />


            <ArtifactColumn
              title="SRS Versions"
              type="SRS_VERSION"
              artifacts={
                grouped.SRS_VERSION
              }
            />


            <ArtifactColumn
              title="UML Versions"
              type="UML_DIAGRAM_VERSION"
              artifacts={
                grouped.UML_DIAGRAM_VERSION
              }
            />


            <ArtifactColumn
              title="Developer Submissions"
              type="DEVELOPER_SUBMISSION"
              artifacts={
                grouped.DEVELOPER_SUBMISSION
              }
            />

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   ARTIFACT COLUMN
   ========================================================= */

function ArtifactColumn({
  title,
  type,
  artifacts
}: {
  title:
    string;

  type:
    TraceabilityArtifactType;

  artifacts:
    TraceabilityArtifactResponse[];
}) {

  const icon =
    getArtifactIcon(
      type
    );


  return (

    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">

        <div className="flex items-center gap-2">

          <div className="text-indigo-600">

            {icon}

          </div>


          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">

            {title}

          </p>

        </div>


        <span className="text-[10px] font-black text-slate-400">

          {artifacts.length}

        </span>

      </div>


      {artifacts.length ===
        0 ? (

        <div className="px-4 py-8 text-center">

          <p className="text-[10px] text-slate-400">

            No linked artifact

          </p>

        </div>

      ) : (

        <div className="divide-y divide-slate-100">

          {artifacts.map(
            (
              artifact
            ) => (

              <div
                key={
                  artifact.linkId
                }
                className="p-4"
              >

                <p className="text-xs font-bold text-slate-800">

                  {artifact.artifactCode ||
                    `${formatEnum(
                      artifact.artifactType
                    )} #${artifact.artifactId}`}

                </p>


                {artifact.artifactTitle && (

                  <p className="text-[11px] text-slate-600 mt-1 leading-5">

                    {artifact.artifactTitle}

                  </p>

                )}


                <div className="flex flex-wrap items-center gap-2 mt-3">

                  {artifact.artifactVersion !==
                    null &&
                    artifact.artifactVersion >
                      0 && (

                    <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-bold">

                      Version {artifact.artifactVersion}

                    </span>

                  )}


                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold">

                    {formatRelation(
                      artifact.relationType
                    )}

                  </span>

                </div>


                {artifact.linkedAt && (

                  <p className="text-[9px] text-slate-400 mt-3">

                    Linked {formatDateTime(
                      artifact.linkedAt
                    )}

                  </p>

                )}

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}


/* =========================================================
   GROUP ARTIFACTS
   ========================================================= */

function groupArtifacts(
  artifacts:
    TraceabilityArtifactResponse[]
) {

  const grouped:
  Record<
    TraceabilityArtifactType,
    TraceabilityArtifactResponse[]
  > = {

    USER_STORY: [],

    SRS_VERSION: [],

    UML_DIAGRAM_VERSION: [],

    DEVELOPER_SUBMISSION: [],
  };


  for (
    const artifact
    of artifacts
  ) {

    grouped[
      artifact.artifactType
    ].push(
      artifact
    );
  }


  return grouped;
}


/* =========================================================
   ARTIFACT ICON
   ========================================================= */

function getArtifactIcon(
  type:
    TraceabilityArtifactType
) {

  switch (
    type
  ) {

    case 'USER_STORY':

      return (
        <UserRoundCheck className="w-4 h-4" />
      );


    case 'SRS_VERSION':

      return (
        <BookOpen className="w-4 h-4" />
      );


    case 'UML_DIAGRAM_VERSION':

      return (
        <Network className="w-4 h-4" />
      );


    case 'DEVELOPER_SUBMISSION':

      return (
        <Code2 className="w-4 h-4" />
      );
  }
}


/* =========================================================
   PIPELINE NODE
   ========================================================= */

function PipelineNode({
  icon,
  label
}: {
  icon:
    React.ReactNode;

  label:
    string;
}) {

  return (

    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">

      <span className="text-indigo-400">

        {icon}

      </span>


      <span className="text-[10px] font-bold">

        {label}

      </span>

    </div>
  );
}


/* =========================================================
   METRIC CARD
   ========================================================= */

function MetricCard({
  label,
  value,
  icon
}: {
  label:
    string;

  value:
    string |
    number;

  icon:
    React.ReactNode;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-4">

      <div className="flex items-center justify-between gap-3">

        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

          {label}

        </p>


        <div className="text-indigo-600">

          {icon}

        </div>

      </div>


      <p className="text-2xl font-black text-slate-900 mt-2">

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   ENUM FORMAT
   ========================================================= */

function formatEnum(
  value:
    string
) {

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
}


/* =========================================================
   RELATION FORMAT
   ========================================================= */

function formatRelation(
  relation:
    string
) {

  switch (
    relation
  ) {

    case 'GENERATED_AS_USER_STORY':

      return 'Generated as User Story';


    case 'DOCUMENTED_IN_SRS':

      return 'Documented in SRS';


    case 'DESIGNED_IN_UML':

      return 'Designed in UML';


    case 'IMPLEMENTED_BY_DEVELOPER_SUBMISSION':

      return 'Developer Implementation';


    default:

      return formatEnum(
        relation
      );
  }
}


/* =========================================================
   DATE
   ========================================================= */

function formatDateTime(
  value:
    string
) {

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


  return date.toLocaleString();
}