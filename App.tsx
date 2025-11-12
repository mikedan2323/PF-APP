// FIX: Use namespace import for React to solve JSX types issue.
import * as React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, AlertData, Permissions, AppUser } from './types';
import { api } from './services/api';

// Firebase Integration
import { auth } from './services/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';

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

const LoginScreen: React.FC<{ onLogin: () => void; isLoading: boolean; error: string | null }> = ({ onLogin, isLoading, error }) => (
    <div className="fixed inset-0 bg-gray-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-surface rounded-lg shadow-xl p-8 border border-gray-border text-center">
        <img src="https://img.icons8.com/ios-filled/50/38bdf8/shield.png" alt="Logo" className="w-12 h-12 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-text-main">Fa Nyame Admin Portal</h1>
        <p className="text-text-muted text-sm mt-1 mb-6">Please sign in to continue.</p>
        
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        
        <Button onClick={onLogin} variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
);

const App: React.FC = () => {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true); // Start true to wait for auth state
  const [error, setError] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    // Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        setIsLoading(true);
        try {
            if (firebaseUser) {
                // User is signed in, now fetch their profile and permissions from Firestore
                let userProfile = await api.getUser(firebaseUser.uid);
                
                if (!userProfile) {
                    // First time login for this user
                    const newUser = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'New User',
                        role: 'Counsellor', // Assign the most restrictive role by default
                        isShared: false,
                    };
                    await api.addUser(newUser.name, newUser.role, '', newUser.isShared, firebaseUser.uid); // Code is irrelevant here
                    userProfile = await api.getUser(firebaseUser.uid); // Re-fetch
                    if(userProfile) addAlert('Welcome! A new account has been created for you with default permissions. Please ask an admin to assign your correct role.', 'success');
                }

                if(userProfile) {
                    const rolePermissions = await api.getRolePermissions(userProfile.role);
                    if(rolePermissions) {
                         const appUser: AppUser = {
                            ...userProfile,
                            permissions: rolePermissions,
                        };
                        setUser(appUser);
                        setError(null); // Clear previous errors on success
                    } else {
                        // This can happen if the role assigned to the user doesn't exist in the 'roles' collection.
                        throw new Error(`Your assigned role "${userProfile.role}" could not be found. Please contact an administrator.`);
                    }
                } else {
                    throw new Error("Could not create or load your user profile. You may not have permission to access this application.");
                }

            } else {
                // User is signed out.
                setUser(null);
                setError(null);
            }
        } catch (e: any) {
            console.error("Error during authentication process:", e);
            const isConnectionError = e.message?.includes('blocked') || e.code?.includes('unavailable') || e.message?.includes('offline') || e.code?.includes('permission-denied');
            const errorMessage = isConnectionError
                ? "Failed to connect to the database. This can be caused by a network issue, an ad blocker, or incorrect security rules. If you are a new user, please contact an admin to be added to the system."
                : `An error occurred: ${e.message || "Could not sign in."}`;
            
            setError(errorMessage);
            setUser(null);
            // If there's an error, we should sign the user out to prevent a broken state
            if (auth.currentUser) {
                await signOut(auth);
            }
        } finally {
            setIsLoading(false);
        }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [addAlert]); // Add addAlert to dependency array

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // The onAuthStateChanged listener will handle setting the user state.
    } catch (e: any) {
        console.error("Firebase login error:", e);
        setError(e.message || "Failed to sign in.");
        setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    // The onAuthStateChanged listener will handle clearing the user state.
  };

  const handleUserUpdate = (updatedUser: AppUser) => {
    // This function will be more relevant when we manage users in Firestore.
    // For now, it ensures UI consistency if permissions are changed in-session.
    setUser(updatedUser);
  };
  
  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (isLoading) return <Spinner show={true} />;

  if (!user) {
    return <LoginScreen onLogin={handleLogin} error={error} isLoading={isLoading} />;
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