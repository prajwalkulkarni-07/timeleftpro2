import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Timer, BarChart2, Heart, Brain } from 'lucide-react';
import Logo from '../ui/Logo';

const Navbar = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/focus', icon: Timer, label: 'Focus' },
    // { path: '/focus-zone', icon: Brain, label: 'Focus Zone' }, // Removed Focus Zone link
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/habits', icon: Heart, label: 'Habits' }
  ];

  return (
    <nav className="w-64 bg-gray-800 p-4 flex flex-col h-screen">
      <div className="flex items-center gap-2 mb-8">
        <Logo />
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          TimeLeft Pro
        </h1>
      </div>

      <div className="flex flex-col gap-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;