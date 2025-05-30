import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Edit, Trash2, Clock, CheckSquare, ChevronUp, ChevronDown } from 'lucide-react';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import { useAppContext } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const TaskManager = () => {
  const { state, dispatch } = useAppContext();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskPriority, setNewTaskPriority] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskEstPomodoros, setNewTaskEstPomodoros] = useState(0);
  const [newTaskEstDeepSessions, setNewTaskEstDeepSessions] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  const filteredTasks = state.tasks.filter(task => {
    if (activeFilter === 'completed') return task.completed;
    if (activeFilter === 'active') return !task.completed;
    return true;
  });
  
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      category: newTaskCategory || 'work', // Default if not selected
      priority: newTaskPriority || 'medium', // Default if not selected
      estPomodoros: parseInt(newTaskEstPomodoros, 10) || 0,
      completedPomodoros: 0,
      estDeepSessions: parseInt(newTaskEstDeepSessions, 10) || 0,
      completedDeepSessions: 0,
      created: new Date(),
      deadline: null,
      completed: false,
      timeSpent: 0,
      subtasks: []
    };
    
    dispatch({ type: 'ADD_TASK', payload: newTask });
    setNewTaskTitle('');
    setNewTaskPriority('');
    setNewTaskCategory('');
    setNewTaskEstPomodoros(0);
    setNewTaskEstDeepSessions(0);
  };
  
  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    
    dispatch({ 
      type: 'UPDATE_TASK', 
      payload: editingTask 
    });
    
    setEditingTask(null);
  };
  
  const startEditing = (task) => {
    setEditingTask({...task});
  };
  
  const toggleTaskComplete = (id) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETE', payload: id });
  };
  
  const confirmDelete = (task) => {
    setDeleteConfirmation(task);
  };

  const deleteTask = () => {
    if (deleteConfirmation) {
      dispatch({ type: 'DELETE_TASK', payload: deleteConfirmation.id });
      setDeleteConfirmation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };
  
  const getCategoryColor = (category) => {
    const colors = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      health: 'bg-red-500',
      learning: 'bg-orange-500'
    };
    return colors[category] || 'bg-gray-500';
  };
  
  const getPriorityLabel = (priority) => {
    const labels = {
      high: { text: 'High', color: 'text-red-400' },
      medium: { text: 'Med', color: 'text-yellow-400' },
      low: { text: 'Low', color: 'text-green-400' }
    };
    return labels[priority] || { text: 'Med', color: 'text-yellow-400' };
  };
  
  const taskItemHeight = 5.5; // Adjusted height for pomodoro/deep session info

  const handleNumericInputChange = (setter, value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setter(num);
    } else if (value === '') {
      setter(0); // Or handle empty string as you see fit, maybe keep it empty and validate on submit
    }
  };

  const adjustNumericInput = (currentValue, setter, adjustment) => {
    const newValue = Math.max(0, (parseInt(currentValue, 10) || 0) + adjustment);
    setter(newValue);
  };

  const adjustEditingNumericInput = (field, adjustment) => {
    setEditingTask(prev => ({
      ...prev,
      [field]: Math.max(0, (parseInt(prev[field], 10) || 0) + adjustment)
    }));
  };
  const maxVisibleTasks = 6;
  const taskListMaxHeight = filteredTasks.length >= maxVisibleTasks ? `${maxVisibleTasks * taskItemHeight}rem` : 'auto';

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="flex gap-2">
          <button 
            className={`text-xs px-2 py-1 rounded ${activeFilter === 'all' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded ${activeFilter === 'active' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setActiveFilter('active')}
          >
            Active
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded ${activeFilter === 'completed' ? 'bg-indigo-600' : 'bg-gray-700'}`}
            onClick={() => setActiveFilter('completed')}
          >
            Done
          </button>
        </div>
      </div>
      
      {editingTask ? (
        <form onSubmit={handleUpdateTask} className="mb-4 bg-gray-800 p-3 rounded-lg">
          <div className="mb-2">
            <input
              type="text"
              value={editingTask.title}
              onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
              placeholder="Task title"
              className="input w-full mb-2"
            />
            <div className="flex gap-2 mb-2">
              <div className="flex-1 flex items-center border border-gray-700 rounded-md bg-gray-900">
                <input
                  type="number"
                  value={editingTask.estPomodoros || 0}
                  onChange={(e) => setEditingTask({...editingTask, estPomodoros: parseInt(e.target.value, 10) || 0})}
                  placeholder="Est Pomos"
                  className="input bg-transparent border-none w-full text-center appearance-none"
                  min="0"
                />
                <div className="flex flex-col">
                  <button type="button" onClick={() => adjustEditingNumericInput('estPomodoros', 1)} className="p-1 hover:bg-gray-700 rounded-tr-md"><ChevronUp size={16} /></button>
                  <button type="button" onClick={() => adjustEditingNumericInput('estPomodoros', -1)} className="p-1 hover:bg-gray-700 rounded-br-md border-t border-gray-700"><ChevronDown size={16} /></button>
                </div>
              </div>
              <div className="flex-1 flex items-center border border-gray-700 rounded-md bg-gray-900">
                <input
                  type="number"
                  value={editingTask.estDeepSessions || 0}
                  onChange={(e) => setEditingTask({...editingTask, estDeepSessions: parseInt(e.target.value, 10) || 0})}
                  placeholder="Est Deep"
                  className="input bg-transparent border-none w-full text-center appearance-none"
                  min="0"
                />
                <div className="flex flex-col">
                  <button type="button" onClick={() => adjustEditingNumericInput('estDeepSessions', 1)} className="p-1 hover:bg-gray-700 rounded-tr-md"><ChevronUp size={16} /></button>
                  <button type="button" onClick={() => adjustEditingNumericInput('estDeepSessions', -1)} className="p-1 hover:bg-gray-700 rounded-br-md border-t border-gray-700"><ChevronDown size={16} /></button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <select
                value={editingTask.priority}
                onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                className={`input text-sm bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 w-auto flex-grow ${editingTask.priority ? '' : 'text-gray-500'}`}
              >
                <option value="" disabled className="text-gray-500">Priority</option>
                <option value="low" className="bg-gray-800 text-white">Low</option>
                <option value="medium" className="bg-gray-800 text-white">Medium</option>
                <option value="high" className="bg-gray-800 text-white">High</option>
              </select>
              <select
                value={editingTask.category}
                onChange={(e) => setEditingTask({...editingTask, category: e.target.value})}
                className={`input text-sm bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 w-auto flex-grow ${editingTask.category ? '' : 'text-gray-500'}`}
              >
                <option value="" disabled className="text-gray-500">Category</option>
                <option value="work" className="bg-gray-800 text-white">Work</option>
                <option value="personal" className="bg-gray-800 text-white">Personal</option>
                <option value="health" className="bg-gray-800 text-white">Health</option>
                <option value="learning" className="bg-gray-800 text-white">Learning</option>
              </select>
              <label htmlFor="editEstPomodoros" className="text-sm text-gray-300 whitespace-nowrap ml-1">Pomos:</label>
              <div className="flex items-center border border-gray-700 rounded-md bg-gray-900 w-20">
                <input
                  id="editEstPomodoros"
                  type="number"
                  value={editingTask.estPomodoros || 0}
                  onChange={(e) => setEditingTask({...editingTask, estPomodoros: parseInt(e.target.value, 10) || 0})}
                  className="input text-sm bg-transparent border-none w-full text-center appearance-none"
                  min="0"
                />
                <div className="flex flex-col">
                  <button type="button" onClick={() => adjustEditingNumericInput('estPomodoros', 1)} className="p-1 hover:bg-gray-700 rounded-tr-md"><ChevronUp size={14} /></button>
                  <button type="button" onClick={() => adjustEditingNumericInput('estPomodoros', -1)} className="p-1 hover:bg-gray-700 rounded-br-md border-t border-gray-700"><ChevronDown size={14} /></button>
                </div>
              </div>
              <label htmlFor="editEstDeepSessions" className="text-sm text-gray-300 whitespace-nowrap ml-1">Deep:</label>
              <div className="flex items-center border border-gray-700 rounded-md bg-gray-900 w-20">
                <input
                  id="editEstDeepSessions"
                  type="number"
                  value={editingTask.estDeepSessions || 0}
                  onChange={(e) => setEditingTask({...editingTask, estDeepSessions: parseInt(e.target.value, 10) || 0})}
                  className="input text-sm bg-transparent border-none w-full text-center appearance-none"
                  min="0"
                />
                <div className="flex flex-col">
                  <button type="button" onClick={() => adjustEditingNumericInput('estDeepSessions', 1)} className="p-1 hover:bg-gray-700 rounded-tr-md"><ChevronUp size={14} /></button>
                  <button type="button" onClick={() => adjustEditingNumericInput('estDeepSessions', -1)} className="p-1 hover:bg-gray-700 rounded-br-md border-t border-gray-700"><ChevronDown size={14} /></button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="btn btn-primary flex-1"
            >
              <CheckSquare className="h-5 w-5 mr-1" /> Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setEditingTask(null)}
              className="btn btn-secondary"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAddTask} className="mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task..."
                className="input flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="btn btn-primary"
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className={`input text-sm bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 w-auto flex-grow ${newTaskPriority ? '' : 'text-gray-500'}`}
              >
                <option value="" disabled className="text-gray-500">Priority</option>
                <option value="low" className="bg-gray-800 text-white">Low</option>
                <option value="medium" className="bg-gray-800 text-white">Medium</option>
                <option value="high" className="bg-gray-800 text-white">High</option>
              </select>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className={`input text-sm bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 w-auto flex-grow ${newTaskCategory ? '' : 'text-gray-500'}`}
              >
                <option value="" disabled className="text-gray-500">Category</option>
                <option value="work" className="bg-gray-800 text-white">Work</option>
                <option value="personal" className="bg-gray-800 text-white">Personal</option>
                <option value="health" className="bg-gray-800 text-white">Health</option>
                <option value="learning" className="bg-gray-800 text-white">Learning</option>
              </select>
              <label htmlFor="estPomodoros" className="text-sm text-gray-300 whitespace-nowrap ml-1">Pomos:</label>
              <div className="flex items-center border border-gray-700 rounded-md bg-gray-900 w-20">
                <input 
                  id="estPomodoros"
                  type="number"
                  value={newTaskEstPomodoros}
                  onChange={(e) => handleNumericInputChange(setNewTaskEstPomodoros, e.target.value)}
                  className="input text-sm bg-transparent border-none w-full text-center appearance-none"
                  min="0"
                />
                <div className="flex flex-col">
                  <button type="button" onClick={() => adjustNumericInput(newTaskEstPomodoros, setNewTaskEstPomodoros, 1)} className="p-1 hover:bg-gray-700 rounded-tr-md"><ChevronUp size={14} /></button>
                  <button type="button" onClick={() => adjustNumericInput(newTaskEstPomodoros, setNewTaskEstPomodoros, -1)} className="p-1 hover:bg-gray-700 rounded-br-md border-t border-gray-700"><ChevronDown size={14} /></button>
                </div>
              </div>
              <label htmlFor="estDeepSessions" className="text-sm text-gray-300 whitespace-nowrap ml-1">Deep:</label>
              <div className="flex items-center border border-gray-700 rounded-md bg-gray-900 w-20">
                <input 
                  id="estDeepSessions"
                  type="number"
                  value={newTaskEstDeepSessions}
                  onChange={(e) => handleNumericInputChange(setNewTaskEstDeepSessions, e.target.value)}
                  className="input text-sm bg-transparent border-none w-full text-center appearance-none"
                  min="0"
                />
                <div className="flex flex-col">
                  <button type="button" onClick={() => adjustNumericInput(newTaskEstDeepSessions, setNewTaskEstDeepSessions, 1)} className="p-1 hover:bg-gray-700 rounded-tr-md"><ChevronUp size={14} /></button>
                  <button type="button" onClick={() => adjustNumericInput(newTaskEstDeepSessions, setNewTaskEstDeepSessions, -1)} className="p-1 hover:bg-gray-700 rounded-br-md border-t border-gray-700"><ChevronDown size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
      
      <div 
        className={`flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1 ${filteredTasks.length === 0 ? 'flex items-center justify-center' : ''}`}
        style={{ maxHeight: taskListMaxHeight }}
      >
        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No tasks to display</p>
        ) : (
          filteredTasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-800 rounded-lg p-3 flex items-center gap-3"
            >
              <button onClick={() => toggleTaskComplete(task.id)}>
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              <div className="flex-1 no-underline">
                <div className="flex items-center no-underline">
                  <p className={`font-medium no-underline ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs ${getPriorityLabel(task.priority).color}`}>
                    {getPriorityLabel(task.priority).text}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs capitalize">{task.category}</span>
                  {(task.estPomodoros > 0 || task.estDeepSessions > 0) && (
                    <span className="text-xs text-gray-400 ml-2">
                      P: {task.completedPomodoros || 0}/{task.estPomodoros || 0} | D: {task.completedDeepSessions || 0}/{task.estDeepSessions || 0}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{formatDistanceToNow(new Date(task.created), { addSuffix: true })}</span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button 
                  className="p-1 hover:bg-gray-700 rounded"
                  onClick={() => startEditing(task)}
                >
                  <Edit className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  className="p-1 hover:bg-gray-700 rounded"
                  onClick={() => confirmDelete(task)}
                >
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={cancelDelete}
        onConfirm={deleteTask}
        itemName={deleteConfirmation?.title}
        itemType="task"
      />
    </div>
  );
};

export default TaskManager;