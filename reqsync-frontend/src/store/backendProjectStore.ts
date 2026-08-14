import {
  create
} from 'zustand';

import {
  persist
} from 'zustand/middleware';

import type {
  ProjectResponse
} from '@/lib/project-api';


interface BackendProjectState {

  projects: ProjectResponse[];

  selectedProjectId: number | null;


  setProjects: (
    projects: ProjectResponse[]
  ) => void;


  selectProject: (
    projectId: number | null
  ) => void;


  upsertProject: (
    project: ProjectResponse
  ) => void;


  removeProject: (
    projectId: number
  ) => void;
}


export const useBackendProjectStore =
  create<BackendProjectState>()(

    persist(

      (set) => ({

        projects: [],

        selectedProjectId: null,


        /*
         * Replace the current backend
         * project list.
         */
        setProjects: (
          projects
        ) =>
          set((state) => {

            let selectedProjectId =
              state.selectedProjectId;


            const selectedProjectExists =
              selectedProjectId !== null &&
              projects.some(
                (project) =>
                  project.id ===
                  selectedProjectId
              );


            /*
             * If selected project was deleted
             * or does not exist, select first project.
             */
            if (
              !selectedProjectExists
            ) {

              selectedProjectId =
                projects.length > 0
                  ? projects[0].id
                  : null;
            }


            return {
              projects,
              selectedProjectId,
            };
          }),


        /*
         * Select the project currently used
         * by Requirement Extraction.
         */
        selectProject: (
          projectId
        ) =>
          set({
            selectedProjectId:
              projectId,
          }),


        /*
         * Add a project or replace
         * an existing project.
         */
        upsertProject: (
          project
        ) =>
          set((state) => {

            const exists =
              state.projects.some(
                (item) =>
                  item.id === project.id
              );


            const projects =
              exists

                ? state.projects.map(
                    (item) =>
                      item.id === project.id
                        ? project
                        : item
                  )

                : [
                    project,
                    ...state.projects,
                  ];


            return {
              projects,

              /*
               * Newly created / updated
               * project becomes selected.
               */
              selectedProjectId:
                project.id,
            };
          }),


        /*
         * Remove project from local UI store.
         */
        removeProject: (
          projectId
        ) =>
          set((state) => {

            const projects =
              state.projects.filter(
                (project) =>
                  project.id !==
                  projectId
              );


            let selectedProjectId =
              state.selectedProjectId;


            if (
              selectedProjectId ===
              projectId
            ) {

              selectedProjectId =
                projects.length > 0
                  ? projects[0].id
                  : null;
            }


            return {
              projects,
              selectedProjectId,
            };
          }),

      }),

      {
        name:
          'reqsync-backend-project-store',
      }
    )
  );