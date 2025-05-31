import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/pages/Dashboard';
import Tasks from './components/pages/Tasks';
import Focus from './components/pages/Focus';
// import FocusPage from './components/pages/FocusPage'; // Removed FocusPage import
import Analytics from './components/pages/Analytics';
import Habits from './components/pages/Habits';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { generateSampleData } from './utils/sampleData.js';

function App() {
  const [initialized, setInitialized] = useLocalStorage('app_initialized', false);
  const [appData, setAppData] = useLocalStorage('app_data', null);

  // Initialize sample data if first time
  React.useEffect(() => {
    if (!initialized) {
      const sampleData = generateSampleData();
      // Ensure totalFocusTime starts at 0 for a new user
      sampleData.analytics.totalFocusTime = 0;
      // Clear sample focus sessions for a new user
      sampleData.focusSessions = []; 
      setAppData(sampleData);
      setInitialized(true);
    }
  }, [initialized, setInitialized, setAppData]);

  if (!appData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl font-semibold">
          Initializing TimeLeft Pro...
        </div>
      </div>
    );
  }

  return (
    <AppProvider initialData={appData}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-gray-100 flex">
          {/* Fixed sidebar */}
          <div className="fixed h-screen">
            <Navbar />
          </div>
          {/* Main content with left padding to account for fixed sidebar width */}
          <main className="flex-1 p-8 ml-64 overflow-y-auto h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/focus" element={<Focus />} />
              {/* <Route path="/focus-zone" element={<FocusPage />} /> */}{/* Removed FocusPage route */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/habits" element={<Habits />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;