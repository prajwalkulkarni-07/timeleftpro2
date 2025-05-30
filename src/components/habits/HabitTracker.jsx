import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Trophy, Zap, Filter, Edit, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';

const HabitTracker = () => {
  const { state, dispatch } = useAppContext();
  const [newHabit, setNewHabit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingHabit, setEditingHabit] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  const categories = {
    health: { label: 'Health', color: 'text-red-400' },
    learning: { label: 'Learning', color: 'text-orange-400' },
    productivity: { label: 'Productivity', color: 'text-indigo-400' },
    personal: { label: 'Personal', color: 'text-green-400' }
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    const habit = {
      id: Date.now().toString(),
      name: newHabit,
      category: selectedCategory,
      streak: 0,
      completedDates: [],
      target: 'daily'
    };

    dispatch({ type: 'ADD_HABIT', payload: habit });
    setNewHabit('');
  };

  const handleUpdateHabit = (e) => {
    e.preventDefault();
    if (!editingHabit || !editingHabit.name.trim()) return;
    
    dispatch({ 
      type: 'UPDATE_HABIT', 
      payload: editingHabit 
    });
    
    setEditingHabit(null);
  };

  const startEditing = (habit) => {
    setEditingHabit({...habit});
  };

  const confirmDelete = (habit) => {
    setDeleteConfirmation(habit);
  };

  const deleteHabit = () => {
    if (deleteConfirmation) {
      dispatch({ type: 'DELETE_HABIT', payload: deleteConfirmation.id });
      setDeleteConfirmation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const toggleHabit = (id) => {
    dispatch({ type: 'COMPLETE_HABIT', payload: id });
  };

  const isHabitCompletedToday = (habit) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return habit.completedDates.includes(today);
  };
  
  const filteredHabits = state.habits.filter(habit => {
    if (filterCategory === 'all') return true;
    return habit.category === filterCategory;
  });

  const habitItemHeight = 5.5; // Approximate height of a single habit item in rem, accounts for padding & inter-item spacing
  const maxVisibleHabits = 7;
  const habitListMaxHeight = filteredHabits.length >= maxVisibleHabits ? `${maxVisibleHabits * habitItemHeight}rem` : 'auto';

  return (
    <div className="card p-6">
      <DeleteConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={cancelDelete}
        onConfirm={deleteHabit}
        itemName={deleteConfirmation?.name}
        itemType="habit"
      />
      
      {editingHabit ? (
        <form onSubmit={handleUpdateHabit} className="mb-6 bg-gray-800 p-4 rounded-lg">
          <div className="mb-4">
            <input
              type="text"
              value={editingHabit.name}
              onChange={(e) => setEditingHabit({...editingHabit, name: e.target.value})}
              placeholder="Habit name"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-full mb-2"
            />
            <select
              value={editingHabit.category}
              onChange={(e) => setEditingHabit({...editingHabit, category: e.target.value})}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-full"
            >
              {Object.entries(categories).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg flex-1 flex items-center justify-center"
            >
              <CheckCircle2 className="h-5 w-5 mr-1" /> Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setEditingHabit(null)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex-1 flex items-center justify-center"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAddHabit} className="mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Add a new habit..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            >
              {Object.entries(categories).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
            >
              <Plus className="h-5 w-5" />
            </motion.button>
          </div>
        </form>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Habits</h3>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm"
          >
            <option value="all">All Categories</option>
            {Object.entries(categories).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div 
        className={`space-y-4 overflow-y-auto overflow-x-hidden pr-1 ${filteredHabits.length === 0 ? 'flex items-center justify-center' : ''}`}
        style={{ maxHeight: habitListMaxHeight }}
      >
        {filteredHabits.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No habits to display</p>
        ) : (
          filteredHabits.map(habit => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleHabit(habit.id)}
                  className="flex-shrink-0"
                >
                  {isHabitCompletedToday(habit) ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className={categories[habit.category].color} />
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-400">
                    <Trophy className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{habit.streak} day streak</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button 
                    className="p-1 hover:bg-gray-700 rounded"
                    onClick={() => startEditing(habit)}
                  >
                    <Edit className="h-4 w-4 text-gray-400" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-700 rounded"
                    onClick={() => confirmDelete(habit)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default HabitTracker;