import React from 'react';
import { motion } from 'framer-motion';
import TaskManager from '../tasks/TaskManager';

const Tasks = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto h-full flex flex-col"
    >
      <h2 className="text-2xl font-bold mb-6">Task Management</h2>
      <TaskManager />
    </motion.div>
  );
};

export default Tasks;