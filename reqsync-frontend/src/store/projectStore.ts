import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* =========================================================
   REQUIREMENT TYPES
   ========================================================= */

export interface Requirement {
  id: string;
  title: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'In Progress';
  priority: 'High' | 'Medium' | 'Low';
  type: 'Functional' | 'Non-Functional' | 'Technical';
  owner: string;
  description: string;
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
  version: string;

  completeness: number;

  completenessBreakdown: {
    clarity: number;
    verifiability: number;
    quality: number;
    conciseness: number;
    consistency: number;
  };

  aiSuggestions: string[];

  /*
   * Temporary frontend fields.
   *
   * These will be removed when the Requirements module is
   * connected to the real backend DTOs because ReqSync does
   * not support Requirement Impact Analysis.
   */
  affectedReqs: number;
  affectedTasks: number;
  affectedStories: number;
  affectedTestCases: number;
  impactExplanation: string;
}


/* =========================================================
   USER STORY
   ========================================================= */

export interface UserStory {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  relatedReq: string;
  assignee: string;
}


/* =========================================================
   TASK
   ========================================================= */

export interface Task {
  id: string;
  title: string;

  status:
    | 'To Do'
    | 'In Progress'
    | 'Ready for QA'
    | 'Done';

  priority:
    | 'High'
    | 'Medium'
    | 'Low';

  relatedStory: string;
  assignee: string;
  dueDate: string;

  implementationDetails?: {
    githubLink: string;
    notes: string;
    submittedAt: string;
  };

  qaReview?: {
    reviewer: string;
    comments: string;
    reviewedAt: string;

    status:
      | 'Approved'
      | 'Changes Requested';
  };
}


/* =========================================================
   UML
   ========================================================= */

export interface UmlClass {
  id: string;
  name: string;
  attributes: string[];
  methods: string[];
}


export interface UmlRelationship {
  id: string;
  sourceClassId: string;
  targetClassId: string;

  type:
    | 'Association'
    | 'Inheritance'
    | 'Aggregation'
    | 'Composition'
    | 'Dependency';
}


export interface UmlDiagramVersion {
  version: string;
  description: string;
  classes: UmlClass[];
  relationships: UmlRelationship[];
  createdAt: string;
  baselineVersion?: string;
}


/* =========================================================
   BASELINE
   ========================================================= */

export interface Baseline {
  version: string;
  description: string;
  createdBy: string;
  createdAt: string;
  reqCount: number;

  status:
    | 'Active'
    | 'Superseded';
}


/* =========================================================
   APPROVAL
   ========================================================= */

export interface Approval {
  id: string;
  title: string;

  type:
    | 'Requirement'
    | 'Baseline'
    | 'Change Request';

  requestedBy: string;
  requestedOn: string;

  status:
    | 'Pending'
    | 'Approved'
    | 'Rejected';
}


/* =========================================================
   KNOWLEDGE VAULT
   ========================================================= */

export interface KnowledgeItem {
  id: string;
  title: string;
  project: string;

  category:
    | 'Requirements'
    | 'Decisions'
    | 'Lessons Learned'
    | 'QA Findings'
    | 'Templates';

  date: string;
}


/* =========================================================
   AUTHENTICATED USER
   ========================================================= */

export interface AppUser {
  id: string;
  name: string;
  email: string;

  role:
    | 'CEO'
    | 'System Admin'
    | 'Project Manager'
    | 'Business Analyst'
    | 'Developer'
    | 'QA Engineer';

  skills?: string;
}


/* =========================================================
   PROJECT SETTINGS
   ========================================================= */

export interface ProjectSettings {
  projectId: number;
  projectName: string;
  projectCode: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;

  teamMembers: {
    name: string;
    role: string;
    email: string;
    skills?: string;
  }[];

  companyName?: string;
  companyRegNumber?: string;
  companyAddress?: string;
}


/* =========================================================
   ZUSTAND STATE
   ========================================================= */

interface ProjectState {
  requirements: Requirement[];
  userStories: UserStory[];
  tasks: Task[];
  baselines: Baseline[];
  approvals: Approval[];
  knowledgeVault: KnowledgeItem[];

  settings: ProjectSettings;

  /*
   * users is temporarily kept because existing Employee
   * Management screens may depend on it.
   *
   * It starts empty and will later be populated using the
   * backend UserManagement API.
   */
  users: AppUser[];

  currentUser: AppUser | null;

  isSidebarOpen: boolean;


  /* =========================
     UML STATE
     ========================= */

  umlDiagramVersions: UmlDiagramVersion[];

  currentUmlDiagram: {
    classes: UmlClass[];
    relationships: UmlRelationship[];
  };


  /* =========================
     REQUIREMENT ACTIONS
     ========================= */

  addRequirement: (
    req: Omit<
      Requirement,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'version'
      | 'completeness'
      | 'completenessBreakdown'
      | 'aiSuggestions'
      | 'affectedReqs'
      | 'affectedTasks'
      | 'affectedStories'
      | 'affectedTestCases'
      | 'impactExplanation'
    >
  ) => void;

  updateRequirement: (
    id: string,
    updates: Partial<Requirement>
  ) => void;

  deleteRequirement: (
    id: string
  ) => void;


  /* =========================
     USER STORIES
     ========================= */

  addUserStory: (
    story: Omit<UserStory, 'id'>
  ) => void;

  updateUserStory: (
    id: string,
    updates: Partial<UserStory>
  ) => void;


  /* =========================
     TASKS
     ========================= */

  addTask: (
    task: Omit<Task, 'id'>
  ) => void;

  updateTask: (
    id: string,
    updates: Partial<Task>
  ) => void;


  /* =========================
     BASELINES / APPROVALS
     ========================= */

  addBaseline: (
    baseline: Omit<
      Baseline,
      'createdAt' | 'reqCount' | 'status'
    >
  ) => void;

  approveApproval: (
    id: string
  ) => void;

  rejectApproval: (
    id: string
  ) => void;


  /* =========================
     KNOWLEDGE
     ========================= */

