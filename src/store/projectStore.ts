import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  completeness: number; // 0 to 100
  completenessBreakdown: {
    clarity: number;
    verifiability: number;
    quality: number;
    conciseness: number;
    consistency: number;
  };
  aiSuggestions: string[];
  affectedReqs: number;
  affectedTasks: number;
  affectedStories: number;
  affectedTestCases: number;
  impactExplanation: string;
}

export interface UserStory {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  relatedReq: string;
  assignee: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Ready for QA' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
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
    status: 'Approved' | 'Changes Requested';
  };
}

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
  type: 'Association' | 'Inheritance' | 'Aggregation' | 'Composition' | 'Dependency';
}

export interface UmlDiagramVersion {
  version: string;
  description: string;
  classes: UmlClass[];
  relationships: UmlRelationship[];
  createdAt: string;
  baselineVersion?: string;
}

export interface Baseline {
  version: string;
  description: string;
  createdBy: string;
  createdAt: string;
  reqCount: number;
  status: 'Active' | 'Superseded';
}

export interface Approval {
  id: string;
  title: string;
  type: 'Requirement' | 'Baseline' | 'Change Request';
  requestedBy: string;
  requestedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface KnowledgeItem {
  id: string;
  title: string;
  project: string;
  category: 'Requirements' | 'Decisions' | 'Lessons Learned' | 'QA Findings' | 'Templates';
  date: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'CEO' | 'Project Manager' | 'Business Analyst' | 'Developer' | 'QA Engineer' | 'Stakeholder';
  skills?: string;
}

export interface ProjectSettings {
  projectName: string;
  projectCode: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  teamMembers: { name: string; role: string; email: string; skills?: string }[];
  companyName?: string;
  companyRegNumber?: string;
  companyAddress?: string;
}

interface ProjectState {
  requirements: Requirement[];
  userStories: UserStory[];
  tasks: Task[];
  baselines: Baseline[];
  approvals: Approval[];
  knowledgeVault: KnowledgeItem[];
  settings: ProjectSettings;
  users: AppUser[];
  currentUser: AppUser | null;
  isSidebarOpen: boolean;

  // UML Workspace State
  umlDiagramVersions: UmlDiagramVersion[];
  currentUmlDiagram: {
    classes: UmlClass[];
    relationships: UmlRelationship[];
  };
  
