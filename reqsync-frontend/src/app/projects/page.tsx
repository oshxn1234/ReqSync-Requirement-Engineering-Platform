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
  Trash2
} from 'lucide-react';

import {
  useRouter
} from 'next/navigation';

import {
  createProject,
  deleteProject,
  getAllProjects,
  type ProjectResponse
} from '@/lib/project-api';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';


export default function ProjectsPage() {

  const router =
    useRouter();


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


  const [name, setName] =
    useState('');


  const [
    description,
    setDescription
  ] =
    useState('');


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


  const loadProjects =
    useCallback(
      async () => {

        setError(null);

        try {

          setLoading(true);

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

          setLoading(false);
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


  const handleCreateProject =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      setError(null);
      setSuccess(null);


      if (!name.trim()) {

        setError(
          'Project name is required.'
        );

        return;
      }


      try {

        setCreating(true);


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


        setName('');
        setDescription('');


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

        setCreating(false);
      }
    };


  const handleDelete =
    async (
      project: ProjectResponse
    ) => {

      const confirmed =
        window.confirm(
          `Delete project "${project.name}"?`
        );


      if (!confirmed) {

        return;
      }


      try {

        setDeletingId(
          project.id
        );

        setError(null);


        await deleteProject(
          project.id
        );


        removeProject(
          project.id
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


  const handleUseProject =
    (
      projectId: number
    ) => {

      selectProject(
        projectId
      );


      router.push(
        '/requirements/extract'
      );
    };


  const formatStatus =
    (
      status: string
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


  return (

    <div className="max-w-7xl mx-auto space-y-6">

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

              Create projects and select the project used by requirement extraction.

            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={
            () =>
              void loadProjects()
          }
          disabled={loading}
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

          Refresh Projects

        </button>

      </div>


      {error && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

          <AlertCircle className="w-5 h-5 shrink-0" />

          <p className="text-sm">
            {error}
          </p>

        </div>
      )}


      {success && (

        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">

          <CheckCircle2 className="w-5 h-5" />

          <p className="text-sm font-semibold">
            {success}
          </p>

        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <form
          onSubmit={
            handleCreateProject
          }
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
        >

          <div>

            <h2 className="font-extrabold text-slate-900">

              Create Project

            </h2>

            <p className="text-xs text-slate-500 mt-1">

              This will save the project in the backend PostgreSQL database.

            </p>

          </div>


          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1.5">

              Project Name

            </label>

            <input
              type="text"
              value={name}
              onChange={
                (event) =>
                  setName(
                    event.target.value
                  )
              }
              placeholder="Online Banking System"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
            />

          </div>


          <div>

            <label className="block text-xs font-bold text-slate-700 mb-1.5">

              Description

            </label>

            <textarea
              rows={8}
              value={description}
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
            disabled={creating}
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


        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-100">

            <h2 className="font-extrabold text-slate-900">

              Backend Projects

            </h2>

            <p className="text-xs text-slate-500 mt-1">

              Projects loaded directly from Spring Boot.

            </p>

          </div>


          {loading ? (

            <div className="min-h-72 flex items-center justify-center">

              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />

            </div>

          ) : projects.length === 0 ? (

            <div className="min-h-72 flex items-center justify-center text-sm text-slate-400">

              No projects found.

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {projects.map(
                (project) => (

                  <div
                    key={project.id}
                    className={`p-5 ${
                      selectedProjectId ===
                      project.id
                        ? 'bg-blue-50/50'
                        : ''
                    }`}
                  >

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                      <div>

                        <div className="flex items-center gap-2">

                          <span className="text-xs font-black text-blue-600">

                            #{project.id}

                          </span>


                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">

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
                            'No description'}

                        </p>

                      </div>


                      <div className="flex items-center gap-2">

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

                          Use Project

                          <ArrowRight className="w-4 h-4" />

                        </button>


                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            project.id
                          }
                          onClick={
                            () =>
                              void handleDelete(
                                project
                              )
                          }
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        >

                          {deletingId ===
                          project.id ? (

                            <Loader2 className="w-4 h-4 animate-spin" />

                          ) : (

                            <Trash2 className="w-4 h-4" />

                          )}

                        </button>

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