import React from 'react';
import { motion } from 'framer-motion';
import TimeProgress from '../time/TimeProgress';
import TaskManager from '../tasks/TaskManager';
import FocusTimer from '../focus/FocusTimer';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const Dashboard = () => {
  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 py-4 px-6 gradient-bg"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Time Progress */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <TimeProgress />
        </motion.div>

        {/* Column 2: Task Management */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <TaskManager />
        </motion.div>

        {/* Column 3: Focus Timer */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <FocusTimer />
        </motion.div>

        {/* Column 4: Analytics & Habits */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <AnalyticsDashboard />
        </motion.div>
      </div>
    </motion.main>
  );
};

export default Dashboard;