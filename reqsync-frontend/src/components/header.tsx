'use client';

import Link from 'next/link';

import {
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  useProjectStore,
} from '@/store/projectStore';


/* =========================================================
   HEADER
   ========================================================= */

export default function Header() {

  /* =======================================================
     STATE
     ======================================================= */

  const [
    mounted,
    setMounted,
  ] =
    useState(false);


  /* =======================================================
     SIDEBAR STORE
     ======================================================= */

  const toggleSidebar =
    useProjectStore(
      (state) =>
        state.toggleSidebar
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

      <header
        className="
          h-16
          bg-white
          border-b
          border-slate-200
          flex
          items-center
          justify-between
          px-8
          shrink-0
        "
      />

    );
  }


  /* =======================================================
     UI
     ======================================================= */

  return (

    <header
      className="
        h-16
        bg-white
        border-b
        border-slate-200
        flex
        items-center
        justify-between
        px-8
        shrink-0
        relative
        z-30
        shadow-xs
      "
    >

      {/* ===================================================
          SIDEBAR TOGGLE
          =================================================== */}

      <button
        type="button"
        onClick={
          toggleSidebar
        }
        className="
          p-2
          -ml-2
          text-slate-500
          hover:text-blue-600
          hover:bg-slate-50
          rounded-xl
          transition-all
        "
        aria-label={
          isSidebarOpen
            ? 'Collapse Sidebar'
            : 'Expand Sidebar'
        }
        title={
          isSidebarOpen
            ? 'Collapse Sidebar'
            : 'Expand Sidebar'
        }
      >

        {isSidebarOpen ? (

          <PanelLeftClose
            className="
              w-5.5
              h-5.5
            "
          />

        ) : (

          <PanelLeftOpen
            className="
              w-5.5
              h-5.5
            "
          />

        )}

      </button>


      {/* ===================================================
          SETTINGS
          =================================================== */}

      <Link
        href="/settings"
        className="
          p-2
          text-slate-500
          hover:text-blue-600
          hover:bg-slate-50
          rounded-xl
          transition-all
        "
        title="Settings"
        aria-label="Settings"
      >

        <Settings
          className="
            w-5.5
            h-5.5
          "
        />

      </Link>

    </header>
  );
}