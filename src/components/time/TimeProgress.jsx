import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, PieChart, Clock2 as Clock24, Clock12, Bell } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import CircularProgress from '../ui/CircularProgress';
import { format } from 'date-fns';

const TimeProgress = () => {
  const { state } = useAppContext();
  const { day, week, month, year } = state.timeProgress;
  const [use24Hour, setUse24Hour] = useState(true);
  
  // Update time every second
  const [currentTime, setCurrentTime] = React.useState(new Date());
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const toggleTimeFormat = () => {
    setUse24Hour(!use24Hour);
  };
  
  const timeFormat = use24Hour ? 'HH:mm:ss' : 'hh:mm:ss a';
  
  // Calculate remaining time
  const hoursInDay = 24;
  const daysInWeek = 7;
  const daysInMonth = 30; // Approximation
  const daysInYear = 365; // Approximation
  
  const dayHoursRemaining = Math.floor((100 - day) * hoursInDay / 100);
  const dayMinutesRemaining = Math.floor(((100 - day) * hoursInDay / 100 - dayHoursRemaining) * 60);
  const weekDaysRemaining = Math.ceil((100 - week) * daysInWeek / 100);
  const monthDaysRemaining = Math.ceil((100 - month) * daysInMonth / 100);
  const yearDaysRemaining = Math.ceil((100 - year) * daysInYear / 100);
  
  return (
    <div className="card p-6 min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">TimeLeft</h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-400 text-lg">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="text-xl font-bold">
            {format(currentTime, timeFormat)}
          </p>
          <button
            onClick={toggleTimeFormat}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {use24Hour ? <Clock24 className="h-4 w-4" /> : <Clock12 className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-8 mt-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 p-8 rounded-lg flex flex-col items-center">
          <CircularProgress 
            percentage={day} 
            size={100} 
            strokeWidth={8} 
            color="rgba(125, 135, 255, 0.8)" 
          />
          <p className="mt-4 font-semibold text-lg uppercase tracking-wider">DAY</p>
          <p className="text-base text-gray-400 mt-2">{dayHoursRemaining}h {dayMinutesRemaining}m remaining</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 p-8 rounded-lg flex flex-col items-center">
          <CircularProgress 
            percentage={week} 
            size={100} 
            strokeWidth={8} 
            color="rgba(76, 201, 240, 0.8)" 
          />
          <p className="mt-4 font-semibold text-lg uppercase tracking-wider">WEEK</p>
          <p className="text-base text-gray-400 mt-2">{weekDaysRemaining} days remaining</p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-900/30 to-pink-600/10 p-8 rounded-lg flex flex-col items-center">
          <CircularProgress 
            percentage={month} 
            size={100} 
            strokeWidth={8} 
            color="rgba(247, 127, 190, 0.8)" 
          />
          <p className="mt-4 font-semibold text-lg uppercase tracking-wider">MONTH</p>
          <p className="text-base text-gray-400 mt-2">{monthDaysRemaining} days remaining</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 p-8 rounded-lg flex flex-col items-center">
          <CircularProgress 
            percentage={year} 
            size={100} 
            strokeWidth={8} 
            color="rgba(72, 199, 142, 0.8)" 
          />
          <p className="mt-4 font-semibold text-lg uppercase tracking-wider">YEAR</p>
          <p className="text-base text-gray-400 mt-2">{yearDaysRemaining} days remaining</p>
        </div>
      </div>
    </div>
  );
};

export default TimeProgress;