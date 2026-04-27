import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './supabaseClient';
import {
  Check, TrendingUp, Award, BarChart3, Calendar, Target, Zap
} from 'lucide-react';

// --- HELPERS ---
const getDateStr = (d) => d.toISOString().split('T')[0];

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
};

const SHORT_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// --- COMPONENT ---
export default function ProgressHistory({ session, isDarkMode }) {
  const [routines, setRoutines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch all routines
      const { data: routineData, error: routineErr } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', session.user.id);
      if (routineErr) { console.error('Error fetching routines:', routineErr); }

      // Fetch logs for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sinceStr = getDateStr(thirtyDaysAgo);

      const { data: logData, error: logErr } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('completed_date', sinceStr);
      if (logErr) { console.error('Error fetching logs:', logErr); }

      if (routineData) setRoutines(routineData);
      if (logData) setLogs(logData);
      setLoading(false);
    };
    fetchData();
  }, [session.user.id]);

  // Build a lookup: "routineId::dateStr" → true
  const logLookup = useMemo(() => {
    const map = new Set();
    logs.forEach(log => { map.add(`${log.routine_id}::${log.completed_date}`); });
    return map;
  }, [logs]);

  const last7 = useMemo(() => getLast7Days(), []);
  const todayStr = getDateStr(new Date());

  // --- 30-DAY STATS ---
  const stats = useMemo(() => {
    if (routines.length === 0) return { bestHabit: null, bestRate: 0, consistencyScore: 0, totalCompleted: 0, totalPossible: 0, activeDays: 0 };

    // Per-habit completion count (last 30 days)
    const habitCounts = {};
    routines.forEach(r => { habitCounts[r.id] = { name: r.task_name, count: 0 }; });
    logs.forEach(log => {
      if (habitCounts[log.routine_id]) habitCounts[log.routine_id].count++;
    });

    // Best habit
    let bestHabit = null;
    let bestRate = 0;
    Object.values(habitCounts).forEach(h => {
      const rate = h.count / 30;
      if (rate > bestRate) { bestRate = rate; bestHabit = h.name; }
    });

    // Active days (unique dates with at least 1 log)
    const activeDates = new Set();
    logs.forEach(log => activeDates.add(log.completed_date));
    const activeDays = activeDates.size;

    // Consistency score = active days / 30
    const consistencyScore = Math.round((activeDays / 30) * 100);

    const totalCompleted = logs.length;
    const totalPossible = routines.length * 30;

    return { bestHabit, bestRate: Math.round(bestRate * 100), consistencyScore, totalCompleted, totalPossible, activeDays };
  }, [routines, logs]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
        ))}
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className={`text-center p-8 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-500'}`}>
        <Target size={40} className="mx-auto mb-3 opacity-50" />
        <p className="font-black text-lg">No routines found</p>
        <p className="text-sm font-bold mt-1">Switch to the Daily Tracker to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* === WEEK AT A GLANCE === */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
            <Calendar size={20} />
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Week at a Glance
          </h2>
        </div>

        <div className={`rounded-2xl sm:rounded-3xl border-2 overflow-hidden transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700 shadow-[0_6px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_6px_0_0_#e2e8f0]'
        }`}>
          {/* Day header row */}
          <div className="grid" style={{ gridTemplateColumns: 'minmax(100px, 1.5fr) repeat(7, 1fr)' }}>
            <div className={`p-2 sm:p-3 border-b-2 border-r-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`} />
            {last7.map((d, i) => {
              const isToday = getDateStr(d) === todayStr;
              return (
                <div key={i} className={`flex flex-col items-center justify-center p-1.5 sm:p-2 border-b-2 text-center ${
                  i < 6 ? `border-r ${isDarkMode ? 'border-slate-700/50' : 'border-slate-50'}` : ''
                } ${isDarkMode ? 'border-b-slate-700' : 'border-b-slate-100'} ${
                  isToday ? isDarkMode ? 'bg-emerald-950/40' : 'bg-emerald-50' : ''
                }`}>
                  <span className={`text-[9px] sm:text-[11px] font-black uppercase tracking-wider ${
                    isToday ? 'text-emerald-500' : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>{SHORT_DAY[d.getDay()]}</span>
                  <span className={`text-xs sm:text-sm font-black ${
                    isToday ? 'text-emerald-500' : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>{d.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Habit rows */}
          {routines.map((routine, rIdx) => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rIdx * 0.03 }}
              className="grid"
              style={{ gridTemplateColumns: 'minmax(100px, 1.5fr) repeat(7, 1fr)' }}
            >
              {/* Habit name */}
              <div className={`flex items-center p-2 sm:p-3 border-r-2 ${
                rIdx < routines.length - 1 ? `border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-50'}` : ''
              } ${isDarkMode ? 'border-r-slate-700' : 'border-r-slate-100'}`}>
                <span className={`text-[11px] sm:text-sm font-bold leading-tight line-clamp-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>{routine.task_name}</span>
              </div>

              {/* 7 day cells */}
              {last7.map((d, dIdx) => {
                const dateStr = getDateStr(d);
                const hasLog = logLookup.has(`${routine.id}::${dateStr}`);
                const isToday = dateStr === todayStr;
                return (
                  <div key={dIdx} className={`flex items-center justify-center p-1.5 sm:p-2 ${
                    rIdx < routines.length - 1 ? `border-b ${isDarkMode ? 'border-slate-700/30' : 'border-slate-50'}` : ''
                  } ${dIdx < 6 ? `border-r ${isDarkMode ? 'border-slate-700/30' : 'border-slate-50/80'}` : ''} ${
                    isToday ? isDarkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/50' : ''
                  }`}>
                    {hasLog ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, delay: rIdx * 0.02 + dIdx * 0.02 }}
                        className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-500 flex items-center justify-center shadow-md"
                        style={{ boxShadow: '0 2px 0 0 #059669' }}
                      >
                        <Check size={12} className="text-white stroke-[4px] sm:hidden" />
                        <Check size={16} className="text-white stroke-[4px] hidden sm:block" />
                      </motion.div>
                    ) : (
                      <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border-2 ${
                        isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                      }`} />
                    )}
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* === MONTHLY STATS === */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
            <BarChart3 size={20} />
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            30-Day Stats
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Consistency Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`col-span-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_6px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_6px_0_0_#e2e8f0]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-amber-400" fill="currentColor" />
                <span className={`font-black text-sm sm:text-base uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Consistency Score
                </span>
              </div>
              <span className={`text-2xl sm:text-3xl font-black ${
                stats.consistencyScore >= 70 ? 'text-emerald-500' : stats.consistencyScore >= 40 ? 'text-amber-400' : 'text-orange-500'
              }`}>{stats.consistencyScore}%</span>
            </div>
            <div className={`relative w-full h-5 sm:h-6 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <motion.div
                className={`h-full rounded-full ${
                  stats.consistencyScore >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                  stats.consistencyScore >= 40 ? 'bg-gradient-to-r from-amber-400 to-yellow-300' :
                  'bg-gradient-to-r from-orange-500 to-red-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${stats.consistencyScore}%` }}
                transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.3 }}
              />
              <div className={`absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-black ${
                stats.consistencyScore > 45 ? 'text-white' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>{stats.activeDays} of 30 days active</div>
            </div>
          </motion.div>

          {/* Best Habit Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_6px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_6px_0_0_#e2e8f0]'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Award size={18} className="text-amber-400" fill="currentColor" />
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Top Habit
              </span>
            </div>
            <p className={`text-sm sm:text-base font-black leading-tight mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {stats.bestHabit || '—'}
            </p>
            <p className={`text-lg sm:text-xl font-black ${
              stats.bestRate >= 70 ? 'text-emerald-500' : stats.bestRate >= 40 ? 'text-amber-400' : 'text-orange-500'
            }`}>{stats.bestRate}%</p>
          </motion.div>

          {/* Total Completions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_6px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_6px_0_0_#e2e8f0]'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={18} className="text-sky-400" />
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Completions
              </span>
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {stats.totalCompleted}
            </p>
            <p className={`text-[10px] sm:text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              of {stats.totalPossible} possible
            </p>
          </motion.div>
        </div>
      </div>

      {/* === PER-HABIT BREAKDOWN === */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
            <Target size={20} />
          </div>
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Habit Breakdown
          </h2>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {routines
            .map(r => {
              const count = logs.filter(l => l.routine_id === r.id).length;
              const pct = Math.round((count / 30) * 100);
              return { ...r, count, pct };
            })
            .sort((a, b) => b.pct - a.pct)
            .map((habit, i) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_4px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_4px_0_0_#f1f5f9]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm sm:text-base font-bold flex-1 mr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {habit.task_name}
                </span>
                <span className={`text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg ${
                  habit.pct >= 70 ? 'bg-emerald-500/15 text-emerald-500' :
                  habit.pct >= 40 ? 'bg-amber-400/15 text-amber-500' :
                  habit.pct > 0 ? 'bg-orange-500/15 text-orange-500' :
                  isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
                }`}>{habit.count}/30</span>
              </div>
              <div className={`relative w-full h-3 sm:h-3.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <motion.div
                  className={`h-full rounded-full ${
                    habit.pct >= 70 ? 'bg-emerald-500' : habit.pct >= 40 ? 'bg-amber-400' : habit.pct > 0 ? 'bg-orange-500' : 'bg-slate-300'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(habit.pct, 1)}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.1 + i * 0.04 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