  // Actions
  addRequirement: (req: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'completeness' | 'completenessBreakdown' | 'aiSuggestions' | 'affectedReqs' | 'affectedTasks' | 'affectedStories' | 'affectedTestCases' | 'impactExplanation'>) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  addUserStory: (story: Omit<UserStory, 'id'>) => void;
  updateUserStory: (id: string, updates: Partial<UserStory>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addBaseline: (baseline: Omit<Baseline, 'createdAt' | 'reqCount' | 'status'>) => void;
  approveApproval: (id: string) => void;
  rejectApproval: (id: string) => void;
  addKnowledge: (item: Omit<KnowledgeItem, 'id' | 'date'>) => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  registerBusiness: (ceoName: string, email: string, password: string, companyName: string, regNumber: string, address: string) => void;
  createUserAccount: (name: string, email: string, password: string, role: AppUser['role'], skills?: string) => boolean;
  updateUserRole: (userId: string, role: AppUser['role']) => void;
  deleteUserAccount: (userId: string) => void;
  toggleSidebar: () => void;

  // New Actions
  submitTaskImplementation: (taskId: string, githubLink: string, notes: string) => void;
  submitTaskQaReview: (taskId: string, comments: string, passed: boolean, reviewer: string) => void;
  generateUmlFromRequirements: () => void;
  addUmlClass: (name: string) => void;
  updateUmlClass: (id: string, updates: Partial<UmlClass>) => void;
  deleteUmlClass: (id: string) => void;
  addUmlRelationship: (sourceId: string, targetId: string, type: UmlRelationship['type']) => void;
  deleteUmlRelationship: (id: string) => void;
  commitUmlToBaseline: (baselineVersion: string, description: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      users: [
        {
          id: 'USR-000',
          name: 'Chief Executive Officer',
          email: 'ceo@company.com',
          password: 'password123',
          role: 'CEO',
          skills: 'Executive Management, Business Strategy, Corporate Governance'
        },
        {
          id: 'USR-001',
          name: 'Michael Brown',
          email: 'michael.b@company.com',
          password: 'password123',
          role: 'Project Manager',
          skills: 'Roadmapping, Agile, Backlog Grooming, QA Coordination'
        },
        {
          id: 'USR-002',
          name: 'Sarah Johnson',
          email: 'sarah.j@company.com',
          password: 'password123',
          role: 'Business Analyst',
          skills: 'Requirements Elicitation, SRS Design, Business Analysis'
        },
        {
          id: 'USR-003',
          name: 'John Doe',
          email: 'john.d@company.com',
          password: 'password123',
          role: 'Developer',
          skills: 'Next.js, React, Zustand, REST APIs, Cryptography'
        },
        {
          id: 'USR-004',
          name: 'Emily Davis',
          email: 'emily.d@company.com',
          password: 'password123',
          role: 'QA Engineer',
          skills: 'Unit Testing, E2E Testing, Automation, Security Auditing'
        },
        {
          id: 'USR-005',
          name: 'Alice Smith',
          email: 'client@external.com',
          password: 'password123',
          role: 'Stakeholder',
          skills: 'Business Requirements, Project Alignment, Executive Sponsor'
        }
      ],
      currentUser: null,
      isSidebarOpen: true,
      umlDiagramVersions: [
        {
          version: 'v1.0',
          description: 'Initial UML Class Diagram mapping Core Authentication and Accounts',
          createdAt: '2026-06-10',
          baselineVersion: 'v1.1',
          classes: [
            {
              id: 'c1',
              name: 'User',
              attributes: ['id: string', 'email: string', 'role: string', 'isLocked: boolean'],
              methods: ['login(): boolean', 'logout(): boolean', 'verifyCredentials(): boolean']
            },
            {
              id: 'c2',
              name: 'Account',
              attributes: ['accountNumber: string', 'balance: number', 'type: string'],
              methods: ['deposit(amount: number): boolean', 'withdraw(amount: number): boolean', 'checkBalance(): number']
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
            attributes: ['id: string', 'email: string', 'role: string', 'isLocked: boolean'],
            methods: ['login(): boolean', 'logout(): boolean', 'verifyCredentials(): boolean']
          },
          {
            id: 'c2',
            name: 'Account',
            attributes: ['accountNumber: string', 'balance: number', 'type: string'],
            methods: ['deposit(amount: number): boolean', 'withdraw(amount: number): boolean', 'checkBalance(): number']
          },
          {
            id: 'c3',
            name: 'Transaction',
            attributes: ['id: string', 'amount: number', 'status: string', 'timestamp: string'],
            methods: ['execute(): boolean', 'validate(): boolean']
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
      requirements: [
        {
          id: 'REQ-128',
          title: 'User Authentication',
          status: 'Approved',
          priority: 'High',
          type: 'Functional',
          owner: 'Sarah Johnson',
          description: 'The system shall allow users to authenticate using email and password. The system shall validate credentials and allow secure access to the account dashboard.',
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
            'Consider adding more details about password complexity rules (e.g. min 8 chars, symbols).',
            'Specify lockout policy details after multiple failed attempts (e.g. lock duration is 15 mins).'
          ],
          affectedReqs: 8,
          affectedTasks: 15,
          affectedStories: 6,
          affectedTestCases: 9,
          impactExplanation: 'This requirement is related to the core authentication flow. Changes may affect login, API security, session management, auditing, and reporting modules.'
        },
        {
          id: 'REQ-127',
          title: 'Fund Transfer',
          status: 'In Review',
          priority: 'High',
          type: 'Functional',
          owner: 'John Doe',
          description: 'The system shall allow users to transfer funds between accounts, supporting both internal transfers (checking to savings) and external transfers (ACH/Wire).',
          acceptanceCriteria: [
            'User selects source account and target destination account',
            'User enters amount within transaction limits',
            'System checks for sufficient balance before executing',
            'System records transaction and triggers notification'
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
            'Include specific transaction fee details for ACH vs Wire transfers.',
            'Provide external banking API integration requirements.'
          ],
          affectedReqs: 4,
          affectedTasks: 8,
          affectedStories: 3,
          affectedTestCases: 5,
          impactExplanation: 'This requirement affects the transaction ledger, account balance updates, payment gateways, and notification services.'
        },
        {
          id: 'REQ-126',
          title: 'Account Dashboard',
          status: 'In Progress',
          priority: 'Medium',
          type: 'Functional',
          owner: 'John Doe',
          description: 'The dashboard shall display summary charts of user accounts, total balance, recent transactions, and quick action links.',
          acceptanceCriteria: [
            'Dashboard displays current account balances accurately',
            'Dashboard loads under 1.5 seconds',
            'Dashboard displays last 5 transaction records'
          ],
          createdAt: '2026-06-08',
          updatedAt: '2026-06-10',
          version: '1.1',
          completeness: 78,
          completenessBreakdown: { clarity: 80, verifiability: 80, quality: 75, conciseness: 85, consistency: 70 },
          aiSuggestions: ['Add data caching specifications to improve dashboard load speeds.'],
          affectedReqs: 2,
          affectedTasks: 4,
          affectedStories: 2,
          affectedTestCases: 3,
          impactExplanation: 'Dashboard displays account summary data, making it dependent on database read speed and account module updates.'
        },
        {
          id: 'REQ-125',
          title: 'Transaction History',
          status: 'In Progress',
          priority: 'Medium',
          type: 'Functional',
          owner: 'Michael Brown',
          description: 'Users shall be able to filter, view, and search their transaction history for up to 2 years.',
          acceptanceCriteria: [
            'User can filter by transaction type, date range, and amount',
            'Pagination allows displaying 10, 20, or 50 records per page',
            'Search index processes transaction descriptions'
          ],
          createdAt: '2026-06-07',
          updatedAt: '2026-06-09',
          version: '1.0',
          completeness: 80,
          completenessBreakdown: { clarity: 85, verifiability: 85, quality: 80, conciseness: 80, consistency: 70 },
          aiSuggestions: ['Confirm database archiving strategy for transactions older than 2 years.'],
          affectedReqs: 3,
          affectedTasks: 5,
          affectedStories: 2,
          affectedTestCases: 4,
          impactExplanation: 'Retrieving historical entries affects database performance and read indexing.'
        },
        {
          id: 'REQ-124',
          title: 'Bill Payments',
          status: 'Draft',
          priority: 'Medium',
          type: 'Functional',
          owner: 'Emily Davis',
          description: 'The system shall allow users to pay standard utility, insurance, and credit card bills online.',
          acceptanceCriteria: [
            'User can add billers with account numbers',
            'User can schedule recurring automatic bill payments',
            'Biller database updates regularly'
          ],
          createdAt: '2026-06-12',
          updatedAt: '2026-06-12',
          version: '0.9',
          completeness: 65,
          completenessBreakdown: { clarity: 70, verifiability: 60, quality: 65, conciseness: 75, consistency: 55 },
          aiSuggestions: [
            'Define legal compliance requirements for customer bank authorizations.',
            'Confirm payment failure alert workflow.'
          ],
          affectedReqs: 5,
          affectedTasks: 9,
          affectedStories: 4,
          affectedTestCases: 6,
          impactExplanation: 'Direct integration with external bill payment providers creates third-party dependency risks.'
        },
        {
          id: 'REQ-123',
          title: 'Manage Beneficiaries',
          status: 'In Review',
          priority: 'High',
          type: 'Functional',
          owner: 'John Doe',
          description: 'The system shall allow users to add, edit, delete, and authorize new beneficiaries for money transfers.',
          acceptanceCriteria: [
            'New beneficiaries require OTP validation before registration',
            'Display list of active beneficiaries with edit options'
          ],
          createdAt: '2026-06-05',
          updatedAt: '2026-06-11',
          version: '1.0',
          completeness: 88,
          completenessBreakdown: { clarity: 90, verifiability: 85, quality: 90, conciseness: 90, consistency: 85 },
          aiSuggestions: ['Verify if multi-factor authentication is required for beneficiary removal.'],
          affectedReqs: 3,
          affectedTasks: 6,
          affectedStories: 2,
          affectedTestCases: 4,
          impactExplanation: 'Securing beneficiary registration directly protects users from unauthorized outbound transfers.'
        },
        {
          id: 'REQ-122',
          title: 'Account Statements',
          status: 'In Review',
          priority: 'Medium',
          type: 'Functional',
          owner: 'Sarah Johnson',
          description: 'Users shall be able to download monthly PDF statements of their transactions.',
          acceptanceCriteria: [
            'Statements are rendered in PDF format',
            'Download option is secure and token-verified',
            'PDF lists starting balance, ending balance, interest, and transactions'
          ],
          createdAt: '2026-06-04',
          updatedAt: '2026-06-10',
          version: '1.0',
          completeness: 90,
          completenessBreakdown: { clarity: 95, verifiability: 90, quality: 90, conciseness: 90, consistency: 85 },
          aiSuggestions: ['Specify PDF branding guidelines and fonts.'],
          affectedReqs: 1,
          affectedTasks: 3,
          affectedStories: 1,
          affectedTestCases: 2,
          impactExplanation: 'Statement downloads rely on background export microservices and read-replica databases.'
        }
      ],
      userStories: [
        {
          id: 'US-045',
          title: 'As a customer, I want to login using my email and password so I can access my dashboard.',
          status: 'In Progress',
          priority: 'High',
          relatedReq: 'REQ-128',
          assignee: 'John Doe'
        },
        {
          id: 'US-046',
          title: 'As a user, I want to reset my password via security code sent to email when I forget it.',
          status: 'To Do',
          priority: 'High',
          relatedReq: 'REQ-128',
          assignee: 'Emily Davis'
        },
        {
          id: 'US-047',
          title: 'As a customer, I want to view my account dashboard and balances in real-time.',
          status: 'In Progress',
          priority: 'Medium',
          relatedReq: 'REQ-126',
          assignee: 'John Doe'
        },
        {
          id: 'US-048',
          title: 'As a customer, I want to transfer money to another account to complete dynamic payments.',
          status: 'To Do',
          priority: 'High',
          relatedReq: 'REQ-127',
          assignee: 'Emily Davis'
        },
        {
          id: 'US-049',
          title: 'As a user, I want to pay utility bills online securely using registered biller details.',
          status: 'In Progress',
          priority: 'Medium',
          relatedReq: 'REQ-124',
          assignee: 'Sarah Johnson'
        }
      ],
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
          title: 'Create Password Reset Flow UI & Backend OTP Validation',
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
      baselines: [
        {
          version: 'v1.3',
          description: 'Third Baseline for release 2 - Core features finalized',
          createdBy: 'Michael Brown',
          createdAt: '2026-06-14',
          reqCount: 88,
          status: 'Active'
        },
        {
          version: 'v1.2',
          description: 'Updated with security requirements and OTP registration details',
          createdBy: 'Sarah Johnson',
          createdAt: '2026-06-10',
          reqCount: 82,
          status: 'Superseded'
        },
        {
          version: 'v1.1',
          description: 'Added fund transfer requirements and edge case rules',
          createdBy: 'John Doe',
          createdAt: '2026-05-28',
          reqCount: 75,
          status: 'Superseded'
        },
        {
          version: 'v1.0',
          description: 'Initial Baseline detailing simple customer signup',
          createdBy: 'Sarah Johnson',
          createdAt: '2026-05-10',
          reqCount: 52,
          status: 'Superseded'
        }
      ],
      approvals: [
        {
          id: 'APR-105',
          title: 'REQ-128 User Authentication update (2FA option)',
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
          title: 'Change Request #32 (Increase Transfer Limits)',
          type: 'Change Request',
          requestedBy: 'John Doe',
          requestedOn: '2026-06-14',
          status: 'Pending'
        },
        {
          id: 'APR-102',
          title: 'REQ-130 Session Timeout limit setting',
          type: 'Requirement',
          requestedBy: 'Emily Davis',
          requestedOn: '2026-06-15',
          status: 'Pending'
        },
        {
          id: 'APR-101',
          title: 'REQ-110 Device Management profile dashboard',
          type: 'Requirement',
          requestedBy: 'Emily Davis',
          requestedOn: '2026-06-15',
          status: 'Pending'
        }
      ],
      knowledgeVault: [
        {
          id: 'K-01',
          title: 'Payment Gateway Requirements & API Specifications',
          project: 'Online Banking System',
          category: 'Requirements',
          date: '2026-06-12'
        },
        {
          id: 'K-02',
          title: 'Two-Factor Authentication Architecture Decisions',
          project: 'Banking App 2025',
          category: 'Decisions',
          date: '2026-06-10'
        },
        {
          id: 'K-03',
          title: 'Performance Testing Lessons and Index Optimization',
          project: 'General',
          category: 'Lessons Learned',
          date: '2026-06-08'
        },
        {
          id: 'K-04',
          title: 'Common Login Security Issues and Remediation Policies',
          project: 'Online Banking System',
          category: 'QA Findings',
          date: '2026-06-05'
        },
        {
          id: 'K-05',
          title: 'Software Requirement Specification (SRS) Standard Template v3.0',
          project: 'Internal',
          category: 'Templates',
          date: '2026-06-01'
        }
      ],
      settings: {
        projectName: 'Online Banking System',
        projectCode: 'OBS-2026',
        description: 'Online banking system for retail customers including accounts, dashboards, fund transfers, and bill payments.',
        startDate: '2026-05-01',
        endDate: '2026-12-31',
        status: 'In Progress',
        teamMembers: [
          { name: 'Chief Executive Officer', role: 'CEO', email: 'ceo@company.com', skills: 'Executive Management, Business Strategy, Corporate Governance' },
          { name: 'Sarah Johnson', role: 'Lead Business Analyst', email: 'sarah.j@company.com', skills: 'Requirements Elicitation, SRS Design, Business Analysis' },
          { name: 'John Doe', role: 'Senior Developer', email: 'john.d@company.com', skills: 'Next.js, React, Zustand, REST APIs, Cryptography' },
          { name: 'Michael Brown', role: 'Product Manager', email: 'michael.b@company.com', skills: 'Roadmapping, Agile, Backlog Grooming, QA Coordination' },
          { name: 'Emily Davis', role: 'QA Engineer', email: 'emily.d@company.com', skills: 'Unit Testing, E2E Testing, Automation, Security Auditing' },
          { name: 'Alice Smith', role: 'Stakeholder / Client', email: 'client@external.com', skills: 'Business Requirements, Project Alignment, Executive Sponsor' }
        ],
        companyName: 'Apex Financial Technologies LLC',
        companyRegNumber: 'TX-98218-A',
        companyAddress: '100 Congress Ave., Austin, TX 78701'
      },

      addRequirement: (req) =>
        set((state) => {
          const nextId = `REQ-${Math.max(...state.requirements.map((r) => parseInt(r.id.split('-')[1]) || 100)) + 1}`;
          const newReq: Requirement = {
            ...req,
            id: nextId,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            version: '1.0',
            completeness: 75,
            completenessBreakdown: { clarity: 80, verifiability: 70, quality: 75, conciseness: 80, consistency: 70 },
            aiSuggestions: ['Review security parameters', 'Link at least two acceptance criteria'],
            affectedReqs: 1,
            affectedTasks: 2,
            affectedStories: 1,
            affectedTestCases: 2,
            impactExplanation: 'New requirement. Integration impact analysis recommended.'
          };
          return { requirements: [newReq, ...state.requirements] };
        }),

      updateRequirement: (id, updates) =>
        set((state) => ({
          requirements: state.requirements.map((req) =>
            req.id === id ? { ...req, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : req
          )
        })),

      deleteRequirement: (id) =>
        set((state) => ({
          requirements: state.requirements.filter((req) => req.id !== id)
        })),

      addUserStory: (story) =>
        set((state) => {
          const nextId = `US-${String(Math.max(...state.userStories.map((s) => parseInt(s.id.split('-')[1]) || 40)) + 1).padStart(3, '0')}`;
          const newStory: UserStory = { ...story, id: nextId };
          return { userStories: [...state.userStories, newStory] };
        }),

      updateUserStory: (id, updates) =>
        set((state) => ({
          userStories: state.userStories.map((story) =>
            story.id === id ? { ...story, ...updates } : story
          )
        })),

      addTask: (task) =>
        set((state) => {
          const nextId = `T-${Math.max(...state.tasks.map((t) => parseInt(t.id.split('-')[1]) || 230)) + 1}`;
          const newTask: Task = { ...task, id: nextId };
          return { tasks: [...state.tasks, newTask] };
        }),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
        })),

      addBaseline: (baseline) =>
        set((state) => {
          const activeReqsCount = state.requirements.filter((r) => r.status === 'Approved').length;
          
          // Mark older baselines as superseded
          const updatedBaselines = state.baselines.map((b) => ({
            ...b,
            status: 'Superseded' as const
          }));

          const newBaseline: Baseline = {
            ...baseline,
            createdAt: new Date().toISOString().split('T')[0],
            reqCount: activeReqsCount,
            status: 'Active'
          };
          return { baselines: [newBaseline, ...updatedBaselines] };
        }),

      approveApproval: (id) =>
        set((state) => {
          const updatedApprovals = state.approvals.map((app) =>
            app.id === id ? { ...app, status: 'Approved' as const } : app
          );

          const approvedItem = state.approvals.find((app) => app.id === id);
          let updatedReqs = [...state.requirements];
          let updatedBaselines = [...state.baselines];

          if (approvedItem) {
            // If approving a requirement update, check if we match REQ ID
            const reqMatch = approvedItem.title.match(/REQ-\d+/);
            if (reqMatch) {
              const reqId = reqMatch[0];
              updatedReqs = state.requirements.map((req) =>
                req.id === reqId ? { ...req, status: 'Approved' as const } : req
              );
            }
            
            // If approving a baseline
            if (approvedItem.type === 'Baseline') {
              const baseMatch = approvedItem.title.match(/v\d+\.\d+/);
              const baseVer = baseMatch ? baseMatch[0] : 'v1.4';
              
              const alreadyExists = state.baselines.some((b) => b.version === baseVer);
              if (!alreadyExists) {
                const activeReqsCount = state.requirements.filter((r) => r.status === 'Approved').length;
                updatedBaselines = [
                  {
                    version: baseVer,
                    description: approvedItem.title,
                    createdBy: approvedItem.requestedBy,
                    createdAt: new Date().toISOString().split('T')[0],
                    reqCount: activeReqsCount,
                    status: 'Active' as const
                  },
                  ...state.baselines.map((b) => ({ ...b, status: 'Superseded' as const }))
                ];
              } else {
                updatedBaselines = state.baselines.map((b) =>
                  b.version === baseVer ? { ...b, status: 'Active' as const } : { ...b, status: 'Superseded' as const }
                );
              }
            }
          }

          return {
            approvals: updatedApprovals,
            requirements: updatedReqs,
            baselines: updatedBaselines
          };
        }),

      rejectApproval: (id) =>
        set((state) => ({
          approvals: state.approvals.map((app) =>
            app.id === id ? { ...app, status: 'Rejected' as const } : app
          )
        })),

      addKnowledge: (item) =>
        set((state) => {
          const nextId = `K-${String(state.knowledgeVault.length + 1).padStart(2, '0')}`;
          const newDoc: KnowledgeItem = {
            ...item,
            id: nextId,
            date: new Date().toISOString().split('T')[0]
          };
          return { knowledgeVault: [newDoc, ...state.knowledgeVault] };
        }),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates }
        })),

