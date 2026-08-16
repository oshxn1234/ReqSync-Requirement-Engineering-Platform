'use client';

import { useCallback, useEffect, useState } from 'react';
import { useBackendProjectStore } from '@/store/backendProjectStore';
import {
  getProjectSrs,
  generateProjectSrs,
  SrsDocumentDto,
} from '@/lib/srs-api';
import SrsDocumentView from '@/components/srs-document-view';
import { RotateCw, FileText, Sparkles, AlertCircle } from 'lucide-react';

export default function SrsPage() {
  const [mounted, setMounted] = useState(false);
  const selectedBackendProjectId = useBackendProjectStore((s) => s.selectedProjectId);

  const [document, setDocument] = useState<SrsDocumentDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectId = selectedBackendProjectId ?? 1;

  const loadSrs = useCallback(async (showLoader: boolean) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const doc = await getProjectSrs(projectId);
      setDocument(doc ?? null);
    } catch (err: any) {
      setDocument(null);
      setError(err?.message ?? 'Unable to load SRS from backend.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    loadSrs(true);
  }, [loadSrs]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const doc = await generateProjectSrs(projectId);
      setDocument(doc);
    } catch (err: any) {
      setError(err?.message ?? 'SRS generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold">SRS Document Builder</h1>
          <p className="text-sm text-slate-500">
            Generate a professional Software Requirements Specification from
            project requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{generating ? 'Generating...' : document ? 'Regenerate SRS' : 'Generate SRS'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600 py-10 justify-center">
            <RotateCw className="w-4 h-4 animate-spin" /> Loading SRS document...
          </div>
        ) : !document ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <h2 className="text-lg font-bold text-slate-700">
              No SRS document generated yet
            </h2>
            <p className="text-sm text-slate-500 max-w-md mt-1">
              Click <span className="font-semibold">Generate SRS</span> to build
              a complete Software Requirements Specification from the project
              requirements using AI.
            </p>
          </div>
        ) : (
          <SrsDocumentView document={document} projectCode={`PRJ-${document.projectId}`} />
        )}
      </div>
    </div>
  );
}
