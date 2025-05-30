import { format } from 'date-fns';
import { calculateTimeProgress } from '../utils/timeUtils';

export const initialState = {
  currentTime: new Date(),
  currentDateForAnalyticsReset: format(new Date(), 'yyyy-MM-dd'),
  timeProgress: {
    day: 0,
    week: 0,
    month: 0,
    year: 0
  },
  tasks: [], // Each task: { id, title, ..., estPomodoros, completedPomodoros, estDeepSessions, completedDeepSessions }
  focusSessions: [],
  habits: [],
  settings: {
    notifications: true,
    preferences: {
      startOfWeek: 1,
      startOfDay: 9,
      endOfDay: 17
    }
  },
  analytics: {
    productivityScore: 0,
    dailyStats: {}, // This could store daily completed pomodoros, deep work, breaks
    weeklyTrends: {},
    completedTasks: 0,
    totalFocusTime: 0 // Consolidated focus time (Pomodoro + Deep Work)
  },
  activeTimers: {
    focusTimer: null,
    taskTimers: {}
  }
};

const calculateProductivityScore = (tasks, totalFocusTimeInMinutes, habits) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const taskCompletionFactor = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

  // Assuming a target of 4 hours (240 minutes) of focus time per day for full score contribution
  const focusTimeFactor = Math.min(1, totalFocusTimeInMinutes / 240);

  const totalHabits = habits.length;
  const today = format(new Date(), 'yyyy-MM-dd');
  const completedHabitsToday = habits.filter(habit => habit.completedDates.includes(today)).length;
  const habitCompletionFactor = totalHabits > 0 ? (completedHabitsToday / totalHabits) : 0;

  // Weighted score: Tasks 50%, Focus 30%, Habits 20%
  const score = (taskCompletionFactor * 50) + (focusTimeFactor * 30) + (habitCompletionFactor * 20);
  return Math.round(score);
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_TIME':
      const now = new Date();
      const todayString = format(now, 'yyyy-MM-dd');
      let newTotalFocusTime = state.analytics.totalFocusTime;
      let newDailyStats = state.analytics.dailyStats;

      if (state.currentDateForAnalyticsReset !== todayString) {
        newTotalFocusTime = 0; // Reset focus time for the new day
        // Optionally, you might want to archive yesterday's stats or reset other daily metrics here
        // For now, just resetting totalFocusTime as per the requirement.
      }

      return {
        ...state,
        currentTime: now,
        timeProgress: calculateTimeProgress(now, state.settings.preferences),
        currentDateForAnalyticsReset: todayString, // Update the stored date
        analytics: {
          ...state.analytics,
          totalFocusTime: newTotalFocusTime,
          // dailyStats might need updating if you decide to archive/reset it too
        }
      };

    case 'ADD_TASK':
      const newTask = {
        ...action.payload,
        estPomodoros: action.payload.estPomodoros || 0,
        completedPomodoros: 0,
        estDeepSessions: action.payload.estDeepSessions || 0,
        completedDeepSessions: 0,
      };
      const newTasksAdd = [...state.tasks, newTask];
      return {
        ...state,
        tasks: newTasksAdd,
        analytics: {
          ...state.analytics,
          productivityScore: calculateProductivityScore(newTasksAdd, state.analytics.totalFocusTime, state.habits)
        }
      };
      
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      };

    case 'DELETE_TASK':
      const newTasksDelete = state.tasks.filter(task => task.id !== action.payload);
      return {
        ...state,
        tasks: newTasksDelete,
        analytics: {
          ...state.analytics,
          productivityScore: calculateProductivityScore(newTasksDelete, state.analytics.totalFocusTime, state.habits)
        }
      };

    case 'TOGGLE_TASK_COMPLETE':
      const updatedTasksToggle = state.tasks.map(task => {
        if (task.id === action.payload) {
          const newCompletedStatus = !task.completed;
          return {
            ...task,
            completed: newCompletedStatus,
            completedAt: newCompletedStatus ? new Date().toISOString() : null
          };
        }
        return task;
      });
      return {
        ...state,
        tasks: updatedTasksToggle,
        analytics: {
          ...state.analytics,
          productivityScore: calculateProductivityScore(updatedTasksToggle, state.analytics.totalFocusTime, state.habits)
        }
      };

    case 'UPDATE_TASK_FOCUS_PROGRESS':
      // payload: { taskId, type: 'pomodoro' | 'deepSession' }
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.taskId) {
            if (action.payload.type === 'pomodoro') {
              return { ...task, completedPomodoros: (task.completedPomodoros || 0) + 1 };
            }
            if (action.payload.type === 'deepSession') {
              return { ...task, completedDeepSessions: (task.completedDeepSessions || 0) + 1 };
            }
          }
          return task;
        })
      };

    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, action.payload]
      };

    case 'COMPLETE_HABIT':
      const today = format(new Date(), 'yyyy-MM-dd');
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload
            ? {
                ...habit,
                completedDates: habit.completedDates.includes(today)
                  ? habit.completedDates.filter(date => date !== today)
                  : [...habit.completedDates, today],
                streak: habit.completedDates.includes(today)
                  ? habit.streak - 1
                  : habit.streak + 1
              }
            : habit
        )
      };
      // Note: When a habit is completed, productivity score should also be updated.
      // This part is a bit tricky as COMPLETE_HABIT is already complex.
      // For simplicity, we'll update it here directly. A more robust solution might involve an UPDATE_ANALYTICS action.
      const updatedHabitsComplete = state.habits.map(habit =>
        habit.id === action.payload
          ? {
              ...habit,
              completedDates: habit.completedDates.includes(today)
                ? habit.completedDates.filter(date => date !== today)
                : [...habit.completedDates, today],
              streak: habit.completedDates.includes(today)
                ? habit.streak - 1
                : habit.streak + 1
            }
          : habit
      );
      return {
        ...state,
        habits: updatedHabitsComplete,
        analytics: {
          ...state.analytics,
          productivityScore: calculateProductivityScore(state.tasks, state.analytics.totalFocusTime, updatedHabitsComplete)
        }
      };

    case 'LOG_FOCUS_SESSION':
      // Ensure payload, duration, and sessionDetails are valid
      if (!action.payload || 
          typeof action.payload.duration !== 'number' || 
          action.payload.duration < 0 || 
          !action.payload.sessionDetails) {
        console.warn('LOG_FOCUS_SESSION: Invalid payload, duration, or sessionDetails', action.payload);
        return state; // Return current state if payload is invalid
      }

      const { duration, sessionDetails } = action.payload;
      const newFocusSessions = [...state.focusSessions, sessionDetails];

      // Only update totalFocusTime and productivityScore for non-break sessions
      if (!sessionDetails.isBreak) {
        const newTotalFocusTime = (state.analytics.totalFocusTime || 0) + duration;
        return {
          ...state,
          focusSessions: newFocusSessions,
          analytics: {
            ...state.analytics,
            totalFocusTime: newTotalFocusTime,
            productivityScore: calculateProductivityScore(state.tasks, newTotalFocusTime, state.habits)
          }
        };
      } else {
        // For break sessions, just add to the log without affecting score or total focus time
        return {
          ...state,
          focusSessions: newFocusSessions
        };
      }

    case 'START_FOCUS_SESSION':
      return {
        ...state,
        activeTimers: {
          ...state.activeTimers,
          focusTimer: action.payload
        }
      };

    case 'END_FOCUS_SESSION':
      const session = {
        ...state.activeTimers.focusTimer,
        endTime: new Date(),
        completed: true
      };

      return {
        ...state,
        focusSessions: [...state.focusSessions, session],
        activeTimers: {
          ...state.activeTimers,
          focusTimer: null
        },
        analytics: {
          ...state.analytics,
          totalFocusTime: state.analytics.totalFocusTime + (session.duration || 0)
        }
      };

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit => 
          habit.id === action.payload.id ? action.payload : habit
        ),
        analytics: {
          ...state.analytics,
          productivityScore: calculateProductivityScore(state.tasks, state.analytics.totalFocusTime, 
            state.habits.map(habit => habit.id === action.payload.id ? action.payload : habit))
        }
      };

    case 'DELETE_HABIT':
      const updatedHabits = state.habits.filter(habit => habit.id !== action.payload);
      return {
        ...state,
        habits: updatedHabits,
        analytics: {
          ...state.analytics,
          productivityScore: calculateProductivityScore(state.tasks, state.analytics.totalFocusTime, updatedHabits)
        }
      };

    default:
      return state;
  }
};