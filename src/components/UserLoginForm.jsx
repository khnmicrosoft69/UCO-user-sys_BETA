import React, { useState, useEffect } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;

// Google "G" logo SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <path
          d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}

export default function UserLoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [office, setOffice] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    if (document.getElementById('gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        setError(data.message || 'Google sign-in failed');
      }
    } catch {
      setError('An error occurred during Google sign-in. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!window.google) {
      setError('Google Sign-In is still loading. Please try again.');
      return;
    }
    setError('');
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      ux_mode: 'popup',
    });
    window.google.accounts.id.prompt((notification) => {
      // If One Tap is suppressed (e.g. user dismissed before), show the popup button flow
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn-container'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin
      ? { email, password }
      : { email, password, fullName, office };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        // Simple session management with localStorage for now
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 dark:shadow-slate-950/20 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img
            src="/images/uco-logo.png"
            alt="AdZU UCO Logo"
            className="w-20 h-auto object-contain drop-shadow-md dark:brightness-110"
          />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          {isLogin ? 'User Login' : 'Create Account'}
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
          {isLogin ? 'Sign in to manage your requests' : 'Register to start submitting requests'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Google Sign-In Button */}
      <div className="space-y-3">
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleClick}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {googleLoading ? (
            <svg className="animate-spin w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Hidden container for GIS rendered button fallback */}
        <div id="google-btn-container" className="hidden" />
      </div>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
          or
        </span>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                Office / Department
              </label>
              <input
                type="text"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                placeholder="Office of Admissions"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                required
              />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@adzu.edu.ph"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-[#0A1C5C] dark:bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm tracking-[0.15em] uppercase shadow-xl shadow-blue-900/20 dark:shadow-indigo-900/10 hover:bg-blue-900 dark:hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all duration-300 mt-2"
        >
          {isLogin ? 'Sign In' : 'Register'}
        </button>
      </form>

      <div className="text-center pt-4">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors uppercase tracking-widest"
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>

      <p className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
        UCO Media Request System - User Portal
      </p>
    </div>
  );
}
