'use client';

import {
  useEffect,
  useState,
  useSyncExternalStore
} from 'react';

import Image from 'next/image';

import {
  useProjectStore,
  type UmlClass,
  type UmlRelationship,
  type UmlDiagramVersion
} from '@/store/projectStore';

import {
  useBackendProjectStore
} from '@/store/backendProjectStore';

import {
  getAllProjects
} from '@/lib/project-api';

import {
  generateUmlFromDatabase,
  getLatestUml,
  getProjectUmlDiagrams,
  getUmlVersions,
  saveEditedUmlVersion,
  type UmlGenerationResponse,
  type UmlVersionRecord,
} from '@/lib/uml-api';

import {
  parsePlantUmlToWorkspace
} from '@/lib/plantuml-parser';

import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  FileText,
  ArrowRight,
  Eye,
  Network,
  X,
  RefreshCw,
  Layers,
  GitCompare,
  Check,
  Code2,
  ShieldCheck,
  FolderKanban,
  LockKeyhole
} from 'lucide-react';


export default function UmlWorkspacePage() {

  /* =========================================================
     HYDRATION
     ========================================================= */

  const mounted =
    useSyncExternalStore(
      () => () => {},
      () => true,
      () => false
    );


  /* =========================================================
     OLD PROJECT STORE - UML DATA
     ========================================================= */

  const baselines =
    useProjectStore(
      (state) =>
        state.baselines
    );


  const umlDiagramVersions =
    useProjectStore(
      (state) =>
        state.umlDiagramVersions
    );


  const currentUmlDiagram =
    useProjectStore(
      (state) =>
        state.currentUmlDiagram
    );


  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  /* =========================================================
     UML STORE ACTIONS
     ========================================================= */

  const addUmlClass =
    useProjectStore(
      (state) =>
        state.addUmlClass
    );


  const updateUmlClass =
    useProjectStore(
      (state) =>
        state.updateUmlClass
    );


  const deleteUmlClass =
    useProjectStore(
      (state) =>
        state.deleteUmlClass
    );


  const addUmlRelationship =
    useProjectStore(
      (state) =>
        state.addUmlRelationship
    );


  const deleteUmlRelationship =
    useProjectStore(
      (state) =>
        state.deleteUmlRelationship
    );


  const commitUmlToBaseline =
    useProjectStore(
      (state) =>
        state.commitUmlToBaseline
    );


  /* =========================================================
     BACKEND PROJECT STORE
     ========================================================= */

  const backendProjects =
    useBackendProjectStore(
      (state) =>
        state.projects
    );


  const selectedBackendProjectId =
    useBackendProjectStore(
      (state) =>
        state.selectedProjectId
    );


  const setBackendProjects =
    useBackendProjectStore(
      (state) =>
        state.setProjects
    );


  const selectBackendProject =
    useBackendProjectStore(
      (state) =>
        state.selectProject
    );


  /* =========================================================
     SELECTED BACKEND PROJECT
     ========================================================= */

  const selectedProject =
    backendProjects.find(
      (project) =>
        project.id ===
        selectedBackendProjectId
    ) ??
    null;


  const projectId =
    selectedProject?.id ??
    null;


  const isCompletedProject =
    selectedProject?.status ===
    'COMPLETED';


  /* =========================================================
     PERMISSIONS
     ========================================================= */

  const canGenerate =
    (
      currentUser?.role ===
        'Business Analyst' ||

      currentUser?.role ===
        'Project Manager'
    ) &&
    !isCompletedProject;


  const canEdit =
    currentUser?.role ===
      'Business Analyst' &&
    !isCompletedProject;


  /* =========================================================
     PROJECT LOADING
     ========================================================= */

  const [
    projectsLoading,
    setProjectsLoading
  ] =
    useState(true);


  const [
    projectLoadError,
    setProjectLoadError
  ] =
    useState('');


  /* =========================================================
     WORKSPACE STATE
     ========================================================= */

  const [
    activeWorkspaceTab,
    setActiveWorkspaceTab
  ] =
    useState<
      'canvas' |
      'compare'
    >('canvas');


  const [
    isGenerating,
    setIsGenerating
  ] =
    useState(false);


  const [
    showExportModal,
    setShowExportModal
  ] =
    useState(false);


  const [
    exportFormat,
    setExportFormat
  ] =
    useState<
      'mermaid' |
      'plantuml'
    >('mermaid');


  const [
    copied,
    setCopied
  ] =
    useState(false);


  const [
    backendUml,
    setBackendUml
  ] =
    useState<
      UmlGenerationResponse |
      null
    >(null);


  const [
    showRenderedDiagram,
    setShowRenderedDiagram
  ] =
    useState(false);


  const [
    backendVersions,
    setBackendVersions
  ] =
    useState<
      UmlVersionRecord[]
    >([]);


  const [
    isSavingVersion,
    setIsSavingVersion
  ] =
    useState(false);


  const [
    isDirty,
    setIsDirty
  ] =
    useState(false);


  const [
    generationError,
    setGenerationError
  ] =
    useState('');


  /* =========================================================
     COMMIT BASELINE MODAL
     ========================================================= */

  const [
    showCommitModal,
    setShowCommitModal
  ] =
    useState(false);


  const [
    selectedBaseline,
    setSelectedBaseline
  ] =
    useState('');


  const activeBaseline =
    selectedBaseline ||
    baselines[0]?.version ||
    '';


  const [
    commitDesc,
    setCommitDesc
  ] =
    useState('');


  /* =========================================================
     EDIT CLASS MODAL
     ========================================================= */

  const [
    showEditClassModal,
    setShowEditClassModal
  ] =
    useState(false);


  const [
    editingClass,
    setEditingClass
  ] =
    useState<UmlClass | null>(
      null
    );


  const [
    classNameInput,
    setClassNameInput
  ] =
    useState('');


  const [
    classAttrInput,
    setClassAttrInput
  ] =
    useState('');


  const [
    classMethodInput,
    setClassMethodInput
  ] =
    useState('');


  /* =========================================================
     ADD CLASS MODAL
     ========================================================= */

  const [
    showAddClassModal,
    setShowAddClassModal
  ] =
    useState(false);


  const [
    newClassName,
    setNewClassName
  ] =
    useState('');


  /* =========================================================
     RELATIONSHIP MODAL
     ========================================================= */

  const [
    showAddRelModal,
    setShowAddRelModal
  ] =
    useState(false);


  const [
    relSource,
    setRelSource
  ] =
    useState('');


  const [
    relTarget,
    setRelTarget
  ] =
    useState('');


  const [
    relType,
    setRelType
  ] =
    useState<
      UmlRelationship['type']
    >('Association');


  /* =========================================================
     COMPARISON
     ========================================================= */

  const [
    compareWithVersion,
    setCompareWithVersion
  ] =
    useState('');


  /* =========================================================
     LOAD BACKEND PROJECTS
     ========================================================= */

  useEffect(
    () => {

      if (
        !mounted
      ) {

        return;
      }


      let cancelled =
        false;


      const loadProjects =
        async () => {

          try {

            setProjectsLoading(
              true
            );


            setProjectLoadError(
              ''
            );


            const projects =
              await getAllProjects();


            if (
              cancelled
            ) {

              return;
            }


            setBackendProjects(
              projects
            );


            /*
             * If nothing is selected, or the previously
             * selected project no longer exists, select
             * the first backend project.
             */
            if (
              projects.length >
                0 &&
              (
                selectedBackendProjectId ===
                  null ||

                !projects.some(
                  (project) =>
                    project.id ===
                    selectedBackendProjectId
                )
              )
            ) {

              selectBackendProject(
                projects[0].id
              );
            }


            /*
             * If no projects exist, clear selection.
             */
            if (
              projects.length ===
              0
            ) {

              selectBackendProject(
                null
              );
            }

          } catch (error) {

            if (
              cancelled
            ) {

              return;
            }


            setProjectLoadError(
              error instanceof Error
                ? error.message
                : 'Unable to load projects.'
            );

          } finally {

            if (
              !cancelled
            ) {

              setProjectsLoading(
                false
              );
            }
          }
        };


      void loadProjects();


      return () => {

        cancelled =
          true;
      };

    },
    [
      mounted,
      setBackendProjects,
      selectBackendProject,
      selectedBackendProjectId
    ]
  );


  /* =========================================================
     LOAD UML WHEN PROJECT CHANGES
     ========================================================= */

  useEffect(
    () => {

      if (
        !mounted ||
        projectId ===
          null
      ) {

        return;
      }


      let cancelled =
        false;


      const loadSelectedProjectUml =
        async () => {

          try {

            /*
             * Clear previous project's UML first.
             */
            setGenerationError(
              ''
            );


            setBackendUml(
              null
            );


            setBackendVersions(
              []
            );


            setIsDirty(
              false
            );


            useProjectStore.setState({
              currentUmlDiagram: {
                classes: [],
                relationships: [],
              },

              umlDiagramVersions: [],
            });


            setCompareWithVersion(
              ''
            );


            /*
             * GET all diagrams belonging to selected project.
             */
            const diagrams =
              await getProjectUmlDiagrams(
                projectId
              );


            if (
              cancelled
            ) {

              return;
            }


            /*
             * Selected project has never generated UML.
             */
            if (
              diagrams.length ===
              0
            ) {

              return;
            }


            /*
             * Load latest UML diagram.
             */
            const latest =
              await getLatestUml(
                diagrams[0].diagramId
              );


            if (
              cancelled
            ) {

              return;
            }


            const parsed =
              parsePlantUmlToWorkspace(
                latest.plantUmlCode
              );


            useProjectStore.setState({
              currentUmlDiagram:
                parsed,
            });


            setBackendUml(
              latest
            );


            /*
             * Load version history.
             */
            const versions =
              await getUmlVersions(
                latest.diagramId
              );


            if (
              cancelled
            ) {

              return;
            }


            setBackendVersions(
              versions
            );


            const previousVersions:
              UmlDiagramVersion[] =
              versions
                .filter(
                  (version) =>
                    version.versionNumber <
                    latest.versionNumber
                )
                .map(
                  (version) => {

                    const parsedVersion =
                      parsePlantUmlToWorkspace(
                        version.plantUmlCode
                      );


                    return {

                      version:
                        `v${version.versionNumber}`,

                      baselineVersion:
                        `v${version.versionNumber}`,

                      description:
                        `${version.source ?? 'AI'} UML version ${version.versionNumber}`,

                      createdAt:
                        version.createdAt?.slice(
                          0,
                          10
                        ) ??
                        '',

                      classes:
                        parsedVersion.classes,

                      relationships:
                        parsedVersion.relationships,
                    };
                  }
                );


            useProjectStore.setState({
              umlDiagramVersions:
                previousVersions,
            });


            setCompareWithVersion(
              previousVersions[0]
                ?.baselineVersion ??

              previousVersions[0]
                ?.version ??

              ''
            );

          } catch (error) {

            console.warn(
              'Could not load saved UML for selected project:',
              error
            );


            const message =
              error instanceof Error
                ? error.message
                : 'Unable to load UML for this project.';


            /*
             * Don't destroy the whole page if the selected
             * project simply has no UML yet.
             */
            if (
              !message
                .toLowerCase()
                .includes(
                  'not found'
                )
            ) {

              setGenerationError(
                message
              );
            }
          }
        };


      void loadSelectedProjectUml();


      return () => {

        cancelled =
          true;
      };

    },
    [
      mounted,
      projectId
    ]
  );


  /* =========================================================
     HYDRATION LOADER
     ========================================================= */

  if (
    !mounted
  ) {

    return (

      <div className="flex items-center justify-center min-h-[60vh]">

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />

      </div>
    );
  }


  /* =========================================================
     REFRESH UML HISTORY
     ========================================================= */

  const refreshBackendHistory =
    async (
      diagramId: number,
      currentVersion: number
    ) => {

      const versions =
        await getUmlVersions(
          diagramId
        );


      setBackendVersions(
        versions
      );


      const previousVersions:
        UmlDiagramVersion[] =
        versions
          .filter(
            (version) =>
              version.versionNumber <
              currentVersion
          )
          .map(
            (version) => {

              const parsedVersion =
                parsePlantUmlToWorkspace(
                  version.plantUmlCode
                );


              return {

                version:
                  `v${version.versionNumber}`,

                baselineVersion:
                  `v${version.versionNumber}`,

                description:
                  `${version.source ?? 'AI'} UML version ${version.versionNumber}`,

                createdAt:
                  version.createdAt?.slice(
                    0,
                    10
                  ) ??
                  '',

                classes:
                  parsedVersion.classes,

                relationships:
                  parsedVersion.relationships,
              };
            }
          );


      useProjectStore.setState({
        umlDiagramVersions:
          previousVersions,
      });


      setCompareWithVersion(
        previousVersions[0]
          ?.baselineVersion ??

        previousVersions[0]
          ?.version ??

        ''
      );
    };


  /* =========================================================
     AI GENERATE UML
     ========================================================= */

  const handleAiGenerate =
    async () => {

      if (
        !selectedProject
      ) {

        setGenerationError(
          'Please select a project first.'
        );

        return;
      }


      if (
        isCompletedProject
      ) {

        setGenerationError(
          'Completed projects are read-only. UML cannot be regenerated.'
        );

        return;
      }


      if (
        !canGenerate
      ) {

        setGenerationError(
          'You do not have permission to generate UML diagrams.'
        );

        return;
      }


      setIsGenerating(
        true
      );


      setGenerationError(
        ''
      );


      try {

        /*
         * Selected backend project ID and project name
         * are sent directly to Spring Boot.
         */
        const result =
          await generateUmlFromDatabase(
            selectedProject.id,
            selectedProject.name
          );


        const parsedDiagram =
          parsePlantUmlToWorkspace(
            result.plantUmlCode
          );


        useProjectStore.setState({
          currentUmlDiagram:
            parsedDiagram,
        });


        setBackendUml(
          result
        );


        setIsDirty(
          false
        );


        await refreshBackendHistory(
          result.diagramId,
          result.versionNumber
        );

      } catch (error) {

        console.error(
          'UML generation failed:',
          error
        );


        const message =
          error instanceof Error
            ? error.message
            : 'Failed to generate UML diagram.';


        setGenerationError(
          message
        );


        window.alert(
          message
        );

      } finally {

        setIsGenerating(
          false
        );
      }
    };


  /* =========================================================
     MERMAID EXPORT
     ========================================================= */

  const getMermaidCode =
    () => {

      let code =
        'classDiagram\n';


      currentUmlDiagram
        .classes
        .forEach(
          (umlClass) => {

            code +=
              `  class ${umlClass.name} {\n`;


            umlClass
              .attributes
              .forEach(
                (attribute) => {

                  code +=
                    `    +${attribute}\n`;
                }
              );


            umlClass
              .methods
              .forEach(
                (method) => {

                  code +=
                    `    +${method}\n`;
                }
              );


            code +=
              '  }\n';
          }
        );


      currentUmlDiagram
        .relationships
        .forEach(
          (relationship) => {

            const source =
              currentUmlDiagram
                .classes
                .find(
                  (umlClass) =>
                    umlClass.id ===
                    relationship.sourceClassId
                )
                ?.name ??
              'Unknown';


            const target =
              currentUmlDiagram
                .classes
                .find(
                  (umlClass) =>
                    umlClass.id ===
                    relationship.targetClassId
                )
                ?.name ??
              'Unknown';


            let symbol =
              '-->';


            if (
              relationship.type ===
              'Inheritance'
            ) {

              symbol =
                '--|>';
            }


            if (
              relationship.type ===
              'Composition'
            ) {

              symbol =
                '*--';
            }


            if (
              relationship.type ===
              'Aggregation'
            ) {

              symbol =
                'o--';
            }


            if (
              relationship.type ===
              'Dependency'
            ) {

              symbol =
                '..>';
            }


            code +=
              `  ${source} ${symbol} ${target} : ${relationship.type}\n`;
          }
        );


      return code;
    };


  /* =========================================================
     PLANTUML EXPORT
     ========================================================= */

  const getPlantUmlCode =
    () => {

      /*
       * If UML has not been manually changed,
       * use the exact backend PlantUML.
       */
      if (
        backendUml?.plantUmlCode &&
        !isDirty
      ) {

        return backendUml
          .plantUmlCode;
      }


      let code =
        '@startuml\n\n';


      currentUmlDiagram
        .classes
        .forEach(
          (umlClass) => {

            code +=
              `class ${umlClass.name} {\n`;


            umlClass
              .attributes
              .forEach(
                (attribute) => {

                  code +=
                    `  +${attribute}\n`;
                }
              );


            umlClass
              .methods
              .forEach(
                (method) => {

                  code +=
                    `  +${method}\n`;
                }
              );


            code +=
              '}\n\n';
          }
        );


      currentUmlDiagram
        .relationships
        .forEach(
          (relationship) => {

            const source =
              currentUmlDiagram
                .classes
                .find(
                  (umlClass) =>
                    umlClass.id ===
                    relationship.sourceClassId
                )
                ?.name ??
              'Unknown';


            const target =
              currentUmlDiagram
                .classes
                .find(
                  (umlClass) =>
                    umlClass.id ===
                    relationship.targetClassId
                )
                ?.name ??
              'Unknown';


            let symbol =
              '-->';


            if (
              relationship.type ===
              'Inheritance'
            ) {

              symbol =
                '--|>';
            }


            if (
              relationship.type ===
              'Composition'
            ) {

              symbol =
                '*--';
            }


            if (
              relationship.type ===
              'Aggregation'
            ) {

              symbol =
                'o--';
            }


            if (
              relationship.type ===
              'Dependency'
            ) {

              symbol =
                '..>';
            }


            code +=
              `${source} ${symbol} ${target} : ${relationship.type}\n`;
          }
        );


      code +=
        '\n@enduml';


      return code;
    };


  /* =========================================================
     COPY CODE
     ========================================================= */

  const copyToClipboard =
    async () => {

      const text =
        exportFormat ===
        'mermaid'

          ? getMermaidCode()

          : getPlantUmlCode();


      await navigator.clipboard
        .writeText(
          text
        );


      setCopied(
        true
      );


      window.setTimeout(
        () =>
          setCopied(
            false
          ),
        2000
      );
    };


  /* =========================================================
     CREATE CLASS
     ========================================================= */

  const handleCreateClass =
    (
      event:
        React.FormEvent
    ) => {

      event.preventDefault();


      if (
        !canEdit
      ) {

        return;
      }


      if (
        !newClassName.trim()
      ) {

        return;
      }


      addUmlClass(
        newClassName.trim()
      );


      setIsDirty(
        true
      );


      setNewClassName(
        ''
      );


      setShowAddClassModal(
        false
      );
    };


  /* =========================================================
     OPEN CLASS EDIT
     ========================================================= */

  const openEditClassModal =
    (
      umlClass:
        UmlClass
    ) => {

      if (
        !canEdit
      ) {

        return;
      }


      setEditingClass(
        umlClass
      );


      setClassNameInput(
        umlClass.name
      );


      setClassAttrInput(
        umlClass.attributes.join(
          '\n'
        )
      );


      setClassMethodInput(
        umlClass.methods.join(
          '\n'
        )
      );


      setShowEditClassModal(
        true
      );
    };


  /* =========================================================
     SAVE CLASS EDIT
     ========================================================= */

  const handleSaveClassEdit =
    (
      event:
        React.FormEvent
    ) => {

      event.preventDefault();


      if (
        !editingClass ||
        !canEdit
      ) {

        return;
      }


      const attributes =
        classAttrInput
          .split(
            '\n'
          )
          .map(
            (attribute) =>
              attribute.trim()
          )
          .filter(
            Boolean
          );


      const methods =
        classMethodInput
          .split(
            '\n'
          )
          .map(
            (method) =>
              method.trim()
          )
          .filter(
            Boolean
          );


      updateUmlClass(
        editingClass.id,
        {
          name:
            classNameInput.trim(),

          attributes,

          methods,
        }
      );


      setIsDirty(
        true
      );


      setShowEditClassModal(
        false
      );


      setEditingClass(
        null
      );
    };


  /* =========================================================
     CREATE RELATIONSHIP
     ========================================================= */

  const handleCreateRelationship =
    (
      event:
        React.FormEvent
    ) => {

      event.preventDefault();


      if (
        !canEdit
      ) {

        return;
      }


      if (
        !relSource ||
        !relTarget ||
        relSource ===
          relTarget
      ) {

        return;
      }


      addUmlRelationship(
        relSource,
        relTarget,
        relType
      );


      setIsDirty(
        true
      );


      setShowAddRelModal(
        false
      );


      setRelSource(
        ''
      );


      setRelTarget(
        ''
      );
    };


  /* =========================================================
     DELETE CLASS
     ========================================================= */

  const handleDeleteClass =
    (
      classId:
        string
    ) => {

      if (
        !canEdit
      ) {

        return;
      }


      deleteUmlClass(
        classId
      );


      setIsDirty(
        true
      );
    };


  /* =========================================================
     DELETE RELATIONSHIP
     ========================================================= */

  const handleDeleteRelationship =
    (
      relationshipId:
        string
    ) => {

      if (
        !canEdit
      ) {

        return;
      }


      deleteUmlRelationship(
        relationshipId
      );


      setIsDirty(
        true
      );
    };


  /* =========================================================
     SAVE NEW UML VERSION
     ========================================================= */

  const handleSaveAsNewVersion =
    async () => {

      if (
        !backendUml
      ) {

        window.alert(
          'Generate a class diagram first.'
        );

        return;
      }


      if (
        !canEdit
      ) {

        window.alert(
          isCompletedProject
            ? 'Completed projects are read-only.'
            : 'Only Business Analysts can save UML changes.'
        );

        return;
      }


      try {

        setIsSavingVersion(
          true
        );


        setGenerationError(
          ''
        );


        const plantUmlCode =
          getPlantUmlCode();


        const saved =
          await saveEditedUmlVersion(
            backendUml.diagramId,
            plantUmlCode
          );


        const parsed =
          parsePlantUmlToWorkspace(
            saved.plantUmlCode
          );


        useProjectStore.setState({
          currentUmlDiagram:
            parsed,
        });


        setBackendUml(
          saved
        );


        setIsDirty(
          false
        );


        await refreshBackendHistory(
          saved.diagramId,
          saved.versionNumber
        );


        window.alert(
          `Changes saved successfully as UML version ${saved.versionNumber}.`
        );

      } catch (error) {

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to save UML version.';


        setGenerationError(
          message
        );


        window.alert(
          message
        );

      } finally {

        setIsSavingVersion(
          false
        );
      }
    };


  /* =========================================================
     COMMIT BASELINE
     ========================================================= */

  const handleCommitBaseline =
    (
      event:
        React.FormEvent
    ) => {

      event.preventDefault();


      if (
        isCompletedProject
      ) {

        return;
      }


      if (
        !activeBaseline ||
        !commitDesc.trim()
      ) {

        return;
      }


      commitUmlToBaseline(
        activeBaseline,
        commitDesc
      );


      setShowCommitModal(
        false
      );


      setCommitDesc(
        ''
      );
    };


  /* =========================================================
     VERSION COMPARISON
     ========================================================= */

  const selectedVersionData =
    umlDiagramVersions.find(
      (version) =>
        version.baselineVersion ===
        compareWithVersion
    ) ??
    umlDiagramVersions[0];


  const getUmlDiffs =
    () => {

      if (
        !selectedVersionData
      ) {

        return {
          added: [],
          removed: [],
          modified: [],
        };
      }


      const currentClasses =
        currentUmlDiagram.classes;


      const oldClasses =
        selectedVersionData.classes;


      const added =
        currentClasses
          .filter(
            (currentClass) =>
              !oldClasses.some(
                (oldClass) =>
                  oldClass.name ===
                  currentClass.name
              )
          )
          .map(
            (currentClass) =>
              currentClass.name
          );


      const removed =
        oldClasses
          .filter(
            (oldClass) =>
              !currentClasses.some(
                (currentClass) =>
                  currentClass.name ===
                  oldClass.name
              )
          )
          .map(
            (oldClass) =>
              oldClass.name
          );


      const modified:
        string[] = [];


      currentClasses.forEach(
        (currentClass) => {

          const matchingOldClass =
            oldClasses.find(
              (oldClass) =>
                oldClass.name ===
                currentClass.name
            );


          if (
            !matchingOldClass
          ) {

            return;
          }


          const attributesChanged =
            currentClass.attributes.some(
              (attribute) =>
                !matchingOldClass
                  .attributes
                  .includes(
                    attribute
                  )
            ) ||

            matchingOldClass
              .attributes
              .some(
                (attribute) =>
                  !currentClass
                    .attributes
                    .includes(
                      attribute
                    )
              );


          const methodsChanged =
            currentClass.methods.some(
              (method) =>
                !matchingOldClass
                  .methods
                  .includes(
                    method
                  )
            ) ||

            matchingOldClass
              .methods
              .some(
                (method) =>
                  !currentClass
                    .methods
                    .includes(
                      method
                    )
              );


          if (
            attributesChanged ||
            methodsChanged
          ) {

            modified.push(
              currentClass.name
            );
          }
        }
      );


      return {
        added,
        removed,
        modified,
      };
    };


  const diffs =
    getUmlDiffs();


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="max-w-7xl mx-auto space-y-6">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">

        <div>

          <div className="flex items-center gap-2">

            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold uppercase">

              AI Engineering Studio

            </span>

          </div>


          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">

            <Network className="w-6 h-6 text-blue-600" />

            AI-Assisted UML Design Workspace

          </h1>


          <p className="text-slate-500 text-sm">

            Generate class structures from project requirements and refine designs collaboratively.

          </p>

        </div>


        <div className="flex flex-wrap gap-2.5">

          {canGenerate && (

            <button
              type="button"
              onClick={
                () =>
                  void handleAiGenerate()
              }
              disabled={
                isGenerating ||
                !selectedProject
              }
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
            >

              {isGenerating ? (

                <>

                  <RefreshCw className="w-4 h-4 animate-spin" />

                  AI Engineering...

                </>

              ) : (

                <>

                  <Sparkles className="w-4 h-4" />

                  Generate Class Diagram

                </>

              )}

            </button>

          )}


          <button
            type="button"
            onClick={
              () =>
                setShowExportModal(
                  true
                )
            }
            disabled={
              currentUmlDiagram.classes.length ===
              0
            }
            className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
          >

            <Code2 className="w-4 h-4 text-slate-500" />

            Export Code

          </button>


          {currentUser?.role !==
            'CEO' &&
            !isCompletedProject && (

            <button
              type="button"
              onClick={
                () =>
                  setShowCommitModal(
                    true
                  )
              }
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold"
            >

              <ShieldCheck className="w-4 h-4 text-teal-400" />

              Commit Snapshot

            </button>

          )}

        </div>

      </div>


      {/* =====================================================
          PROJECT SELECTOR
          ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

        <div className="flex flex-wrap items-center gap-3">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">

              Project for UML

            </p>


            {projectsLoading ? (

              <div className="mt-1 min-w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 flex items-center gap-2">

                <RefreshCw className="w-3.5 h-3.5 animate-spin" />

                Loading projects...

              </div>

            ) : backendProjects.length ===
              0 ? (

              <div className="mt-1 min-w-72 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">

                No projects available

              </div>

            ) : (

              <select
                value={
                  selectedBackendProjectId ??
                  ''
                }
                onChange={
                  (event) => {

                    const value =
                      event.target.value;


                    /*
                     * Clear old UML immediately.
                     */
                    setBackendUml(
                      null
                    );


                    setBackendVersions(
                      []
                    );


                    setGenerationError(
                      ''
                    );


                    setIsDirty(
                      false
                    );


                    useProjectStore.setState({
                      currentUmlDiagram: {
                        classes: [],
                        relationships: [],
                      },

                      umlDiagramVersions: [],
                    });


                    if (
                      !value
                    ) {

                      selectBackendProject(
                        null
                      );

                      return;
                    }


                    selectBackendProject(
                      Number(
                        value
                      )
                    );
                  }
                }
                className="mt-1 min-w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
              >

                <option value="">

                  Select a project

                </option>


                {backendProjects.map(
                  (project) => (

                    <option
                      key={
                        project.id
                      }
                      value={
                        project.id
                      }
                    >

                      #{project.projectNumber} - {project.name}

                    </option>

                  )
                )}

              </select>

            )}


            {projectLoadError && (

              <p className="mt-2 text-[10px] font-semibold text-rose-600">

                {projectLoadError}

              </p>

            )}

          </div>


          {/* PROJECT STATUS */}

          {selectedProject && (

            <ProjectStatusBadge
              status={
                selectedProject.status
              }
            />

          )}


          {/* UML VERSION */}

          {backendUml && (

            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-700">

              Diagram #{backendUml.diagramId}
              {' - '}
              Version {backendUml.versionNumber}

            </span>

          )}


          {/* DIRTY */}

          {isDirty && (

            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700">

              Unsaved UML changes

            </span>

          )}

        </div>


        <div className="flex flex-wrap items-center gap-2">

          {/* COMPLETED READ ONLY */}

          {isCompletedProject && (

            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl">

              <LockKeyhole className="w-3.5 h-3.5" />

              Completed Project — Read Only

            </span>

          )}


          {!canGenerate &&
            !isCompletedProject && (

            <span className="text-[10px] font-semibold text-slate-400">

              View-only role. Use Business Analyst or Project Manager to generate.

            </span>

          )}


          {backendUml && (

            <button
              type="button"
              onClick={
                () =>
                  setShowRenderedDiagram(
                    true
                  )
              }
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50"
            >

              <Eye className="h-3.5 w-3.5 text-blue-600" />

              View Diagram

            </button>

          )}


          {canEdit &&
            backendUml && (

            <button
              type="button"
              onClick={
                () =>
                  void handleSaveAsNewVersion()
              }
              disabled={
                isSavingVersion
              }
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[10px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >

              {isSavingVersion ? (

                <RefreshCw className="h-3.5 w-3.5 animate-spin" />

              ) : (

                <ShieldCheck className="h-3.5 w-3.5" />

              )}

              Save Update as New Version

            </button>

          )}

        </div>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {generationError && (

        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">

          {generationError}

        </div>

      )}


      {/* =====================================================
          NO PROJECT
          ===================================================== */}

      {!projectsLoading &&
        !selectedProject && (

        <div className="min-h-[350px] bg-white border border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-center">

          <FolderKanban className="w-12 h-12 text-slate-300" />


          <h2 className="text-sm font-bold text-slate-700 mt-4">

            Select a project

          </h2>


          <p className="text-xs text-slate-400 mt-1">

            Select an existing ReqSync project to load or generate its UML diagram.

          </p>

        </div>

      )}


      {/* =====================================================
          WORKSPACE
          ===================================================== */}

      {selectedProject && (

        <>

          {/* TABS */}

          <div className="flex border-b border-slate-200">

            <button
              type="button"
              onClick={
                () =>
                  setActiveWorkspaceTab(
                    'canvas'
                  )
              }
              className={
                `px-5 py-3 border-b-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  activeWorkspaceTab ===
                  'canvas'

                    ? 'border-blue-600 text-blue-600'

                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >

              <Layers className="w-4 h-4" />

              Interactive Diagram Arena

            </button>


            <button
              type="button"
              onClick={
                () =>
                  setActiveWorkspaceTab(
                    'compare'
                  )
              }
              className={
                `px-5 py-3 border-b-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  activeWorkspaceTab ===
                  'compare'

                    ? 'border-blue-600 text-blue-600'

                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >

              <GitCompare className="w-4 h-4" />

              Version Comparison Diff

            </button>

          </div>


          {/* =================================================
              CANVAS TAB
              ================================================= */}

          {activeWorkspaceTab ===
          'canvas' ? (

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">

              {/* =============================================
                  UML CLASS CANVAS
                  ============================================= */}

              <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-3xl p-6 relative min-h-[550px] shadow-inner flex flex-col justify-between overflow-hidden">

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />


                <div className="relative z-10 flex justify-between items-center pb-4 border-b border-slate-900">

                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">

                    <span className="w-2 h-2 rounded-full bg-emerald-500" />

                    Live Design Canvas

                  </span>


                  {canEdit && (

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={
                          () =>
                            setShowAddClassModal(
                              true
                            )
                        }
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1"
                      >

                        <Plus className="w-3.5 h-3.5" />

                        Class

                      </button>


                      <button
                        type="button"
                        onClick={
                          () =>
                            setShowAddRelModal(
                              true
                            )
                        }
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1"
                      >

                        <Plus className="w-3.5 h-3.5" />

                        Relationship

                      </button>

                    </div>

                  )}

                </div>


                {/* CLASS CARDS */}

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 py-8 flex-grow">

                  {currentUmlDiagram.classes.length ===
                  0 ? (

                    <div className="col-span-3 flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-3">

                      <Network className="w-12 h-12 text-slate-700" />


                      <p className="text-xs">

                        No UML classes exist for this project yet.

                      </p>


                      {canGenerate && (

                        <button
                          type="button"
                          onClick={
                            () =>
                              void handleAiGenerate()
                          }
                          disabled={
                            isGenerating
                          }
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
                        >

                          {isGenerating ? (

                            <RefreshCw className="w-4 h-4 animate-spin" />

                          ) : (

                            <Sparkles className="w-4 h-4" />

                          )}

                          Generate Class Diagram

                        </button>

                      )}

                    </div>

                  ) : (

                    currentUmlDiagram.classes.map(
                      (umlClass) => (

                        <div
                          key={
                            umlClass.id
                          }
                          className="bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl hover:border-blue-500/50 transition-all group"
                        >

                          {/* CLASS HEADER */}

                          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">

                            <span className="font-extrabold text-xs text-white tracking-wide uppercase">

                              {umlClass.name}

                            </span>


                            {canEdit && (

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      openEditClassModal(
                                        umlClass
                                      )
                                  }
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                                >

                                  <Edit2 className="w-3 h-3" />

                                </button>


                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      handleDeleteClass(
                                        umlClass.id
                                      )
                                  }
                                  className="p-1 hover:bg-slate-800 text-rose-400 rounded"
                                >

                                  <Trash2 className="w-3 h-3" />

                                </button>

                              </div>

                            )}

                          </div>


                          {/* ATTRIBUTES */}

                          <div className="p-3 border-b border-slate-800/50 space-y-1">

                            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">

                              Attributes

                            </div>


                            {umlClass.attributes.length ===
                            0 ? (

                              <div className="text-[10px] text-slate-600 italic">

                                No attributes

                              </div>

                            ) : (

                              umlClass.attributes.map(
                                (
                                  attribute,
                                  index
                                ) => (

                                  <div
                                    key={
                                      index
                                    }
                                    className="text-[10px] text-slate-300 font-mono font-medium truncate"
                                  >

                                    {attribute}

                                  </div>

                                )
                              )

                            )}

                          </div>


                          {/* METHODS */}

                          <div className="p-3 bg-slate-900/40 flex-grow space-y-1">

                            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">

                              Methods

                            </div>


                            {umlClass.methods.length ===
                            0 ? (

                              <div className="text-[10px] text-slate-600 italic">

                                No methods

                              </div>

                            ) : (

                              umlClass.methods.map(
                                (
                                  method,
                                  index
                                ) => (

                                  <div
                                    key={
                                      index
                                    }
                                    className="text-[10px] text-blue-400 font-mono font-medium truncate"
                                  >

                                    {method}

                                  </div>

                                )
                              )

                            )}

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>


                {/* BOTTOM */}

                <div className="relative z-10 border-t border-slate-900 pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-bold tracking-wide gap-3">

                  <span>

                    ACTIVE SCHEMA CONTAINS:{' '}

                    {currentUmlDiagram.classes.length}
                    {' '}
                    CLASSES,
                    {' '}
                    {currentUmlDiagram.relationships.length}
                    {' '}
                    CONNECTIONS

                  </span>


                  {isCompletedProject ? (

                    <span className="flex items-center gap-1 text-amber-400">

                      <LockKeyhole className="w-3.5 h-3.5" />

                      COMPLETED PROJECT — DIAGRAM IS READ ONLY

                    </span>

                  ) : (

                    <span>

                      Business Analysts can edit classes and relationships.

                    </span>

                  )}

                </div>

              </div>


              {/* =============================================
                  RELATIONSHIP MANAGER
                  ============================================= */}

              <div className="lg:col-span-1 self-start bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col">

                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-3 border-b border-slate-100">

                  Relationship Matrix

                </h3>


                {currentUmlDiagram.relationships.length ===
                0 ? (

                  <div className="text-center py-10 text-slate-400 text-xs italic">

                    No relationships established.

                  </div>

                ) : (

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1.5 mt-4">

                    {currentUmlDiagram.relationships.map(
                      (relationship) => {

                        const source =
                          currentUmlDiagram
                            .classes
                            .find(
                              (umlClass) =>
                                umlClass.id ===
                                relationship.sourceClassId
                            )
                            ?.name ??
                          'Unknown';


                        const target =
                          currentUmlDiagram
                            .classes
                            .find(
                              (umlClass) =>
                                umlClass.id ===
                                relationship.targetClassId
                            )
                            ?.name ??
                          'Unknown';


                        return (

                          <div
                            key={
                              relationship.id
                            }
                            className="border border-slate-200 p-3 rounded-xl text-[11px] hover:border-slate-400 transition-colors flex items-center justify-between gap-3 bg-slate-50/50"
                          >

                            <div className="flex flex-col gap-1 min-w-0">

                              <div className="flex items-center gap-1 font-semibold text-slate-800">

                                <span className="truncate">

                                  {source}

                                </span>


                                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />


                                <span className="truncate">

                                  {target}

                                </span>

                              </div>


                              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded w-fit">

                                {relationship.type}

                              </span>

                            </div>


                            {canEdit && (

                              <button
                                type="button"
                                onClick={
                                  () =>
                                    handleDeleteRelationship(
                                      relationship.id
                                    )
                                }
                                className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg shrink-0"
                              >

                                <Trash2 className="w-3.5 h-3.5" />

                              </button>

                            )}

                          </div>

                        );
                      }
                    )}

                  </div>

                )}


                {canEdit && (

                  <button
                    type="button"
                    onClick={
                      () =>
                        setShowAddRelModal(
                          true
                        )
                    }
                    className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold mt-4"
                  >

                    <Plus className="w-4 h-4" />

                    Add Relationship

                  </button>

                )}

              </div>

            </div>

          ) : (

            /* =================================================
               VERSION COMPARISON
               ================================================= */

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">

                <div>

                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">

                    Version Difference Analyzer

                  </h2>


                  <p className="text-xs text-slate-400 mt-1">

                    Compare the current class diagram with a previous UML version stored in the database.

                  </p>

                </div>


                <div className="flex items-center gap-2">

                  <span className="text-xs font-bold text-slate-500">

                    Compare With:

                  </span>


                  <select
                    value={
                      compareWithVersion
                    }
                    onChange={
                      (event) =>
                        setCompareWithVersion(
                          event.target.value
                        )
                    }
                    className="text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 px-3.5 py-2 focus:outline-none focus:border-blue-500"
                  >

                    {umlDiagramVersions.length ===
                    0 ? (

                      <option value="">

                        No previous versions

                      </option>

                    ) : (

                      umlDiagramVersions.map(
                        (version) => (

                          <option
                            key={
                              version.baselineVersion
                            }
                            value={
                              version.baselineVersion
                            }
                          >

                            {version.version}
                            {' - '}
                            {version.description}

                          </option>

                        )
                      )

                    )}

                  </select>

                </div>

              </div>


              {!selectedVersionData ? (

                <div className="text-center py-20 text-slate-400 italic text-xs">

                  No previous UML versions exist yet.

                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <DiffCard
                    title="Added Classes"
                    count={
                      diffs.added.length
                    }
                    values={
                      diffs.added
                    }
                    type="added"
                  />


                  <DiffCard
                    title="Modified Classes"
                    count={
                      diffs.modified.length
                    }
                    values={
                      diffs.modified
                    }
                    type="modified"
                  />


                  <DiffCard
                    title="Removed Classes"
                    count={
                      diffs.removed.length
                    }
                    values={
                      diffs.removed
                    }
                    type="removed"
                  />

                </div>

              )}

            </div>

          )}

        </>

      )}


      {/* =====================================================
          RENDERED SVG MODAL
          ===================================================== */}

      {showRenderedDiagram &&
        backendUml && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">

              <div>

                <h3 className="font-extrabold text-slate-800 text-sm">

                  Generated UML Class Diagram

                </h3>


                <p className="text-[10px] text-slate-400 mt-1">

                  {selectedProject?.name}
                  {' - '}
                  Diagram #{backendUml.diagramId}
                  {' - '}
                  Version {backendUml.versionNumber}

                </p>

              </div>


              <button
                type="button"
                onClick={
                  () =>
                    setShowRenderedDiagram(
                      false
                    )
                }
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"
              >

                <X className="w-5 h-5" />

              </button>

            </div>


            <div className="p-6 bg-slate-100 overflow-auto max-h-[75vh]">

              <div className="bg-white rounded-2xl border border-slate-200 p-4 min-h-[300px] flex items-center justify-center">

                <Image
                  src={
                    `data:image/svg+xml;base64,${backendUml.svgBase64}`
                  }
                  alt="Generated UML Class Diagram"
                  width={
                    1200
                  }
                  height={
                    800
                  }
                  unoptimized
                  className="max-w-full h-auto"
                />

              </div>

            </div>


            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">

              <button
                type="button"
                onClick={
                  () =>
                    setShowRenderedDiagram(
                      false
                    )
                }
                className="border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200"
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          EXPORT MODAL
          ===================================================== */}

      {showExportModal && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">

              <h3 className="font-extrabold text-slate-800 text-sm">

                Export UML Class Diagram

              </h3>


              <button
                type="button"
                onClick={
                  () =>
                    setShowExportModal(
                      false
                    )
                }
              >

                <X className="w-5 h-5 text-slate-400" />

              </button>

            </div>


            <div className="p-6 space-y-4">

              <div className="flex border border-slate-100 bg-slate-50 p-1 rounded-xl w-fit">

                <button
                  type="button"
                  onClick={
                    () =>
                      setExportFormat(
                        'mermaid'
                      )
                  }
                  className={
                    `px-4 py-2 rounded-lg text-xs font-bold ${
                      exportFormat ===
                      'mermaid'

                        ? 'bg-blue-600 text-white'

                        : 'text-slate-500'
                    }`
                  }
                >

                  Mermaid

                </button>


                <button
                  type="button"
                  onClick={
                    () =>
                      setExportFormat(
                        'plantuml'
                      )
                  }
                  className={
                    `px-4 py-2 rounded-lg text-xs font-bold ${
                      exportFormat ===
                      'plantuml'

                        ? 'bg-blue-600 text-white'

                        : 'text-slate-500'
                    }`
                  }
                >

                  PlantUML

                </button>

              </div>


              <div className="relative">

                <pre className="bg-slate-950 text-slate-200 font-mono text-xs p-5 rounded-2xl overflow-x-auto max-h-[300px]">

                  {exportFormat ===
                  'mermaid'
                    ? getMermaidCode()
                    : getPlantUmlCode()}

                </pre>


                <button
                  type="button"
                  onClick={
                    () =>
                      void copyToClipboard()
                  }
                  className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1"
                >

                  {copied ? (

                    <>

                      <Check className="w-3.5 h-3.5 text-emerald-400" />

                      Copied!

                    </>

                  ) : (

                    <>

                      <FileText className="w-3.5 h-3.5" />

                      Copy Code

                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          COMMIT BASELINE MODAL
          ===================================================== */}

      {showCommitModal &&
        !isCompletedProject && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">

              <h3 className="font-extrabold text-slate-800 text-sm">

                Commit UML to Baseline Snapshot

              </h3>


              <button
                type="button"
                onClick={
                  () =>
                    setShowCommitModal(
                      false
                    )
                }
              >

                <X className="w-5 h-5 text-slate-400" />

              </button>

            </div>


            <form
              onSubmit={
                handleCommitBaseline
              }
            >

              <div className="p-6 space-y-4">

                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">

                    Target Requirement Baseline

                  </label>


                  <select
                    value={
                      activeBaseline
                    }
                    onChange={
                      (event) =>
                        setSelectedBaseline(
                          event.target.value
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  >

                    {baselines.map(
                      (baseline) => (

                        <option
                          key={
                            baseline.version
                          }
                          value={
                            baseline.version
                          }
                        >

                          {baseline.version}
                          {' - '}
                          {baseline.description.substring(
                            0,
                            40
                          )}

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">

                    Commit Description

                  </label>


                  <textarea
                    rows={3}
                    value={
                      commitDesc
                    }
                    onChange={
                      (event) =>
                        setCommitDesc(
                          event.target.value
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    required
                  />

                </div>

              </div>


              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">

                <button
                  type="button"
                  onClick={
                    () =>
                      setShowCommitModal(
                        false
                      )
                  }
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >

                  Commit Snapshot

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          EDIT CLASS MODAL
          ===================================================== */}

      {showEditClassModal &&
        editingClass &&
        canEdit && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">

              <h3 className="font-extrabold text-slate-800 text-sm">

                Edit UML Class: {editingClass.name}

              </h3>


              <button
                type="button"
                onClick={
                  () => {

                    setShowEditClassModal(
                      false
                    );

                    setEditingClass(
                      null
                    );
                  }
                }
              >

                <X className="w-5 h-5 text-slate-400" />

              </button>

            </div>


            <form
              onSubmit={
                handleSaveClassEdit
              }
            >

              <div className="p-6 space-y-4">

                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">

                    Class Name

                  </label>


                  <input
                    type="text"
                    value={
                      classNameInput
                    }
                    onChange={
                      (event) =>
                        setClassNameInput(
                          event.target.value
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    required
                  />

                </div>


                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">

                    Attributes — One per line

                  </label>


                  <textarea
                    rows={4}
                    value={
                      classAttrInput
                    }
                    onChange={
                      (event) =>
                        setClassAttrInput(
                          event.target.value
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono"
                  />

                </div>


                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">

                    Methods — One per line

                  </label>


                  <textarea
                    rows={4}
                    value={
                      classMethodInput
                    }
                    onChange={
                      (event) =>
                        setClassMethodInput(
                          event.target.value
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono"
                  />

                </div>

              </div>


              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">

                <button
                  type="button"
                  onClick={
                    () => {

                      setShowEditClassModal(
                        false
                      );

                      setEditingClass(
                        null
                      );
                    }
                  }
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >

                  Save Changes

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          ADD CLASS MODAL
          ===================================================== */}

      {showAddClassModal &&
        canEdit && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">

              <h3 className="font-extrabold text-slate-800 text-sm">

                Add Custom UML Class

              </h3>


              <button
                type="button"
                onClick={
                  () =>
                    setShowAddClassModal(
                      false
                    )
                }
              >

                <X className="w-5 h-5 text-slate-400" />

              </button>

            </div>


            <form
              onSubmit={
                handleCreateClass
              }
            >

              <div className="p-6">

                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">

                  Class Name

                </label>


                <input
                  type="text"
                  value={
                    newClassName
                  }
                  onChange={
                    (event) =>
                      setNewClassName(
                        event.target.value
                      )
                  }
                  placeholder="e.g. AuditLog"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  required
                />

              </div>


              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">

                <button
                  type="button"
                  onClick={
                    () =>
                      setShowAddClassModal(
                        false
                      )
                  }
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >

                  Create Class

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          ADD RELATIONSHIP MODAL
          ===================================================== */}

      {showAddRelModal &&
        canEdit && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">

              <h3 className="font-extrabold text-slate-800 text-sm">

                Connect UML Classes

              </h3>


              <button
                type="button"
                onClick={
                  () =>
                    setShowAddRelModal(
                      false
                    )
                }
              >

                <X className="w-5 h-5 text-slate-400" />

              </button>

            </div>


            <form
              onSubmit={
                handleCreateRelationship
              }
            >

              <div className="p-6 space-y-4">

                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">

                    Source Class

                  </label>


                  <select
                    value={
                      relSource
                    }
                    onChange={
                      (event) =>
                        setRelSource(
                          event.target.value
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    required
                  >

                    <option value="">

                      Select Source Class

                    </option>


                    {currentUmlDiagram.classes.map(
                      (umlClass) => (

                        <option
                          key={
                            umlClass.id
                          }
                          value={
                            umlClass.id
                          }
                        >

                          {umlClass.name}

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">

                    Target Class

                  </label>


                  <select
                    value={
                      relTarget
                    }
                    onChange={
                      (event) =>
                        setRelTarget(
                          event.target.value
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                    required
                  >

                    <option value="">

                      Select Target Class

                    </option>


                    {currentUmlDiagram.classes.map(
                      (umlClass) => (

                        <option
                          key={
                            umlClass.id
                          }
                          value={
                            umlClass.id
                          }
                        >

                          {umlClass.name}

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div>

                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">

                    Relationship Type

                  </label>


                  <select
                    value={
                      relType
                    }
                    onChange={
                      (event) =>
                        setRelType(
                          event.target.value as
                            UmlRelationship['type']
                        )
                    }
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  >

                    <option value="Association">

                      Association

                    </option>


                    <option value="Inheritance">

                      Inheritance

                    </option>


                    <option value="Composition">

                      Composition

                    </option>


                    <option value="Aggregation">

                      Aggregation

                    </option>


                    <option value="Dependency">

                      Dependency

                    </option>

                  </select>

                </div>

              </div>


              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">

                <button
                  type="button"
                  onClick={
                    () =>
                      setShowAddRelModal(
                        false
                      )
                  }
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >

                  Establish Link

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   PROJECT STATUS
   ========================================================= */

function ProjectStatusBadge({
  status
}: {
  status: string;
}) {

  let style =
    'border-slate-200 bg-slate-50 text-slate-600';


  if (
    status ===
    'ACTIVE'
  ) {

    style =
      'border-blue-200 bg-blue-50 text-blue-700';
  }


  if (
    status ===
    'PLANNING'
  ) {

    style =
      'border-amber-200 bg-amber-50 text-amber-700';
  }


  if (
    status ===
    'ON_HOLD'
  ) {

    style =
      'border-orange-200 bg-orange-50 text-orange-700';
  }


  if (
    status ===
    'COMPLETED'
  ) {

    style =
      'border-emerald-200 bg-emerald-50 text-emerald-700';
  }


  if (
    status ===
    'CANCELLED'
  ) {

    style =
      'border-rose-200 bg-rose-50 text-rose-700';
  }


  return (

    <span
      className={
        `rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${style}`
      }
    >

      {status.replaceAll(
        '_',
        ' '
      )}

    </span>
  );
}


/* =========================================================
   DIFF CARD
   ========================================================= */

function DiffCard({
  title,
  count,
  values,
  type
}: {
  title: string;

  count: number;

  values: string[];

  type:
    'added' |
    'modified' |
    'removed';
}) {

  let titleClass =
    'text-emerald-600';


  let dotClass =
    'bg-emerald-500';


  let borderClass =
    'border-emerald-100';


  if (
    type ===
    'modified'
  ) {

    titleClass =
      'text-amber-600';

    dotClass =
      'bg-amber-500';

    borderClass =
      'border-amber-100';
  }


  if (
    type ===
    'removed'
  ) {

    titleClass =
      'text-rose-600';

    dotClass =
      'bg-rose-500';

    borderClass =
      'border-rose-100';
  }


  return (

    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/20">

      <div className="pb-3 border-b border-slate-100">

        <span
          className={
            `text-xs font-bold uppercase tracking-wider ${titleClass}`
          }
        >

          {title} ({count})

        </span>

      </div>


      <div className="mt-4 space-y-2">

        {values.length ===
        0 ? (

          <p className="text-xs text-slate-400 italic">

            None

          </p>

        ) : (

          values.map(
            (value) => (

              <div
                key={
                  value
                }
                className={
                  `flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white border px-3 py-2 rounded-xl ${borderClass} ${
                    type ===
                    'removed'
                      ? 'line-through'
                      : ''
                  }`
                }
              >

                <span
                  className={
                    `w-2 h-2 rounded-full shrink-0 ${dotClass}`
                  }
                />

                {value}

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}