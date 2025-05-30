import React, { useState, useEffect, useContext } from 'react';
import { useAppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, StopCircle, Zap, Coffee, Brain } from 'lucide-react';
import CircularProgress from '../ui/CircularProgress';

// Define timer modes and settings
const modes = {
  pomodoro: { label: 'Pomodoro', time: 25 * 60, icon: <Zap className="h-5 w-5" />, color: 'rgba(255, 105, 97, 0.8)' },
  shortBreak: { label: 'Short Break', time: 5 * 60, icon: <Coffee className="h-5 w-5" />, color: 'rgba(76, 201, 240, 0.8)' },
  deepWork: { label: 'Deep Work', time: 90 * 60, icon: <Brain className="h-5 w-5" />, color: 'rgba(125, 135, 255, 0.8)' }
};

const FocusTimer = () => {
  const { dispatch } = useAppContext();
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(modes.pomodoro.time);
  const [totalTime, setTotalTime] = useState(modes.pomodoro.time);
  const [isActive, setIsActive] = useState(false);

  // Request Notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  // Reset timer when mode changes
  useEffect(() => {
    if (isActive) {
      // If timer is active and mode changes, log elapsed time of old mode before switching
      const elapsedTime = totalTime - timeLeft;
      logSession(elapsedTime);
    }
    const newTime = modes[timerMode].time;
    setTimeLeft(newTime);
    setTotalTime(newTime);
    setIsActive(false);
  }, [timerMode]); // Removed dispatch from dependencies as logSession handles it

  // Countdown logic
  useEffect(() => {
    if (!isActive) return;
    const start = Date.now();
    const end = start + timeLeft * 1000;
    let rafId;
  
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((end - now) / 1000));
      setTimeLeft(remaining);
  
      if (remaining > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        setIsActive(false);
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        audio.play().catch(console.error);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Timer Completed', { body: `Your ${modes[timerMode].label} session has finished.` });
        }
        logSession(totalTime); // Log full session duration on natural completion
      }
    };
  
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isActive, timerMode, timeLeft, totalTime]); // Added timeLeft and totalTime, removed dispatch

  const formatTime = secs => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleTimer = () => setIsActive(active => !active);
  const logSession = (durationInSeconds) => {
    if (durationInSeconds <= 0) return; // Don't log zero or negative duration
    
    dispatch({
      type: 'LOG_FOCUS_SESSION',
      payload: {
        duration: durationInSeconds / 60, // Convert seconds to minutes
        sessionDetails: {
          mode: timerMode,
          label: modes[timerMode].label,
          completedAt: new Date().toISOString(),
          duration: durationInSeconds / 60,
          isPartial: timeLeft > 0, // Mark as partial if timer wasn't completed
          isBreak: timerMode === 'shortBreak' // Add a flag to identify break sessions
        }
      }
    });
  };

  const resetTimer = () => {
    if (isActive) {
      // If timer is active and reset is hit, consider it a stop and log elapsed time
      const elapsedTime = totalTime - timeLeft;
      logSession(elapsedTime);
    }
    setTimeLeft(modes[timerMode].time);
    setTotalTime(modes[timerMode].time); // Ensure totalTime is also reset
    setIsActive(false);
  };

  const stopTimerAndLog = () => {
    if (isActive) {
      setIsActive(false);
      const elapsedTime = totalTime - timeLeft;
      logSession(elapsedTime);
    }
    // Reset to full time of current mode after stopping
    setTimeLeft(modes[timerMode].time);
    setTotalTime(modes[timerMode].time);
  };

  const current = modes[timerMode];
  const isBreak = timerMode === 'shortBreak';
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="card p-6">
      <div className="flex justify-center mb-8">
        <div className="flex gap-4 bg-gray-800 p-2 rounded-lg">
          {Object.entries(modes).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => setTimerMode(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                timerMode === key ? 'bg-indigo-600' : 'hover:bg-gray-700'
              }`}
            >
              {mode.icon}
              <span className="text-sm">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold">{current.label}</h3>
          <p className="text-gray-400 text-sm mt-1">
            {isBreak ? 'Break Time' : 'Focus Session'} • {formatTime(timeLeft)}
          </p>
        </div>

        <div className="relative w-48 h-48 mb-6">
          {/* Hide default label and draw progress ring only */}
          <CircularProgress
            percentage={progress}
            size={192}
            strokeWidth={12}
            color={isBreak ? modes.shortBreak.color : current.color}
            showLabel={false}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Main timer */}
            <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
            {/* Custom percentage below timer */}
            <span className="text-sm text-gray-400 mt-1">{Math.round(progress)}%</span>
            {/* Session label */}
            <span className="text-xs text-gray-500 mt-1">{isBreak ? 'Break' : 'Focus'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTimer} className="p-4 bg-indigo-600 hover:bg-indigo-700 rounded-full">
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.button>
        {isActive && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={stopTimerAndLog} className="p-4 bg-red-600 hover:bg-red-700 rounded-full">
            <StopCircle className="h-6 w-6" />
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={resetTimer} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full">
          <RotateCcw className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
};

export default FocusTimer;