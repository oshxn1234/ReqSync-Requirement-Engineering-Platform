'use client';

import Link from 'next/link';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  LayoutDashboard,
  FileText,
  Users,
  Sparkles,
  UserCog,
  LogOut,
  Network,
  FolderKanban,
  BookOpen,
  Code2,
  UserRoundCheck,
  ClipboardList,
  TestTube2,
  ShieldCheck,
  GitBranch,
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import {
  useEffect,
  useState,
} from 'react';

import {
  useProjectStore,
  type AppUser,
} from '@/store/projectStore';


/* =========================================================
   ROLE TYPE
   ========================================================= */

type FrontendRole =
  AppUser['role'];


/* =========================================================
   ROLE-BASED ROUTE ACCESS
   ========================================================= */

const rolePaths: Record<
  string,
  FrontendRole[]
> = {

  /* =======================================================
     PROJECTS

     Developer and QA do not see Projects.
     ======================================================= */

  '/projects': [
    'CEO',
    'Project Manager',
    'Business Analyst',
  ],


  /* =======================================================
     SYSTEM ADMIN
     ======================================================= */

  '/system-admin': [
    'System Admin',
  ],


  /* =======================================================
     EMPLOYEE MANAGEMENT
     ======================================================= */

  '/user-management': [
    'System Admin',
  ],


  /* =======================================================
     TEAM MANAGEMENT

     PROJECT MANAGER ONLY
     ======================================================= */

  '/team-management': [
    'Project Manager',
  ],


  /* =======================================================
     REQUIREMENTS
     ======================================================= */

  '/requirements': [
    'Business Analyst',
    'Project Manager',
  ],


  /* =======================================================
     REQUIREMENT EXTRACTION
     ======================================================= */

  '/requirements/extract': [
    'Business Analyst',
  ],


  /* =======================================================
     USER STORIES

     Developer can access.
     ======================================================= */

  '/user-stories': [
    'Business Analyst',
    'Project Manager',
    'Developer',
    'QA Engineer',
  ],


  /* =======================================================
     TASK ASSIGNMENT
     ======================================================= */

  '/task-assignment': [
    'Project Manager',
  ],


  /* =======================================================
     DEVELOPER WORKSPACE
     ======================================================= */

  '/developer': [
    'Developer',
  ],


  /* =======================================================
     QA REVIEW
     ======================================================= */

  '/qa-review': [
    'QA Engineer',
  ],


  /* =======================================================
     SRS
     ======================================================= */

  '/srs': [
    'CEO',
    'Project Manager',
    'Business Analyst',
    'Developer',
    'QA Engineer',
  ],


  /* =======================================================
     UML WORKSPACE

     Developer can access.
     ======================================================= */

  '/uml-workspace': [
    'CEO',
    'Project Manager',
    'Business Analyst',
    'Developer',
  ],


  /* =======================================================
     TRACEABILITY

     All project roles except System Admin.
     ======================================================= */

  '/traceability': [
    'CEO',
    'Project Manager',
    'Business Analyst',
    'Developer',
    'QA Engineer',
  ],
};


/* =========================================================
   NAVIGATION ITEMS
   ========================================================= */

const navItems = [

  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },


  {
    name: 'Admin Overview',
    href: '/system-admin',
    icon: ShieldCheck,
  },


  {
    name: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },


  {
    name: 'Employee Management',
    href: '/user-management',
    icon: UserCog,
  },


  {
    name: 'Team Management',
    href: '/team-management',
    icon: UserRoundCheck,
  },


  {
    name: 'Requirements',
    href: '/requirements',
    icon: FileText,
  },


  {
    name: 'Extract Requirements',
    href: '/requirements/extract',
    icon: Sparkles,
  },


  {
    name: 'User Stories',
    href: '/user-stories',
    icon: Users,
  },


  {
    name: 'Task Assignment',
    href: '/task-assignment',
    icon: ClipboardList,
  },


  {
    name: 'Developer Workspace',
    href: '/developer',
    icon: Code2,
  },


  {
    name: 'QA Review',
    href: '/qa-review',
    icon: TestTube2,
  }
,


  {
    name: 'SRS',
    href: '/srs',
    icon: BookOpen,
  },


  {
    name: 'UML Workspace',
    href: '/uml-workspace',
    icon: Network,
  },


  {
    name: 'Traceability',
    href: '/traceability',
    icon: GitBranch,
  },

];


