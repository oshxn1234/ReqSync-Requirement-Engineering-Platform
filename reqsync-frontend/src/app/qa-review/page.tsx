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
  Clock3,
  Code2,
  ExternalLink,
  FileCheck2,
  GitBranch,
  GitCommit,
  Loader2,
  MessageSquareText,
  RefreshCcw,
  Search,
  ShieldAlert,
  TestTube2,
  UserRound,
  X,
  XCircle
} from 'lucide-react';

import {
  getApprovedQaSubmissions,
  getPendingQaSubmissions,
  getRejectedQaSubmissions,
  reviewQaSubmission,
  type DeveloperSubmissionResponse
} from '@/lib/qa-api';

import {
  useProjectStore
} from '@/store/projectStore';


type QaTab =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';


export default function QaReviewPage() {

  /* =========================================================
     AUTH
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const isQaEngineer =
    currentUser?.role ===
    'QA Engineer';


  /* =========================================================
     TAB
     ========================================================= */

  const [
    activeTab,
    setActiveTab
  ] =
    useState<QaTab>(
      'PENDING'
    );


  /* =========================================================
     SUBMISSIONS
     ========================================================= */

  const [
    pendingSubmissions,
    setPendingSubmissions
  ] =
    useState<
      DeveloperSubmissionResponse[]
    >([]);


  const [
    approvedSubmissions,
    setApprovedSubmissions
  ] =
    useState<
      DeveloperSubmissionResponse[]
    >([]);


  const [
    rejectedSubmissions,
    setRejectedSubmissions
  ] =
    useState<
      DeveloperSubmissionResponse[]
    >([]);


  const [
    selectedSubmissionId,
    setSelectedSubmissionId
  ] =
    useState<number | null>(
      null
    );


  /* =========================================================
     SEARCH
     ========================================================= */

  const [
    searchQuery,
    setSearchQuery
  ] =
    useState('');


  /* =========================================================
     REVIEW FORM
     ========================================================= */

  const [
    feedback,
    setFeedback
  ] =
    useState('');


  const [
    reviewing,
    setReviewing
  ] =
    useState<
      'APPROVE' |
      'REJECT' |
      null
    >(null);


  /* =========================================================
     LOADING
     ========================================================= */

  const [
    loading,
    setLoading
  ] =
    useState(true);


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
     CURRENT TAB DATA
     ========================================================= */

  const currentSubmissions =
    useMemo(
      () => {

        switch (
          activeTab
        ) {

          case 'APPROVED':

            return approvedSubmissions;


          case 'REJECTED':

            return rejectedSubmissions;


          default:

            return pendingSubmissions;
        }
      },

      [
        activeTab,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions
      ]
    );


  /* =========================================================
     FILTERED DATA
     ========================================================= */

  const filteredSubmissions =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        if (
          !query
        ) {

          return currentSubmissions;
        }


        return currentSubmissions.filter(
          (
            submission:
              DeveloperSubmissionResponse
          ) => {

            const searchable =
              [
                submission.id,
                submission.taskId,
                submission.developerId,
                submission.githubBranch,
                submission.commitHash,
                submission.pullRequestUrl,
                submission.implementationNotes
              ]
                .filter(
                  (
                    value
                  ) =>
                    value !==
                    null &&
                    value !==
                    undefined
                )
                .join(
                  ' '
                )
                .toLowerCase();


            return searchable.includes(
              query
            );
          }
        );
      },

      [
        currentSubmissions,
        searchQuery
      ]
    );


  /* =========================================================
     SELECTED SUBMISSION
     ========================================================= */

  const selectedSubmission =
    useMemo(
      () => {

        if (
          currentSubmissions.length ===
          0
        ) {

          return null;
        }


        if (
          selectedSubmissionId ===
          null
        ) {

          return currentSubmissions[0];
        }


        return (
          currentSubmissions.find(
            (
              submission:
                DeveloperSubmissionResponse
            ) =>
              submission.id ===
              selectedSubmissionId
          ) ??
          currentSubmissions[0]
        );
      },

      [
        currentSubmissions,
        selectedSubmissionId
      ]
    );


  /* =========================================================
     LOAD QA DATA
     ========================================================= */

  const loadQaData =
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
            pending,
            approved,
            rejected
          ] =
            await Promise.all([

              getPendingQaSubmissions(),

              getApprovedQaSubmissions(),

              getRejectedQaSubmissions(),
            ]);


          setPendingSubmissions(
            pending
          );

          setApprovedSubmissions(
            approved
          );

          setRejectedSubmissions(
            rejected
          );


          /*
           * Keep current selection if possible.
           */
          setSelectedSubmissionId(
            (
              current
            ) => {

              const all =
                [
                  ...pending,
                  ...approved,
                  ...rejected,
                ];


              if (
                current !==
                  null &&
                all.some(
                  (
                    submission
                  ) =>
                    submission.id ===
                    current
                )
              ) {

                return current;
              }


              return (
                pending[0]?.id ??
                approved[0]?.id ??
                rejected[0]?.id ??
                null
              );
            }
          );

        } catch (error) {

          setError(
            error instanceof Error
              ? error.message
              : 'Unable to load QA submissions.'
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
        !isQaEngineer
      ) {

        return;
      }


      void loadQaData();

    },
    [
      isQaEngineer,
      loadQaData
    ]
  );


  /* =========================================================
     TAB CHANGE
     ========================================================= */

  useEffect(
    () => {

      setSelectedSubmissionId(
        currentSubmissions[0]?.id ??
        null
      );


      setFeedback(
        ''
      );


      setError(
        null
      );

      setSuccess(
        null
      );

    },
    [
      activeTab
    ]
  );


  /* =========================================================
     SUBMISSION CHANGE
     ========================================================= */

  useEffect(
    () => {

      setFeedback(
        ''
      );

    },
    [
      selectedSubmissionId
    ]
  );


  /* =========================================================
     APPROVE
     ========================================================= */

  const handleApprove =
    async () => {

      if (
        !selectedSubmission
      ) {

        return;
      }


      const confirmed =
        window.confirm(
          `Approve submission #${selectedSubmission.id}?`
        );


      if (
        !confirmed
      ) {

        return;
      }


      try {

        setReviewing(
          'APPROVE'
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        await reviewQaSubmission(
          selectedSubmission.id,
          {
            status:
              'APPROVED',

            feedback:
              feedback.trim(),
          }
        );


        setSuccess(
          `Submission #${selectedSubmission.id} was approved successfully.`
        );


        setFeedback(
          ''
        );


        await loadQaData();

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to approve submission.'
        );

      } finally {

        setReviewing(
          null
        );
      }
    };


  /* =========================================================
     REJECT / REQUEST CHANGES
     ========================================================= */

  const handleReject =
    async () => {

      if (
        !selectedSubmission
      ) {

        return;
      }


      if (
        !feedback.trim()
      ) {

        setError(
          'QA feedback is required when requesting changes.'
        );

        return;
      }


      const confirmed =
        window.confirm(
          `Request changes for submission #${selectedSubmission.id}?`
        );


      if (
        !confirmed
      ) {

        return;
      }


      try {

        setReviewing(
          'REJECT'
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        await reviewQaSubmission(
          selectedSubmission.id,
          {
            status:
              'REJECTED',

            feedback:
              feedback.trim(),
          }
        );


        setSuccess(
          `Changes were requested for submission #${selectedSubmission.id}.`
        );


        setFeedback(
          ''
        );


        await loadQaData();

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to request changes.'
        );

      } finally {

        setReviewing(
          null
        );
      }
    };


  /* =========================================================
     ACCESS CONTROL
     ========================================================= */

  if (
    !isQaEngineer
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

            Only QA Engineers can review developer submissions.

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

          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">

            <TestTube2 className="w-5 h-5" />

          </div>


          <div>

            <h1 className="text-2xl font-extrabold text-slate-900">

              QA Review

            </h1>


            <p className="text-sm text-slate-500 mt-1">

              Review developer submissions and approve completed work or request changes.

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
              void loadQaData()
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

          Refresh

        </button>

      </div>


      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {success && (

        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">

          <CheckCircle2 className="w-5 h-5 shrink-0" />


          <div>

            <p className="text-sm font-bold">

              QA Review Updated

            </p>


            <p className="text-xs mt-1">

              {success}

            </p>

          </div>

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

              QA Review Error

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <SummaryCard
          title="Pending QA"
          value={
            pendingSubmissions.length
          }
          icon={
            <Clock3 className="w-4 h-4" />
          }
          valueClass="text-amber-600"
        />


        <SummaryCard
          title="Approved"
          value={
            approvedSubmissions.length
          }
          icon={
            <CheckCircle2 className="w-4 h-4" />
          }
          valueClass="text-emerald-600"
        />


        <SummaryCard
          title="Changes Requested"
          value={
            rejectedSubmissions.length
          }
          icon={
            <XCircle className="w-4 h-4" />
          }
          valueClass="text-rose-600"
        />

      </div>


      {/* =====================================================
          TABS
          ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-2">

        <div className="grid grid-cols-3 gap-2">

          <QaTabButton
            active={
              activeTab ===
              'PENDING'
            }
            onClick={
              () =>
                setActiveTab(
                  'PENDING'
                )
            }
            label="Pending QA"
            count={
              pendingSubmissions.length
            }
            icon={
              <Clock3 className="w-4 h-4" />
            }
            activeClass="bg-amber-500 text-white"
          />


          <QaTabButton
            active={
              activeTab ===
              'APPROVED'
            }
            onClick={
              () =>
                setActiveTab(
                  'APPROVED'
                )
            }
            label="Approved"
            count={
              approvedSubmissions.length
            }
            icon={
              <CheckCircle2 className="w-4 h-4" />
            }
            activeClass="bg-emerald-600 text-white"
          />


          <QaTabButton
            active={
              activeTab ===
              'REJECTED'
            }
            onClick={
              () =>
                setActiveTab(
                  'REJECTED'
                )
            }
            label="Changes Requested"
            count={
              rejectedSubmissions.length
            }
            icon={
              <XCircle className="w-4 h-4" />
            }
            activeClass="bg-rose-600 text-white"
          />

        </div>

      </div>


      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-4">

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
            placeholder="Search by submission, task, developer, branch, commit or implementation notes..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:border-blue-500"
          />

        </div>

      </div>


      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading ? (

        <div className="min-h-[380px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />


          <p className="text-xs text-slate-500 mt-3">

            Loading QA submissions...

          </p>

        </div>

      ) : currentSubmissions.length ===
        0 ? (

        /* ===================================================
           EMPTY TAB
           =================================================== */

        <div className="min-h-[350px] bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-10">

          {activeTab ===
          'PENDING' ? (

            <FileCheck2 className="w-10 h-10 text-slate-300" />

          ) : activeTab ===
            'APPROVED' ? (

            <CheckCircle2 className="w-10 h-10 text-emerald-300" />

          ) : (

            <XCircle className="w-10 h-10 text-rose-300" />

          )}


          <h2 className="text-sm font-bold text-slate-800 mt-4">

            {activeTab ===
            'PENDING'
              ? 'No submissions waiting for QA'
              : activeTab ===
                'APPROVED'
                ? 'No approved submissions'
                : 'No submissions with changes requested'}

          </h2>


          <p className="text-xs text-slate-500 mt-1">

            {activeTab ===
            'PENDING'
              ? 'Developer submissions will appear here when they are ready for QA.'
              : 'Reviewed submissions will remain available here for history.'}

          </p>

        </div>

      ) : (

        /* ===================================================
           SUBMISSION LIST + DETAIL
           =================================================== */

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6">

          {/* =================================================
              LIST
              ================================================= */}

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden self-start">

            <div className="p-5 border-b border-slate-100">

              <h2 className="font-extrabold text-slate-900">

                {activeTab ===
                'PENDING'
                  ? 'Pending QA Submissions'
                  : activeTab ===
                    'APPROVED'
                    ? 'Approved Submissions'
                    : 'Changes Requested'}

              </h2>


              <p className="text-xs text-slate-500 mt-1">

                {filteredSubmissions.length}
                {' '}
                {filteredSubmissions.length ===
                1
                  ? 'submission'
                  : 'submissions'}
                {' '}
                shown

              </p>

            </div>


            <div className="divide-y divide-slate-100">

              {filteredSubmissions.length ===
              0 ? (

                <div className="py-12 text-center text-sm text-slate-400">

                  No matching submissions found.

                </div>

              ) : (

                filteredSubmissions.map(
                  (
                    submission
                  ) => (

                    <button
                      key={
                        submission.id
                      }
                      type="button"
                      onClick={
                        () =>
                          setSelectedSubmissionId(
                            submission.id
                          )
                      }
                      className={
                        `w-full text-left p-5 transition-colors ${
                          selectedSubmission?.id ===
                          submission.id

                            ? activeTab ===
                              'APPROVED'

                              ? 'bg-emerald-50/70'

                              : activeTab ===
                                'REJECTED'

                                ? 'bg-rose-50/70'

                                : 'bg-purple-50/70'

                            : 'hover:bg-slate-50'
                        }`
                      }
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-start gap-3">

                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">

                            <Code2 className="w-5 h-5 text-slate-600" />

                          </div>


                          <div>

                            <div className="flex items-center gap-2 flex-wrap">

                              <span className="text-xs font-black text-purple-600">

                                Submission #{submission.id}

                              </span>


                              <SubmissionStatusBadge
                                status={
                                  submission.status
                                }
                              />

                            </div>


                            <p className="text-sm font-bold text-slate-800 mt-1">

                              Task #{submission.taskId}

                            </p>


                            <p className="text-[11px] text-slate-500 mt-1">

                              Developer #{submission.developerId}

                            </p>


                            {submission.implementationNotes && (

                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">

                                {submission.implementationNotes}

                              </p>

                            )}

                          </div>

                        </div>


                        <span className="text-[10px] text-slate-400 shrink-0">

                          {formatDate(
                            submission.submittedAt
                          )}

                        </span>

                      </div>

                    </button>

                  )
                )

              )}

            </div>

          </div>


          {/* =================================================
              DETAILS
              ================================================= */}

          <div className="space-y-5 self-start">

            {selectedSubmission && (

              <>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                  <div className="p-5 border-b border-slate-100">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-xs font-black text-purple-600">

                          Submission #{selectedSubmission.id}

                        </p>


                        <h2 className="font-extrabold text-slate-900 mt-1">

                          Developer Submission

                        </h2>

                      </div>


                      <SubmissionStatusBadge
                        status={
                          selectedSubmission.status
                        }
                      />

                    </div>

                  </div>


                  <div className="p-5 space-y-4">

                    {/* TASK */}

                    <DetailCard
                      icon={
                        <FileCheck2 className="w-4 h-4" />
                      }
                      title="Task"
                      value={
                        `Task #${selectedSubmission.taskId}`
                      }
                    />


                    {/* DEVELOPER */}

                    <DetailCard
                      icon={
                        <UserRound className="w-4 h-4" />
                      }
                      title="Developer"
                      value={
                        `Developer #${selectedSubmission.developerId}`
                      }
                    />


                    {/* BRANCH */}

                    <DetailCard
                      icon={
                        <GitBranch className="w-4 h-4" />
                      }
                      title="GitHub Branch"
                      value={
                        selectedSubmission.githubBranch ||
                        'Not provided'
                      }
                    />


                    {/* COMMIT */}

                    <DetailCard
                      icon={
                        <GitCommit className="w-4 h-4" />
                      }
                      title="Commit Hash"
                      value={
                        selectedSubmission.commitHash ||
                        'Not provided'
                      }
                    />


                    {/* PR */}

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                      <div className="flex items-center gap-2 text-slate-400">

                        <ExternalLink className="w-4 h-4" />


                        <p className="text-[9px] uppercase tracking-wider font-bold">

                          Pull Request

                        </p>

                      </div>


                      {selectedSubmission.pullRequestUrl ? (

                        <a
                          href={
                            selectedSubmission.pullRequestUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline mt-2 break-all"
                        >

                          Open Pull Request

                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />

                        </a>

                      ) : (

                        <p className="text-xs text-slate-500 mt-2">

                          Not provided

                        </p>

                      )}

                    </div>


                    {/* NOTES */}

                    <div>

                      <div className="flex items-center gap-2">

                        <MessageSquareText className="w-4 h-4 text-slate-500" />


                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">

                          Implementation Notes

                        </p>

                      </div>


                      <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-4">

                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">

                          {selectedSubmission.implementationNotes ||
                            'No implementation notes provided.'}

                        </p>

                      </div>

                    </div>


                    {/* SUBMITTED */}

                    <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">

                      <span>

                        Submitted

                      </span>


                      <span className="font-semibold text-slate-600">

                        {formatDateTime(
                          selectedSubmission.submittedAt
                        )}

                      </span>

                    </div>

                  </div>

                </div>


                {/* ===========================================
                    QA REVIEW ACTIONS
                    =========================================== */}

                {activeTab ===
                  'PENDING' && (

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                    <div className="p-5 border-b border-slate-100">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">

                          <TestTube2 className="w-5 h-5 text-purple-600" />

                        </div>


                        <div>

                          <h2 className="font-extrabold text-slate-900">

                            QA Decision

                          </h2>


                          <p className="text-xs text-slate-500 mt-1">

                            Approve the implementation or return it to the developer.

                          </p>

                        </div>

                      </div>

                    </div>


                    <div className="p-5 space-y-4">

                      <div>

                        <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                          QA Feedback

                        </label>


                        <textarea
                          rows={6}
                          value={
                            feedback
                          }
                          onChange={
                            (
                              event
                            ) =>
                              setFeedback(
                                event.target.value
                              )
                          }
                          placeholder="Enter QA findings, testing notes, issues or approval comments..."
                          className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-xs resize-y focus:outline-none focus:border-purple-500"
                        />


                        <p className="text-[10px] text-slate-400 mt-2">

                          Feedback is optional for approval and required when requesting changes.

                        </p>

                      </div>


                      <div className="grid grid-cols-2 gap-3">

                        <button
                          type="button"
                          disabled={
                            reviewing !==
                            null
                          }
                          onClick={
                            () =>
                              void handleReject()
                          }
                          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                          {reviewing ===
                          'REJECT' ? (

                            <Loader2 className="w-4 h-4 animate-spin" />

                          ) : (

                            <X className="w-4 h-4" />

                          )}


                          {reviewing ===
                          'REJECT'
                            ? 'Requesting...'
                            : 'Request Changes'}

                        </button>


                        <button
                          type="button"
                          disabled={
                            reviewing !==
                            null
                          }
                          onClick={
                            () =>
                              void handleApprove()
                          }
                          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                          {reviewing ===
                          'APPROVE' ? (

                            <Loader2 className="w-4 h-4 animate-spin" />

                          ) : (

                            <CheckCircle2 className="w-4 h-4" />

                          )}


                          {reviewing ===
                          'APPROVE'
                            ? 'Approving...'
                            : 'Approve Work'}

                        </button>

                      </div>

                    </div>

                  </div>

                )}


                {/* ===========================================
                    HISTORY STATUS
                    =========================================== */}

                {activeTab ===
                  'APPROVED' && (

                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">

                    <div className="flex items-start gap-3">

                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />


                      <div>

                        <p className="text-sm font-extrabold text-emerald-900">

                          QA Approved

                        </p>


                        <p className="text-xs text-emerald-700 mt-1">

                          This submission passed QA and its development task was marked completed.

                        </p>

                      </div>

                    </div>

                  </div>

                )}


                {activeTab ===
                  'REJECTED' && (

                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">

                    <div className="flex items-start gap-3">

                      <XCircle className="w-6 h-6 text-rose-600 shrink-0" />


                      <div>

                        <p className="text-sm font-extrabold text-rose-900">

                          Changes Requested

                        </p>


                        <p className="text-xs text-rose-700 mt-1">

                          This work was returned to the developer. The related task is available for correction and resubmission.

                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </>

            )}

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
  title: string;

  value: number;

  icon: React.ReactNode;

  valueClass?: string;
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center justify-between">

        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">

          {title}

        </p>


        <div className="text-purple-600">

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
   TAB BUTTON
   ========================================================= */

function QaTabButton({
  active,
  onClick,
  label,
  count,
  icon,
  activeClass
}: {
  active: boolean;

  onClick: () => void;

  label: string;

  count: number;

  icon: React.ReactNode;

  activeClass: string;
}) {

  return (

    <button
      type="button"
      onClick={
        onClick
      }
      className={
        `flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition-all ${
          active
            ? activeClass
            : 'text-slate-500 hover:bg-slate-50'
        }`
      }
    >

      {icon}


      <span className="hidden sm:inline">

        {label}

      </span>


      <span
        className={
          `px-2 py-0.5 rounded-full ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-slate-600'
          }`
        }
      >

        {count}

      </span>

    </button>
  );
}


/* =========================================================
   STATUS BADGE
   ========================================================= */

function SubmissionStatusBadge({
  status
}: {
  status: string;
}) {

  let style =
    'bg-slate-100 text-slate-700';


  let label =
    formatValue(
      status
    );


  if (
    status ===
    'SUBMITTED'
  ) {

    style =
      'bg-amber-50 text-amber-700';

    label =
      'Pending QA';
  }


  if (
    status ===
    'QA_REVIEW'
  ) {

    style =
      'bg-purple-50 text-purple-700';

    label =
      'QA Review';
  }


  if (
    status ===
    'APPROVED'
  ) {

    style =
      'bg-emerald-50 text-emerald-700';

    label =
      'Approved';
  }


  if (
    status ===
    'REJECTED'
  ) {

    style =
      'bg-rose-50 text-rose-700';

    label =
      'Changes Requested';
  }


  return (

    <span
      className={
        `inline-flex px-2 py-1 rounded-full text-[9px] font-bold ${style}`
      }
    >

      {label}

    </span>
  );
}


/* =========================================================
   DETAIL CARD
   ========================================================= */

function DetailCard({
  icon,
  title,
  value
}: {
  icon: React.ReactNode;

  title: string;

  value: string;
}) {

  return (

    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

      <div className="flex items-center gap-2 text-slate-400">

        {icon}


        <p className="text-[9px] uppercase tracking-wider font-bold">

          {title}

        </p>

      </div>


      <p className="text-xs font-semibold text-slate-700 mt-2 break-words">

        {value}

      </p>

    </div>
  );
}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
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


  return date.toLocaleDateString();
}


/* =========================================================
   DATE TIME
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


/* =========================================================
   FORMAT ENUM
   ========================================================= */

function formatValue(
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