      login: (email, password) => {
        let success = false;
        set((state) => {
          // Try to find the user in the current state
          let user = state.users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
          );

          // If not found (often due to outdated persisted state in browser localstorage),
          // check if it's one of the seeded accounts and inject it.
          if (!user) {
            const seedUsers = [
              {
                id: 'USR-000',
                name: 'Chief Executive Officer',
                email: 'ceo@company.com',
                password: 'password123',
                role: 'CEO' as const,
                skills: 'Executive Management, Business Strategy, Corporate Governance'
              },
              {
                id: 'USR-001',
                name: 'Michael Brown',
                email: 'michael.b@company.com',
                password: 'password123',
                role: 'Project Manager' as const,
                skills: 'Roadmapping, Agile, Backlog Grooming, QA Coordination'
              },
              {
                id: 'USR-002',
                name: 'Sarah Johnson',
                email: 'sarah.j@company.com',
                password: 'password123',
                role: 'Business Analyst' as const,
                skills: 'Requirements Elicitation, SRS Design, Business Analysis'
              },
              {
                id: 'USR-003',
                name: 'John Doe',
                email: 'john.d@company.com',
                password: 'password123',
                role: 'Developer' as const,
                skills: 'Next.js, React, Zustand, REST APIs, Cryptography'
              },
              {
                id: 'USR-004',
                name: 'Emily Davis',
                email: 'emily.d@company.com',
                password: 'password123',
                role: 'QA Engineer' as const,
                skills: 'Unit Testing, E2E Testing, Automation, Security Auditing'
              },
              {
                id: 'USR-005',
                name: 'Alice Smith',
                email: 'client@external.com',
                password: 'password123',
                role: 'Stakeholder' as const,
                skills: 'Business Requirements, Project Alignment, Executive Sponsor'
              }
            ];

            const match = seedUsers.find(
              (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (match) {
              const updatedUsers = [...state.users];
              if (!updatedUsers.some(u => u.email.toLowerCase() === match.email.toLowerCase())) {
                updatedUsers.push(match);
              }
              success = true;
              return {
                users: updatedUsers,
                currentUser: match
              };
            }
          } else {
            success = true;
            return { currentUser: user };
          }
          return {};
        });
        return success;
      },

      logout: () => set({ currentUser: null }),

      registerBusiness: (ceoName, email, password, companyName, regNumber, address) =>
        set((state) => {
          const newCeo: AppUser = {
            id: `USR-${Math.max(...state.users.map((u) => parseInt(u.id.split('-')[1]) || 100)) + 1}`,
            name: ceoName,
            email,
            password,
            role: 'CEO',
            skills: 'Executive Management, Business Strategy'
          };

          const updatedSettings = {
            ...state.settings,
            companyName,
            companyRegNumber: regNumber,
            companyAddress: address,
            teamMembers: [
              ...state.settings.teamMembers,
              { name: ceoName, role: 'CEO', email, skills: 'Executive Management, Business Strategy' }
            ]
          };

          return {
            users: [...state.users, newCeo],
            currentUser: newCeo,
            settings: updatedSettings
          };
        }),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      createUserAccount: (name, email, password, role, skills) => {
        let created = false;
        set((state) => {
          const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            return {};
          }
          const newUser: AppUser = {
            id: `USR-${Math.max(...state.users.map((u) => parseInt(u.id.split('-')[1]) || 100)) + 1}`,
            name,
            email,
            password,
            role,
            skills: skills || 'No skills listed'
          };
          created = true;

          const newTeamMember = {
            name,
            role,
            email,
            skills: skills || 'No skills listed'
          };

          return {
            users: [...state.users, newUser],
            settings: {
              ...state.settings,
              teamMembers: [...state.settings.teamMembers, newTeamMember]
            }
          };
        });
        return created;
      },

