import React, { useState } from 'react';

export default function UserLoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [office, setOffice] = useState('');
  const [error, setError] = useState('');

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
        body: JSON.stringify(body)
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
