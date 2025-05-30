import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Calendar, BarChart2, ArrowRight } from 'lucide-react';
import TimeProgress from '../time/TimeProgress';
import { useAppContext } from '../../context/AppContext';

const Dashboard = () => {
  const { state } = useAppContext();
  
  // Calculate summary data
  const completedTasks = state.tasks.filter(task => task.completed).length;
  const totalTasks = state.tasks.length;
  const completedHabits = state.habits.filter(habit => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  }).length;
  const totalHabits = state.habits.length;
  const focusTimeToday = Math.round(state.analytics.totalFocusTime / 60);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-[85%] mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      <TimeProgress />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Tasks Summary */}
        <Link to="/tasks" className="card p-3 hover:bg-gray-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <CheckCircle2 className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">Completed</span>
              <span className="text-sm font-medium">{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>{totalTasks - completedTasks} tasks remaining</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
        
        {/* Focus Summary */}
        <Link to="/focus" className="card p-3 hover:bg-gray-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Focus Timer</h3>
            <Clock className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="mb-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{focusTimeToday}h</span>
              <span className="text-sm text-gray-400">Focus time today</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Start a new focus session</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
        
        {/* Habits Summary */}
        <Link to="/habits" className="card p-3 hover:bg-gray-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Habits</h3>
            <Calendar className="h-6 w-6 text-green-400" />
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">Completed Today</span>
              <span className="text-sm font-medium">{completedHabits}/{totalHabits}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${totalHabits ? (completedHabits / totalHabits) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>{totalHabits - completedHabits} habits remaining today</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
        
        {/* Analytics Summary */}
        <Link to="/analytics" className="card p-3 hover:bg-gray-800 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Analytics</h3>
            <BarChart2 className="h-6 w-6 text-purple-400" />
          </div>
          <div className="mb-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{state.analytics.productivityScore}</span>
              <span className="text-sm text-gray-400">Productivity score</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>View detailed analytics</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default Dashboard;