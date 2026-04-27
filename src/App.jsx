import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import RoutineTracker from './RoutineTracker';
import InstallPrompt from './InstallPrompt';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #58cc02, #89e219)' }}>
        <div className="text-white font-black text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {session ? <RoutineTracker session={session} /> : <Auth />}
      <InstallPrompt />
    </>
  );
}
