import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart2, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Footer = () => {
  const { state } = useAppContext();
  const completedTasks = state.tasks.filter(task => task.completed).length;
  const totalTasks = state.tasks.length;
  
  const quotes = [
    "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    "Time is what we want most, but what we use worst.",
    "Until we can manage time, we can manage nothing else.",
    "You may delay, but time will not.",
    "Either you run the day, or the day runs you."
  ];
  
  // Get a random quote based on the current date
  const getRandomQuote = () => {
    const date = new Date();
    const index = (date.getDate() + date.getMonth()) % quotes.length;
    return quotes[index];
  };

  return (
    <motion.footer
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass py-4 px-6 mt-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-6 mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <span className="text-sm">
              Tasks: {completedTasks}/{totalTasks}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-green-400" />
            <span className="text-sm">
              Focus: {Math.round(state.analytics.totalFocusTime / 60)} hrs
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-400" />
            <span className="text-sm">
              Habits: {state.habits.filter(h => h.streak > 0).length}
            </span>
          </div>
        </div>
        
        <div className="text-center md:text-right">
          <p className="text-sm text-gray-400 italic">
            "{getRandomQuote()}"
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;