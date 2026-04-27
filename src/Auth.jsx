import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Check your email for a confirmation link!');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #58cc02 0%, #89e219 30%, #ffc800 70%, #ff9600 100%)',
      }}
    >
      {/* Floating decorative circles */}
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-16 left-10 w-32 h-32 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.4)' }}
      />
      <motion.div
        animate={{ y: [15, -15, 15], x: [8, -8, 8] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="absolute bottom-20 right-8 w-48 h-48 rounded-full opacity-15"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />
      <motion.div
        animate={{ y: [10, -20, 10] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute top-1/3 right-16 w-20 h-20 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.5)' }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="bg-white rounded-3xl p-8 border-2 border-slate-100"
          style={{
            boxShadow: '0 12px 0 0 #e2e8f0, 0 24px 48px rgba(0,0,0,0.15)',
          }}
        >
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, damping: 12 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 rounded-2xl bg-lime-500 flex items-center justify-center mx-auto"
                style={{ boxShadow: '0 6px 0 0 #65a30d' }}
              >
                <span className="text-4xl">✅</span>
              </div>
            </motion.div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Daily Routine
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1">
              Build streaks. Stay consistent.
            </p>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <input
                id="auth-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-bold text-lg placeholder-slate-400 focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <input
                id="auth-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-bold text-lg placeholder-slate-400 focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Error / Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-2xl bg-red-50 border-2 border-red-200"
              >
                <p className="text-red-600 font-bold text-sm">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-2xl bg-lime-50 border-2 border-lime-200"
              >
                <p className="text-lime-700 font-bold text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="space-y-3">
            <motion.button
              id="auth-signup-btn"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleSignUp}
              disabled={loading || !email || !password}
              className="w-full py-5 rounded-2xl font-black text-xl text-white cursor-pointer border-2 border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #58cc02, #89e219)',
                boxShadow: '0 6px 0 0 #3a8a01',
              }}
            >
              {loading ? '...' : 'Sign Up'}
            </motion.button>

            <motion.button
              id="auth-login-btn"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full py-5 rounded-2xl font-black text-xl cursor-pointer border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#ffffff',
                color: '#58cc02',
                borderColor: '#e2e8f0',
                boxShadow: '0 6px 0 0 #e2e8f0',
              }}
            >
              {loading ? '...' : 'Log In'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
