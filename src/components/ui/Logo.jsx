import React from 'react';
import { Clock3 } from 'lucide-react';

const Logo = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50 rounded-full"></div>
      <Clock3 className="relative h-6 w-6 text-white" />
    </div>
  );
};

export default Logo;