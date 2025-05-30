import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { reducer, initialState } from './appReducer';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children, initialData }) => {
  const [state, dispatch] = useReducer(reducer, initialData || initialState);
  const [, setStoredData] = useLocalStorage('app_data', null);

  // Sync state with localStorage
  useEffect(() => {
    setStoredData(state);
  }, [state, setStoredData]);

  // Update time-related data every minute
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: 'UPDATE_CURRENT_TIME' });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};