      updateUserRole: (userId, role) =>
        set((state) => {
          const updatedUsers = state.users.map((u) => {
            if (u.id === userId) {
              const updated = { ...u, role };
              return updated;
            }
            return u;
          });

          // Sync with settings teamMembers
          const userObj = state.users.find((u) => u.id === userId);
          let updatedTeamMembers = [...state.settings.teamMembers];
          if (userObj) {
            updatedTeamMembers = state.settings.teamMembers.map((m) =>
              m.email.toLowerCase() === userObj.email.toLowerCase() ? { ...m, role } : m
            );
          }

          // If current user is updated, update the session
          const updatedCurrentUser = state.currentUser?.id === userId
            ? (updatedUsers.find((u) => u.id === userId) ?? null)
            : state.currentUser;

          return {
            users: updatedUsers,
            currentUser: updatedCurrentUser,
            settings: {
              ...state.settings,
              teamMembers: updatedTeamMembers
            }
          };
        }),

      deleteUserAccount: (userId) =>
        set((state) => {
          const userToDelete = state.users.find((u) => u.id === userId);
          if (!userToDelete) return {};

          const updatedUsers = state.users.filter((u) => u.id !== userId);

          // Also sync settings teamMembers
          const updatedTeamMembers = state.settings.teamMembers.filter(
            (m) => m.email.toLowerCase() !== userToDelete.email.toLowerCase()
          );

          // If the logged in user is deleted, log them out
          const isCurrentUserDeleted = state.currentUser?.id === userId;

          return {
            users: updatedUsers,
            settings: {
              ...state.settings,
              teamMembers: updatedTeamMembers
            },
            currentUser: isCurrentUserDeleted ? null : state.currentUser
          };
        }),

