'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  LogOut,
  Save,
  ShieldCheck,
  User,
  UserRound
} from 'lucide-react';

import {
  useRouter
} from 'next/navigation';

import {
  useProjectStore
} from '@/store/projectStore';


export default function ProfileSettingsPage() {

  const router =
    useRouter();


  /* =========================================================
     CURRENT USER
     ========================================================= */

  const currentUser =
    useProjectStore(
      (state) =>
        state.currentUser
    );


  const updateProfile =
    useProjectStore(
      (state) =>
        state.updateProfile
    );


  const logout =
    useProjectStore(
      (state) =>
        state.logout
    );


  /* =========================================================
     HYDRATION
     ========================================================= */

  const [
    mounted,
    setMounted
  ] =
    useState(false);


  /* =========================================================
     PROFILE FORM
     ========================================================= */

  const [
    profileName,
    setProfileName
  ] =
    useState('');


  const [
    profileSkills,
    setProfileSkills
  ] =
    useState('');


  const [
    savingProfile,
    setSavingProfile
  ] =
    useState(false);


  const [
    profileSuccess,
    setProfileSuccess
  ] =
    useState(false);


  const [
    profileError,
    setProfileError
  ] =
    useState('');


  /* =========================================================
     PASSWORD FORM
     ========================================================= */

  const [
    currentPassword,
    setCurrentPassword
  ] =
    useState('');


  const [
    newPassword,
    setNewPassword
  ] =
    useState('');


  const [
    confirmPassword,
    setConfirmPassword
  ] =
    useState('');


  const [
    changingPassword,
    setChangingPassword
  ] =
    useState(false);


  const [
    passwordSuccess,
    setPasswordSuccess
  ] =
    useState(false);


  const [
    passwordError,
    setPasswordError
  ] =
    useState('');


  /* =========================================================
     PASSWORD VISIBILITY
     ========================================================= */

  const [
    showCurrentPassword,
    setShowCurrentPassword
  ] =
    useState(false);


  const [
    showNewPassword,
    setShowNewPassword
  ] =
    useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword
  ] =
    useState(false);


  /* =========================================================
     INITIALS
     ========================================================= */

  const initials =
    useMemo(
      () => {

        if (
          !currentUser?.name
        ) {

          return 'U';
        }


        return currentUser.name
          .split(' ')
          .filter(
            Boolean
          )
          .map(
            (part) =>
              part[0]
          )
          .join('')
          .slice(
            0,
            2
          )
          .toUpperCase();
      },

      [
        currentUser?.name
      ]
    );


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(
    () => {

      setMounted(
        true
      );

    },
    []
  );


  /* =========================================================
     SYNC USER → FORM
     ========================================================= */

  useEffect(
    () => {

      if (
        !currentUser
      ) {

        return;
      }


      setProfileName(
        currentUser.name ??
        ''
      );


      setProfileSkills(
        currentUser.skills ??
        ''
      );

    },
    [
      currentUser
    ]
  );


  /* =========================================================
     SAVE PROFILE
     ========================================================= */

  const handleSaveProfile =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      if (
        !currentUser
      ) {

        return;
      }


      setProfileError(
        ''
      );


      setProfileSuccess(
        false
      );


      if (
        !profileName.trim()
      ) {

        setProfileError(
          'Full name is required.'
        );

        return;
      }


      try {

        setSavingProfile(
          true
        );


        /*
         * Current implementation uses the
         * authenticated Zustand user store.
         *
         * This updates:
         * - users[]
         * - currentUser
         * - matching team-member display data
         */
        updateProfile(
          currentUser.id,
          profileName.trim(),
          profileSkills.trim()
        );


        setProfileSuccess(
          true
        );


        window.setTimeout(
          () =>
            setProfileSuccess(
              false
            ),
          3000
        );

      } catch (error) {

        setProfileError(
          error instanceof Error
            ? error.message
            : 'Unable to update profile.'
        );

      } finally {

        setSavingProfile(
          false
        );
      }
    };


  /* =========================================================
     CHANGE PASSWORD
     ========================================================= */

  const handleChangePassword =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      if (
        !currentUser
      ) {

        return;
      }


      setPasswordError(
        ''
      );


      setPasswordSuccess(
        false
      );


      /*
       * Current frontend store has the password.
       *
       * When a backend password endpoint is added,
       * this check should be removed and Spring Boot
       * should verify the current password instead.
       */
      if (
        currentUser.password &&
        currentPassword !==
          currentUser.password
      ) {

        setPasswordError(
          'Current password is incorrect.'
        );

        return;
      }


      if (
        newPassword.length <
        6
      ) {

        setPasswordError(
          'New password must contain at least 6 characters.'
        );

        return;
      }


      if (
        newPassword !==
        confirmPassword
      ) {

        setPasswordError(
          'New password and confirmation do not match.'
        );

        return;
      }


      if (
        currentPassword ===
        newPassword
      ) {

        setPasswordError(
          'New password must be different from your current password.'
        );

        return;
      }


      try {

        setChangingPassword(
          true
        );


        updateProfile(
          currentUser.id,
          currentUser.name,
          currentUser.skills ??
            '',
          newPassword
        );


        setCurrentPassword(
          ''
        );


        setNewPassword(
          ''
        );


        setConfirmPassword(
          ''
        );


        setPasswordSuccess(
          true
        );


        window.setTimeout(
          () =>
            setPasswordSuccess(
              false
            ),
          3000
        );

      } catch (error) {

        setPasswordError(
          error instanceof Error
            ? error.message
            : 'Unable to change password.'
        );

      } finally {

        setChangingPassword(
          false
        );
      }
    };


  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout =
    () => {

      logout();


      router.replace(
        '/login'
      );
    };


  /* =========================================================
     HYDRATION
     ========================================================= */

  if (
    !mounted
  ) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />

      </div>
    );
  }


  /* =========================================================
     NO SESSION
     ========================================================= */

  if (
    !currentUser
  ) {

    return (

      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">

        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">

          <AlertCircle className="w-8 h-8 text-rose-600" />

        </div>


        <h1 className="text-xl font-extrabold text-slate-900 mt-5">

          Profile unavailable

        </h1>


        <p className="text-sm text-slate-500 mt-2">

          Your login session could not be found. Please sign in again.

        </p>


        <button
          type="button"
          onClick={
            () =>
              router.replace(
                '/login'
              )
          }
          className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
        >

          Go to Login

        </button>

      </div>
    );
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (

    <div className="max-w-5xl mx-auto space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">

        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

          <UserRound className="w-5 h-5 text-blue-700" />

        </div>


        <div>

          <h1 className="text-2xl font-extrabold text-slate-900">

            Profile Settings

          </h1>


          <p className="text-sm text-slate-500 mt-1">

            Manage your personal profile, password and active session.

          </p>

        </div>

      </div>


      {/* =====================================================
          PROFILE SUMMARY
          ===================================================== */}

      <div className="bg-slate-900 rounded-2xl p-6 text-white">

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-lg font-black shadow-lg shrink-0">

            {initials}

          </div>


          <div className="min-w-0 flex-1">

            <h2 className="text-xl font-extrabold truncate">

              {currentUser.name}

            </h2>


            <p className="text-sm text-slate-400 mt-1 truncate">

              {currentUser.email}

            </p>


            <div className="flex flex-wrap items-center gap-2 mt-3">

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">

                <ShieldCheck className="w-3.5 h-3.5" />

                {currentUser.role}

              </span>


              <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">

                Active Session

              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          PERSONAL INFORMATION
          ===================================================== */}

      <form
        onSubmit={
          handleSaveProfile
        }
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
      >

        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <User className="w-4 h-4 text-blue-600" />


              <h2 className="font-extrabold text-slate-900">

                Personal Information

              </h2>

            </div>


            <p className="text-xs text-slate-500 mt-1">

              Update the personal information shown throughout ReqSync.

            </p>

          </div>


          {profileSuccess && (

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">

              <Check className="w-4 h-4" />

              Saved

            </div>

          )}

        </div>


        <div className="p-6 space-y-5">

          {profileError && (

            <InlineError
              message={
                profileError
              }
            />

          )}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* NAME */}

            <div>

              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                Full Name *

              </label>


              <input
                type="text"
                value={
                  profileName
                }
                onChange={
                  (
                    event
                  ) =>
                    setProfileName(
                      event.target.value
                    )
                }
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                required
              />

            </div>


            {/* EMAIL */}

            <div>

              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                Work Email

              </label>


              <input
                type="email"
                value={
                  currentUser.email
                }
                disabled
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
              />


              <p className="text-[10px] text-slate-400 mt-1.5">

                Your email address is linked to your account and cannot be changed here.

              </p>

            </div>


            {/* ROLE */}

            <div>

              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                System Role

              </label>


              <div className="h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">

                <ShieldCheck className="w-4 h-4 text-blue-600" />


                <span className="text-xs font-bold text-slate-700">

                  {currentUser.role}

                </span>

              </div>


              <p className="text-[10px] text-slate-400 mt-1.5">

                Roles are controlled by your organization and cannot be edited from your profile.

              </p>

            </div>


            {/* SKILLS */}

            <div>

              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                Professional Skills

              </label>


              <input
                type="text"
                value={
                  profileSkills
                }
                onChange={
                  (
                    event
                  ) =>
                    setProfileSkills(
                      event.target.value
                    )
                }
                placeholder="Java, Spring Boot, React, Testing..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-800 focus:outline-none focus:border-blue-500"
              />


              <p className="text-[10px] text-slate-400 mt-1.5">

                Separate multiple skills using commas.

              </p>

            </div>

          </div>

        </div>


        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">

          <button
            type="submit"
            disabled={
              savingProfile
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {savingProfile ? (

              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

            ) : (

              <Save className="w-4 h-4" />

            )}


            {savingProfile
              ? 'Saving...'
              : 'Save Profile'}

          </button>

        </div>

      </form>


      {/* =====================================================
          PASSWORD
          ===================================================== */}

      <form
        onSubmit={
          handleChangePassword
        }
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
      >

        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <KeyRound className="w-4 h-4 text-indigo-600" />


              <h2 className="font-extrabold text-slate-900">

                Password & Security

              </h2>

            </div>


            <p className="text-xs text-slate-500 mt-1">

              Change the password used to access your ReqSync account.

            </p>

          </div>


          {passwordSuccess && (

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">

              <Check className="w-4 h-4" />

              Password Updated

            </div>

          )}

        </div>


        <div className="p-6 space-y-5">

          {passwordError && (

            <InlineError
              message={
                passwordError
              }
            />

          )}


          <div className="grid grid-cols-1 gap-5">

            {/* CURRENT PASSWORD */}

            <PasswordField
              label="Current Password"
              value={
                currentPassword
              }
              onChange={
                setCurrentPassword
              }
              visible={
                showCurrentPassword
              }
              onToggleVisibility={
                () =>
                  setShowCurrentPassword(
                    (current) =>
                      !current
                  )
              }
            />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NEW */}

              <PasswordField
                label="New Password"
                value={
                  newPassword
                }
                onChange={
                  setNewPassword
                }
                visible={
                  showNewPassword
                }
                onToggleVisibility={
                  () =>
                    setShowNewPassword(
                      (current) =>
                        !current
                    )
                }
              />


              {/* CONFIRM */}

              <PasswordField
                label="Confirm New Password"
                value={
                  confirmPassword
                }
                onChange={
                  setConfirmPassword
                }
                visible={
                  showConfirmPassword
                }
                onToggleVisibility={
                  () =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                }
              />

            </div>

          </div>


          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">

            <LockKeyhole className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />


            <div>

              <p className="text-xs font-bold text-indigo-900">

                Password requirements

              </p>


              <p className="text-[10px] text-indigo-700 mt-1 leading-relaxed">

                Your new password must contain at least 6 characters and must match the confirmation password.

              </p>

            </div>

          </div>

        </div>


        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">

          <button
            type="submit"
            disabled={
              changingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {changingPassword ? (

              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

            ) : (

              <KeyRound className="w-4 h-4" />

            )}


            {changingPassword
              ? 'Updating...'
              : 'Change Password'}

          </button>

        </div>

      </form>


      {/* =====================================================
          SESSION
          ===================================================== */}

      <div className="bg-white border border-rose-200 rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-rose-100">

          <div className="flex items-center gap-2">

            <LogOut className="w-4 h-4 text-rose-600" />


            <h2 className="font-extrabold text-slate-900">

              Session

            </h2>

          </div>


          <p className="text-xs text-slate-500 mt-1">

            Sign out of ReqSync on this device.

          </p>

        </div>


        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <p className="text-sm font-bold text-slate-800">

              Sign out of your account

            </p>


            <p className="text-xs text-slate-500 mt-1">

              Your active authentication session will be removed from this browser.

            </p>

          </div>


          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0"
          >

            <LogOut className="w-4 h-4" />

            Log Out

          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PASSWORD FIELD
   ========================================================= */

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisibility
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) =>
      void;

  visible:
    boolean;

  onToggleVisibility:
    () =>
      void;
}) {

  return (

    <div>

      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

        {label}

      </label>


      <div className="relative">

        <input
          type={
            visible
              ? 'text'
              : 'password'
          }
          value={
            value
          }
          onChange={
            (
              event
            ) =>
              onChange(
                event.target.value
              )
          }
          className="w-full pl-3.5 pr-11 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-800 focus:outline-none focus:border-blue-500"
          required
        />


        <button
          type="button"
          onClick={
            onToggleVisibility
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          title={
            visible
              ? 'Hide password'
              : 'Show password'
          }
        >

          {visible ? (

            <EyeOff className="w-4 h-4" />

          ) : (

            <Eye className="w-4 h-4" />

          )}

        </button>

      </div>

    </div>
  );
}


/* =========================================================
   ERROR
   ========================================================= */

function InlineError({
  message
}: {
  message:
    string;
}) {

  return (

    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">

      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />


      <p className="text-xs font-medium">

        {message}

      </p>

    </div>
  );
}