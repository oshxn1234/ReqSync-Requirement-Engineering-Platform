"use client";

import { useState } from 'react';

type RequirementForUserStory = {
  code: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  actor: string;
};

type UserStory = {
  id: string;
  requirementCode: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  priority: string;
  estimatedEffort: string;
};

type GenerationResponse = {
  projectName: string;
  userStories: UserStory[] | null;
  srsDocument: string | null;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export function useUserStoryAndSrsGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function callApi(path: string, projectName: string, requirements: RequirementForUserStory[]) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, requirements }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Request failed');
      }

      const data = (await response.json()) as GenerationResponse;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function generateUserStoriesAndSrs(projectName: string, requirements: RequirementForUserStory[]) {
    return callApi('/api/userstory/generate', projectName, requirements);
  }

  async function generateUserStories(projectName: string, requirements: RequirementForUserStory[]) {
    return callApi('/api/userstory/user-stories', projectName, requirements);
  }

  async function generateSrs(projectName: string, requirements: RequirementForUserStory[]) {
    return callApi('/api/userstory/srs', projectName, requirements);
  }

  return {
    loading,
    error,
    generateUserStoriesAndSrs,
    generateUserStories,
    generateSrs,
  };
}