      submitTaskImplementation: (taskId, githubLink, notes) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'Ready for QA' as const,
                  implementationDetails: {
                    githubLink,
                    notes,
                    submittedAt: new Date().toISOString().split('T')[0]
                  }
                }
              : task
          )
        })),

      submitTaskQaReview: (taskId, comments, passed, reviewer) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: (passed ? 'Done' : 'In Progress') as any,
                  qaReview: {
                    reviewer,
                    comments,
                    reviewedAt: new Date().toISOString().split('T')[0],
                    status: passed ? 'Approved' as const : 'Changes Requested' as const
                  }
                }
              : task
          )
        })),

      generateUmlFromRequirements: () =>
        set((state) => {
          const hasMFA = state.requirements.some(r => r.title.toLowerCase().includes('mfa') || r.description.toLowerCase().includes('mfa') || r.title.toLowerCase().includes('multi-factor'));
          const hasTimeout = state.requirements.some(r => r.title.toLowerCase().includes('timeout') || r.description.toLowerCase().includes('timeout') || r.title.toLowerCase().includes('inactive'));

          const newClasses: UmlClass[] = [
            {
              id: 'c1',
              name: 'User',
              attributes: ['id: string', 'email: string', 'role: string', 'isLocked: boolean'],
              methods: ['login(): boolean', 'logout(): boolean', 'verifyCredentials(): boolean']
            },
            {
              id: 'c2',
              name: 'Account',
              attributes: ['accountNumber: string', 'balance: number', 'type: string'],
              methods: ['deposit(amount: number): boolean', 'withdraw(amount: number): boolean', 'checkBalance(): number']
            },
            {
              id: 'c3',
              name: 'Transaction',
              attributes: ['id: string', 'amount: number', 'status: string', 'timestamp: string'],
              methods: ['execute(): boolean', 'validate(): boolean']
            }
          ];

          const newRelationships: UmlRelationship[] = [
            { id: 'r1', sourceClassId: 'c1', targetClassId: 'c2', type: 'Association' },
            { id: 'r2', sourceClassId: 'c2', targetClassId: 'c3', type: 'Composition' }
          ];

          if (hasMFA) {
            newClasses.push({
              id: 'c4',
              name: 'MfaVerification',
              attributes: ['userId: string', 'otpCode: string', 'expiresAt: string', 'attempts: number'],
              methods: ['sendOTP(): boolean', 'verifyOTP(code: string): boolean', 'isExpired(): boolean']
            });
            newRelationships.push({
              id: 'r3',
              sourceClassId: 'c1',
              targetClassId: 'c4',
              type: 'Dependency'
            });
          }

          if (hasTimeout) {
            newClasses.push({
              id: 'c5',
              name: 'SessionTracker',
              attributes: ['sessionId: string', 'lastActivityTime: string', 'timeoutLimitMinutes: number'],
              methods: ['trackEvent(): void', 'checkInactivity(): boolean', 'terminateSession(): void']
            });
            newRelationships.push({
              id: 'r4',
              sourceClassId: 'c1',
              targetClassId: 'c5',
              type: 'Association'
            });
          }

          return {
            currentUmlDiagram: {
              classes: newClasses,
              relationships: newRelationships
            }
          };
        }),

      addUmlClass: (name) =>
        set((state) => {
          const maxId = state.currentUmlDiagram.classes.length > 0 
            ? Math.max(...state.currentUmlDiagram.classes.map(c => parseInt(c.id.replace('c', '')) || 0)) 
            : 0;
          const nextId = `c${maxId + 1}`;
          const newClass: UmlClass = {
            id: nextId,
            name,
            attributes: [],
            methods: []
          };
          return {
            currentUmlDiagram: {
              ...state.currentUmlDiagram,
              classes: [...state.currentUmlDiagram.classes, newClass]
            }
          };
        }),

      updateUmlClass: (id, updates) =>
        set((state) => ({
          currentUmlDiagram: {
            ...state.currentUmlDiagram,
            classes: state.currentUmlDiagram.classes.map(c => c.id === id ? { ...c, ...updates } : c)
          }
        })),

      deleteUmlClass: (id) =>
        set((state) => ({
          currentUmlDiagram: {
            classes: state.currentUmlDiagram.classes.filter(c => c.id !== id),
            relationships: state.currentUmlDiagram.relationships.filter(r => r.sourceClassId !== id && r.targetClassId !== id)
          }
        })),

      addUmlRelationship: (sourceClassId, targetClassId, type) =>
        set((state) => {
          const maxId = state.currentUmlDiagram.relationships.length > 0 
            ? Math.max(...state.currentUmlDiagram.relationships.map(r => parseInt(r.id.replace('r', '')) || 0)) 
            : 0;
          const nextId = `r${maxId + 1}`;
          const newRel: UmlRelationship = {
            id: nextId,
            sourceClassId,
            targetClassId,
            type
          };
          return {
            currentUmlDiagram: {
              ...state.currentUmlDiagram,
              relationships: [...state.currentUmlDiagram.relationships, newRel]
            }
          };
        }),

      deleteUmlRelationship: (id) =>
        set((state) => ({
          currentUmlDiagram: {
            ...state.currentUmlDiagram,
            relationships: state.currentUmlDiagram.relationships.filter(r => r.id !== id)
          }
        })),

      commitUmlToBaseline: (baselineVersion, description) =>
        set((state) => {
          const newVer: UmlDiagramVersion = {
            version: `UML-${baselineVersion}`,
            description,
            classes: JSON.parse(JSON.stringify(state.currentUmlDiagram.classes)),
            relationships: JSON.parse(JSON.stringify(state.currentUmlDiagram.relationships)),
            createdAt: new Date().toISOString().split('T')[0],
            baselineVersion
          };
          return {
            umlDiagramVersions: [newVer, ...state.umlDiagramVersions]
          };
        })
    }),
    {
      name: 'reqsync-project-store',
      skipHydration: false
    }
  )
);