  addKnowledge: (
    item: Omit<
      KnowledgeItem,
      'id' | 'date'
    >
  ) => void;


  /* =========================
     SETTINGS
     ========================= */

  updateSettings: (
    settings: Partial<ProjectSettings>
  ) => void;


  /* =========================
     AUTHENTICATION
     ========================= */

  setAuthenticatedUser: (
    user: AppUser | null
  ) => void;

  logout: () => void;


  /* =========================
     TEMPORARY USER ACTIONS

     These are temporarily kept so existing frontend
     employee/profile screens continue compiling.

     They will later be replaced by user-api.ts calls.
     ========================= */

  registerBusiness: (
    ceoName: string,
    email: string,
    password: string,
    companyName: string,
    regNumber: string,
    address: string
  ) => void;

  createUserAccount: (
    name: string,
    email: string,
    password: string,
    role: AppUser['role'],
    skills?: string
  ) => boolean;

  updateUserRole: (
    userId: string,
    role: AppUser['role']
  ) => void;

  updateProfile: (
    userId: string,
    name: string,
    skills: string,
    newPassword?: string
  ) => void;

  deleteUserAccount: (
    userId: string
  ) => void;


  toggleSidebar: () => void;


  /* =========================
     DEVELOPER / QA
     ========================= */

  submitTaskImplementation: (
    taskId: string,
    githubLink: string,
    notes: string
  ) => void;

  submitTaskQaReview: (
    taskId: string,
    comments: string,
    passed: boolean,
    reviewer: string
  ) => void;


  /* =========================
     UML ACTIONS
     ========================= */

  generateUmlFromRequirements: () => void;

  addUmlClass: (
    name: string
  ) => void;

  updateUmlClass: (
    id: string,
    updates: Partial<UmlClass>
  ) => void;

  deleteUmlClass: (
    id: string
  ) => void;

  addUmlRelationship: (
    sourceId: string,
    targetId: string,
    type: UmlRelationship['type']
  ) => void;

  deleteUmlRelationship: (
    id: string
  ) => void;

  commitUmlToBaseline: (
    baselineVersion: string,
    description: string
  ) => void;
}


/* =========================================================
   STORE
   ========================================================= */

