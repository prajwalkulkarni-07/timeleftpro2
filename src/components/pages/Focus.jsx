import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FocusTimer from '../focus/FocusTimer';
import { useAppContext } from '../../context/AppContext';
import { format, isToday, parseISO } from 'date-fns';
import { PlayCircle, PauseCircle, SkipForward, RotateCcw, Coffee, Brain } from 'lucide-react'; // Added imports

const Focus = () => {
  const { state, dispatch } = useAppContext(); // Added dispatch
  const [activeTab, setActiveTab] = useState('timer'); // 'timer' or 'log' or 'tasks'
  const [selectedTask, setSelectedTask] = useState(null);

  const focusTasks = state.tasks.filter(
    task => (task.estPomodoros > 0 || task.estDeepSessions > 0) && 
            ((task.completedPomodoros || 0) < (task.estPomodoros || 0) || 
             (task.completedDeepSessions || 0) < (task.estDeepSessions || 0))
  );

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    // Potentially switch to timer tab or update timer context
    setActiveTab('timer'); 
  };

  // Placeholder for timer control logic that might be needed here or passed to FocusTimer
  // const completeSession = (type) => {
  //   if (selectedTask) {
  //     dispatch({ type: 'UPDATE_TASK_FOCUS_PROGRESS', payload: { taskId: selectedTask.id, type } });
  //   }
  // };

  const todaySessions = state.focusSessions.filter(session => 
    session.completedAt && isToday(parseISO(session.completedAt))
  );

  const pomodorosToday = todaySessions.filter(s => s.mode === 'pomodoro' && !s.isBreak);
  const deepWorkToday = todaySessions.filter(s => s.mode === 'deepWork' && !s.isBreak);
  const breaksToday = todaySessions.filter(s => s.isBreak);

  const totalPomodoroTime = pomodorosToday.reduce((sum, s) => sum + s.duration, 0);
  const totalDeepWorkTime = deepWorkToday.reduce((sum, s) => sum + s.duration, 0);
  const totalBreakTime = breaksToday.reduce((sum, s) => sum + s.duration, 0);

  const formatMinutes = (minutes) => {
    if (minutes < 1) return '<1 min';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    let str = '';
    if (h > 0) str += `${h}h `;
    if (m > 0 || h === 0) str += `${m}m`;
    return str.trim();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex border-b border-gray-700 mb-6">
        <button 
          onClick={() => setActiveTab('timer')}
          className={`px-4 py-2 text-lg font-medium transition-colors 
            ${activeTab === 'timer' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Timer
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-lg font-medium transition-colors 
            ${activeTab === 'tasks' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Focus Tasks
        </button>
        <button 
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 text-lg font-medium transition-colors 
            ${activeTab === 'log' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Session Log
        </button>
      </div>

      {activeTab === 'timer' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Focus Timer</h2>
          {/* Pass selectedTask and other necessary props to FocusTimer */}
          <FocusTimer selectedTask={selectedTask} setSelectedTask={setSelectedTask} /> 
        </>
      )}

      {activeTab === 'tasks' && (
        <div className="card bg-gray-800 p-6 flex-1 overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 text-white">Tasks to Focus On</h2>
          {focusTasks.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No tasks with Pomodoros or Deep Focus sessions planned, or all are completed.</p>
          ) : (
            <div className="overflow-y-auto max-h-[calc(100vh-22rem)] space-y-3 pr-2"> {/* Adjusted max-h */} 
              {focusTasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ease-in-out 
                              ${selectedTask?.id === task.id ? 'bg-indigo-600 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => handleSelectTask(task)}
                >
                  <h3 className={`font-medium ${selectedTask?.id === task.id ? 'text-white' : 'text-gray-100'}`}>{task.title}</h3>
                  <div className={`text-xs mt-1 ${selectedTask?.id === task.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                    <span>Pomodoros: {task.completedPomodoros || 0} / {task.estPomodoros || 0}</span>
                    <span className="mx-2">|</span>
                    <span>Deep Sessions: {task.completedDeepSessions || 0} / {task.estDeepSessions || 0}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'log' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Today's Session Log</h2>
          {todaySessions.length === 0 ? (
            <p className="text-gray-400">No focus sessions logged today.</p>
          ) : (
            <div className="card p-6 bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-indigo-400">Pomodoros</h3>
                  <p className="text-2xl font-bold">{pomodorosToday.length}</p>
                  <p className="text-sm text-gray-400">Total time: {formatMinutes(totalPomodoroTime)}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-400">Deep Work</h3>
                  <p className="text-2xl font-bold">{deepWorkToday.length}</p>
                  <p className="text-sm text-gray-400">Total time: {formatMinutes(totalDeepWorkTime)}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-400">Breaks</h3>
                  <p className="text-2xl font-bold">{breaksToday.length}</p>
                  <p className="text-sm text-gray-400">Total time: {formatMinutes(totalBreakTime)}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4">All Sessions Today:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-750">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duration</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {todaySessions.sort((a,b) => parseISO(b.completedAt) - parseISO(a.completedAt)).map((session, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{session.label}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatMinutes(session.duration)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{format(parseISO(session.completedAt), 'p')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {session.isPartial ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500 text-yellow-900">Partial</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500 text-green-900">Full</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Focus;