// FIX: Use namespace import for React to solve JSX types issue.
import * as React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertData, AppUser } from './types';
import { api } from './services/api';

// Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Spinner from './components/ui/Spinner';
import Alert from './components/ui/Alert';
import ErrorBoundary from './components/ErrorBoundary';
import Button from './components/ui/Button';

// Pages
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import Uniform from './pages/Uniform';
import Points from './pages/Points';
import Fees from './pages/Fees';
import Inventory from './pages/Inventory';
import Honours from './pages/Honours';
import Resources from './pages/Resources';
import Events from './pages/Events';
import Admin from './pages/Admin';

// Contexts
const UserContext = React.createContext<AppUser | null>(null);
const AlertContext = React.createContext<{ addAlert: (message: string, type: AlertData['type']) => void }>({ addAlert: () => {} });
export const ThemeContext = React.createContext<{ theme: 'light' | 'dark'; toggleTheme: () => void; }>({ theme: 'dark', toggleTheme: () => {} });

export const useUser = () => React.useContext(UserContext);
export const useAlert = () => React.useContext(AlertContext);
export const useTheme = () => React.useContext(ThemeContext);

const LoginScreen: React.FC<{
  onLogin: () => void;
  isLoading: boolean;
  error: string | null;
  availableUsers: AppUser[];
  selectedUserId: string;
  onSelectUser: (id: string) => void;
}> = ({ onLogin, isLoading, error, availableUsers, selectedUserId, onSelectUser }) => (
    <div className="fixed inset-0 bg-gray-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-surface rounded-lg shadow-xl p-8 border border-gray-border text-center">
        <img src="https://img.icons8.com/ios-filled/50/38bdf8/shield.png" alt="Logo" className="w-12 h-12 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-text-main">Fa Nyame Admin Portal</h1>
        <p className="text-text-muted text-sm mt-1 mb-6">Choose a demo account to explore the app.</p>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <label className="block text-left text-sm text-text-muted mb-2" htmlFor="demo-user">
          Demo account
        </label>
        <select
          id="demo-user"
          value={selectedUserId}
          onChange={event => onSelectUser(event.target.value)}
          className="w-full mb-4 rounded-md border border-gray-border bg-gray-base px-3 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        >
          <option value="">Select an account</option>
          {availableUsers.map(availableUser => (
            <option key={availableUser.id} value={availableUser.id}>
              {availableUser.name} ({availableUser.role})
            </option>
          ))}
        </select>

        <Button onClick={onLogin} variant="primary" className="w-full" disabled={isLoading || !selectedUserId}>
            {isLoading ? 'Signing In...' : 'Sign in'}
        </Button>
      </div>
    </div>
);

const App: React.FC = () => {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = React.useState<AppUser[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [alerts, setAlerts] = React.useState<AlertData[]>([]);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const addAlert = React.useCallback((message: string, type: AlertData['type']) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  }, []);

  const loadUserById = React.useCallback(async (userId: string) => {
    const profile = await api.getUser(userId);
    if (!profile) {
      throw new Error('Selected account could not be found.');
    }
    const rolePermissions = await api.getRolePermissions(profile.role);
    const resolvedUser: AppUser = {
      ...profile,
      permissions: rolePermissions || profile.permissions,
    };
    setUser(resolvedUser);
    localStorage.setItem('appUserId', resolvedUser.id);
    setError(null);
    return resolvedUser;
  }, []);

  const refreshAvailableUsers = React.useCallback(async () => {
    const response = await api.getUsers();
    if (response.success) {
      setAvailableUsers(response.data);
    }
    return response;
  }, []);

  React.useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const response = await refreshAvailableUsers();
        const storedUserId = localStorage.getItem('appUserId');
        if (storedUserId && response.success && response.data.some(availableUser => availableUser.id === storedUserId)) {
          setSelectedUserId(storedUserId);
          await loadUserById(storedUserId);
        }
      } catch (e) {
        console.error('Failed to initialize demo accounts:', e);
        setError('Failed to load demo accounts. Please refresh to try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadUserById, refreshAvailableUsers]);

  React.useEffect(() => {
    if (!selectedUserId && availableUsers.length > 0) {
      setSelectedUserId(availableUsers[0].id);
    }
  }, [availableUsers, selectedUserId]);

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
    setError(null);
  };

  const handleLogin = async () => {
    if (!selectedUserId) {
      setError('Please choose an account to continue.');
      return;
    }

    setIsLoading(true);
    try {
      await loadUserById(selectedUserId);
    } catch (e: any) {
      console.error('Demo login failed:', e);
      setError(e?.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('appUserId');
    setError(null);
  };

  const handleUserUpdate = async (updatedUser: AppUser) => {
    setUser(updatedUser);
    localStorage.setItem('appUserId', updatedUser.id);
    await refreshAvailableUsers();
  };
  
  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (isLoading) return <Spinner show={true} />;

  if (!user) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        error={error}
        isLoading={isLoading}
        availableUsers={availableUsers}
        selectedUserId={selectedUserId}
        onSelectUser={handleSelectUser}
      />
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <UserContext.Provider value={user}>
        <AlertContext.Provider value={{ addAlert }}>
          <HashRouter>
            <div key={user.id} className="flex h-screen bg-gray-base">
              <Sidebar 
                isMobileOpen={isMobileMenuOpen} 
                setMobileOpen={setIsMobileMenuOpen} 
                isCollapsed={isSidebarCollapsed} 
              />
              <div className="flex-1 flex flex-col overflow-hidden">
                <ErrorBoundary fallback={<div className="p-4 m-4 bg-danger/20 text-red-300 border border-danger/30 rounded-lg">Error: The application header failed to load.</div>}>
                  <Header 
                    onLogout={handleLogout} 
                    toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    toggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    isSidebarCollapsed={isSidebarCollapsed}
                  />
                </ErrorBoundary>
                <ErrorBoundary fallback={<div className="p-4 m-4 bg-danger/20 text-red-300 border border-danger/30 rounded-lg">Error: This page crashed. Please try refreshing or navigating to another page.</div>}>
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-base p-4 md:p-6">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/members" element={<Members />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/uniform" element={<Uniform />} />
                        <Route path="/points" element={<Points />} />
                        <Route path="/fees" element={<Fees />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/honours" element={<Honours />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/admin" element={<Admin onLogout={handleLogout} onUserUpdate={handleUserUpdate} />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </main>
                </ErrorBoundary>
              </div>
            </div>
            <div className="fixed top-4 left-4 right-4 z-[100] space-y-2 md:w-full md:max-w-sm md:left-auto md:top-5 md:right-5">
                {alerts.map(alert => (
                    <Alert key={alert.id} message={alert.message} type={alert.type} onClose={() => removeAlert(alert.id)} />
                ))}
            </div>
          </HashRouter>
        </AlertContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;