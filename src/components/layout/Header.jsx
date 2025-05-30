import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Moon, Sun, Activity, Settings } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import Logo from '../ui/Logo';

const Header = () => {
  const { state, dispatch } = useAppContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { theme: isDarkMode ? 'light' : 'dark' }
    });
  };

  const productivityScore = state.analytics.productivityScore || 85;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass sticky top-0 z-10 py-4 px-6 mb-6 backdrop-blur-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            TimeLeft Pro
          </h1>
        </div>

        <div className="hidden md:flex items-center justify-center space-x-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            <span className="text-lg font-medium">
              {format(currentTime, 'h:mm:ss a')}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-700"></div>
          <div className="text-lg font-medium">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg"
          >
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">Score: {productivityScore}</span>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-400" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-400" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;