'use client';

import { FileDown, Printer, FileText, CheckCircle2 } from 'lucide-react';
import type { SrsDocumentDto } from '@/lib/srs-api';

interface SrsDocumentViewProps {
  document: SrsDocumentDto;
  companyName?: string;
  projectCode?: string;
  showExport?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineFormat(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code key={index} className="px-1 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderContentLines(content: string): React.ReactNode {
  const lines = content.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let bulletGroup: string[] = [];
  let numberedGroup: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bulletGroup.length > 0) {
      nodes.push(
        <ul key={`ul-${key++}`} className="list-disc pl-5 text-[11px] text-slate-600 space-y-1 font-medium">
          {bulletGroup.map((line, i) => (
            <li key={i}>{inlineFormat(line)}</li>
          ))}
        </ul>
      );
      bulletGroup = [];
    }
  };

  const flushNumbered = () => {
    if (numberedGroup.length > 0) {
      nodes.push(
        <ol key={`ol-${key++}`} className="list-decimal pl-5 text-[11px] text-slate-600 space-y-1 font-medium">
          {numberedGroup.map((line, i) => (
            <li key={i}>{inlineFormat(line)}</li>
          ))}
        </ol>
      );
      numberedGroup = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushBullets();
      flushNumbered();
      continue;
    }

    if (line.startsWith('### ')) {
      flushBullets();
      flushNumbered();
      nodes.push(
        <h4 key={key++} className="text-xs font-extrabold text-slate-800 pt-3">
          {inlineFormat(line.slice(4))}
        </h4>
      );
      continue;
    }

    if (/^-\s+/.test(line)) {
      flushNumbered();
      bulletGroup.push(line.replace(/^-\s+/, ''));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushBullets();
      numberedGroup.push(line.replace(/^\d+\.\s+/, ''));
      continue;
    }

    flushBullets();
    flushNumbered();
    nodes.push(
      <p key={key++} className="text-[11px] text-slate-600 leading-relaxed font-normal">
        {inlineFormat(line)}
      </p>
    );
  }

  flushBullets();
  flushNumbered();

  return nodes;
}

