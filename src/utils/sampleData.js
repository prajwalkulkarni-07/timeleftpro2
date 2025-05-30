import { format, subDays } from 'date-fns';
import { calculateTimeProgress } from './timeUtils';

export const generateSampleData = () => {
  const now = new Date();
  
  // Generate sample tasks
  const sampleTasks = [];
  
  // Generate sample habits
  const generateCompletedDates = (streak) => {
    const dates = [];
    for (let i = 0; i < streak; i++) {
      dates.push(format(subDays(now, i), 'yyyy-MM-dd'));
    }
    return dates;
  };
  
  const sampleHabits = [];
  
  // Generate sample focus sessions
  const sampleFocusSessions = [
    {
      id: '1',
      type: 'pomodoro',
      duration: 25,
      startTime: subDays(now, 1).toISOString(),
      endTime: new Date(new Date(subDays(now, 1)).getTime() + 25 * 60 * 1000).toISOString(),
      completed: true,
      notes: 'Worked on project plan'
    },
    {
      id: '2',
      type: 'deepWork',
      duration: 90,
      startTime: subDays(now, 2).toISOString(),
      endTime: new Date(new Date(subDays(now, 2)).getTime() + 90 * 60 * 1000).toISOString(),
      completed: true,
      notes: 'Completed code review'
    }
  ];
  
  // Generate sample analytics
  const sampleAnalytics = {
    productivityScore: 0,
    dailyStats: {
      [format(subDays(now, 1), 'yyyy-MM-dd')]: {
        tasksCompleted: 3,
        focusTime: 120,
        score: 82
      },
      [format(subDays(now, 2), 'yyyy-MM-dd')]: {
        tasksCompleted: 5,
        focusTime: 180,
        score: 88
      }
    },
    weeklyTrends: {
      [format(subDays(now, 7), 'yyyy-MM-dd')]: {
        tasksCompleted: 18,
        focusTime: 720,
        score: 84
      }
    },
    completedTasks: 1,
    totalFocusTime: 0
  };
  
  return {
    currentTime: now,
    timeProgress: calculateTimeProgress(now),
    tasks: sampleTasks,
    focusSessions: sampleFocusSessions,
    habits: sampleHabits,
    settings: {
      theme: 'dark',
      timerPresets: {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
        deepWork: 90
      },
      notifications: true,
      preferences: {
        startOfWeek: 1, // Monday
        startOfDay: 9, // 9 AM
        endOfDay: 17 // 5 PM
      }
    },
    analytics: sampleAnalytics,
    activeTimers: {
      focusTimer: null,
      taskTimers: {}
    }
  };
};