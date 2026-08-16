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
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  FolderKanban,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';

import {
  useRouter
} from 'next/navigation';

import {
  createKnowledgeItem,
  getKnowledgeVault,
  type KnowledgeCategory,
  type KnowledgeItemResponse
} from '@/lib/knowledge-api';

import {
  getAllProjects,
  type ProjectResponse
} from '@/lib/project-api';

import {
  useProjectStore
} from '@/store/projectStore';


/* =========================================================
   CATEGORIES
   ========================================================= */

const KNOWLEDGE_CATEGORIES:
KnowledgeCategory[] = [

  'Requirements',

  'Decisions',

  'Lessons Learned',

  'QA Findings',

  'Templates',
];


/* =========================================================
   PAGE
   ========================================================= */

export default function KnowledgeVaultPage() {

  const router =
    useRouter();


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


  /*
   * Current backend does not add method-level
   * role restrictions for POST /api/knowledge.
   *
   * Frontend keeps creation focused on management/
   * analysis roles.
   */
  const canCreate =
    currentUser?.role ===
      'CEO' ||

    currentUser?.role ===
      'Project Manager' ||

    currentUser?.role ===
      'Business Analyst';


  /* =========================================================
     DATA
     ========================================================= */

  const [
    items,
    setItems
  ] =
    useState<
      KnowledgeItemResponse[]
    >([]);


  const [
    projects,
    setProjects
  ] =
    useState<
      ProjectResponse[]
    >([]);


  /* =========================================================
     FILTERS
     ========================================================= */

  const [
    search,
    setSearch
  ] =
    useState('');


  const [
    categoryFilter,
    setCategoryFilter
  ] =
    useState<
      KnowledgeCategory |
      'ALL'
    >('ALL');


  /* =========================================================
     CREATE FORM
     ========================================================= */

  const [
    showCreateForm,
    setShowCreateForm
  ] =
    useState(false);


  const [
    title,
    setTitle
  ] =
    useState('');


  const [
    category,
    setCategory
  ] =
    useState<KnowledgeCategory>(
      'Requirements'
    );


  const [
    projectId,
    setProjectId
  ] =
    useState<number | null>(
      null
    );


  /* =========================================================
     LOADING
     ========================================================= */

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
     COMPLETED PROJECTS

     Backend refuses project-linked knowledge unless
     the project status is COMPLETED.
     ========================================================= */

  const completedProjects =
    useMemo(
      () =>
        projects.filter(
          (
            project
          ) =>
            project.status ===
            'COMPLETED'
        ),

      [
        projects
      ]
    );


  /* =========================================================
     FILTERED ITEMS
     ========================================================= */

  const filteredItems =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        return items.filter(
          (
            item
          ) => {

            const matchesCategory =
              categoryFilter ===
                'ALL' ||
              item.category ===
                categoryFilter;


            const matchesSearch =
              !query ||

              item.title
                .toLowerCase()
                .includes(
                  query
                ) ||

              item.project
                .toLowerCase()
                .includes(
                  query
                ) ||

              item.id
                .toLowerCase()
                .includes(
                  query
                ) ||

              item.category
                .toLowerCase()
                .includes(
                  query
                );


            return (
              matchesCategory &&
              matchesSearch
            );
          }
        );
      },

      [
        items,
        search,
        categoryFilter
      ]
    );


  /* =========================================================
     CATEGORY COUNTS
     ========================================================= */

  const categoryCounts =
    useMemo(
      () => {

        const result:
        Record<
          KnowledgeCategory,
          number
        > = {

          Requirements: 0,

          Decisions: 0,

          'Lessons Learned': 0,

          'QA Findings': 0,

          Templates: 0,
        };


        for (
          const item
          of items
        ) {

          result[
            item.category
          ]++;
        }


        return result;
      },

      [
        items
      ]
    );


  /* =========================================================
     LOAD DATA
     ========================================================= */

  const loadData =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError(
            null
          );


          const [
            vaultResponse,
            projectResponse
          ] =
            await Promise.all([

              getKnowledgeVault(),

              getAllProjects(),
            ]);


          setItems(
            vaultResponse
          );


          setProjects(
            projectResponse
          );

        } catch (error) {

          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load the Knowledge Vault.'
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
     INITIAL LOAD
     ========================================================= */

  useEffect(
    () => {

      if (
        !canView
      ) {

        return;
      }


      void loadData();

    },
    [
      canView,
      loadData
    ]
  );


  /* =========================================================
     CREATE ITEM
     ========================================================= */

  const handleCreate =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      if (
        !title.trim()
      ) {

        setError(
          'Knowledge item title is required.'
        );

        return;
      }


      try {

        setCreating(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        const created =
          await createKnowledgeItem({
            title:
              title.trim(),

            category,

            projectId,
          });


        setItems(
          (
            current
          ) => [
            created,
            ...current,
          ]
        );


        setTitle(
          ''
        );

        setCategory(
          'Requirements'
        );

        setProjectId(
          null
        );

        setShowCreateForm(
          false
        );


        setSuccess(
          `${created.id} was added to the Knowledge Vault.`
        );

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to create knowledge item.'
        );

      } finally {

        setCreating(
          false
        );
      }
    };


  /* =========================================================
     OPEN REFERENCED ITEM
     ========================================================= */

  const handleOpenItem =
    (
      item:
        KnowledgeItemResponse
    ) => {

      /*
       * Completed-project SRS documents are automatically
       * published with referenceType = "SRS".
       *
       * Your SRS page currently works by selected project,
       * rather than /srs/{id}, so this frontend sends the
       * user to the SRS module.
       */
      if (
        item.referenceType ===
          'SRS' &&
        item.referenceId
      ) {

        router.push(
          '/srs'
        );

        return;
      }
    };


  /* =========================================================
     ACCESS DENIED
     ========================================================= */

  if (
    !canView
  ) {

    return (

      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-6">

        <div className="p-4 bg-rose-50 rounded-full text-rose-600">

          <ShieldCheck className="w-12 h-12" />

        </div>


        <div>

          <h2 className="text-2xl font-extrabold text-slate-900">

            Access Denied

          </h2>


          <p className="text-sm text-slate-500 mt-2">

            You do not have permission to access the Knowledge Vault.

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

          <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700">

            <Database className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              Knowledge Vault

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Reuse knowledge from completed projects and shared organizational resources.

            </p>

          </div>

        </div>


        <div className="flex items-center gap-2">

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              () =>
                void loadData()
            }
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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

            Refresh

          </button>


          {canCreate && (

            <button
              type="button"
              onClick={
                () => {

                  setShowCreateForm(
                    (
                      current
                    ) =>
                      !current
                  );

                  setError(
                    null
                  );

                  setSuccess(
                    null
                  );
                }
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
            >

              {showCreateForm ? (

                <X className="w-4 h-4" />

              ) : (

                <Plus className="w-4 h-4" />

              )}


              {showCreateForm
                ? 'Cancel'
                : 'Add Knowledge'}

            </button>

          )}

        </div>

      </div>


      {/* =====================================================
          BACKEND RULE INFORMATION
          ===================================================== */}

      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">

        <div className="flex items-start gap-3">

          <Sparkles className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />


          <div>

            <p className="text-sm font-bold text-violet-900">

              Shared organizational knowledge

            </p>


            <p className="text-xs text-violet-700 mt-1 leading-relaxed">

              Project-specific knowledge is published only after a project is completed. Shared resources are available across the business. Completed project SRS documents are automatically added to the vault.

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
          CREATE FORM
          ===================================================== */}

      {showCreateForm &&
        canCreate && (

        <form
          onSubmit={
            handleCreate
          }
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >

          <div className="p-5 border-b border-slate-800">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">

                <Plus className="w-5 h-5 text-violet-400" />

              </div>


              <div>

                <h2 className="font-extrabold text-white">

                  Add Knowledge Item

                </h2>


                <p className="text-xs text-slate-400 mt-1">

                  Create a shared resource or link knowledge to a completed project.

                </p>

              </div>

            </div>

          </div>


          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* TITLE */}

            <div className="md:col-span-2">

              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">

                Knowledge Title *

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
                placeholder="Authentication Security Lessons Learned"
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                required
              />

            </div>


            {/* CATEGORY */}

            <div>

              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">

                Category *

              </label>


              <select
                value={
                  category
                }
                onChange={
                  (
                    event
                  ) =>
                    setCategory(
                      event.target.value as
                        KnowledgeCategory
                    )
                }
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
              >

                {KNOWLEDGE_CATEGORIES.map(
                  (
                    item
                  ) => (

                    <option
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >

                      {item}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* PROJECT */}

            <div>

              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">

                Source Project

              </label>


              <select
                value={
                  projectId ??
                  ''
                }
                onChange={
                  (
                    event
                  ) => {

                    const value =
                      event.target.value;


                    setProjectId(
                      value
                        ? Number(
                            value
                          )
                        : null
                    );
                  }
                }
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
              >

                <option value="">

                  General / Shared Resource

                </option>


                {completedProjects.map(
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

                      {project.name}

                    </option>

                  )
                )}

              </select>


              <p className="text-[10px] text-slate-500 mt-2">

                Only completed projects can be linked to the Knowledge Vault.

              </p>

            </div>


            <div className="md:col-span-2 flex justify-end pt-2">

              <button
                type="submit"
                disabled={
                  creating
                }
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >

                {creating ? (

                  <Loader2 className="w-4 h-4 animate-spin" />

                ) : (

                  <Plus className="w-4 h-4" />

                )}


                {creating
                  ? 'Adding Knowledge...'
                  : 'Add to Knowledge Vault'}

              </button>

            </div>

          </div>

        </form>

      )}


      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

        <SummaryCard
          label="All Knowledge"
          value={
            items.length
          }
          icon={
            <Database className="w-4 h-4" />
          }
        />


        <SummaryCard
          label="Requirements"
          value={
            categoryCounts.Requirements
          }
          icon={
            <FileText className="w-4 h-4" />
          }
        />


        <SummaryCard
          label="Decisions"
          value={
            categoryCounts.Decisions
          }
          icon={
            <Lightbulb className="w-4 h-4" />
          }
        />


        <SummaryCard
          label="Lessons"
          value={
            categoryCounts[
              'Lessons Learned'
            ]
          }
          icon={
            <BookOpen className="w-4 h-4" />
          }
        />


        <SummaryCard
          label="QA Findings"
          value={
            categoryCounts[
              'QA Findings'
            ]
          }
          icon={
            <ShieldCheck className="w-4 h-4" />
          }
        />


        <SummaryCard
          label="Templates"
          value={
            categoryCounts.Templates
          }
          icon={
            <FolderKanban className="w-4 h-4" />
          }
        />

      </div>


      {/* =====================================================
          FILTERS
          ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-4">

        <div className="grid grid-cols-1 md:grid-cols-[1fr_230px] gap-3">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />


            <input
              type="text"
              value={
                search
              }
              onChange={
                (
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Search knowledge by title, project, code or category..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-violet-500"
            />

          </div>


          <select
            value={
              categoryFilter
            }
            onChange={
              (
                event
              ) =>
                setCategoryFilter(
                  event.target.value as
                    KnowledgeCategory |
                    'ALL'
                )
            }
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-violet-500"
          >

            <option value="ALL">

              All Categories

            </option>


            {KNOWLEDGE_CATEGORIES.map(
              (
                item
              ) => (

                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >

                  {item}

                </option>

              )
            )}

          </select>

        </div>

      </div>


      {/* =====================================================
          CONTENT
          ===================================================== */}

      {loading ? (

        <div className="min-h-[350px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />

          <p className="text-xs text-slate-500 mt-3">

            Loading Knowledge Vault...

          </p>

        </div>

      ) : filteredItems.length ===
        0 ? (

        <div className="min-h-[350px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

          <Database className="w-12 h-12 text-slate-300" />


          <h2 className="text-base font-bold text-slate-800 mt-4">

            No knowledge items found

          </h2>


          <p className="text-sm text-slate-500 mt-2 max-w-lg">

            Knowledge from completed projects and shared organizational resources will appear here.

          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {filteredItems.map(
            (
              item
            ) => (

              <KnowledgeCard
                key={
                  item.id
                }
                item={
                  item
                }
                onOpen={
                  handleOpenItem
                }
              />

            )
          )}

        </div>

      )}

    </div>
  );
}


