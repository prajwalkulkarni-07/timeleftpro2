import React from 'react';
import { motion } from 'framer-motion';
import HabitTracker from '../habits/HabitTracker';

const Habits = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">Habit Tracking</h2>
      <HabitTracker />
    </motion.div>
  );
};

export default Habits;