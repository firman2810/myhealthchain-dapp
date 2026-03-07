import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AddRecordForm from './components/AddRecordForm';
import PatientDashboard from './components/PatientDashboard';
import GetRecordView from './components/GetRecordView';
import { AuditorPortal } from './components/AuditorPortal';
import Login from './components/Login';
import { Activity, ClipboardList, Stethoscope, User, Search, FilePlus, LogOut, ShieldCheck, Database, Shield, Wifi, WifiOff } from 'lucide-react';
import { Button, Badge } from './components/ui/elements';
import { apiFetch, clearToken, getToken, setSession, getSession } from './client';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LoadingOverlay } from './components/ui/LoadingOverlay';

// ─── Shared Page Transition ──────────────────────────────
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

type UserRole = 'doctor' | 'patient' | 'HOSPITAL_AUDITOR';

// Page title mapping
const PAGE_TITLES: Record<string, string> = {
  '/login': 'Login | MyHealthChain',
  '/consultation': 'Consultation | MyHealthChain',
  '/history': 'Retrieve History | MyHealthChain',
  '/dashboard': 'Dashboard | MyHealthChain',
  '/audit': 'Audit Portal | MyHealthChain',
};

// ─── Route Guard ────────────────────────────────────────
// Redirects unauthorized roles away from routes they shouldn't access
const RoleGuard: React.FC<{ allowed: UserRole[]; role: UserRole | null; children: React.ReactNode }> = ({ allowed, role, children }) => {
  if (!role || !allowed.includes(role)) {
    // Redirect to the default home for their role
    const home = role === 'doctor' ? '/consultation' : role === 'HOSPITAL_AUDITOR' ? '/audit' : '/dashboard';
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Restore session
  const savedSession = getSession();
  const savedRole = savedSession?.role as UserRole | undefined;

  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken() && !!savedSession);
  const [userRole, setUserRole] = useState<UserRole | null>(savedRole ?? null);
  const [displayName, setDisplayName] = useState<string>(savedSession?.displayName ?? '');
  const [username, setUsername] = useState<string>(savedSession?.username ?? '');

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Backend health check
  useEffect(() => {
    apiFetch<{ status: string }>('/health')
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));
  }, []);

  // Update document.title on every route change
  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] || 'MyHealthChain';
  }, [location.pathname]);

  const handleLogin = (role: UserRole, name: string, user: string) => {
    // Start full-screen loading overlay
    setIsTransitioning(true);

    // Hold the loading screen for 1 second safely masking the network transition
    setTimeout(() => {
      setUserRole(role);
      setDisplayName(name);
      setUsername(user);
      setIsAuthenticated(true);
      setSession({ role, displayName: name, username: user });
      const home = role === 'doctor' ? '/consultation' : role === 'HOSPITAL_AUDITOR' ? '/audit' : '/dashboard';
      navigate(home, { replace: true });

      // Let the portal DOM render, then fade out the overlay
      setTimeout(() => setIsTransitioning(false), 300);
    }, 2000);
  };

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
    setUserRole(null);
    setDisplayName('');
    setUsername('');
    navigate('/login', { replace: true });
  };

  // ─── Not Authenticated ─────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <LoadingOverlay isVisible={isTransitioning} />
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  // ─── Authenticated Layout ──────────────────────────────
  const portalLabel =
    userRole === 'doctor' ? 'Provider Portal' :
      userRole === 'HOSPITAL_AUDITOR' ? 'Auditor Portal' :
        'Patient Portal';

  const badgeLabel =
    userRole === 'doctor' ? 'License Verified' :
      userRole === 'HOSPITAL_AUDITOR' ? 'Auditor Credential Verified' :
        'Personal Identity Verified';

  const avatarIcon =
    userRole === 'doctor' ? <Stethoscope className="w-5 h-5 text-blue-600" /> :
      userRole === 'HOSPITAL_AUDITOR' ? <ClipboardList className="w-5 h-5 text-blue-600" /> :
        <User className="w-5 h-5 text-blue-600" />;

  const defaultHome = userRole === 'doctor' ? '/consultation' : userRole === 'HOSPITAL_AUDITOR' ? '/audit' : '/dashboard';

  return (
    <>
      <LoadingOverlay isVisible={isTransitioning} />

      {/* Framer Motion wrapper for smooth portal entry */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100"
      >
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-200">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-tight text-slate-800">MyHealthChain</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  {portalLabel}
                </span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200">
              {userRole === 'doctor' ? (
                <>
                  <button
                    onClick={() => navigate('/consultation')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center ${location.pathname === '/consultation' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <FilePlus className="w-4 h-4 mr-2" /> Record Consultation
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center ${location.pathname === '/history' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Search className="w-4 h-4 mr-2" /> Retrieve History
                  </button>
                </>
              ) : userRole === 'HOSPITAL_AUDITOR' ? (
                <button
                  onClick={() => navigate('/audit')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center bg-white text-blue-600 shadow-sm border border-slate-200"
                >
                  <ClipboardList className="w-4 h-4 mr-2" /> Audit Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center bg-white text-blue-600 shadow-sm border border-slate-200"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" /> My Health Ledger
                </button>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                {isConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                <span className={`text-[10px] uppercase tracking-wider font-bold ${isConnected ? 'text-green-600' : 'text-red-500'}`}>{isConnected ? 'Backend Online' : 'Backend Offline'}</span>
              </div>
              <div className="hidden sm:flex items-center space-x-3 pr-2 border-r border-slate-200">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-800">{displayName}</span>
                  <Badge variant="outline" className="text-[10px] h-4 bg-slate-50 px-1 border-slate-200 text-slate-500">
                    {badgeLabel}
                  </Badge>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                  {avatarIcon}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Routed Content */}
        <main className="flex-1 container mx-auto px-4 py-8 relative">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {/* @ts-expect-error React Router types don't include key, but it's required for AnimatePresence */}
              <Routes location={location} key={location.pathname}>
                {/* Doctor routes */}
                <Route path="/consultation" element={
                  <RoleGuard allowed={['doctor']} role={userRole}>
                    <PageTransition>
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient Consultation</h1>
                            <p className="text-slate-500 font-medium">Add an encrypted clinical record to the healthcare ledger.</p>
                          </div>
                          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 text-xs font-bold">
                            <Database className="w-4 h-4" /> Storage Node: SG-1 Active
                          </div>
                        </div>
                        <AddRecordForm />
                      </div>
                    </PageTransition>
                  </RoleGuard>
                } />

                <Route path="/history" element={
                  <RoleGuard allowed={['doctor']} role={userRole}>
                    <PageTransition>
                      <GetRecordView />
                    </PageTransition>
                  </RoleGuard>
                } />

                {/* Patient route */}
                <Route path="/dashboard" element={
                  <RoleGuard allowed={['patient']} role={userRole}>
                    <PageTransition>
                      <PatientDashboard username={username} />
                    </PageTransition>
                  </RoleGuard>
                } />

                {/* Auditor route */}
                <Route path="/audit" element={
                  <RoleGuard allowed={['HOSPITAL_AUDITOR']} role={userRole}>
                    <PageTransition>
                      <AuditorPortal />
                    </PageTransition>
                  </RoleGuard>
                } />

                {/* Catch-all: redirect to role-appropriate home */}
                <Route path="*" element={<Navigate to={defaultHome} replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200">
          <div className="bg-white py-4 px-4">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-sm text-slate-800">MyHealthChain</span>
                <span className="text-slate-400 hidden sm:inline">|</span>
                <span className="text-xs text-slate-400 hidden sm:inline">© 2026 MyHealthChain Foundation. All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-6 text-xs font-semibold text-slate-500">
                <a href="#" className="hover:text-slate-800 transition-colors">PRIVACY</a>
                <a href="#" className="hover:text-slate-800 transition-colors">TERMS</a>
                <a href="#" className="hover:text-slate-800 transition-colors">COMPLIANCE</a>
                <span className="flex items-center text-emerald-600">
                  <Shield className="w-3 h-3 mr-1" /> ISO 27001
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 py-2 px-4">
            <div className="container mx-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center space-x-4 text-slate-400">
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-emerald-400">Network: HealthNet-01</span>
                </span>
                <span className="hidden sm:inline text-slate-500">Block Height: 12,849,203</span>
              </div>
              <div className="flex items-center space-x-4 text-slate-500">
                <span className="hidden sm:inline">Enc: AES-256-GCM</span>
                <span className="text-emerald-400">Sync: 100% Verified</span>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  );
};

export default App;
