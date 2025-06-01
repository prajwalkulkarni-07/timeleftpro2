import React, { useContext } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { motion } from 'framer-motion';
import { BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { format, getDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isFuture, isToday, isPast } from 'date-fns'; // Added isFuture, isToday, isPast
import { formatMinutesToHoursAndMinutes } from '../../utils/timeUtils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const Analytics = () => {
  const { state } = useAppContext();
  
  // Calculate task statistics
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Task category distribution data
  const categories = ['Work', 'Personal', 'Health', 'Learning'];
  const categoryCounts = categories.map(cat => state.tasks.filter(t => t.category === cat.toLowerCase()).length);
  const totalCategorizedTasks = categoryCounts.reduce((sum, count) => sum + count, 0);

  const categoryData = {
    labels: categories,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: [
          'rgba(76, 201, 240, 0.8)', // Work
          'rgba(72, 199, 142, 0.8)', // Personal
          'rgba(255, 105, 97, 0.8)',  // Health
          'rgba(255, 186, 73, 0.8)'   // Learning
        ],
        borderWidth: 1,
        borderColor: 'rgba(31, 41, 55, 1)'
      }
    ]
  };

  // Weekly productivity data
  const today = new Date();
  const weekStartsOn = state.settings?.preferences?.startOfWeek === 0 ? 0 : 1; 
  const currentWeekStart = startOfWeek(today, { weekStartsOn });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn });
  const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const dailyTaskCounts = Array(7).fill(0); // Added back the declaration
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const displayDayLabels = weekStartsOn === 0 ? ['Sun', ...dayLabels.slice(0,6)] : dayLabels;

  state.tasks.forEach(task => {
    if (task.completed && task.completedAt) {
      const completedDate = parseISO(task.completedAt);
      if (completedDate >= currentWeekStart && completedDate <= currentWeekEnd) {
        let dayIndex = getDay(completedDate); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        // Adjust index if week starts on Monday for the array
        if (weekStartsOn === 1) { // Monday is start of week
            dayIndex = (dayIndex === 0) ? 6 : dayIndex - 1; // Sun becomes 6, Mon becomes 0
        }
        // For a Sunday start, dayIndex is already correct (0 for Sun, 1 for Mon etc.)
        if (dayIndex >= 0 && dayIndex < 7) {
            dailyTaskCounts[dayIndex]++;
        }
      }
    }
  });

  const weeklyData = {
    labels: displayDayLabels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: dailyTaskCounts,
        backgroundColor: 'rgba(125, 135, 255, 0.8)'
      }
    ]
  };

  // Daily focus time data for the last 7 days
  const dailyFocusTimeData = {
    labels: displayDayLabels,
    datasets: [
      {
        label: 'Focus Time (minutes)',
        data: daysInWeek.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          let totalFocusForDay = 0;
          if (state.focusSessions && state.focusSessions.length > 0) {
            state.focusSessions.forEach(session => {
              if (session.completed && session.endTime) {
                const sessionEndDate = parseISO(session.endTime);
                if (format(sessionEndDate, 'yyyy-MM-dd') === dayStr) {
                  totalFocusForDay += session.duration;
                }
              }
            });
          }
          return totalFocusForDay;
        }),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ]
  };

  const habitsWithCalendarData = state.habits.map(habit => {
    const dailyStatus = daysInWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const completed = habit.completedDates.includes(dayStr);
      const habitCreatedAt = habit.createdAt ? parseISO(habit.createdAt) : new Date(0); // Handle undefined createdAt
      return { date: day, completed, habitCreatedAt }; // Return date object, completion status, and habit creation date
    });
    return { ...habit, dailyStatus };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <BarChart2 className="h-5 w-5 text-indigo-400" />
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Completion Rate</p>
          <p className="text-xl font-bold">{completionRate}%</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Tasks Pending</p>
          <p className="text-xl font-bold">{pendingTasks}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Focus Time</p>
          <p className="text-xl font-bold">{formatMinutesToHoursAndMinutes(state.analytics.totalFocusTime)}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Productivity</p>
          <p className="text-xl font-bold">{state.analytics.productivityScore}</p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Task Distribution Chart */}
        <div className="w-full md:w-1/2">
          <h3 className="text-sm font-medium mb-2">Task Distribution</h3>
          <div className="bg-gray-800 p-3 rounded-lg" style={{ height: '320px' }}>
            <Doughnut 
              data={categoryData} 
              options={{
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    display: false, // Remove legend as requested
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed !== null) {
                          const value = context.parsed;
                          const percentage = totalCategorizedTasks > 0 ? ((value / totalCategorizedTasks) * 100).toFixed(1) : 0;
                          label += `${value} tasks (${percentage}%)`;
                        }
                        return label;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Weekly Progress Chart */}
        <div className="w-full md:w-1/2">
          <h3 className="text-sm font-medium mb-2">Weekly Progress</h3>
          <div className="bg-gray-800 p-3 rounded-lg" style={{ height: '320px' }}>
            <Bar 
              data={weeklyData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: {
                        size: 10
                      }
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: {
                        size: 10
                      }
                    },
                    grid: {
                      display: false
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* New Charts Row */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Daily Focus Time Chart */}
        <div className="w-full md:w-1/2">
          <h3 className="text-sm font-medium mb-2">Daily Focus Time (Last 7 Days)</h3>
          <div className="bg-gray-800 p-3 rounded-lg" style={{ height: '320px' }}>
            <Line 
              data={dailyFocusTimeData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Minutes', color: 'rgba(255, 255, 255, 0.7)', font: {size: 12}}, // Increased font size
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: {size: 12}}, // Increased font size
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: {size: 12}}, // Increased font size
                    grid: { display: false }
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>
        </div>

        {/* Habit Consistency Calendar Grid */}
        <div className="w-full md:w-1/2">
          <h3 className="text-sm font-medium mb-2">Habit Consistency (Last 7 Days)</h3>
          <div className="bg-gray-800 p-3 rounded-lg" style={{ minHeight: '320px' }}>
            {state.habits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr>
                      <th className="py-2 px-2 font-semibold text-gray-300">Habit</th>
                      {displayDayLabels.map(dayLabel => (
                        <th key={dayLabel} className="py-2 px-2 text-center font-semibold text-gray-300">{dayLabel.charAt(0)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {habitsWithCalendarData.map(habit => (
                      <tr key={habit.id}>
                        <td className="py-2 px-2 whitespace-nowrap text-gray-200">{habit.name}</td>
                        {habit.dailyStatus.map((status, index) => {
                          const dayIsPast = isPast(status.date) && !isToday(status.date);
                          const dayIsToday = isToday(status.date);
                          const dayIsAfterCreation = status.date >= status.habitCreatedAt;

                          return (
                            <td key={index} className="py-2 px-2 text-center">
                              {status.completed && dayIsAfterCreation ? 
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> :
                                (dayIsPast && !status.completed && dayIsAfterCreation ? 
                                  <XCircle className="h-5 w-5 text-red-500 mx-auto" /> :
                                  null // Empty for future days, today (if not completed), or days before habit creation
                                )
                              }
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Habits Tracked
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;