/* =========================================================
   SIDEBAR
   ========================================================= */

export default function Sidebar() {

  const pathname =
    usePathname();


  const router =
    useRouter();


  const [
    mounted,
    setMounted,
  ] =
    useState(false);


  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const logout =
    useProjectStore(
      (state) =>
        state.logout
    );


  const isSidebarOpen =
    useProjectStore(
      (state) =>
        state.isSidebarOpen
    );


  /* =======================================================
     HYDRATION
     ======================================================= */

  useEffect(
    () => {

      setMounted(
        true
      );

    },
    []
  );


  /* =======================================================
     HYDRATION PLACEHOLDER
     ======================================================= */

  if (
    !mounted
  ) {

    return (

      <aside
        className="
          w-64
          h-screen
          bg-slate-900
          border-r
          border-slate-800
          flex
          flex-col
          shrink-0
          overflow-hidden
          transition-all
          duration-300
        "
      >

        <div
          className="
            h-16
            px-6
            border-b
            border-slate-800
            flex
            items-center
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-8
                h-8
                rounded-lg
                bg-blue-600
                flex
                items-center
                justify-center
                font-bold
                text-white
                text-lg
              "
            >

              R

            </div>


            <span
              className="
                text-xl
                font-bold
                text-white
                tracking-wide
              "
            >

              ReqSync

            </span>

          </div>

        </div>

      </aside>
    );
  }


  /* =======================================================
     FILTER NAVIGATION BY ROLE
     ======================================================= */

  const displayedNavItems =
    navItems.filter(
      (item) => {

        /*
         * Dashboard is available to every authenticated user.
         */
        if (
          item.href ===
          '/dashboard'
        ) {

          return Boolean(
            currentUser
          );
        }


        const allowedRoles =
          rolePaths[
            item.href
          ];


        if (
          !allowedRoles
        ) {

          return false;
        }


        if (
          !currentUser
        ) {

          return false;
        }


        return allowedRoles.includes(
          currentUser.role
        );
      }
    );


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout =
    () => {

      logout();


      router.replace(
        '/login'
      );
    };


  /* =======================================================
     USER INITIALS
     ======================================================= */

  const userInitials =
    currentUser?.name

      ? currentUser.name
          .split(' ')
          .filter(
            Boolean
          )
          .map(
            (name) =>
              name[0]
          )
          .join('')
          .slice(
            0,
            2
          )
          .toUpperCase()

      : 'U';


  /* =======================================================
     UI
     ======================================================= */

  return (

    <aside
      className={
        cn(
          `
            h-screen
            bg-slate-900
            border-r
            border-slate-800
            flex
            flex-col
            shrink-0
            text-slate-300
            transition-all
            duration-300
            relative
            overflow-hidden
          `,

          isSidebarOpen
            ? 'w-64'
            : 'w-20'
        )
      }
    >

      {/* ===================================================
          BRAND HEADER
          =================================================== */}

      <div
        className={
          cn(
            `
              border-b
              border-slate-800
              flex
              items-center
              h-16
              shrink-0
            `,

            isSidebarOpen
              ? 'px-6 justify-start'
              : 'px-0 justify-center'
          )
        }
      >

        <Link
          href="/dashboard"
          className="
            flex
            items-center
            gap-3
            group
            min-w-0
          "
        >

          <div
            className="
              w-8.5
              h-8.5
              rounded-lg
              bg-gradient-to-tr
              from-blue-600
              to-indigo-500
              flex
              items-center
              justify-center
              font-bold
              text-white
              shadow-md
              shadow-blue-500/20
              group-hover:scale-105
              transition-transform
              duration-200
              shrink-0
            "
          >

            <Sparkles
              className="
                w-4.5
                h-4.5
                text-white
              "
            />

          </div>


          {isSidebarOpen && (

            <div
              className="
                flex
                flex-col
                overflow-hidden
                animate-in
                fade-in
                zoom-in
                duration-300
                min-w-0
              "
            >

              <span
                className="
                  text-lg
                  font-bold
                  text-white
                  tracking-wide
                  leading-none
                  group-hover:text-blue-400
                  transition-colors
                  whitespace-nowrap
                "
              >

                ReqSync

              </span>


              <span
                className="
                  text-[10px]
                  text-slate-500
                  font-semibold
                  tracking-wider
                  uppercase
                  mt-1
                  whitespace-nowrap
                "
              >

                Requirements Platform

              </span>

            </div>

          )}

        </Link>

      </div>


      {/* ===================================================
          NAVIGATION
          =================================================== */}

      <nav
        className={
          cn(
            `
              flex-1
              min-h-0
              overflow-y-auto
              overflow-x-hidden
              py-6
              space-y-1
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            `,

            isSidebarOpen
              ? 'px-4'
              : 'px-2'
          )
        }
      >

        {displayedNavItems.map(
          (item) => {

            /*
             * Exact match for /requirements prevents
             * /requirements/extract from highlighting both.
             */
            const isActive =

              item.href ===
              '/requirements'

                ? pathname ===
                  '/requirements'

                : pathname ===
                    item.href ||

                  pathname?.startsWith(
                    `${item.href}/`
                  );


            const Icon =
              item.icon;


            return (

              <div
                key={
                  item.href
                }
                className="
                  relative
                  group/nav
                  min-w-0
                "
              >

                <Link
                  href={
                    item.href
                  }
                  title={
                    !isSidebarOpen
                      ? item.name
                      : undefined
                  }
                  className={
                    cn(
                      `
                        flex
                        items-center
                        rounded-xl
                        text-sm
                        font-medium
                        transition-all
                        duration-200
                        min-w-0
                      `,

                      isSidebarOpen
                        ? 'gap-3 px-4 py-3'
                        : 'justify-center p-3',

                      isActive

                        ? `
                            bg-blue-600
                            text-white
                            shadow-lg
                            shadow-blue-600/15
                          `

                        : `
                            hover:bg-slate-800
                            hover:text-white
                          `
                    )
                  }
                >

                  <Icon
                    className={
                      cn(
                        `
                          w-5
                          h-5
                          shrink-0
                        `,

                        isActive
                          ? 'text-white'

                          : `
                              text-slate-400
                              group-hover/nav:text-white
                            `
                      )
                    }
                  />


                  {isSidebarOpen && (

                    <span
                      className="
                        whitespace-nowrap
                        overflow-hidden
                        text-ellipsis
                      "
                    >

                      {item.name}

                    </span>

                  )}

                </Link>

              </div>
            );
          }
        )}

      </nav>


      {/* ===================================================
          CURRENT USER
          =================================================== */}

      <div
        className={
          cn(
            `
              border-t
              border-slate-800
              bg-slate-950/40
              flex
              flex-col
              gap-3
              shrink-0
            `,

            isSidebarOpen
              ? 'p-4'
              : 'p-2 items-center'
          )
        }
      >

        <div
          className={
            cn(
              `
                flex
                items-center
                w-full
                min-w-0
              `,

              isSidebarOpen
                ? 'justify-between'

                : `
                    justify-center
                    flex-col
                    gap-2
                  `
            )
          }
        >

          {/* =================================================
              USER
              ================================================= */}

          <div
            className="
              flex
              items-center
              gap-3
              p-1
              rounded-xl
              min-w-0
            "
          >

            <div
              className="
                relative
                shrink-0
              "
            >

              {/* USER AVATAR */}

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-gradient-to-tr
                  from-emerald-500
                  to-teal-400
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-slate-950
                  text-xs
                  shadow-md
                  uppercase
                "
              >

                {userInitials}

              </div>


              {/* ONLINE INDICATOR */}

              <div
                className="
                  absolute
                  -bottom-0.5
                  -right-0.5
                  w-2.5
                  h-2.5
                  rounded-full
                  bg-emerald-500
                  border-2
                  border-slate-900
                "
              />

            </div>


            {/* USER DETAILS */}

            {isSidebarOpen && (

              <div
                className="
                  flex
                  flex-col
                  min-w-0
                  overflow-hidden
                "
              >

                <span
                  className="
                    text-xs
                    font-bold
                    text-white
                    truncate
                  "
                >

                  {currentUser?.name ||
                    'User'}

                </span>


                <span
                  className="
                    text-[10px]
                    text-slate-500
                    truncate
                  "
                >

                  {currentUser?.role ||
                    ''}

                </span>

              </div>

            )}

          </div>


          {/* =================================================
              LOGOUT
              ================================================= */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="
              p-2
              text-slate-500
              hover:text-rose-400
              hover:bg-slate-800/40
              rounded-xl
              transition-all
              cursor-pointer
              shrink-0
            "
            title="Log Out"
          >

            <LogOut
              className="
                w-4.5
                h-4.5
              "
            />

          </button>

        </div>

      </div>

    </aside>
  );
}