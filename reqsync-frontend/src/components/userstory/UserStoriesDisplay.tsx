"use client";

import React from 'react';

interface UserStory {
  id: string;
  requirementCode: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  priority: string;
  estimatedEffort: string;
}

interface UserStoriesDisplayProps {
  userStories: UserStory[] | null;
  loading?: boolean;
}

export const UserStoriesDisplay: React.FC<UserStoriesDisplayProps> = ({
  userStories,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userStories || userStories.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
        No user stories generated yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userStories.map((story) => (
        <div
          key={story.id}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
              <p className="text-sm text-gray-500">Code: {story.requirementCode}</p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {story.priority}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {story.estimatedEffort}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-4 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">As a</span> {story.asA}
              <br />
              <span className="font-semibold">I want</span> {story.iWant}
              <br />
              <span className="font-semibold">So that</span> {story.soThat}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Acceptance Criteria:</h4>
            <ul className="space-y-2">
              {story.acceptanceCriteria.map((criterion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="mt-1 rounded" disabled />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};
