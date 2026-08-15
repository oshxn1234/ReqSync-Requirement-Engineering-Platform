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
  CheckCircle2,
  FileText,
  FolderKanban,
  Loader2,
  RefreshCcw,
  Sparkles
} from 'lucide-react';

import {
  getAllProjects
} from '@/lib/project-api';

import {
  extractRequirements,
  getLatestRequirementExtraction,
  type ExtractedRequirement,
  type RequirementExtractionResponse
} from '@/lib/requirement-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';


export default function RequirementExtractionPage() {

  /*
   * Project state.
   */
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


  /*
   * Requirement extraction states.
   */
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
    error,
    setError
  ] =
    useState<string | null>(
      null
    );


  /*
   * Get full selected project object.
   */
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


  /*
   * Load real projects from backend.
   */
  const loadProjects =
    useCallback(
      async () => {

        setError(null);


        try {

          setProjectsLoading(
            true
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
      [setProjects]
    );


  useEffect(
    () => {

      void loadProjects();

    },
    [loadProjects]
  );


  /*
   * POST /api/requirements/extract
   */
  const handleExtract =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      setError(null);
      setResult(null);


      if (
        selectedProjectId === null
      ) {

        setError(
          'Please select a project first.'
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


  /*
   * GET latest extraction.
   */
  const handleLoadLatest =
    async () => {

      setError(null);


      if (
        selectedProjectId === null
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


      return `${Math.round(score)}%`;
    };


  return (

    <div className="max-w-7xl mx-auto space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">

            <Sparkles className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">

              AI Requirement Extraction

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Convert meeting notes into structured software requirements using the backend AI service.

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
            selectedProjectId === null
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >

          {latestLoading ? (

            <Loader2 className="w-4 h-4 animate-spin" />

          ) : (

            <RefreshCcw className="w-4 h-4" />

          )}


          Load Latest Extraction

        </button>

      </div>


      {/* ERROR */}
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


      {/* NO PROJECT */}
      {!projectsLoading &&
        projects.length === 0 && (

        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">

          <FolderKanban className="w-5 h-5" />


          <p className="text-sm">

            No projects exist yet.{' '}

            <Link
              href="/projects"
              className="font-bold underline"
            >

              Create a project first.

            </Link>

          </p>

        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* INPUT SIDE */}
        <form
          onSubmit={
            handleExtract
          }
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5"
        >

          <div>

            <h2 className="font-extrabold text-slate-900">

              Extraction Input

            </h2>


            <p className="text-xs text-slate-500 mt-1">

              Select a backend project and paste your source notes.

            </p>

          </div>


          {/* PROJECT SELECT */}
          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1.5">

              Project

            </label>


            {projectsLoading ? (

              <div className="h-10 flex items-center">

                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />

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
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              >

                {projects.length ===
                  0 && (

                  <option value="">

                    No projects available

                  </option>
                )}


                {projects.map(
                  (project) => (

                    <option
                      key={project.id}
                      value={project.id}
                    >

                      #{project.id} - {project.name}

                    </option>
                  )
                )}

              </select>
            )}

          </div>


          {/* SELECTED PROJECT */}
          {selectedProject && (

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">

              <p className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">

                Selected Project

              </p>


              <p className="text-sm font-extrabold text-blue-900 mt-1">

                {selectedProject.name}

              </p>


              <p className="text-xs text-blue-700 mt-1">

                Backend ID: {selectedProject.id}

              </p>


              <p className="text-xs text-blue-700">

                Status:{' '}

                {formatEnum(
                  selectedProject.status
                )}

              </p>

            </div>
          )}


          {/* DOCUMENT */}
          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1.5">

              Meeting Notes / Document Content

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
              placeholder="Example: Customers can register using their name, email and password. A customer can own one or more bank accounts..."
              className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 resize-y focus:outline-none focus:border-blue-500 focus:bg-white"
            />

          </div>


          {/* EXTRACT BUTTON */}
          <button
            type="submit"
            disabled={
              loading ||
              selectedProjectId ===
                null
            }
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-sm font-bold"
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


        {/* RESULTS SIDE */}
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

                Select a project, enter meeting notes, and click Extract Requirements.

              </p>

            </div>

          ) : (

            <>

              {/* RESULT SUMMARY */}
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


              {/* RESULT TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">

                <div className="p-5 border-b border-slate-100">

                  <h2 className="font-extrabold text-slate-900">

                    Extracted Requirements

                  </h2>


                  {result.message && (

                    <p className="text-xs text-slate-500 mt-1">

                      {result.message}

                    </p>
                  )}

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


                              <td className="px-4 py-4 align-top text-xs text-slate-600">

                                {formatEnum(
                                  requirement.type
                                )}

                              </td>


                              <td className="px-4 py-4 align-top text-xs font-bold text-slate-700">

                                {formatEnum(
                                  requirement.priority
                                )}

                              </td>


                              <td className="px-4 py-4 align-top">

                                <span className="inline-flex px-2 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">

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