import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardView from './pages/DashboardView.jsx';
import AccountsHub from './pages/AccountsHub.jsx';
import SecurityCenter from './pages/SecurityCenter.jsx';
import ProjectsHub from './pages/ProjectsHub.jsx';
import FinanceTracker from './pages/FinanceTracker.jsx';
import GoalsHabits from './pages/GoalsHabits.jsx';
import CollegeStudy from './pages/CollegeStudy.jsx';
import DocumentsVault from './pages/DocumentsVault.jsx';
import DevicesManager from './pages/DevicesManager.jsx';
import Entertainment from './pages/Entertainment.jsx';
import LoginPage from './pages/LoginPage.jsx';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('lifeos_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lifeos_user');
    return saved ? JSON.parse(saved) : null;
  });

  if (!isAuthenticated) {
    return <LoginPage setIsAuthenticated={setIsAuthenticated} setUser={setUser} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView setActiveModule={setActiveModule} />;
      case 'accounts':
        return <AccountsHub />;
      case 'security':
        return <SecurityCenter />;
      case 'projects':
        return <ProjectsHub />;
      case 'finance':
        return <FinanceTracker />;
      case 'habits':
        return <GoalsHabits />;
      case 'study':
        return <CollegeStudy />;
      case 'vault':
        return <DocumentsVault />;
      case 'devices':
        return <DevicesManager />;
      case 'entertainment':
        return <Entertainment />;
      default:
        return <DashboardView setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c16] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Navbar Header */}
      <Navbar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setIsAuthenticated={setIsAuthenticated}
        setUser={setUser}
        user={user}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-[1800px] w-full mx-auto relative">
        {/* Left Sidebar */}
        <Sidebar 
          activeModule={activeModule} 
          setActiveModule={setActiveModule} 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default App;