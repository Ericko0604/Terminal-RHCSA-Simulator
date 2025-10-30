import { useState } from 'react';
import { StatusPage } from './components/StatusPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { TerminalSession } from './components/TerminalSession';

type AppState = 
  | { screen: 'status' }
  | { screen: 'admin-login' }
  | { screen: 'admin-dashboard'; adminToken: string }
  | { screen: 'terminal'; token: string };

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'status' });

  const handleTokenSubmit = (token: string) => {
    setState({ screen: 'terminal', token });
  };

  const handleAdminClick = () => {
    setState({ screen: 'admin-login' });
  };

  const handleAdminLoginSuccess = (adminToken: string) => {
    setState({ screen: 'admin-dashboard', adminToken });
  };

  const handleAdminLogout = () => {
    setState({ screen: 'status' });
  };

  const handleTerminalExit = () => {
    setState({ screen: 'status' });
  };

  const handleBackToStatus = () => {
    setState({ screen: 'status' });
  };

  switch (state.screen) {
    case 'status':
      return (
        <StatusPage
          onTokenSubmit={handleTokenSubmit}
          onAdminClick={handleAdminClick}
        />
      );
    
    case 'admin-login':
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={handleBackToStatus}
        />
      );
    
    case 'admin-dashboard':
      return (
        <AdminDashboard
          adminToken={state.adminToken}
          onLogout={handleAdminLogout}
        />
      );
    
    case 'terminal':
      return (
        <TerminalSession
          token={state.token}
          onExit={handleTerminalExit}
        />
      );
  }
}