export const useProjectStore =
  create<ProjectState>()(
    persist(
      (set) => ({

        /* =================================================
           USERS

           No seeded frontend accounts anymore.
           Users must eventually come from Spring Boot.
           ================================================= */

        users: [],


        /* =================================================
           AUTHENTICATED USER
           ================================================= */

        currentUser: null,


        /* =================================================
           UI
           ================================================= */

        isSidebarOpen: true,


        /* =================================================
           UML MOCK DATA

           Kept temporarily until UML API integration.
           ================================================= */

        umlDiagramVersions: [
          {
            version: 'v1.0',

            description:
              'Initial UML Class Diagram mapping Core Authentication and Accounts',

            createdAt: '2026-06-10',

            baselineVersion: 'v1.1',

            classes: [
              {
                id: 'c1',

                name: 'User',

                attributes: [
                  'id: string',
                  'email: string',
                  'role: string',
                  'isLocked: boolean'
                ],

                methods: [
                  'login(): boolean',
                  'logout(): boolean',
                  'verifyCredentials(): boolean'
                ]
              },

              {
                id: 'c2',

                name: 'Account',

                attributes: [
                  'accountNumber: string',
                  'balance: number',
                  'type: string'
                ],

                methods: [
                  'deposit(amount: number): boolean',
                  'withdraw(amount: number): boolean',
                  'checkBalance(): number'
                ]
              }
            ],

            relationships: [
              {
                id: 'r1',
                sourceClassId: 'c1',
                targetClassId: 'c2',
                type: 'Association'
              }
            ]
          }
        ],


        currentUmlDiagram: {
          classes: [
            {
              id: 'c1',

              name: 'User',

              attributes: [
                'id: string',
                'email: string',
                'role: string',
                'isLocked: boolean'
              ],

              methods: [
                'login(): boolean',
                'logout(): boolean',
                'verifyCredentials(): boolean'
              ]
            },

            {
              id: 'c2',

              name: 'Account',

              attributes: [
                'accountNumber: string',
                'balance: number',
                'type: string'
              ],

              methods: [
                'deposit(amount: number): boolean',
                'withdraw(amount: number): boolean',
                'checkBalance(): number'
              ]
            },

            {
              id: 'c3',

              name: 'Transaction',

              attributes: [
                'id: string',
                'amount: number',
                'status: string',
                'timestamp: string'
              ],

              methods: [
                'execute(): boolean',
                'validate(): boolean'
              ]
            }
          ],

          relationships: [
            {
              id: 'r1',
              sourceClassId: 'c1',
              targetClassId: 'c2',
              type: 'Association'
            },

            {
              id: 'r2',
              sourceClassId: 'c2',
              targetClassId: 'c3',
              type: 'Composition'
            }
          ]
        },


        /* =================================================
           REQUIREMENTS MOCK DATA

           Kept temporarily so existing pages do not break.
           Will be replaced by Requirement API.
           ================================================= */

        requirements: [
          {
            id: 'REQ-128',
            title: 'User Authentication',
            status: 'Approved',
            priority: 'High',
            type: 'Functional',
            owner: 'Sarah Johnson',

            description:
              'The system shall allow users to authenticate using email and password. The system shall validate credentials and allow secure access to the account dashboard.',

            acceptanceCriteria: [
              'User shall enter valid email and password',
              'System shall validate credentials and enforce SSL',
              'System shall log in successfully within 2 seconds',
              'System shall handle invalid attempts and lock account after 5 failed tries'
            ],

            createdAt: '2026-06-10',
            updatedAt: '2026-06-15',
            version: '1.2',

            completeness: 92,

            completenessBreakdown: {
              clarity: 95,
              verifiability: 90,
              quality: 88,
              conciseness: 92,
              consistency: 95
            },

            aiSuggestions: [
              'Consider adding more details about password complexity rules.',
              'Specify lockout policy details after multiple failed attempts.'
            ],

            affectedReqs: 8,
            affectedTasks: 15,
            affectedStories: 6,
            affectedTestCases: 9,

            impactExplanation:
              'Temporary mock field. This will be removed during backend Requirement API integration.'
          },

          {
            id: 'REQ-127',
            title: 'Fund Transfer',
            status: 'In Review',
            priority: 'High',
            type: 'Functional',
            owner: 'John Doe',

            description:
              'The system shall allow users to transfer funds between accounts, supporting both internal and external transfers.',

            acceptanceCriteria: [
              'User selects source account and target account',
              'User enters amount within transaction limits',
              'System checks sufficient balance',
              'System records the transaction'
            ],

            createdAt: '2026-06-11',
            updatedAt: '2026-06-12',
            version: '1.0',

            completeness: 85,

            completenessBreakdown: {
              clarity: 88,
              verifiability: 82,
              quality: 85,
              conciseness: 90,
              consistency: 85
            },

            aiSuggestions: [
              'Include specific transaction fee details.',
              'Provide external integration requirements.'
            ],

            affectedReqs: 4,
            affectedTasks: 8,
            affectedStories: 3,
            affectedTestCases: 5,

            impactExplanation:
              'Temporary mock field.'
          },

          {
            id: 'REQ-126',
            title: 'Account Dashboard',
            status: 'In Progress',
            priority: 'Medium',
            type: 'Functional',
            owner: 'John Doe',

            description:
              'The dashboard shall display summary charts of user accounts, total balance, recent transactions, and quick action links.',

            acceptanceCriteria: [
              'Dashboard displays current account balances accurately',
              'Dashboard loads under 1.5 seconds',
              'Dashboard displays last 5 transaction records'
            ],

            createdAt: '2026-06-08',
            updatedAt: '2026-06-10',
            version: '1.1',

            completeness: 78,

            completenessBreakdown: {
              clarity: 80,
              verifiability: 80,
              quality: 75,
              conciseness: 85,
              consistency: 70
            },

            aiSuggestions: [
              'Add data caching specifications.'
            ],

            affectedReqs: 2,
            affectedTasks: 4,
            affectedStories: 2,
            affectedTestCases: 3,

            impactExplanation:
              'Temporary mock field.'
          },

          {
            id: 'REQ-125',
            title: 'Transaction History',
            status: 'In Progress',
            priority: 'Medium',
            type: 'Functional',
            owner: 'Michael Brown',

            description:
              'Users shall be able to filter, view, and search their transaction history.',

            acceptanceCriteria: [
              'User can filter by transaction type, date range, and amount',
              'Pagination supports multiple page sizes',
              'Search processes transaction descriptions'
            ],

            createdAt: '2026-06-07',
            updatedAt: '2026-06-09',
            version: '1.0',

            completeness: 80,

            completenessBreakdown: {
              clarity: 85,
              verifiability: 85,
              quality: 80,
              conciseness: 80,
              consistency: 70
            },

            aiSuggestions: [
              'Confirm database archiving strategy.'
            ],

            affectedReqs: 3,
            affectedTasks: 5,
            affectedStories: 2,
            affectedTestCases: 4,

            impactExplanation:
              'Temporary mock field.'
          },

          {
            id: 'REQ-124',
            title: 'Bill Payments',
            status: 'Draft',
            priority: 'Medium',
            type: 'Functional',
            owner: 'Emily Davis',

            description:
              'The system shall allow users to pay utility, insurance, and credit card bills online.',

            acceptanceCriteria: [
              'User can add billers',
              'User can schedule recurring payments',
              'Biller database updates regularly'
            ],

            createdAt: '2026-06-12',
            updatedAt: '2026-06-12',
            version: '0.9',

            completeness: 65,

            completenessBreakdown: {
              clarity: 70,
              verifiability: 60,
              quality: 65,
              conciseness: 75,
              consistency: 55
            },

            aiSuggestions: [
              'Define authorization requirements.',
              'Confirm payment failure workflow.'
            ],

            affectedReqs: 5,
            affectedTasks: 9,
            affectedStories: 4,
            affectedTestCases: 6,

            impactExplanation:
              'Temporary mock field.'
          },

          {
            id: 'REQ-123',
            title: 'Manage Beneficiaries',
            status: 'In Review',
            priority: 'High',
            type: 'Functional',
            owner: 'John Doe',

            description:
              'The system shall allow users to add, edit and remove beneficiaries.',

            acceptanceCriteria: [
              'New beneficiaries require validation',
              'Display active beneficiaries'
            ],

            createdAt: '2026-06-05',
            updatedAt: '2026-06-11',
            version: '1.0',

            completeness: 88,

            completenessBreakdown: {
              clarity: 90,
              verifiability: 85,
              quality: 90,
              conciseness: 90,
              consistency: 85
            },

            aiSuggestions: [
              'Verify authentication requirements.'
            ],

            affectedReqs: 3,
            affectedTasks: 6,
            affectedStories: 2,
            affectedTestCases: 4,

            impactExplanation:
              'Temporary mock field.'
          },

          {
            id: 'REQ-122',
            title: 'Account Statements',
            status: 'In Review',
            priority: 'Medium',
            type: 'Functional',
            owner: 'Sarah Johnson',

            description:
              'Users shall be able to download monthly PDF statements.',

            acceptanceCriteria: [
              'Statements are generated as PDF',
              'Downloads require authentication',
              'Statements contain transaction information'
            ],

            createdAt: '2026-06-04',
            updatedAt: '2026-06-10',
            version: '1.0',

            completeness: 90,

            completenessBreakdown: {
              clarity: 95,
              verifiability: 90,
              quality: 90,
              conciseness: 90,
              consistency: 85
            },

            aiSuggestions: [
              'Specify PDF branding guidelines.'
            ],

            affectedReqs: 1,
            affectedTasks: 3,
            affectedStories: 1,
            affectedTestCases: 2,

            impactExplanation:
              'Temporary mock field.'
          }
        ],


        /* =================================================
           USER STORIES
           ================================================= */

        userStories: [
          {
            id: 'US-045',
            title:
              'As a customer, I want to login using my email and password so I can access my dashboard.',
            status: 'In Progress',
            priority: 'High',
            relatedReq: 'REQ-128',
            assignee: 'John Doe'
          },

          {
            id: 'US-046',
            title:
              'As a user, I want to reset my password when I forget it.',
            status: 'To Do',
            priority: 'High',
            relatedReq: 'REQ-128',
            assignee: 'Emily Davis'
          },

          {
            id: 'US-047',
            title:
              'As a customer, I want to view my account dashboard.',
            status: 'In Progress',
            priority: 'Medium',
            relatedReq: 'REQ-126',
            assignee: 'John Doe'
          },

          {
            id: 'US-048',
            title:
              'As a customer, I want to transfer money to another account.',
            status: 'To Do',
            priority: 'High',
            relatedReq: 'REQ-127',
            assignee: 'Emily Davis'
          },

          {
            id: 'US-049',
            title:
              'As a user, I want to pay utility bills online securely.',
            status: 'In Progress',
            priority: 'Medium',
            relatedReq: 'REQ-124',
            assignee: 'Sarah Johnson'
          }
        ],


        /* =================================================
           TASKS
           ================================================= */

        tasks: [
          {
            id: 'T-231',
            title: 'Implement Login UI Components',
            status: 'In Progress',
            priority: 'High',
            relatedStory: 'US-045',
            assignee: 'John Doe',
            dueDate: '2026-06-20'
          },

          {
            id: 'T-232',
            title: 'Implement Authentication API Endpoints',
            status: 'To Do',
            priority: 'High',
            relatedStory: 'US-045',
            assignee: 'Michael Brown',
            dueDate: '2026-06-22'
          },

          {
            id: 'T-233',
            title: 'Create Password Reset Flow',
            status: 'In Progress',
            priority: 'High',
            relatedStory: 'US-046',
            assignee: 'Emily Davis',
            dueDate: '2026-06-21'
          },

          {
            id: 'T-234',
            title: 'Dashboard UI Layout & Integration',
            status: 'Done',
            priority: 'Medium',
            relatedStory: 'US-047',
            assignee: 'Sarah Johnson',
            dueDate: '2026-06-15'
          },

          {
            id: 'T-235',
            title: 'Fetch Account Summary API Hook',
            status: 'Done',
            priority: 'Medium',
            relatedStory: 'US-047',
            assignee: 'John Doe',
            dueDate: '2026-06-18'
          }
        ],


        /* =================================================
           BASELINES
           ================================================= */

        baselines: [
          {
            version: 'v1.3',
            description:
              'Third Baseline for release 2 - Core features finalized',
            createdBy: 'Michael Brown',
            createdAt: '2026-06-14',
            reqCount: 88,
            status: 'Active'
          },

          {
            version: 'v1.2',
            description:
              'Updated with security requirements and OTP registration details',
            createdBy: 'Sarah Johnson',
            createdAt: '2026-06-10',
            reqCount: 82,
            status: 'Superseded'
          },

          {
            version: 'v1.1',
            description:
              'Added fund transfer requirements and edge case rules',
            createdBy: 'John Doe',
            createdAt: '2026-05-28',
            reqCount: 75,
            status: 'Superseded'
          },

          {
            version: 'v1.0',
            description:
              'Initial Baseline detailing simple customer signup',
            createdBy: 'Sarah Johnson',
            createdAt: '2026-05-10',
            reqCount: 52,
            status: 'Superseded'
          }
        ],


        /* =================================================
           APPROVALS
           ================================================= */

        approvals: [
          {
            id: 'APR-105',
            title:
              'REQ-128 User Authentication update (2FA option)',
            type: 'Requirement',
            requestedBy: 'Sarah Johnson',
            requestedOn: '2026-06-12',
            status: 'Pending'
          },

          {
            id: 'APR-104',
            title: 'Baseline v1.3 Snapshot approval',
            type: 'Baseline',
            requestedBy: 'Michael Brown',
            requestedOn: '2026-06-14',
            status: 'Pending'
          },

          {
            id: 'APR-103',
            title:
              'Change Request #32',
            type: 'Change Request',
            requestedBy: 'John Doe',
            requestedOn: '2026-06-14',
            status: 'Pending'
          },

          {
            id: 'APR-102',
            title:
              'REQ-130 Session Timeout setting',
            type: 'Requirement',
            requestedBy: 'Emily Davis',
            requestedOn: '2026-06-15',
            status: 'Pending'
          },

          {
            id: 'APR-101',
            title:
              'REQ-110 Device Management',
            type: 'Requirement',
            requestedBy: 'Emily Davis',
            requestedOn: '2026-06-15',
            status: 'Pending'
          }
        ],


        /* =================================================
           KNOWLEDGE VAULT
           ================================================= */

        knowledgeVault: [
          {
            id: 'K-01',
            title:
              'Payment Gateway Requirements & API Specifications',
            project: 'Online Banking System',
            category: 'Requirements',
            date: '2026-06-12'
          },

          {
            id: 'K-02',
            title:
              'Two-Factor Authentication Architecture Decisions',
            project: 'Banking App 2025',
            category: 'Decisions',
            date: '2026-06-10'
          },

          {
            id: 'K-03',
            title:
              'Performance Testing Lessons and Index Optimization',
            project: 'General',
            category: 'Lessons Learned',
            date: '2026-06-08'
          },

          {
            id: 'K-04',
            title:
              'Common Login Security Issues and Remediation Policies',
            project: 'Online Banking System',
            category: 'QA Findings',
            date: '2026-06-05'
          },

          {
            id: 'K-05',
            title:
              'Software Requirement Specification Standard Template',
            project: 'Internal',
            category: 'Templates',
            date: '2026-06-01'
          }
        ],


        /* =================================================
           PROJECT SETTINGS
           ================================================= */

        settings: {
          projectId: 1,
          projectName: 'Online Banking System',
          projectCode: 'OBS-2026',

          description:
            'Temporary frontend project data. This will be replaced by the Spring Boot Project API.',

          startDate: '2026-05-01',
          endDate: '2026-12-31',
          status: 'In Progress',

          teamMembers: [],

          companyName:
            'Apex Financial Technologies LLC',

          companyRegNumber:
            'TX-98218-A',

          companyAddress:
            '100 Congress Ave., Austin, TX 78701'
        },


        /* =================================================
           REQUIREMENT ACTIONS
           ================================================= */

        addRequirement: (req) =>
          set((state) => {

            const ids =
              state.requirements.map(
                (requirement) =>
                  parseInt(
                    requirement.id.split('-')[1]
                  ) || 100
              );

            const maxId =
              ids.length > 0
                ? Math.max(...ids)
                : 100;

            const nextId =
              `REQ-${maxId + 1}`;


            const newReq: Requirement = {
              ...req,

              id: nextId,

              createdAt:
                new Date()
                  .toISOString()
                  .split('T')[0],

              updatedAt:
                new Date()
                  .toISOString()
                  .split('T')[0],

              version: '1.0',

              completeness: 75,

              completenessBreakdown: {
                clarity: 80,
                verifiability: 70,
                quality: 75,
                conciseness: 80,
                consistency: 70
              },

              aiSuggestions: [
                'Review requirement quality.',
                'Review acceptance criteria.'
              ],

              affectedReqs: 0,
              affectedTasks: 0,
              affectedStories: 0,
              affectedTestCases: 0,

              impactExplanation:
                ''
            };


            return {
              requirements: [
                newReq,
                ...state.requirements
              ]
            };
          }),


        updateRequirement: (
          id,
          updates
        ) =>
          set((state) => ({
            requirements:
              state.requirements.map(
                (req) =>
                  req.id === id
                    ? {
                        ...req,
                        ...updates,

                        updatedAt:
                          new Date()
                            .toISOString()
                            .split('T')[0]
                      }
                    : req
              )
          })),


        deleteRequirement: (id) =>
          set((state) => ({
            requirements:
              state.requirements.filter(
                (req) =>
                  req.id !== id
              )
          })),


        /* =================================================
           USER STORY ACTIONS
           ================================================= */

        addUserStory: (story) =>
          set((state) => {

            const ids =
              state.userStories.map(
                (item) =>
                  parseInt(
                    item.id.split('-')[1]
                  ) || 40
              );

            const maxId =
              ids.length > 0
                ? Math.max(...ids)
                : 40;

            const nextId =
              `US-${String(
                maxId + 1
              ).padStart(
                3,
                '0'
              )}`;


            const newStory: UserStory = {
              ...story,
              id: nextId
            };


            return {
              userStories: [
                ...state.userStories,
                newStory
              ]
            };
          }),


        updateUserStory: (
          id,
          updates
        ) =>
          set((state) => ({
            userStories:
              state.userStories.map(
                (story) =>
                  story.id === id
                    ? {
                        ...story,
                        ...updates
                      }
                    : story
              )
          })),


        /* =================================================
           TASK ACTIONS
           ================================================= */

        addTask: (task) =>
          set((state) => {

            const ids =
              state.tasks.map(
                (item) =>
                  parseInt(
                    item.id.split('-')[1]
                  ) || 230
              );

            const maxId =
              ids.length > 0
                ? Math.max(...ids)
                : 230;

            const nextId =
              `T-${maxId + 1}`;


            const newTask: Task = {
              ...task,
              id: nextId
            };


            return {
              tasks: [
                ...state.tasks,
                newTask
              ]
            };
          }),


        updateTask: (
          id,
          updates
        ) =>
          set((state) => ({
            tasks:
              state.tasks.map(
                (task) =>
                  task.id === id
                    ? {
                        ...task,
                        ...updates
                      }
                    : task
              )
          })),


        /* =================================================
           BASELINES
           ================================================= */

        addBaseline: (baseline) =>
          set((state) => {

            const activeReqsCount =
              state.requirements.filter(
                (requirement) =>
                  requirement.status ===
                  'Approved'
              ).length;


            const updatedBaselines =
              state.baselines.map(
                (item) => ({
                  ...item,
                  status:
                    'Superseded' as const
                })
              );


            const newBaseline: Baseline = {
              ...baseline,

              createdAt:
                new Date()
                  .toISOString()
                  .split('T')[0],

              reqCount:
                activeReqsCount,

              status: 'Active'
            };


            return {
              baselines: [
                newBaseline,
                ...updatedBaselines
              ]
            };
          }),


        /* =================================================
           APPROVAL ACTIONS
           ================================================= */

        approveApproval: (id) =>
          set((state) => {

            const updatedApprovals =
              state.approvals.map(
                (approval) =>
                  approval.id === id
                    ? {
                        ...approval,
                        status:
                          'Approved' as const
                      }
                    : approval
              );


            const approvedItem =
              state.approvals.find(
                (approval) =>
                  approval.id === id
              );


            let updatedReqs = [
              ...state.requirements
            ];

            let updatedBaselines = [
              ...state.baselines
            ];


            if (approvedItem) {

              const reqMatch =
                approvedItem.title.match(
                  /REQ-\d+/
                );


              if (reqMatch) {

                const reqId =
                  reqMatch[0];


                updatedReqs =
                  state.requirements.map(
                    (req) =>
                      req.id === reqId
                        ? {
                            ...req,
                            status:
                              'Approved' as const
                          }
                        : req
                  );
              }


              if (
                approvedItem.type ===
                'Baseline'
              ) {

                const baseMatch =
                  approvedItem.title.match(
                    /v\d+\.\d+/
                  );


                const baseVer =
                  baseMatch
                    ? baseMatch[0]
                    : 'v1.4';


                const alreadyExists =
                  state.baselines.some(
                    (baseline) =>
                      baseline.version ===
                      baseVer
                  );


                if (!alreadyExists) {

                  const activeReqsCount =
                    state.requirements.filter(
                      (req) =>
                        req.status ===
                        'Approved'
                    ).length;


                  updatedBaselines = [
                    {
                      version:
                        baseVer,

                      description:
                        approvedItem.title,

                      createdBy:
                        approvedItem.requestedBy,

                      createdAt:
                        new Date()
                          .toISOString()
                          .split('T')[0],

                      reqCount:
                        activeReqsCount,

                      status:
                        'Active' as const
                    },

                    ...state.baselines.map(
                      (baseline) => ({
                        ...baseline,

                        status:
                          'Superseded' as const
                      })
                    )
                  ];

                } else {

                  updatedBaselines =
                    state.baselines.map(
                      (baseline) =>
                        baseline.version ===
                        baseVer
                          ? {
                              ...baseline,

                              status:
                                'Active' as const
                            }
                          : {
                              ...baseline,

                              status:
                                'Superseded' as const
                            }
                    );
                }
              }
            }


            return {
              approvals:
                updatedApprovals,

              requirements:
                updatedReqs,

              baselines:
                updatedBaselines
            };
          }),


        rejectApproval: (id) =>
          set((state) => ({
            approvals:
              state.approvals.map(
                (approval) =>
                  approval.id === id
                    ? {
                        ...approval,

                        status:
                          'Rejected' as const
                      }
                    : approval
              )
          })),


        /* =================================================
           KNOWLEDGE ACTIONS
           ================================================= */

        addKnowledge: (item) =>
          set((state) => {

            const nextId =
              `K-${String(
                state.knowledgeVault.length +
                  1
              ).padStart(
                2,
                '0'
              )}`;


            const newDoc: KnowledgeItem = {
              ...item,

              id: nextId,

              date:
                new Date()
                  .toISOString()
                  .split('T')[0]
            };


            return {
              knowledgeVault: [
                newDoc,
                ...state.knowledgeVault
              ]
            };
          }),


        /* =================================================
           SETTINGS
           ================================================= */

        updateSettings: (updates) =>
          set((state) => ({
            settings: {
              ...state.settings,
              ...updates
            }
          })),


        /* =================================================
           REAL AUTHENTICATION STATE

           Login itself is NOT performed here anymore.

           Login happens through:
           POST /api/auth/login

           login/page.tsx then calls:
           setAuthenticatedUser(...)
           ================================================= */

        setAuthenticatedUser: (user) =>
          set({
            currentUser: user
          }),


        logout: () => {

          if (
            typeof window !==
            'undefined'
          ) {

            localStorage.removeItem(
              'reqsync_token'
            );
          }


          set({
            currentUser: null
          });
        },


        /* =================================================
           TEMPORARY BUSINESS REGISTRATION

           Kept only for existing page compatibility.
           Password is deliberately NOT stored.
           This will later be moved to backend API.
           ================================================= */

        registerBusiness: (
          ceoName,
          email,
          _password,
          companyName,
          regNumber,
          address
        ) =>
          set((state) => {

            const numericIds =
              state.users
                .map(
                  (user) =>
                    parseInt(
                      user.id
                        .replace(
                          'USR-',
                          ''
                        )
                    )
                )
                .filter(
                  (value) =>
                    !Number.isNaN(value)
                );


            const nextNumber =
              numericIds.length
                ? Math.max(
                    ...numericIds
                  ) + 1
                : 1;


            const newCeo: AppUser = {
              id:
                `USR-${String(
                  nextNumber
                ).padStart(
                  3,
                  '0'
                )}`,

              name: ceoName,

              email,

              role: 'CEO',

              skills:
                'Executive Management, Business Strategy'
            };


            return {
              users: [
                ...state.users,
                newCeo
              ],

              currentUser:
                newCeo,

              settings: {
                ...state.settings,

                companyName,

                companyRegNumber:
                  regNumber,

                companyAddress:
                  address,

                teamMembers: [
                  ...state.settings
                    .teamMembers,

                  {
                    name:
                      ceoName,

                    role:
                      'CEO',

                    email,

                    skills:
                      'Executive Management, Business Strategy'
                  }
                ]
              }
            };
          }),


        /* =================================================
           TEMPORARY EMPLOYEE CREATION

           Password is not stored.
           Will later call backend user-api.ts.
           ================================================= */

        createUserAccount: (
          name,
          email,
          _password,
          role,
          skills
        ) => {

          let created =
            false;


          set((state) => {

            const exists =
              state.users.some(
                (user) =>
                  user.email.toLowerCase() ===
                  email.toLowerCase()
              );


            if (exists) {
              return {};
            }


            const numericIds =
              state.users
                .map(
                  (user) =>
                    parseInt(
                      user.id.replace(
                        'USR-',
                        ''
                      )
                    )
                )
                .filter(
                  (value) =>
                    !Number.isNaN(
                      value
                    )
                );


            const nextNumber =
              numericIds.length
                ? Math.max(
                    ...numericIds
                  ) + 1
                : 1;


            const newUser: AppUser = {
              id:
                `USR-${String(
                  nextNumber
                ).padStart(
                  3,
                  '0'
                )}`,

              name,

              email,

              role,

              skills:
                skills ||
                'No skills listed'
            };


            created = true;


            const newTeamMember = {
              name,
              role,
              email,

              skills:
                skills ||
                'No skills listed'
            };


            return {
              users: [
                ...state.users,
                newUser
              ],

              settings: {
                ...state.settings,

                teamMembers: [
                  ...state.settings
                    .teamMembers,

                  newTeamMember
                ]
              }
            };
          });


          return created;
        },


        /* =================================================
           USER ROLE
           ================================================= */

        updateUserRole: (
          userId,
          role
        ) =>
          set((state) => {

            const updatedUsers =
              state.users.map(
                (user) =>
                  user.id === userId
                    ? {
                        ...user,
                        role
                      }
                    : user
              );


            const userObj =
              state.users.find(
                (user) =>
                  user.id === userId
              );


            let updatedTeamMembers = [
              ...state.settings
                .teamMembers
            ];


            if (userObj) {

              updatedTeamMembers =
                state.settings.teamMembers.map(
                  (member) =>
                    member.email.toLowerCase() ===
                    userObj.email.toLowerCase()
                      ? {
                          ...member,
                          role
                        }
                      : member
                );
            }


            const updatedCurrentUser =
              state.currentUser?.id ===
              userId

                ? updatedUsers.find(
                    (user) =>
                      user.id ===
                      userId
                  ) ?? null

                : state.currentUser;


            return {
              users:
                updatedUsers,

              currentUser:
                updatedCurrentUser,

              settings: {
                ...state.settings,

                teamMembers:
                  updatedTeamMembers
              }
            };
          }),


        /* =================================================
           PROFILE UPDATE

           Password parameter remains temporarily because an
           existing page may still call this function.

           Password is NOT stored in Zustand.
           ================================================= */

        updateProfile: (
          userId,
          name,
          skills,
          _newPassword
        ) =>
          set((state) => {

            const userObj =
              state.users.find(
                (user) =>
                  user.id ===
                  userId
              );


            if (!userObj) {
              return {};
            }


            const updatedUsers =
              state.users.map(
                (user) =>
                  user.id ===
                  userId

                    ? {
                        ...user,

                        name,

                        skills:
                          skills ||
                          'No skills listed'
                      }

                    : user
              );


            const updatedTeamMembers =
              state.settings.teamMembers.map(
                (member) =>
                  member.email.toLowerCase() ===
                  userObj.email.toLowerCase()

                    ? {
                        ...member,

                        name,

                        skills:
                          skills ||
                          'No skills listed'
                      }

                    : member
              );


            const updatedCurrentUser =
              state.currentUser?.id ===
              userId

                ? updatedUsers.find(
                    (user) =>
                      user.id ===
                      userId
                  ) ?? null

                : state.currentUser;


            return {
              users:
                updatedUsers,

              currentUser:
                updatedCurrentUser,

              settings: {
                ...state.settings,

                teamMembers:
                  updatedTeamMembers
              }
            };
          }),


        /* =================================================
           DELETE USER
           ================================================= */

        deleteUserAccount: (
          userId
        ) =>
          set((state) => {

            const userToDelete =
              state.users.find(
                (user) =>
                  user.id ===
                  userId
              );


            if (!userToDelete) {
              return {};
            }


            const updatedUsers =
              state.users.filter(
                (user) =>
                  user.id !==
                  userId
              );


            const updatedTeamMembers =
              state.settings.teamMembers.filter(
                (member) =>
                  member.email.toLowerCase() !==
                  userToDelete.email.toLowerCase()
              );


            const isCurrentUserDeleted =
              state.currentUser?.id ===
              userId;


            return {
              users:
                updatedUsers,

              settings: {
                ...state.settings,

                teamMembers:
                  updatedTeamMembers
              },

              currentUser:
                isCurrentUserDeleted
                  ? null
                  : state.currentUser
            };
          }),


        /* =================================================
           SIDEBAR
           ================================================= */

        toggleSidebar: () =>
          set((state) => ({
            isSidebarOpen:
              !state.isSidebarOpen
          })),


        /* =================================================
           DEVELOPER SUBMISSION
           ================================================= */

        submitTaskImplementation: (
          taskId,
          githubLink,
          notes
        ) =>
          set((state) => ({
            tasks:
              state.tasks.map(
                (task) =>
                  task.id === taskId

                    ? {
                        ...task,

                        status:
                          'Ready for QA' as const,

                        implementationDetails: {
                          githubLink,
                          notes,

                          submittedAt:
                            new Date()
                              .toISOString()
                              .split('T')[0]
                        }
                      }

                    : task
              )
          })),


        /* =================================================
           QA REVIEW
           ================================================= */

        submitTaskQaReview: (
          taskId,
          comments,
          passed,
          reviewer
        ) =>
          set((state) => ({
            tasks:
              state.tasks.map(
                (task) =>
                  task.id ===
                  taskId

                    ? {
                        ...task,

                        status:
                          (
                            passed
                              ? 'Done'
                              : 'In Progress'
                          ) as Task['status'],

                        qaReview: {
                          reviewer,
                          comments,

                          reviewedAt:
                            new Date()
                              .toISOString()
                              .split('T')[0],

                          status:
                            passed
                              ? 'Approved'
                              : 'Changes Requested'
                        }
                      }

                    : task
              )
          })),


        /* =================================================
           UML GENERATION

           Temporary mock implementation.
           This will eventually call UmlController.
           ================================================= */

        generateUmlFromRequirements: () =>
          set((state) => {

            const hasMFA =
              state.requirements.some(
                (requirement) =>
                  requirement.title
                    .toLowerCase()
                    .includes('mfa') ||

                  requirement.description
                    .toLowerCase()
                    .includes('mfa') ||

                  requirement.title
                    .toLowerCase()
                    .includes(
                      'multi-factor'
                    )
              );


            const hasTimeout =
              state.requirements.some(
                (requirement) =>
                  requirement.title
                    .toLowerCase()
                    .includes(
                      'timeout'
                    ) ||

                  requirement.description
                    .toLowerCase()
                    .includes(
                      'timeout'
                    ) ||

                  requirement.title
                    .toLowerCase()
                    .includes(
                      'inactive'
                    )
              );


            const newClasses: UmlClass[] = [
              {
                id: 'c1',

                name: 'User',

                attributes: [
                  'id: string',
                  'email: string',
                  'role: string',
                  'isLocked: boolean'
                ],

                methods: [
                  'login(): boolean',
                  'logout(): boolean',
                  'verifyCredentials(): boolean'
                ]
              },

              {
                id: 'c2',

                name: 'Account',

                attributes: [
                  'accountNumber: string',
                  'balance: number',
                  'type: string'
                ],

                methods: [
                  'deposit(amount: number): boolean',
                  'withdraw(amount: number): boolean',
                  'checkBalance(): number'
                ]
              },

              {
                id: 'c3',

                name:
                  'Transaction',

                attributes: [
                  'id: string',
                  'amount: number',
                  'status: string',
                  'timestamp: string'
                ],

                methods: [
                  'execute(): boolean',
                  'validate(): boolean'
                ]
              }
            ];


            const newRelationships:
              UmlRelationship[] = [
                {
                  id: 'r1',
                  sourceClassId:
                    'c1',
                  targetClassId:
                    'c2',
                  type:
                    'Association'
                },

                {
                  id: 'r2',
                  sourceClassId:
                    'c2',
                  targetClassId:
                    'c3',
                  type:
                    'Composition'
                }
              ];


            if (hasMFA) {

              newClasses.push({
                id: 'c4',

                name:
                  'MfaVerification',

                attributes: [
                  'userId: string',
                  'otpCode: string',
                  'expiresAt: string',
                  'attempts: number'
                ],

                methods: [
                  'sendOTP(): boolean',
                  'verifyOTP(code: string): boolean',
                  'isExpired(): boolean'
                ]
              });


              newRelationships.push({
                id: 'r3',

                sourceClassId:
                  'c1',

                targetClassId:
                  'c4',

                type:
                  'Dependency'
              });
            }


            if (hasTimeout) {

              newClasses.push({
                id: 'c5',

                name:
                  'SessionTracker',

                attributes: [
                  'sessionId: string',
                  'lastActivityTime: string',
                  'timeoutLimitMinutes: number'
                ],

                methods: [
                  'trackEvent(): void',
                  'checkInactivity(): boolean',
                  'terminateSession(): void'
                ]
              });


              newRelationships.push({
                id: 'r4',

                sourceClassId:
                  'c1',

                targetClassId:
                  'c5',

                type:
                  'Association'
              });
            }


            return {
              currentUmlDiagram: {
                classes:
                  newClasses,

                relationships:
                  newRelationships
              }
            };
          }),


        /* =================================================
           ADD UML CLASS
           ================================================= */

        addUmlClass: (name) =>
          set((state) => {

            const maxId =
              state.currentUmlDiagram
                .classes.length > 0

                ? Math.max(
                    ...state.currentUmlDiagram.classes.map(
                      (umlClass) =>
                        parseInt(
                          umlClass.id.replace(
                            'c',
                            ''
                          )
                        ) || 0
                    )
                  )

                : 0;


            const nextId =
              `c${maxId + 1}`;


            const newClass:
              UmlClass = {
                id:
                  nextId,

                name,

                attributes: [],

                methods: []
              };


            return {
              currentUmlDiagram: {
                ...state.currentUmlDiagram,

                classes: [
                  ...state.currentUmlDiagram
                    .classes,

                  newClass
                ]
              }
            };
          }),


        /* =================================================
           UPDATE UML CLASS
           ================================================= */

        updateUmlClass: (
          id,
          updates
        ) =>
          set((state) => ({
            currentUmlDiagram: {
              ...state.currentUmlDiagram,

              classes:
                state.currentUmlDiagram.classes.map(
                  (umlClass) =>
                    umlClass.id ===
                    id
                      ? {
                          ...umlClass,
                          ...updates
                        }
                      : umlClass
                )
            }
          })),


        /* =================================================
           DELETE UML CLASS
           ================================================= */

        deleteUmlClass: (id) =>
          set((state) => ({
            currentUmlDiagram: {

              classes:
                state.currentUmlDiagram.classes.filter(
                  (umlClass) =>
                    umlClass.id !==
                    id
                ),

              relationships:
                state.currentUmlDiagram.relationships.filter(
                  (relationship) =>
                    relationship.sourceClassId !==
                      id &&
                    relationship.targetClassId !==
                      id
                )
            }
          })),


        /* =================================================
           ADD UML RELATIONSHIP
           ================================================= */

        addUmlRelationship: (
          sourceClassId,
          targetClassId,
          type
        ) =>
          set((state) => {

            const maxId =
              state.currentUmlDiagram
                .relationships.length > 0

                ? Math.max(
                    ...state.currentUmlDiagram.relationships.map(
                      (relationship) =>
                        parseInt(
                          relationship.id.replace(
                            'r',
                            ''
                          )
                        ) || 0
                    )
                  )

                : 0;


            const nextId =
              `r${maxId + 1}`;


            const newRelationship:
              UmlRelationship = {

                id:
                  nextId,

                sourceClassId,

                targetClassId,

                type
              };


            return {
              currentUmlDiagram: {
                ...state.currentUmlDiagram,

                relationships: [
                  ...state.currentUmlDiagram
                    .relationships,

                  newRelationship
                ]
              }
            };
          }),


        /* =================================================
           DELETE UML RELATIONSHIP
           ================================================= */

        deleteUmlRelationship: (
          id
        ) =>
          set((state) => ({
            currentUmlDiagram: {
              ...state.currentUmlDiagram,

              relationships:
                state.currentUmlDiagram.relationships.filter(
                  (relationship) =>
                    relationship.id !==
                    id
                )
            }
          })),


        /* =================================================
           COMMIT UML VERSION
           ================================================= */

        commitUmlToBaseline: (
          baselineVersion,
          description
        ) =>
          set((state) => {

            const newVersion:
              UmlDiagramVersion = {

                version:
                  `UML-${baselineVersion}`,

                description,

                classes:
                  JSON.parse(
                    JSON.stringify(
                      state.currentUmlDiagram
                        .classes
                    )
                  ),

                relationships:
                  JSON.parse(
                    JSON.stringify(
                      state.currentUmlDiagram
                        .relationships
                    )
                  ),

                createdAt:
                  new Date()
                    .toISOString()
                    .split('T')[0],

                baselineVersion
              };


            return {
              umlDiagramVersions: [
                newVersion,
                ...state.umlDiagramVersions
              ]
            };
          })
      }),

      {
        name:
          'reqsync-project-store',

        skipHydration:
          false
      }
    )
  );