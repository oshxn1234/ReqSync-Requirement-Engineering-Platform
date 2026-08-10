"use client";

import React, { useState } from 'react';
import { useUserStoryAndSrsGeneration } from '@/hooks/useUserStoryAndSrsGeneration';
import { UserStoriesDisplay } from './UserStoriesDisplay';
import { SrsDocumentDisplay } from './SrsDocumentDisplay';

interface Requirement {
  code: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  actor: string;
}

interface UserStoryAndSrsGeneratorProps {
  projectName: string;
  requirements?: Requirement[];
  onClose?: () => void;
}

type GenerationType = 'both' | 'userStories' | 'srs';

export const UserStoryAndSrsGenerator: React.FC<UserStoryAndSrsGeneratorProps> = ({
  projectName,
  requirements = [],
  onClose,
}) => {
  const {
    loading,
    error,
    generateUserStoriesAndSrs,
    generateUserStories,
    generateSrs,
  } = useUserStoryAndSrsGeneration();

  const [generationType, setGenerationType] = useState<GenerationType>('both');
  const [userStories, setUserStories] = useState<any[] | null>(null);
  const [srsDocument, setSrsDocument] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (requirements.length === 0) {
      alert('Please provide requirements');
      return;
    }

    if (generationType === 'both') {
      const response = await generateUserStoriesAndSrs(projectName, requirements);
      setUserStories(response?.userStories ?? null);
      setSrsDocument(response?.srsDocument ?? null);
    } else if (generationType === 'userStories') {
      const response = await generateUserStories(projectName, requirements);
      setUserStories(response?.userStories ?? null);
      setSrsDocument(null);
    } else {
      const response = await generateSrs(projectName, requirements);
      setUserStories(null);
      setSrsDocument(response?.srsDocument ?? null);
    }

    setGenerated(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Story & SRS Generator</h2>
        <p className="text-gray-600 mb-6">
          Project: <span className="font-semibold">{projectName}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Generation Type</label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="generationType"
                  value="both"
                  checked={generationType === 'both'}
                  onChange={(e) => setGenerationType(e.target.value as GenerationType)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="ml-3 text-gray-700">Both User Stories & SRS</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="generationType"
                  value="userStories"
                  checked={generationType === 'userStories'}
                  onChange={(e) => setGenerationType(e.target.value as GenerationType)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="ml-3 text-gray-700">Only User Stories</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="generationType"
                  value="srs"
                  checked={generationType === 'srs'}
                  onChange={(e) => setGenerationType(e.target.value as GenerationType)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="ml-3 text-gray-700">Only SRS Document</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {generated && (
        <div className="space-y-6">
          {(generationType === 'both' || generationType === 'userStories') && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">User Stories</h3>
              <UserStoriesDisplay userStories={userStories} loading={loading} />
            </div>
          )}

          {(generationType === 'both' || generationType === 'srs') && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">SRS Document</h3>
              <SrsDocumentDisplay projectName={projectName} srsDocument={srsDocument} loading={loading} />
            </div>
          )}
        </div>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Close
        </button>
      )}
    </div>
  );
};