function buildExportHtml(
  document: SrsDocumentDto,
  companyName?: string,
  projectCode?: string
): string {
  const company = companyName || 'Apex Financial Technologies LLC';
  const compiled = new Date(document.createdAt).toISOString().split('T')[0];

  const sectionHtml = document.sections
    .map((section, index) => {
      const sub = section.content
        .split(/\r?\n/)
        .map((raw) => raw.trim())
        .filter(Boolean)
        .map((line) => {
          if (line.startsWith('### ')) {
            return `<h4>${escapeHtml(line.slice(4))}</h4>`;
          }
          if (/^-\s+/.test(line)) {
            return `<li>${escapeHtml(line.replace(/^-\s+/, ''))}</li>`;
          }
          if (/^\d+\.\s+/.test(line)) {
            return `<li>${escapeHtml(line.replace(/^\d+\.\s+/, ''))}</li>`;
          }
          return `<p>${escapeHtml(line)}</p>`;
        })
        .join('\n');

      return `
        <div class="srs-section">
          <h3>${index + 1}. ${escapeHtml(section.title)}</h3>
          ${sub}
        </div>`;
    })
    .join('\n');

  const toc = document.sections
    .map((section, index) => `<li>${index + 1}. ${escapeHtml(section.title)}</li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(document.title)}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
  .cover { text-align: center; padding: 80px 0 40px; border-bottom: 1px solid #e2e8f0; margin-bottom: 32px; }
  .badge { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: #f1f5f9; color: #334155; padding: 4px 12px; border-radius: 4px; }
  h1 { font-size: 30px; color: #0f172a; margin: 16px 0 8px; }
  .meta { font-size: 12px; color: #64748b; }
  .company { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 64px; line-height: 1.7; }
  h2 { font-size: 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  h3 { font-size: 13px; color: #0f172a; margin-top: 24px; }
  h4 { font-size: 12px; color: #0f172a; margin-top: 12px; }
  p { font-size: 11px; color: #475569; line-height: 1.6; }
  ul, ol { font-size: 11px; color: #475569; padding-left: 20px; }
  li { margin-bottom: 3px; }
  .toc { padding-left: 20px; font-size: 12px; color: #334155; font-weight: 600; }
</style>
</head>
<body>
  <div class="cover">
    <span class="badge">Software Requirements Specification (SRS)</span>
    <h1>${escapeHtml(document.title)}</h1>
    <div class="meta">Project Reference: ${escapeHtml(projectCode || `PRJ-${document.projectId}`)} | Version: ${document.version}</div>
    <div class="company">Company: ${escapeHtml(company)}<br>Date Compiled: ${compiled}<br>Prepared By: ReqSync AI Architect</div>
  </div>

  <h2>Table of Contents</h2>
  <ol class="toc">
    ${toc}
  </ol>

  ${sectionHtml}

  <div style="margin-top:48px; border-top:1px solid #e2e8f0; padding-top:8px; font-size:9px; color:#94a3b8; text-align:center;">
    Generated by ReqSync — Requirement Engineering Platform
  </div>
</body>
</html>`;
}

function downloadDoc(html: string, filename: string) {
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function SrsDocumentView({
  document: srsDocument,
  companyName,
  projectCode,
  showExport = true,
}: SrsDocumentViewProps) {
  const handleExportWord = () => {
    const slug = (srsDocument.title || `SRS-v${srsDocument.version}`)
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
    downloadDoc(buildExportHtml(srsDocument, companyName, projectCode), `${slug}.doc`);
  };

  const handleExportPdf = () => {
    const html = buildExportHtml(srsDocument, companyName, projectCode);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {showExport && (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Word (.doc)</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export / Print PDF</span>
          </button>
        </div>
      )}

      <div className="border border-slate-200 p-8 rounded-2xl shadow-xs bg-slate-50 max-h-[60vh] overflow-y-auto print:max-h-none print:bg-white print:p-0 print:border-none scrollbar-thin">
        <div className="bg-white border border-slate-200/60 p-8 max-w-3xl mx-auto space-y-12 font-sans text-slate-800 shadow-2xs print:shadow-none print:border-none">
          {/* Cover Page */}
          <div className="text-center py-20 space-y-6 border-b border-slate-100">
            <span className="text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-700 px-3 py-1 rounded">
              Software Requirements Specification (SRS)
            </span>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-4">
              {srsDocument.title}
            </h1>
            <p className="text-xs text-slate-500">
              Project Reference: {projectCode || `PRJ-${srsDocument.projectId}`} | Version: {srsDocument.version}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold pt-16">
              Company: {companyName || 'Apex Financial Technologies LLC'}<br />
              Date Compiled: {new Date(srsDocument.createdAt).toISOString().split('T')[0]}<br />
              Prepared By: ReqSync AI Architect
            </p>
          </div>

          {/* Table of Contents */}
          <div className="space-y-4 pt-6">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-1 uppercase tracking-wider">
              Table of Contents
            </h2>
            <div className="space-y-1 text-xs text-slate-600 font-semibold">
              {srsDocument.sections.map((section, index) => (
                <div
                  key={section.order}
                  className="flex justify-between border-b border-dotted border-slate-200 pb-0.5"
                >
                  <span>
                    {index + 1}. {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          {srsDocument.sections.map((section, index) => (
            <div key={section.order} className="space-y-3 pt-6">
              <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-1">
                {index + 1}. {section.title}
              </h2>
              <div className="space-y-2">
                {renderContentLines(section.content)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
        <FileText className="w-3.5 h-3.5" />
        <span>{srsDocument.sections.length} sections</span>
        <span className="mx-1">•</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>Status: {srsDocument.status}</span>
      </div>
    </div>
  );
}
