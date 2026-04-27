import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient';
import ProgressHistory from './ProgressHistory';
import { 
  Check, Droplets, Sun, Briefcase, Moon, Calendar, ChevronRight,
  Trophy, Flame, BookOpen, Cake, X, Cloud, CloudRain, CloudSnow, CloudFog, LogOut,
  MessageCircle, Users, Heart, BarChart3, ClipboardList
} from 'lucide-react';

const RAW_DATA = {
  Monday: {
    Morning: ["Stretch", "Workout", "Bible Reading", "Prayer", "Creed", "Morning/Evening "],
    "Daily Briefing": ["Clean and Organize", "Albert Mohler", "Calendar Review", "Email to Zero", "Birthday List", "Communication List", "Review Projects List", "Daily Focus"],
    "Evening Prep": ["Review Projects List", "Tomorrow's Focus", "Email to Zero", "Organize Inbox", "Tidy Workspace"]
  },
  Tuesday: {
    Morning: ["Stretch ", "Workout", "Bible Reading", "Prayer", "Creed", "Morning/Evening "],
    "Daily Briefing": ["Clean and Organize", "Albert Mohler", "Calendar Review", "Email to Zero", "Birthday List", "Communication List", "Review Projects List", "Daily Focus"],
    "Evening Prep": ["Review Projects List", "Schedule Tomorrow's Focus", "Email to Zero", "Organize Inbox", "Tidy Workspace"]
  },
  Wednesday: {
    Morning: ["Stretch", "Workout", "Bible Reading", "Prayer", "Creed", "Morning/Evening "],
    "Daily Briefing": ["Clean and Organize", "Albert Mohler", "Calendar Review", "Email to Zero", "Birthday List", "Communication List", "Review Projects List", "Daily Focus"],
    "Evening Prep": ["Review Projects List", "Schedule Tomorrow's Focus", "Email to Zero", "Organize Inbox", "Tidy Workspace"]
  },
  Thursday: {
    Morning: ["Stretch", "Workout", "Bible Reading", "Prayer", "Creed", "Morning/Evening "],
    "Daily Briefing": ["Clean and Organize", "Albert Mohler", "Calendar Review", "Email to Zero", "Birthday List", "Communication List", "Review Projects List", "Daily Focus"],
    "Evening Prep": ["Review Projects List", "Schedule Tomorrow's Focus", "Email to Zero", "Organize Inbox", "Tidy Workspace"]
  },
  Friday: {
    Morning: ["Stretch", "Workout", "Bible Reading", "Prayer", "Creed", "Morning/Evening "],
    "Daily Briefing": ["Clean and Organize", "Albert Mohler", "Calendar Review", "Email to Zero", "Birthday List", "Communication List", "Review Projects List", "Daily Focus"],
    "Evening Prep": ["Review Projects List", "Schedule Tomorrow's Focus", "Email to Zero", "Organize Inbox", "Tidy Workspace"]
  },
  Saturday: {
    Morning: ["Stretch ", "Workout", "Bible Reading", "Prayer", "Creed", "Morning/Evening "],
    "Daily Briefing": ["Clean and Organize", "Albert Mohler", "Calendar Review", "Email to Zero", "Review Inbox", "Birthday List", "Communication List", "Review Projects List", "Daily Focus"],
    "Evening Prep": ["Review Projects List", "Schedule Tomorrow's Focus", "Email to Zero", "Organize Inbox", "Tidy Workspace"],
    "Weekly Review": ["Morning Routine", "Daily Briefing", "Review Journal", "Update Projects List", "Update Next Actions List", "Review and Update Calendar", "Update Communications List", "Time Block Daily Focus", "Process Tickler File", "Evening Prep"]
  },
  Sunday: {
    Morning: ["Rest & Reflection"],
    "Daily Briefing": ["Weekly Planning Lite"],
    "Evening Prep": ["Set Clothes for Monday"]
  }
};

const WATER_GOAL = 120;
const WATER_INCREMENT = 8;
const DAYS_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



const dayOfMonth = new Date().getDate();
const todaysReadings = [
  { book: 'Proverbs', chapter: dayOfMonth },
  { book: 'Psalms', chapter: dayOfMonth },
];

// --- COMPONENTS ---

