import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, RadialLinearScale, Filler } from 'chart.js';
import { Doughnut, Bar, Line, Radar } from 'react-chartjs-2';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, getDay, parseISO } from 'date-fns';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, RadialLinearScale, Filler);

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
  // Assuming week starts on Monday (1 for getDay, date-fns uses 0 for Sunday, 1 for Monday)
  const weekStartsOn = state.settings?.preferences?.startOfWeek === 0 ? 0 : 1; 
  const currentWeekStart = startOfWeek(today, { weekStartsOn });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn });
  const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const dailyTaskCounts = Array(7).fill(0);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Adjust labels if week starts on Sunday
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

  // Habit consistency data (Radar Chart)
  const habitNames = state.habits.map(h => h.name);
  const habitCompletionPercentages = state.habits.map(habit => {
    const totalPossibleCompletions = daysInWeek.length; // Assuming we track for the current week
    const actualCompletions = daysInWeek.filter(day => 
      habit.completedDates.includes(format(day, 'yyyy-MM-dd'))
    ).length;
    return totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0;
  });

  const habitRadarData = {
    labels: habitNames.length > 0 ? habitNames : ['No Habits Tracked'],
    datasets: [
      {
        label: 'Completion %',
        data: habitNames.length > 0 ? habitCompletionPercentages : [0],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };
  
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
          <p className="text-xl font-bold">{Math.round(state.analytics.totalFocusTime / 60)}h</p>
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
                    title: { display: true, text: 'Minutes', color: 'rgba(255, 255, 255, 0.7)', font: {size: 10}},
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: {size: 10}},
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)', font: {size: 10}},
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

        {/* Habit Consistency Chart */}
        <div className="w-full md:w-1/2">
          <h3 className="text-sm font-medium mb-2">Habit Consistency (Last 7 Days)</h3>
          <div className="bg-gray-800 p-3 rounded-lg" style={{ height: '320px' }}>
            {state.habits.length > 0 ? (
              <Radar 
                data={habitRadarData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                      grid: { color: 'rgba(255, 255, 255, 0.2)' },
                      pointLabels: { font: { size: 10 }, color: 'rgba(255, 255, 255, 0.7)' },
                      ticks: { backdropColor: 'transparent', color: 'rgba(255,255,255,0.7)', font: {size: 8}, stepSize: 20, max: 100, min: 0 },
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
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