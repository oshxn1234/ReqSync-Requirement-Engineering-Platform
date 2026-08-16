'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useBackendProjectStore } from '@/store/backendProjectStore';
import { getProjectRequirements } from '@/lib/completeness-api';
import { RotateCw, FileText, Printer } from 'lucide-react';

export default function SrsPage() {
  const [mounted, setMounted] = useState(false);
  const settings = useProjectStore((s) => s.settings);
  const localRequirements = useProjectStore((s) => s.requirements);
  const selectedBackendProjectId = useBackendProjectStore((s) => s.selectedProjectId);

  const [backendRequirements, setBackendRequirements] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const projectId = selectedBackendProjectId ?? 1;
        const reqs = await getProjectRequirements(projectId);
        setBackendRequirements(reqs as any[]);
      } catch {
        setBackendRequirements(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedBackendProjectId]);

  const requirements = backendRequirements ?? localRequirements;

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold">SRS Document Builder</h1>
          <p className="text-sm text-slate-500">Generate a printable SRS from project requirements.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span>Print / Export</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">Software Requirements Specification (SRS)</h2>
            <p className="text-sm text-slate-500">{settings.projectName} - {settings.projectCode}</p>
          </div>
          <div className="text-sm text-slate-500">Generated: {new Date().toLocaleDateString()}</div>
        </div>

        <hr className="my-4" />

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <RotateCw className="w-4 h-4 animate-spin" /> Loading requirements...
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.length === 0 ? (
              <div className="text-sm text-slate-500">No requirements available to include in the SRS.</div>
            ) : (
              requirements.map((req: any) => (
                <section key={req.id} className="p-3 border border-slate-100 rounded-xl">
                  <h3 className="font-bold">{req.id ?? req.code ?? 'REQ-?'}: {req.title || req.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{req.description}</p>
                  <div className="mt-2 text-xs text-slate-500">Type: {req.type ?? req.type} • Priority: {req.priority ?? req.priority} • Status: {req.status ?? req.status}</div>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
