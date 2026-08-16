'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit3,
  FileClock,
  FileText,
  FolderKanban,
  Loader2,
  RefreshCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  getAllProjects
} from '@/lib/project-api';

import {
  deleteSrs,
  generateSrs,
  getProjectSrs,
  getSrsVersions,
  updateSrs,
  type SrsGenerationResponse,
  type SrsStatus
} from '@/lib/srs-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  useProjectStore
} from '@/store/projectStore';


export default function SrsPage() {

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


  const canViewPage =
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
     SRS DATA
     ========================================================= */

  const [
    latestSrs,
    setLatestSrs
  ] =
    useState<
      SrsGenerationResponse |
      null
    >(null);


  const [
    versions,
    setVersions
  ] =
    useState<
      SrsGenerationResponse[]
    >([]);


  const [
    selectedSrsId,
    setSelectedSrsId
  ] =
    useState<number | null>(
      null
    );


  /* =========================================================
     PDF DOCUMENT REFERENCE
     ========================================================= */

  const pdfDocumentRef =
    useRef<HTMLDivElement | null>(
      null
    );


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
    deleting,
    setDeleting
  ] =
    useState(false);


  const [
    downloadingPdf,
    setDownloadingPdf
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
    editContent,
    setEditContent
  ] =
    useState('');


  const [
    editStatus,
    setEditStatus
  ] =
    useState<SrsStatus>(
      'DRAFT'
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
     SELECTED SRS
     ========================================================= */

  const selectedSrs =
    useMemo(
      () => {

        if (
          versions.length ===
          0
        ) {

          return latestSrs;
        }


        if (
          selectedSrsId ===
          null
        ) {

          return (
            latestSrs ??
            versions[0]
          );
        }


        return (
          versions.find(
            (version) =>
              version.id ===
              selectedSrsId
          ) ??
          latestSrs ??
          versions[0]
        );
      },

      [
        versions,
        selectedSrsId,
        latestSrs
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
     LOAD SRS
     ========================================================= */

  const loadSrsData =
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
            latest,
            history
          ] =
            await Promise.all([

              getProjectSrs(
                projectId
              ),

              getSrsVersions(
                projectId
              ),
            ]);


          setLatestSrs(
            latest
          );


          setVersions(
            history
          );


          if (
            latest
          ) {

            setSelectedSrsId(
              latest.id
            );

          } else if (
            history.length >
            0
          ) {

            setSelectedSrsId(
              history[0].id
            );

          } else {

            setSelectedSrsId(
              null
            );
          }

        } catch (error) {

          setLatestSrs(
            null
          );

          setVersions(
            []
          );

          setSelectedSrsId(
            null
          );


          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load SRS documents.'
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

      setLatestSrs(
        null
      );

      setVersions(
        []
      );

      setSelectedSrsId(
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


      void loadSrsData(
        selectedProjectId
      );

    },
    [
      selectedProjectId,
      loadSrsData
    ]
  );


  /* =========================================================
     GENERATE
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
          'Only Business Analysts can generate an SRS.'
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


        const generated =
          await generateSrs(
            selectedProjectId
          );


        setLatestSrs(
          generated
        );


        setSelectedSrsId(
          generated.id
        );


        const history =
          await getSrsVersions(
            selectedProjectId
          );


        setVersions(
          history
        );


        setSuccess(
          `SRS version ${generated.version} was generated successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to generate the SRS.'
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

  const handleOpenEdit =
    () => {

      if (
        !selectedSrs ||
        !isBusinessAnalyst
      ) {

        return;
      }


      setEditTitle(
        selectedSrs.title
      );


      setEditContent(
        selectedSrs.markdownContent
      );


      setEditStatus(
        selectedSrs.status
      );


      setEditOpen(
        true
      );
    };


  /* =========================================================
     SAVE EDIT
     ========================================================= */

  const handleSave =
    async () => {

      if (
        !selectedSrs
      ) {

        return;
      }


      if (
        !editTitle.trim()
      ) {

        setError(
          'SRS title is required.'
        );

        return;
      }


      if (
        !editContent.trim()
      ) {

        setError(
          'SRS content cannot be empty.'
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
          await updateSrs(
            selectedSrs.id,
            {
              title:
                editTitle.trim(),

              content:
                editContent.trim(),

              status:
                editStatus,
            }
          );


        setLatestSrs(
          (
            current
          ) =>
            current?.id ===
            updated.id
              ? updated
              : current
        );


        setVersions(
          (
            current
          ) =>
            current.map(
              (
                version
              ) =>
                version.id ===
                updated.id
                  ? updated
                  : version
            )
        );


        setEditOpen(
          false
        );


        setSuccess(
          `SRS version ${updated.version} was updated successfully.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to update the SRS.'
        );

      } finally {

        setSaving(
          false
        );
      }
    };


  /* =========================================================
     DELETE
     ========================================================= */

  const handleDelete =
    async () => {

      if (
        !selectedSrs ||
        !isBusinessAnalyst
      ) {

        return;
      }


      const confirmed =
        window.confirm(
          `Delete SRS version ${selectedSrs.version}?`
        );


      if (
        !confirmed
      ) {

        return;
      }


      try {

        setDeleting(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        await deleteSrs(
          selectedSrs.id
        );


        if (
          selectedProjectId !==
          null
        ) {

          await loadSrsData(
            selectedProjectId
          );
        }


        setSuccess(
          `SRS version ${selectedSrs.version} was deleted.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to delete the SRS.'
        );

      } finally {

        setDeleting(
          false
        );
      }
    };


  /* =========================================================
     DOWNLOAD PDF
     ========================================================= */

  const handleDownloadPdf =
    async () => {

      if (
        !selectedSrs ||
        !pdfDocumentRef.current
      ) {

        return;
      }


      try {

        setDownloadingPdf(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        /*
         * Import libraries only when PDF generation
         * is requested.
         */
        const html2canvasModule =
          await import(
            'html2canvas-pro'
          );


        const jsPdfModule =
          await import(
            'jspdf'
          );


        const html2canvas =
          html2canvasModule.default;


        const {
          jsPDF
        } =
          jsPdfModule;


        /*
         * Capture only the document content.
         */
        const sourceCanvas =
          await html2canvas(
            pdfDocumentRef.current,
            {
              scale: 2,

              useCORS: true,

              backgroundColor:
                '#ffffff',

              logging: false,

              windowWidth:
                pdfDocumentRef.current.scrollWidth,
            }
          );


        /*
         * Create A4 PDF.
         */
        const pdf =
          new jsPDF({
            orientation:
              'portrait',

            unit:
              'mm',

            format:
              'a4',
          });


        const pageWidth =
          pdf.internal
            .pageSize
            .getWidth();


        const pageHeight =
          pdf.internal
            .pageSize
            .getHeight();


        const margin =
          12;


        const contentWidth =
          pageWidth -
          margin * 2;


        const contentHeight =
          pageHeight -
          margin * 2;


        /*
         * Convert PDF page height to the matching
         * number of pixels in the canvas.
         */
        const pixelsPerMillimeter =
          sourceCanvas.width /
          contentWidth;


        const pageHeightPixels =
          Math.floor(
            contentHeight *
            pixelsPerMillimeter
          );


        let sourceY =
          0;


        let pageIndex =
          0;


        /*
         * Split the long rendered document into
         * individual A4-sized images.
         */
        while (
          sourceY <
          sourceCanvas.height
        ) {

          const remainingHeight =
            sourceCanvas.height -
            sourceY;


          const currentHeight =
            Math.min(
              pageHeightPixels,
              remainingHeight
            );


          const pageCanvas =
            window.document
              .createElement(
                'canvas'
              );


          pageCanvas.width =
            sourceCanvas.width;


          pageCanvas.height =
            currentHeight;


          const context =
            pageCanvas.getContext(
              '2d'
            );


          if (
            !context
          ) {

            throw new Error(
              'Unable to prepare PDF page.'
            );
          }


          /*
           * White background.
           */
          context.fillStyle =
            '#ffffff';


          context.fillRect(
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );


          /*
           * Copy the correct section of the full
           * SRS canvas into the current PDF page.
           */
          context.drawImage(
            sourceCanvas,

            0,
            sourceY,

            sourceCanvas.width,
            currentHeight,

            0,
            0,

            sourceCanvas.width,
            currentHeight
          );


          const pageImage =
            pageCanvas.toDataURL(
              'image/jpeg',
              0.95
            );


          const renderedHeight =
            currentHeight /
            pixelsPerMillimeter;


          if (
            pageIndex >
            0
          ) {

            pdf.addPage();
          }


          pdf.addImage(
            pageImage,

            'JPEG',

            margin,
            margin,

            contentWidth,
            renderedHeight,

            undefined,

            'FAST'
          );


          sourceY +=
            currentHeight;


          pageIndex++;
        }


        /*
         * Safe filename.
         */
        const projectName =
          selectedProject?.name ||
          selectedSrs.projectName ||
          `Project-${selectedSrs.projectId}`;


        const safeProjectName =
          projectName
            .replace(
              /[^a-zA-Z0-9-_ ]/g,
              ''
            )
            .trim()
            .replace(
              /\s+/g,
              '-'
            );


        pdf.save(
          `${safeProjectName}-SRS-v${selectedSrs.version}.pdf`
        );


        setSuccess(
          `SRS version ${selectedSrs.version} was saved as PDF.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to create the SRS PDF.'
        );

      } finally {

        setDownloadingPdf(
          false
        );
      }
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

            You do not have permission to access SRS documents.

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

          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">

            <BookOpen className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              Software Requirements Specification

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Generate, review, edit, export and browse SRS document versions.

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

                  void loadSrsData(
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
                  null
              }
              onClick={
                () =>
                  void handleGenerate()
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold disabled:opacity-50"
            >

              {generating ? (

                <Loader2 className="w-4 h-4 animate-spin" />

              ) : (

                <Sparkles className="w-4 h-4" />

              )}


              {generating
                ? 'Generating SRS...'
                : 'Generate New SRS'}

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

                Select the project whose SRS you want to manage.

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

                      Project #{project.projectNumber} - {project.name}

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

                Selected Project:

              </span>{' '}


              <span className="font-bold text-slate-700">

                {selectedProject.name}

              </span>

            </div>


            {selectedProject.projectManagerName && (

              <div>

                <span className="text-slate-400">

                  Project Manager:

                </span>{' '}


                <span className="font-bold text-slate-700">

                  {selectedProject.projectManagerName}

                </span>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =====================================================
          NO PROJECT
          ===================================================== */}

      {!projectsLoading &&
        selectedProjectId ===
          null && (

        <div className="min-h-[330px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

          <FolderKanban className="w-10 h-10 text-slate-300" />


          <h2 className="text-sm font-bold text-slate-800 mt-4">

            Select a project

          </h2>


          <p className="text-xs text-slate-500 mt-1">

            Select a project before viewing or generating its SRS.

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

          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />


          <p className="text-xs text-slate-500 mt-3">

            Loading SRS documents...

          </p>

        </div>

      )}


      {/* =====================================================
          NO SRS
          ===================================================== */}

      {selectedProjectId !==
        null &&
        !dataLoading &&
        !selectedSrs && (

        <div className="min-h-[380px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

          <FileText className="w-12 h-12 text-slate-300" />


          <h2 className="text-base font-bold text-slate-800 mt-4">

            No SRS generated yet

          </h2>


          <p className="text-sm text-slate-500 mt-2 max-w-md">

            A Business Analyst can generate the Software Requirements Specification from approved project requirements.

          </p>


          {isBusinessAnalyst && (

            <button
              type="button"
              onClick={
                () =>
                  void handleGenerate()
              }
              disabled={
                generating
              }
              className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50"
            >

              {generating ? (

                <Loader2 className="w-4 h-4 animate-spin" />

              ) : (

                <Sparkles className="w-4 h-4" />

              )}


              Generate SRS

            </button>

          )}

        </div>

      )}


      {/* =====================================================
          SRS WORKSPACE
          ===================================================== */}

      {selectedSrs &&
        !dataLoading && (

        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">

          {/* =================================================
              VERSION HISTORY
              ================================================= */}

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden self-start">

            <div className="p-5 border-b border-slate-100">

              <div className="flex items-center gap-2">

                <FileClock className="w-4 h-4 text-indigo-600" />


                <h2 className="font-extrabold text-slate-900">

                  Version History

                </h2>

              </div>


              <p className="text-xs text-slate-500 mt-1">

                {versions.length}
                {' '}
                {versions.length ===
                1
                  ? 'version'
                  : 'versions'}

              </p>

            </div>


            {versions.length ===
            0 ? (

              <div className="p-6 text-xs text-slate-400 text-center">

                No version history available.

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {versions.map(
                  (
                    version
                  ) => (

                    <button
                      key={
                        version.id
                      }
                      type="button"
                      onClick={
                        () =>
                          setSelectedSrsId(
                            version.id
                          )
                      }
                      className={
                        `w-full text-left p-4 transition-colors ${
                          selectedSrs.id ===
                          version.id
                            ? 'bg-indigo-50'
                            : 'hover:bg-slate-50'
                        }`
                      }
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <p className="text-xs font-black text-indigo-600">

                              Version {version.version}

                            </p>


                            <SrsStatusBadge
                              status={
                                version.status
                              }
                            />

                          </div>


                          <p className="text-xs font-semibold text-slate-700 mt-2 line-clamp-2">

                            {version.title}

                          </p>


                          <p className="text-[10px] text-slate-400 mt-2">

                            {formatDateTime(
                              version.createdAt
                            )}

                          </p>

                        </div>


                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />

                      </div>

                    </button>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================================
              DOCUMENT
              ================================================= */}

          <div className="space-y-5">

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              {/* DOCUMENT HEADER */}

              <div className="p-5 border-b border-slate-100">

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="text-xs font-black text-indigo-600">

                        Version {selectedSrs.version}

                      </span>


                      <SrsStatusBadge
                        status={
                          selectedSrs.status
                        }
                      />

                    </div>


                    <h2 className="text-xl font-extrabold text-slate-900 mt-2">

                      {selectedSrs.title}

                    </h2>


                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-slate-400 mt-2">

                      <span>

                        Created {formatDateTime(
                          selectedSrs.createdAt
                        )}

                      </span>


                      <span>

                        Updated {formatDateTime(
                          selectedSrs.updatedAt
                        )}

                      </span>

                    </div>

                  </div>


                  {/* DOCUMENT ACTIONS */}

                  <div className="flex flex-wrap items-center gap-2">

                    {/* PDF */}

                    <button
                      type="button"
                      onClick={
                        () =>
                          void handleDownloadPdf()
                      }
                      disabled={
                        downloadingPdf
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {downloadingPdf ? (

                        <Loader2 className="w-4 h-4 animate-spin" />

                      ) : (

                        <Download className="w-4 h-4" />

                      )}


                      {downloadingPdf
                        ? 'Creating PDF...'
                        : 'Download PDF'}

                    </button>


                    {/* BA ACTIONS */}

                    {isBusinessAnalyst && (

                      <>

                        <button
                          type="button"
                          onClick={
                            handleOpenEdit
                          }
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >

                          <Edit3 className="w-4 h-4" />

                          Edit

                        </button>


                        <button
                          type="button"
                          onClick={
                            () =>
                              void handleDelete()
                          }
                          disabled={
                            deleting
                          }
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          title="Delete SRS version"
                        >

                          {deleting ? (

                            <Loader2 className="w-4 h-4 animate-spin" />

                          ) : (

                            <Trash2 className="w-4 h-4" />

                          )}

                        </button>

                      </>

                    )}

                  </div>

                </div>

              </div>


              {/* =================================================
                  PDF / RENDERED SRS CONTENT
                  ================================================= */}

              <div
                ref={
                  pdfDocumentRef
                }
                className="bg-white p-6 md:p-10"
              >

                {/* ===============================================
                    PDF DOCUMENT COVER HEADER
                    =============================================== */}

                <div className="mb-10 pb-7 border-b border-slate-200">

                  <p className="text-[10px] uppercase tracking-[0.22em] font-black text-indigo-600">

                    ReqSync

                  </p>


                  <h1 className="text-3xl font-black text-slate-950 mt-3">

                    {selectedSrs.title}

                  </h1>


                  <p className="text-base font-semibold text-slate-600 mt-2">

                    {selectedProject?.name ||
                      selectedSrs.projectName ||
                      `Project ${selectedSrs.projectId}`}

                  </p>


                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6">

                    <PdfMeta
                      label="Project"
                      value={
                        selectedProject?.name ||
                        selectedSrs.projectName ||
                        `Project ${selectedSrs.projectId}`
                      }
                    />


                    <PdfMeta
                      label="Version"
                      value={
                        `v${selectedSrs.version}`
                      }
                    />


                    <PdfMeta
                      label="Status"
                      value={
                        formatEnum(
                          selectedSrs.status
                        )
                      }
                    />


                    <PdfMeta
                      label="Created"
                      value={
                        formatDateTime(
                          selectedSrs.createdAt
                        )
                      }
                    />

                  </div>

                </div>


                {/* ===============================================
                    RENDER MARKDOWN
                    =============================================== */}

                {selectedSrs.markdownContent ? (

                  <MarkdownDocument
                    content={
                      selectedSrs.markdownContent
                    }
                  />

                ) : selectedSrs.sections.length >
                  0 ? (

                  <div className="space-y-8">

                    {selectedSrs.sections
                      .slice()
                      .sort(
                        (
                          a,
                          b
                        ) =>
                          a.order -
                          b.order
                      )
                      .map(
                        (
                          section
                        ) => (

                          <section
                            key={
                              `${selectedSrs.id}-${section.order}`
                            }
                            className="pb-8 border-b border-slate-100 last:border-b-0"
                          >

                            <h2 className="text-xl font-extrabold text-slate-900 mb-4">

                              {section.title}

                            </h2>


                            <MarkdownDocument
                              content={
                                section.content
                              }
                            />

                          </section>

                        )
                      )}

                  </div>

                ) : (

                  <div className="py-12 text-center text-sm text-slate-400">

                    This SRS version contains no document content.

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          EDIT MODAL
          ===================================================== */}

      {editOpen &&
        selectedSrs && (

        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* MODAL HEADER */}

            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">

              <div>

                <p className="text-xs font-black text-indigo-600">

                  Version {selectedSrs.version}

                </p>


                <h3 className="font-extrabold text-slate-900 mt-1">

                  Edit SRS

                </h3>

              </div>


              <button
                type="button"
                onClick={
                  () =>
                    setEditOpen(
                      false
                    )
                }
                disabled={
                  saving
                }
                className="p-2 text-slate-400 hover:text-slate-700"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* MODAL BODY */}

            <div className="p-6 overflow-y-auto space-y-5">

              {/* TITLE */}

              <div>

                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                  Document Title

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
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />

              </div>


              {/* STATUS */}

              <div>

                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                  Status

                </label>


                <select
                  value={
                    editStatus
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditStatus(
                        event.target.value as
                          SrsStatus
                      )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                >

                  <option value="GENERATED">

                    Generated

                  </option>


                  <option value="DRAFT">

                    Draft

                  </option>


                  <option value="REVIEWED">

                    Reviewed

                  </option>


                  <option value="APPROVED">

                    Approved

                  </option>

                </select>

              </div>


              {/* MARKDOWN EDITOR */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">

                    Markdown Content

                  </label>


                  <span className="text-[10px] text-slate-400">

                    Markdown syntax supported

                  </span>

                </div>


                <textarea
                  rows={24}
                  value={
                    editContent
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEditContent(
                        event.target.value
                      )
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl font-mono text-xs resize-y focus:outline-none focus:border-indigo-500"
                />

              </div>


              {/* PREVIEW */}

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                  Preview

                </p>


                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 max-h-[400px] overflow-y-auto">

                  <MarkdownDocument
                    content={
                      editContent
                    }
                  />

                </div>

              </div>

            </div>


            {/* MODAL FOOTER */}

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">

              <button
                type="button"
                onClick={
                  () =>
                    setEditOpen(
                      false
                    )
                }
                disabled={
                  saving
                }
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >

                Cancel

              </button>


              <button
                type="button"
                onClick={
                  () =>
                    void handleSave()
                }
                disabled={
                  saving
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >

                {saving ? (

                  <Loader2 className="w-4 h-4 animate-spin" />

                ) : (

                  <Save className="w-4 h-4" />

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
   PDF META
   ========================================================= */

function PdfMeta({
  label,
  value
}: {
  label: string;
  value: string;
}) {

  return (

    <div>

      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

        {label}

      </p>


      <p className="text-xs font-semibold text-slate-700 mt-1">

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   MARKDOWN DOCUMENT
   ========================================================= */

function MarkdownDocument({
  content
}: {
  content: string;
}) {

  return (

    <div className="text-slate-700">

      <ReactMarkdown
        remarkPlugins={[
          remarkGfm
        ]}
        components={{

          h1: ({
            children
          }) => (

            <h1 className="text-2xl font-extrabold text-slate-950 mt-8 first:mt-0 mb-4 pb-2 border-b border-slate-200">

              {children}

            </h1>

          ),


          h2: ({
            children
          }) => (

            <h2 className="text-xl font-extrabold text-slate-900 mt-8 mb-3">

              {children}

            </h2>

          ),


          h3: ({
            children
          }) => (

            <h3 className="text-base font-bold text-slate-900 mt-6 mb-2">

              {children}

            </h3>

          ),


          h4: ({
            children
          }) => (

            <h4 className="text-sm font-bold text-slate-800 mt-5 mb-2">

              {children}

            </h4>

          ),


          p: ({
            children
          }) => (

            <p className="text-sm text-slate-700 leading-7 mb-4">

              {children}

            </p>

          ),


          ul: ({
            children
          }) => (

            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700 mb-5">

              {children}

            </ul>

          ),


          ol: ({
            children
          }) => (

            <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-700 mb-5">

              {children}

            </ol>

          ),


          li: ({
            children
          }) => (

            <li className="leading-6">

              {children}

            </li>

          ),


          strong: ({
            children
          }) => (

            <strong className="font-bold text-slate-900">

              {children}

            </strong>

          ),


          em: ({
            children
          }) => (

            <em className="italic text-slate-700">

              {children}

            </em>

          ),


          blockquote: ({
            children
          }) => (

            <blockquote className="border-l-4 border-indigo-300 bg-indigo-50 px-4 py-3 my-5 text-sm text-slate-700">

              {children}

            </blockquote>

          ),


          code: ({
            children
          }) => (

            <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">

              {children}

            </code>

          ),


          pre: ({
            children
          }) => (

            <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs font-mono my-5">

              {children}

            </pre>

          ),


          table: ({
            children
          }) => (

            <div className="overflow-x-auto my-6">

              <table className="w-full border-collapse text-sm">

                {children}

              </table>

            </div>

          ),


          thead: ({
            children
          }) => (

            <thead className="bg-slate-100">

              {children}

            </thead>

          ),


          th: ({
            children
          }) => (

            <th className="border border-slate-200 px-3 py-2 text-left font-bold text-slate-800">

              {children}

            </th>

          ),


          td: ({
            children
          }) => (

            <td className="border border-slate-200 px-3 py-2 align-top text-slate-700">

              {children}

            </td>

          ),


          a: ({
            href,
            children
          }) => (

            <a
              href={
                href
              }
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-semibold hover:underline"
            >

              {children}

            </a>

          ),


          hr: () => (

            <hr className="my-7 border-slate-200" />

          ),
        }}
      >

        {content}

      </ReactMarkdown>

    </div>
  );
}


/* =========================================================
   STATUS BADGE
   ========================================================= */

function SrsStatusBadge({
  status
}: {
  status: SrsStatus;
}) {

  const style =
    status ===
      'APPROVED'

      ? 'bg-emerald-50 text-emerald-700'

      : status ===
        'REVIEWED'

        ? 'bg-blue-50 text-blue-700'

        : status ===
          'DRAFT'

          ? 'bg-amber-50 text-amber-700'

          : 'bg-indigo-50 text-indigo-700';


  return (

    <span
      className={
        `inline-flex px-2 py-1 rounded-full text-[9px] font-bold ${style}`
      }
    >

      {formatEnum(
        status
      )}

    </span>
  );
}


/* =========================================================
   FORMAT ENUM
   ========================================================= */

function formatEnum(
  value: string
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


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDateTime(
  value: string
) {

  if (
    !value
  ) {

    return '-';
  }


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