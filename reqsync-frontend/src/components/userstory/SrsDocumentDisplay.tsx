"use client";

import React, { useState } from 'react';

interface SrsDocumentDisplayProps {
  srsDocument: string | null;
  projectName?: string;
  loading?: boolean;
}

export const SrsDocumentDisplay: React.FC<SrsDocumentDisplayProps> = ({
  srsDocument,
  projectName = 'Project',
  loading = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (srsDocument) {
      navigator.clipboard.writeText(srsDocument);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (srsDocument) {
      const element = document.createElement('a');
      const file = new Blob([srsDocument], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `SRS_${projectName}_${new Date().getTime()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!srsDocument) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
        No SRS document generated yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
        >
          Download as TXT
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
          {srsDocument}
        </div>
      </div>
    </div>
  );
};