const DarkModeToggle = ({ isDarkMode, onToggle }) => (
  <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={onToggle}
    className="relative flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 font-black text-lg cursor-pointer transition-colors duration-300"
    style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#475569' : '#e2e8f0',
      boxShadow: isDarkMode ? '0 4px 0 0 #0f172a' : '0 4px 0 0 #f1f5f9', color: isDarkMode ? '#fbbf24' : '#f97316' }}
    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
    <AnimatePresence mode="wait">
      {isDarkMode ? (
        <motion.div key="moon" initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}><Moon size={20} fill="currentColor" /></motion.div>
      ) : (
        <motion.div key="sun" initial={{ rotate: 90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: -90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}><Sun size={20} fill="currentColor" /></motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

const DaySelector = ({ selectedDay, realToday, onSelect, isDarkMode }) => (
  <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 px-0 sm:px-1">
    {DAYS_ORDER.map((dayName, i) => {
      const isSelected = dayName === selectedDay;
      const isToday = dayName === realToday;
      return (
        <motion.button key={dayName} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => onSelect(dayName)}
          className={`relative flex-1 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer border-2 ${
            isSelected ? 'bg-lime-500 text-white border-lime-500 shadow-[0_4px_0_0_#65a30d]'
              : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700 shadow-[0_4px_0_0_#0f172a] hover:text-slate-200 hover:border-slate-600'
              : 'bg-white text-slate-400 border-slate-100 shadow-[0_4px_0_0_#f1f5f9] hover:text-slate-600 hover:border-slate-200'}`}>
          {DAY_LABELS[i]}
          {isToday && (<span className={`absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isSelected ? 'bg-orange-400' : 'bg-red-500'}`}>
            <span className={`absolute inset-0 rounded-full animate-ping ${isSelected ? 'bg-orange-400' : 'bg-red-500'} opacity-75`} /></span>)}
        </motion.button>
      );
    })}
  </div>
);

const ProgressBar = ({ progress, isDarkMode }) => {
  const getColor = () => { if (progress < 30) return 'bg-orange-500'; if (progress < 70) return 'bg-yellow-400'; return 'bg-lime-500'; };
  return (
    <div className={`fixed top-0 left-0 w-full h-4 z-50 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
      <motion.div className={`h-full ${getColor()} transition-colors duration-500`} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: 'spring', damping: 20 }} />
    </div>
  );
};

const WaterGlass = ({ amount, onAdd, isDarkMode }) => {
  const fillPercentage = Math.min((amount / WATER_GOAL) * 100, 100);
  return (
    <div className={`flex flex-col items-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 mb-6 sm:mb-8 overflow-hidden relative transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_6px_0_0_#0f172a] sm:shadow-[0_8px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_6px_0_0_#e2e8f0] sm:shadow-[0_8px_0_0_#e2e8f0]'}`}>
      <div className="flex justify-between w-full items-center mb-3 sm:mb-4">
        <div><h3 className={`text-lg sm:text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Hydration</h3>
          <p className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{amount}oz / {WATER_GOAL}oz</p></div>
        <Droplets className="text-sky-400" size={28} />
      </div>
      <div onClick={onAdd} className={`relative w-24 h-32 sm:w-32 sm:h-44 border-4 rounded-b-2xl rounded-t-lg overflow-hidden cursor-pointer active:scale-95 transition-transform ${
        isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-50'}`}>
        <motion.div className="absolute bottom-0 w-full bg-sky-400" initial={{ height: 0 }} animate={{ height: `${fillPercentage}%` }} transition={{ type: 'spring', damping: 15 }}>
          <motion.div animate={{ x: [-5, 5, -5], transition: { repeat: Infinity, duration: 2, ease: "linear" } }}
            className="absolute top-0 left-0 w-[120%] h-4 bg-sky-300 opacity-50 -translate-y-2" />
        </motion.div>
        <div className={`absolute inset-0 flex items-center justify-center font-black text-xl sm:text-2xl select-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>+8oz</div>
      </div>
    </div>
  );
};

const TaskItem = ({ task, completed, onToggle, isDarkMode }) => (
  <motion.div whileTap={{ scale: 0.98 }} onClick={onToggle}
    className={`flex items-center p-3 sm:p-4 mb-2 sm:mb-3 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer ${
      completed ? isDarkMode ? 'bg-slate-900/50 border-transparent' : 'bg-slate-50 border-transparent'
        : isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_4px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_4px_0_0_#f1f5f9]'}`}>
    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
      completed ? 'bg-lime-500 border-lime-500' : isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-white'}`}>
      {completed && <Check size={18} className="text-white stroke-[4px]" />}
    </div>
    <span className={`ml-3 sm:ml-4 font-bold text-base sm:text-lg transition-all ${completed ? 'text-slate-400 line-through' : isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>{task}</span>
  </motion.div>
);

const RoutineGroup = ({ title, tasks, completedTasks, onToggle, onBibleReading, onBirthdayList, icon: Icon, color, isDarkMode }) => {
  const allDone = tasks.every(t => completedTasks.includes(t));
  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex items-center mb-3 sm:mb-4 px-1 sm:px-2">
        <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${color} text-white mr-2 sm:mr-3 shadow-lg`}><Icon size={20} /></div>
        <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
      </div>
      <div className="space-y-0.5 sm:space-y-1">
        {tasks.map(task => (
          <TaskItem key={task} task={task} completed={completedTasks.includes(task)} isDarkMode={isDarkMode}
            onToggle={() => {
              if (task === 'Bible Reading' && onBibleReading && !completedTasks.includes(task)) { onBibleReading(); }
              else if (task === 'Birthday List' && onBirthdayList && !completedTasks.includes(task)) { onBirthdayList(); }
              else { onToggle(task, allDone); }
            }} />
        ))}
      </div>
    </div>
  );
};

// --- BIBLE READING MODAL ---
const BibleReadingModal = ({ isOpen, onClose, onMarkRead, isDarkMode }) => (
  <AnimatePresence>{isOpen && (<>
    <motion.div key="bible-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      onClick={onClose} className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} />
    <motion.div key="bible-modal" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className={`w-full max-w-lg rounded-t-3xl p-6 pb-10 border-t-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.25)' }}>
        <div className="flex justify-end mb-2">
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><X size={24} /></motion.button>
        </div>
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15, damping: 12 }} className="inline-block mb-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${isDarkMode ? 'bg-indigo-900/60' : 'bg-indigo-50'}`}>
              <BookOpen size={32} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-500'} /></div>
          </motion.div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>📖 Today's Reading</h2>
          <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Day {dayOfMonth} of the month</p>
        </div>
        <div className="space-y-3 mb-8">
          {todaysReadings.map((reading, i) => (
            <motion.div key={reading.book} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_4px_0_0_#0f172a]' : 'bg-slate-50 border-slate-100 shadow-[0_4px_0_0_#e2e8f0]'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                i === 0 ? isDarkMode ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-600' : isDarkMode ? 'bg-sky-900/50 text-sky-400' : 'bg-sky-100 text-sky-600'}`}>{reading.chapter}</div>
              <div><p className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{reading.book} {reading.chapter}</p>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{i === 0 ? 'Wisdom Literature' : 'Songs & Prayers'}</p></div>
            </motion.div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }} onClick={onMarkRead}
          className="w-full py-5 rounded-2xl font-black text-xl text-white cursor-pointer border-2 border-transparent transition-colors"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 6px 0 0 #4338ca' }}>✅ Mark as Read</motion.button>
      </div>
    </motion.div>
  </>)}</AnimatePresence>
);

// --- BIRTHDAY LIST MODAL ---
const BirthdayModal = ({ isOpen, onClose, onReviewComplete, isDarkMode, todayBirthdays, upcomingBirthdays }) => (
  <AnimatePresence>{isOpen && (<>
    <motion.div key="birthday-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      onClick={onClose} className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} />
    <motion.div key="birthday-modal" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className={`w-full max-w-lg rounded-t-3xl p-6 pb-10 border-t-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.25)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="flex justify-end mb-2">
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><X size={24} /></motion.button>
        </div>
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15, damping: 12 }} className="inline-block mb-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${isDarkMode ? 'bg-pink-900/60' : 'bg-pink-50'}`}>
              <Cake size={32} className={isDarkMode ? 'text-pink-400' : 'text-pink-500'} /></div>
          </motion.div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>🎂 Birthday Check</h2>
          <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{MONTH_NAMES[new Date().getMonth()]} {new Date().getDate()}</p>
        </div>
        {todayBirthdays.length > 0 && (
          <div className="mb-6">
            <p className={`text-xs font-black uppercase tracking-widest mb-3 px-1 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`}>Today's Birthdays</p>
            <div className="space-y-3">
              {todayBirthdays.map((person, i) => (
                <motion.div key={person.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${isDarkMode ? 'bg-gradient-to-r from-pink-950/60 to-purple-950/40 border-pink-800 shadow-[0_4px_0_0_#831843]' : 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 shadow-[0_4px_0_0_#fbcfe8]'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDarkMode ? 'bg-pink-900/70' : 'bg-pink-100'}`}>🎉</div>
                  <div className="flex-1">
                    <p className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{person.name}</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`}>🎉 Today!</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-8">
          <p className={`text-xs font-black uppercase tracking-widest mb-3 px-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>Upcoming (Next 7 Days)</p>
          {upcomingBirthdays.length > 0 ? (
            <div className="space-y-3">
              {upcomingBirthdays.map((person, i) => (
                <motion.div key={`${person.name}-${person.monthName}-${person.day}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_4px_0_0_#0f172a]' : 'bg-slate-50 border-slate-100 shadow-[0_4px_0_0_#e2e8f0]'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isDarkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                    {person.monthName.slice(0, 3)}<br/>{person.day}</div>
                  <div className="flex-1">
                    <p className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{person.name}</p>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{person.monthName} {person.day} — in {person.daysUntil} day{person.daysUntil !== 1 ? 's' : ''}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`p-5 rounded-2xl border-2 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No upcoming birthdays this week.</p>
            </div>
          )}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }} onClick={onReviewComplete}
          className="w-full py-5 rounded-2xl font-black text-xl text-white cursor-pointer border-2 border-transparent transition-colors"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 6px 0 0 #9d174d' }}>🎂 Review Complete</motion.button>
      </div>
    </motion.div>
  </>)}</AnimatePresence>
);

// --- MONTHLY COMMS SECTION ---
const MonthlyComms = ({ contacts, onToggleContact, isDarkMode }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isContactedThisMonth = (lastContacted) => {
    if (!lastContacted) return false;
    const d = new Date(lastContacted);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const contactedCount = contacts.filter(c => isContactedThisMonth(c.last_contacted)).length;
  const totalCount = contacts.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((contactedCount / totalCount) * 100);

  const familyContacts = contacts.filter(c => c.category === 'Family');
  const friendContacts = contacts.filter(c => c.category === 'Friends');

  const getProgressColor = () => {
    if (progressPct < 30) return { bar: 'bg-orange-500', glow: 'shadow-orange-500/30' };
    if (progressPct < 70) return { bar: 'bg-amber-400', glow: 'shadow-amber-400/30' };
    return { bar: 'bg-emerald-500', glow: 'shadow-emerald-500/30' };
  };
  const pColor = getProgressColor();

  const ContactRow = ({ contact }) => {
    const contacted = isContactedThisMonth(contact.last_contacted);
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => onToggleContact(contact)}
        className={`flex items-center p-4 mb-3 rounded-2xl border-2 transition-all cursor-pointer ${
          contacted
            ? isDarkMode ? 'bg-emerald-950/40 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200'
            : isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_4px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_4px_0_0_#f1f5f9]'
        }`}
      >
        <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
          contacted ? 'bg-emerald-500 border-emerald-500' : isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-white'
        }`}>
          {contacted && <Check size={20} className="text-white stroke-[4px]" />}
        </div>
        <span className={`ml-4 font-bold text-lg transition-all ${
          contacted ? 'text-emerald-400 line-through' : isDarkMode ? 'text-slate-100' : 'text-slate-700'
        }`}>{contact.name}</span>
        {contacted && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="ml-auto text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg"
          >✓ Done</motion.span>
        )}
      </motion.div>
    );
  };

  const CategoryGroup = ({ title, icon: Icon, iconBg, contacts: catContacts }) => {
    const catDone = catContacts.filter(c => isContactedThisMonth(c.last_contacted)).length;
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${iconBg}`}><Icon size={18} className="text-white" /></div>
            <span className={`font-black text-sm uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</span>
          </div>
          <span className={`text-xs font-black px-2 py-1 rounded-lg ${
            catDone === catContacts.length
              ? 'bg-emerald-500/15 text-emerald-500'
              : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
          }`}>{catDone}/{catContacts.length}</span>
        </div>
        {catContacts.map(c => <ContactRow key={c.id} contact={c} />)}
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
          <MessageCircle size={24} />
        </div>
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Monthly Comms</h2>
          <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{MONTH_NAMES[currentMonth]} {currentYear}</p>
        </div>
        {progressPct === 100 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-2xl">🏆</motion.span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2 px-1">
          <span className={`text-sm font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Contacts Reached This Month
          </span>
          <span className={`text-sm font-black ${
            progressPct === 100 ? 'text-emerald-500' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>{contactedCount} / {totalCount}</span>
        </div>
        <div className={`relative w-full h-5 rounded-full overflow-hidden ${
          isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
        }`}>
          <motion.div
            className={`h-full rounded-full ${pColor.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
          <div className={`absolute inset-0 flex items-center justify-center text-xs font-black ${
            progressPct > 45 ? 'text-white' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>{progressPct}%</div>
        </div>
      </div>

      {/* Contact Groups */}
      {familyContacts.length > 0 && (
        <CategoryGroup title="Family" icon={Heart} iconBg="bg-rose-500" contacts={familyContacts} />
      )}
      {friendContacts.length > 0 && (
        <CategoryGroup title="Friends" icon={Users} iconBg="bg-blue-500" contacts={friendContacts} />
      )}
    </>
  );
};

// --- COMMUNICATION TRACKER MODAL ---
const CommunicationTrackerModal = ({ isOpen, onClose, contacts, onToggleContact, isDarkMode }) => (
  <AnimatePresence>{isOpen && (<>
    <motion.div key="comms-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      onClick={onClose} className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} />
    <motion.div key="comms-modal" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className={`w-full max-w-lg rounded-t-3xl p-6 pb-10 border-t-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.25)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="flex justify-end mb-2">
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><X size={24} /></motion.button>
        </div>

        <MonthlyComms contacts={contacts} onToggleContact={onToggleContact} isDarkMode={isDarkMode} />

        <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }} onClick={onClose}
          className="w-full py-5 rounded-2xl font-black text-xl text-white cursor-pointer border-2 border-transparent transition-colors mt-2"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', boxShadow: '0 6px 0 0 #6d28d9' }}>✕ Close Tracker</motion.button>
      </div>
    </motion.div>
  </>)}</AnimatePresence>
);

const getWeatherIcon = (code) => {
  if (code === 0 || code === 1) return { Icon: Sun, color: 'text-amber-400', label: 'Clear' };
  if (code === 2) return { Icon: Cloud, color: 'text-sky-400', label: 'Partly Cloudy' };
  if (code === 3) return { Icon: Cloud, color: 'text-slate-400', label: 'Cloudy' };
  if (code >= 45 && code <= 48) return { Icon: CloudFog, color: 'text-slate-400', label: 'Foggy' };
  if (code >= 51 && code <= 67) return { Icon: CloudRain, color: 'text-blue-400', label: 'Rain' };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, color: 'text-sky-300', label: 'Snow' };
  if (code >= 80 && code <= 82) return { Icon: CloudRain, color: 'text-blue-500', label: 'Showers' };
  if (code >= 85 && code <= 86) return { Icon: CloudSnow, color: 'text-sky-300', label: 'Snow Showers' };
  if (code >= 95) return { Icon: CloudRain, color: 'text-indigo-500', label: 'Thunderstorm' };
  return { Icon: Sun, color: 'text-amber-400', label: 'Clear' };
};

const WeatherWidget = ({ weather, isDarkMode }) => {
  if (!weather) {
    return (
      <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex items-center gap-1.5 sm:gap-2 animate-pulse transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-slate-700 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
        <div className="flex flex-col gap-1">
          <div className={`w-10 sm:w-12 h-3 sm:h-4 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
          <div className={`w-14 sm:w-16 h-2.5 sm:h-3 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
        </div>
      </div>
    );
  }
  const { Icon, color, label } = getWeatherIcon(weather.code);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15 }}
      className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_4px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_4px_0_0_#f1f5f9]'}`}>
      <div className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} ${color}`}>
        <Icon size={18} fill="currentColor" strokeWidth={1.5} /></div>
      <div className="flex flex-col leading-tight">
        <span className={`font-black text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{Math.round(weather.temp)}°</span>
        <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
export default function RoutineTracker({ session }) {
  const [realToday] = useState(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  });
  const [day, setDay] = useState(realToday);
  const [water, setWater] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [sectionsCompleted, setSectionsCompleted] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isBibleModalOpen, setIsBibleModalOpen] = useState(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [liveBirthdays, setLiveBirthdays] = useState([]);
  const [monthlyContacts, setMonthlyContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [liveRoutines, setLiveRoutines] = useState([]);
  const [todayLogs, setTodayLogs] = useState({}); // { routine_id: logRow }
  const [activeView, setActiveView] = useState('tracker'); // 'tracker' | 'progress'
  const [isMigrating, setIsMigrating] = useState(false);


  const [streak, setStreak] = useState(() => { try { const s = localStorage.getItem('routine-streak'); return s ? Number(s) : 0; } catch { return 0; } });
  const [lastCompletedDate, setLastCompletedDate] = useState(() => { try { return localStorage.getItem('routine-last-completed-date') || null; } catch { return null; } });
  const [isDarkMode, setIsDarkMode] = useState(() => { try { return localStorage.getItem('routine-dark-mode') === 'true'; } catch { return false; } });

  useEffect(() => { try { localStorage.setItem('routine-streak', streak); } catch {} }, [streak]);
  useEffect(() => { try { if (lastCompletedDate) localStorage.setItem('routine-last-completed-date', lastCompletedDate); } catch {} }, [lastCompletedDate]);
  useEffect(() => { try { localStorage.setItem('routine-dark-mode', isDarkMode); } catch {} }, [isDarkMode]);

  // Fetch weather
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.8114&longitude=-90.8507&current_weather=true&temperature_unit=fahrenheit')
      .then(res => res.json()).then(data => { if (data.current_weather) setWeather({ temp: data.current_weather.temperature, code: data.current_weather.weathercode }); }).catch(() => {});
  }, []);

  // Fetch birthdays from Supabase on mount
  useEffect(() => { fetchBirthdays(); }, []);

  // Fetch monthly contacts from Supabase on mount
  useEffect(() => { fetchMonthlyContacts(); }, []);

  // Fetch daily routines from Supabase on mount
  useEffect(() => { fetchDailyRoutines(); }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- MIGRATION TOOL ---
  const fetchBirthdays = async () => {
    const { data, error } = await supabase.from('birthdays').select('*');
    if (error) { console.error('Error fetching birthdays:', error); return; }
    if (data) setLiveBirthdays(data);
  };

  const fetchMonthlyContacts = async () => {
    const { data, error } = await supabase.from('monthly_contacts').select('*').order('name');
    if (error) { console.error('Error fetching monthly contacts:', error); return; }
    if (data) setMonthlyContacts(data);
  };

  // Returns today's date as a local YYYY-MM-DD string (avoids UTC timezone shifts)
  const getTodayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Build a flat deduplicated list of all task names from RAW_DATA
  const getAllTaskNames = () => {
    const seen = new Set();
    const rows = [];
    Object.values(RAW_DATA).forEach(dayData => {
      Object.values(dayData).forEach(tasks => {
        tasks.forEach(task => {
          const key = task.trim();
          if (!seen.has(key)) {
            seen.add(key);
            rows.push({ user_id: session.user.id, task_name: task.trim() });
          }
        });
      });
    });
    return rows;
  };

  const seedDailyRoutines = async () => {
    setIsMigrating(true);
    console.log('[RoutineTracker] Seeding daily_routines…');

    // Ensure a profile row exists first (required by FK on daily_routines.user_id)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, email: session.user.email }, { onConflict: 'id' });
    if (profileError) {
      console.warn('[RoutineTracker] Profile upsert warning (may be safe to ignore):', profileError.message);
    }

    const rows = getAllTaskNames();
    const { data, error } = await supabase
      .from('daily_routines')
      .insert(rows)
      .select();
    if (error) {
      console.error('[RoutineTracker] Error seeding daily_routines:', error);
      setIsMigrating(false);
      return;
    }
    console.log('[RoutineTracker] Seeded', data?.length, 'routines.');
    setLiveRoutines(data ?? []);
    await fetchTodayLogs(data ?? []);
    setIsMigrating(false);
  };

  const fetchDailyRoutines = async () => {
    console.log('[RoutineTracker] Fetching daily_routines for user_id:', session.user.id);
    const { data, error } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('user_id', session.user.id);
    if (error) {
      console.error('[RoutineTracker] Error fetching daily routines:', error);
      return;
    }
    console.log('[RoutineTracker] daily_routines returned', data?.length ?? 0, 'rows.');
    if (data && data.length > 0) {
      setLiveRoutines(data);
      await fetchTodayLogs(data);
    } else {
      // Table is empty for this user — auto-seed from RAW_DATA
      console.log('[RoutineTracker] No routines found — auto-seeding from RAW_DATA…');
      await seedDailyRoutines();
    }
  };

  const fetchTodayLogs = async (routines = liveRoutines) => {
    const todayStr = getTodayStr();
    console.log('[RoutineTracker] Fetching logs for date:', todayStr);
    const { data: logs, error } = await supabase
      .from('routine_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('completed_date', todayStr);
    if (error) {
      console.error('[RoutineTracker] Error fetching routine logs:', error);
      return;
    }
    if (logs) {
      console.log('[RoutineTracker] Loaded', logs.length, 'log(s) for today.');
      // Build a lookup: routine_id → log row
      const logsMap = {};
      logs.forEach(log => { logsMap[log.routine_id] = log; });
      setTodayLogs(logsMap);
      // Derive completed task names from logs
      const completedNames = routines
        .filter(r => logsMap[r.id])
        .map(r => r.task_name);
      setCompleted(completedNames);
    }
  };


  const handleToggleContact = async (contact) => {
    // Optimistic: update immediately, then persist to Supabase
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastContacted = contact.last_contacted ? new Date(contact.last_contacted) : null;
    const isAlreadyContacted = lastContacted && lastContacted.getMonth() === currentMonth && lastContacted.getFullYear() === currentYear;

    // If already contacted this month, set to null (uncheck). Otherwise set to now.
    const newValue = isAlreadyContacted ? null : new Date().toISOString();

    // Optimistic UI update
    setMonthlyContacts(prev => prev.map(c => c.id === contact.id ? { ...c, last_contacted: newValue } : c));

    const { error } = await supabase.from('monthly_contacts').update({ last_contacted: newValue }).eq('id', contact.id);
    if (error) {
      console.error('Error updating contact:', error);
      // Revert on failure
      setMonthlyContacts(prev => prev.map(c => c.id === contact.id ? { ...c, last_contacted: contact.last_contacted } : c));
    }
  };




  const handleDayChange = (newDay) => {
    if (newDay !== day) {
      setDay(newDay);
      setWater(0);
      setSectionsCompleted([]);
      // When switching to today, restore completed from logs; otherwise clear
      if (newDay === realToday) {
        const completedNames = liveRoutines
          .filter(r => todayLogs[r.id])
          .map(r => r.task_name);
        setCompleted(completedNames);
      } else {
        setCompleted([]);
      }
    }
  };

  const todayData = RAW_DATA[day] || {};

  // Birthday helpers — use liveBirthdays from Supabase
  const getBirthdayInfo = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const currentMonthName = MONTH_NAMES[currentMonth];

    // Build a lookup from liveBirthdays (expects columns: name, month, day)
    const bdaysByMonth = {};
    MONTH_NAMES.forEach(m => { bdaysByMonth[m] = []; });
    liveBirthdays.forEach(b => {
      const monthKey = b.month; // expects month stored as full name e.g. "January"
      if (bdaysByMonth[monthKey]) bdaysByMonth[monthKey].push(b);
    });

    const todayBdays = (bdaysByMonth[currentMonthName] || []).filter(b => b.day === currentDay);

    const upcoming = [];
    for (let offset = 1; offset <= 7; offset++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + offset);
      const futureMonthName = MONTH_NAMES[futureDate.getMonth()];
      const futureDay = futureDate.getDate();
      const matches = (bdaysByMonth[futureMonthName] || []).filter(b => b.day === futureDay);
      matches.forEach(m => { upcoming.push({ ...m, monthName: futureMonthName, daysUntil: offset }); });
    }
    return { todayBirthdays: todayBdays, upcomingBirthdays: upcoming };
  };

  const { todayBirthdays, upcomingBirthdays } = getBirthdayInfo();

  const totalTasks = useMemo(() => Object.values(todayData).flat().length + (WATER_GOAL / WATER_INCREMENT), [todayData]);
  const currentProgress = useMemo(() => {
    const taskPoints = completed.length;
    const waterPoints = Math.floor(water / WATER_INCREMENT);
    return Math.round(((taskPoints + waterPoints) / totalTasks) * 100);
  }, [completed, water, totalTasks]);

  useEffect(() => {
    if (currentProgress < 100) return;
    const todayStr = getTodayStr();
    if (lastCompletedDate === todayStr) return;
    // Compute yesterday in local time to correctly detect consecutive streaks
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yy = yesterday.getFullYear();
    const ym = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yd = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yy}-${ym}-${yd}`;
    const newStreak = lastCompletedDate === yesterdayStr ? streak + 1 : 1;
    setStreak(newStreak); setLastCompletedDate(todayStr);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#f97316', '#ef4444', '#eab308', '#dc2626', '#f59e0b', '#fbbf24'] });
  }, [currentProgress]);

  const handleToggle = async (task) => {
    const isCompleting = !completed.includes(task);
    // Try exact match first, then trimmed match (RAW_DATA has some trailing spaces like "Stretch ")
    const routine = liveRoutines.find(r => r.task_name === task) ||
                    liveRoutines.find(r => r.task_name.trim() === task.trim());
    if (!routine) {
      console.warn('[RoutineTracker] No routine found in liveRoutines for task:', JSON.stringify(task));
      console.warn('[RoutineTracker] Available task_names:', liveRoutines.map(r => JSON.stringify(r.task_name)));
      // liveRoutines is empty — likely DB not seeded for this user. Bail gracefully.
      return;
    }

    const todayStr = getTodayStr();

    // Optimistic UI update — happens immediately, before the async request
    setCompleted(prev => isCompleting ? [...prev, task] : prev.filter(t => t !== task));

    if (isCompleting) {
      // Check for an existing log first to avoid duplicate-key errors
      const { data: existing, error: checkError } = await supabase
        .from('routine_logs')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('routine_id', routine.id)
        .eq('completed_date', todayStr)
        .maybeSingle();

      if (checkError) {
        console.error('[RoutineTracker] Error checking for existing log:', checkError);
        // Revert optimistic update
        setCompleted(prev => prev.filter(t => t !== task));
        return;
      }

      if (existing) {
        // Log already exists — just update local state to reflect it
        console.log('[RoutineTracker] Log already exists for routine:', routine.id, '— skipping insert.');
        setTodayLogs(prev => ({ ...prev, [routine.id]: existing }));
        return;
      }

      // INSERT a new log row
      const newLog = { user_id: session.user.id, routine_id: routine.id, completed_date: todayStr };
      setTodayLogs(prev => ({ ...prev, [routine.id]: newLog }));

      const { data, error } = await supabase
        .from('routine_logs')
        .insert(newLog)
        .select()
        .single();

      if (error) {
        console.error('[RoutineTracker] Error inserting routine log:', error);
        // Revert optimistic update
        setCompleted(prev => prev.filter(t => t !== task));
        setTodayLogs(prev => { const next = { ...prev }; delete next[routine.id]; return next; });
      } else {
        // Store the real row (with server-generated id) in our local cache
        setTodayLogs(prev => ({ ...prev, [routine.id]: data }));
        console.log('[RoutineTracker] Log inserted for routine:', routine.id, 'date:', todayStr);
      }
    } else {
      // DELETE the existing log row
      const existingLog = todayLogs[routine.id];
      setTodayLogs(prev => { const next = { ...prev }; delete next[routine.id]; return next; });

      const { error } = await supabase
        .from('routine_logs')
        .delete()
        .eq('user_id', session.user.id)
        .eq('routine_id', routine.id)
        .eq('completed_date', todayStr);

      if (error) {
        console.error('[RoutineTracker] Error deleting routine log:', error);
        // Revert optimistic update
        setCompleted(prev => [...prev, task]);
        if (existingLog) setTodayLogs(prev => ({ ...prev, [routine.id]: existingLog }));
      } else {
        console.log('[RoutineTracker] Log deleted for routine:', routine.id, 'date:', todayStr);
      }
    }
  };

  const handleBibleMarkRead = () => {
    setIsBibleModalOpen(false);
    setCompleted(prev => prev.includes('Bible Reading') ? prev : [...prev, 'Bible Reading']);
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 }, colors: ['#3b82f6', '#60a5fa', '#fbbf24', '#f59e0b', '#1d4ed8', '#eab308'] });
  };

  const handleBirthdayReviewComplete = () => {
    setIsBirthdayModalOpen(false);
    setCompleted(prev => prev.includes('Birthday List') ? prev : [...prev, 'Birthday List']);
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 }, colors: ['#ec4899', '#d946ef', '#a855f7', '#fbbf24', '#f59e0b', '#f472b6'] });
  };

  useEffect(() => {
    Object.entries(todayData).forEach(([section, tasks]) => {
      const isAllDone = tasks.every(t => completed.includes(t));
      if (isAllDone && !sectionsCompleted.includes(section)) {
        setSectionsCompleted(prev => [...prev, section]);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#A7E92F', '#3ABEF9', '#FFCF25'] });
      } else if (!isAllDone && sectionsCompleted.includes(section)) {
        setSectionsCompleted(prev => prev.filter(s => s !== section));
      }
    });
  }, [completed, todayData, sectionsCompleted]);

  const addWater = () => { if (water < WATER_GOAL) { setWater(prev => Math.min(prev + WATER_INCREMENT, WATER_GOAL)); if (water + WATER_INCREMENT === WATER_GOAL) confetti({ particleCount: 150, velocity: 30, colors: ['#3ABEF9'] }); } };

  const bgGradient = isDarkMode ? 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)' : 'linear-gradient(to bottom right, #e0f2fe, #eef2ff, #fff7ed)';
  const dotColor = isDarkMode ? '%23334155' : '%23e8e4dd';
  const dotOpacity = isDarkMode ? 0.3 : 0.4;

  // Show a loading screen while auto-seeding on first launch
  if (isMigrating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans" style={{ background: bgGradient }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-lime-500 flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_0_#65a30d]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Sun size={32} className="text-white" />
            </motion.div>
          </div>
          <p className={`font-black text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Setting up your routines…</p>
          <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>One-time setup, just a moment!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-10 font-sans relative transition-colors duration-500" style={{ background: bgGradient }}>
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: dotOpacity, backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='${dotColor}'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat' }} />
      <ProgressBar progress={currentProgress} isDarkMode={isDarkMode} />
      <main className="relative max-w-md mx-auto px-3 sm:px-4 overflow-x-hidden">
        <header className="mb-4 px-1 sm:px-2">
          {/* Top row: Title + Dark Mode + Logout */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-orange-500 font-black uppercase tracking-widest text-xs sm:text-sm">{ day === realToday ? "Today's Routine" : `${day}'s Routine`}</p>
              <h1 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{day}</h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <DarkModeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(prev => !prev)} />
              <motion.button id="logout-btn" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 font-black cursor-pointer transition-colors duration-300"
                style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#475569' : '#e2e8f0',
                  boxShadow: isDarkMode ? '0 4px 0 0 #0f172a' : '0 4px 0 0 #f1f5f9', color: isDarkMode ? '#f87171' : '#ef4444' }}
                aria-label="Log out">
                <LogOut size={18} />
              </motion.button>
            </div>
          </div>

          {/* Bottom row: Weather + Progress + Streak */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <WeatherWidget weather={weather} isDarkMode={isDarkMode} />
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex items-center transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_4px_0_0_#0f172a]' : 'bg-white border-slate-100 shadow-[0_4px_0_0_#f1f5f9]'}`}>
              <Trophy className="text-yellow-400 mr-1.5 sm:mr-2" fill="currentColor" size={18} />
              <span className={`font-black text-sm sm:text-base ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>{currentProgress}%</span>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex items-center gap-1 sm:gap-1.5 transition-colors duration-300 ${
              isDarkMode ? 'bg-orange-950/60 border-orange-800 shadow-[0_4px_0_0_#431407]' : 'bg-orange-50 border-orange-200 shadow-[0_4px_0_0_#fed7aa]'}`}>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
                <Flame size={18} className={isDarkMode ? 'text-orange-400' : 'text-orange-500'} fill="currentColor" strokeWidth={1.5} />
              </motion.div>
              <span className={`font-black text-sm sm:text-lg leading-none ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>{streak}</span>
            </div>
          </div>

          {/* View Toggle: Daily Tracker ↔ Progress History */}
          <div className={`flex mt-4 rounded-xl sm:rounded-2xl border-2 overflow-hidden transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <motion.button
              id="view-tracker-btn"
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView('tracker')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 font-black text-xs sm:text-sm cursor-pointer transition-all duration-200 ${
                activeView === 'tracker'
                  ? 'bg-lime-500 text-white shadow-[0_3px_0_0_#65a30d]'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ClipboardList size={16} />
              Daily Tracker
            </motion.button>
            <motion.button
              id="view-progress-btn"
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView('progress')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 font-black text-xs sm:text-sm cursor-pointer transition-all duration-200 ${
                activeView === 'progress'
                  ? 'bg-violet-500 text-white shadow-[0_3px_0_0_#6d28d9]'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart3 size={16} />
              Progress
            </motion.button>
          </div>
        </header>

        {activeView === 'tracker' ? (
          <>
            <DaySelector selectedDay={day} realToday={realToday} onSelect={handleDayChange} isDarkMode={isDarkMode} />
            <WaterGlass amount={water} onAdd={addWater} isDarkMode={isDarkMode} />

            {todayData.Morning && (
              <RoutineGroup title="Morning" icon={Sun} color="bg-orange-400" tasks={todayData.Morning} completedTasks={completed}
                onToggle={handleToggle} onBibleReading={() => setIsBibleModalOpen(true)} isDarkMode={isDarkMode} />
            )}
            {todayData["Daily Briefing"] && (
              <RoutineGroup title="Daily Briefing" icon={Briefcase} color="bg-sky-500" tasks={todayData["Daily Briefing"]} completedTasks={completed}
                onToggle={handleToggle} onBirthdayList={() => setIsBirthdayModalOpen(true)} isDarkMode={isDarkMode} />
            )}
            {day === 'Saturday' && todayData["Weekly Review"] && (
              <RoutineGroup title="Weekly Review" icon={Calendar} color="bg-purple-500" tasks={todayData["Weekly Review"]} completedTasks={completed}
                onToggle={handleToggle} isDarkMode={isDarkMode} />
            )}
            {todayData["Evening Prep"] && (
              <RoutineGroup title="Evening Prep" icon={Moon} color="bg-indigo-600" tasks={todayData["Evening Prep"]} completedTasks={completed}
                onToggle={handleToggle} isDarkMode={isDarkMode} />
            )}

            {/* Communication Tracker + Birthday List trigger buttons */}
            <div className="flex gap-2 sm:gap-3 mb-8 sm:mb-10">
              <motion.button id="birthday-list-btn" whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
                onClick={() => setIsBirthdayModalOpen(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg cursor-pointer border-2 transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-pink-950/50 border-pink-800 text-pink-300 shadow-[0_4px_0_0_#831843] sm:shadow-[0_6px_0_0_#831843]'
                    : 'bg-gradient-to-br from-pink-50 to-fuchsia-50 border-pink-200 text-pink-600 shadow-[0_4px_0_0_#fbcfe8] sm:shadow-[0_6px_0_0_#fbcfe8]'
                }`}>
                🎂 Birthdays
              </motion.button>
              <motion.button id="comms-tracker-btn" whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
                onClick={() => setShowContacts(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg cursor-pointer border-2 transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-violet-950/50 border-violet-800 text-violet-300 shadow-[0_4px_0_0_#4c1d95] sm:shadow-[0_6px_0_0_#4c1d95]'
                    : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-200 text-violet-600 shadow-[0_4px_0_0_#ddd6fe] sm:shadow-[0_6px_0_0_#ddd6fe]'
                }`}>
                📞 Comms
              </motion.button>
            </div>
          </>
        ) : (
          <ProgressHistory session={session} isDarkMode={isDarkMode} />
        )}


        <div className="h-10" />
      </main>

      <AnimatePresence>
        {currentProgress === 100 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-0 w-full px-6 z-40">
            <div className="bg-lime-500 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between font-black">
              <span>DAY COMPLETE! 🌟</span>
              <button onClick={() => window.location.reload()} className="bg-white text-lime-600 px-4 py-2 rounded-xl text-sm">Reset</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BibleReadingModal isOpen={isBibleModalOpen} onClose={() => setIsBibleModalOpen(false)} onMarkRead={handleBibleMarkRead} isDarkMode={isDarkMode} />
      <BirthdayModal isOpen={isBirthdayModalOpen} onClose={() => setIsBirthdayModalOpen(false)} onReviewComplete={handleBirthdayReviewComplete}
        isDarkMode={isDarkMode} todayBirthdays={todayBirthdays} upcomingBirthdays={upcomingBirthdays} />
      <CommunicationTrackerModal isOpen={showContacts} onClose={() => setShowContacts(false)}
        contacts={monthlyContacts} onToggleContact={handleToggleContact} isDarkMode={isDarkMode} />
    </div>
  );
}