/* =========================================================
   KNOWLEDGE CARD
   ========================================================= */

function KnowledgeCard({
  item,
  onOpen
}: {
  item:
    KnowledgeItemResponse;

  onOpen:
    (
      item:
        KnowledgeItemResponse
    ) =>
      void;
}) {

  const isReferencedDocument =
    Boolean(
      item.referenceType &&
      item.referenceId
    );


  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-violet-200 hover:shadow-sm transition-all">

      <div className="flex items-start justify-between gap-3">

        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">

          <KnowledgeIcon
            category={
              item.category
            }
          />

        </div>


        <span className="text-[10px] font-black text-violet-600">

          {item.id}

        </span>

      </div>


      <div className="mt-4">

        <CategoryBadge
          category={
            item.category
          }
        />


        <h3 className="text-sm font-extrabold text-slate-900 mt-3 leading-5">

          {item.title}

        </h3>


        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">

          <FolderKanban className="w-3.5 h-3.5 shrink-0" />


          <span className="truncate">

            {item.project}

          </span>

        </div>


        <p className="text-[10px] text-slate-400 mt-2">

          Added {formatDate(
            item.date
          )}

        </p>

      </div>


      {item.referenceType && (

        <div className="mt-4 pt-4 border-t border-slate-100">

          <div className="flex items-center justify-between gap-3">

            <div>

              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

                Reference

              </p>


              <p className="text-xs font-semibold text-slate-700 mt-1">

                {item.referenceType}
                {item.referenceId
                  ? ` #${item.referenceId}`
                  : ''}

              </p>

            </div>


            {isReferencedDocument && (

              <button
                type="button"
                onClick={
                  () =>
                    onOpen(
                      item
                    )
                }
                className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold"
              >

                Open

              </button>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   CATEGORY ICON
   ========================================================= */

function KnowledgeIcon({
  category
}: {
  category:
    KnowledgeCategory;
}) {

  switch (
    category
  ) {

    case 'Decisions':

      return (
        <Lightbulb className="w-5 h-5 text-amber-600" />
      );


    case 'Lessons Learned':

      return (
        <BookOpen className="w-5 h-5 text-blue-600" />
      );


    case 'QA Findings':

      return (
        <ShieldCheck className="w-5 h-5 text-rose-600" />
      );


    case 'Templates':

      return (
        <FileText className="w-5 h-5 text-emerald-600" />
      );


    default:

      return (
        <FileText className="w-5 h-5 text-violet-600" />
      );
  }
}


/* =========================================================
   CATEGORY BADGE
   ========================================================= */

function CategoryBadge({
  category
}: {
  category:
    KnowledgeCategory;
}) {

  let style =
    'bg-violet-50 text-violet-700';


  if (
    category ===
    'Decisions'
  ) {

    style =
      'bg-amber-50 text-amber-700';
  }


  if (
    category ===
    'Lessons Learned'
  ) {

    style =
      'bg-blue-50 text-blue-700';
  }


  if (
    category ===
    'QA Findings'
  ) {

    style =
      'bg-rose-50 text-rose-700';
  }


  if (
    category ===
    'Templates'
  ) {

    style =
      'bg-emerald-50 text-emerald-700';
  }


  return (

    <span
      className={
        `inline-flex px-2.5 py-1 rounded-full text-[9px] font-bold ${style}`
      }
    >

      {category}

    </span>
  );
}


/* =========================================================
   SUMMARY CARD
   ========================================================= */

function SummaryCard({
  label,
  value,
  icon
}: {
  label:
    string;

  value:
    number;

  icon:
    React.ReactNode;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-4">

      <div className="flex items-center justify-between">

        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">

          {label}

        </p>


        <div className="text-violet-600">

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
   DATE
   ========================================================= */

function formatDate(
  value:
    string
) {

  if (
    !value
  ) {

    return '-';
  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;
  }


  return date.toLocaleDateString();
}