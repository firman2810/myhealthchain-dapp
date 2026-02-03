import React, { useEffect, useState } from 'react';
import AddRecordForm from './components/AddRecordForm';
import PatientDashboard from './components/PatientDashboard';
import GetRecordView from './components/GetRecordView';
import Login from './components/Login';
import { Activity, Stethoscope, User, Search, FilePlus, LogOut, ShieldCheck, Database, Bot, Terminal, Shield, Layout, Settings, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { Button, Badge } from './components/ui/elements';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'doctor' | 'patient' | null>(null);
  const [view, setView] = useState<'doctor-add' | 'doctor-get' | 'patient-dash'>('doctor-add');

  const [backendStatus, setBackendStatus] = useState<string>('Checking connection...');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  /* Backend connection logic - commented out for frontend preview
  useEffect(() => {
    fetch('/api/health')
      .then(res => {
        if (res.ok) {
          setIsConnected(true);
          return res.text();
        }
        throw new Error('Network response was not ok');
      })
      .then(data => setBackendStatus(`Connected: ${ data } `))
      .catch(() => {
        setIsConnected(false);
        setBackendStatus('Backend disconnected (Is Spring Boot running?)');
      });
  }, []);
  */

  const handleLogin = (role: 'doctor' | 'patient') => {
    setUserRole(role);
    setIsAuthenticated(true);
    setView(role === 'doctor' ? 'doctor-add' : 'patient-dash');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-200">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight text-slate-800">MyHealthChain</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                {userRole === 'doctor' ? 'Provider Portal' : 'Patient Portal'}
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200">
            {userRole === 'doctor' ? (
              <>
                <button
                  onClick={() => setView('doctor-add')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center ${view === 'doctor-add' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FilePlus className="w-4 h-4 mr-2" /> Record Consultation
                </button>
                <button
                  onClick={() => setView('doctor-get')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center ${view === 'doctor-get' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Search className="w-4 h-4 mr-2" /> Retrieve History
                </button>
              </>
            ) : (
              <button
                onClick={() => setView('patient-dash')}
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
                <span className="text-sm font-bold text-slate-800">{userRole === 'doctor' ? 'Dr. Sarah Smith' : 'John Doe'}</span>
                <Badge variant="outline" className="text-[10px] h-4 bg-slate-50 px-1 border-slate-200 text-slate-500">
                  {userRole === 'doctor' ? 'License Verified' : 'Personal Identity Verified'}
                </Badge>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                {userRole === 'doctor' ? <Stethoscope className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-blue-600" />}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {view === 'doctor-add' && userRole === 'doctor' && (
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
          )}

          {view === 'doctor-get' && userRole === 'doctor' && (
            <GetRecordView />
          )}

          {view === 'patient-dash' && userRole === 'patient' && (
            <PatientDashboard />
          )}
        </div>
      </main>

      {/* Global Ledger Status Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-sm border-t border-slate-200 py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
              Network: HealthNet-01
            </span>
            <span className="hidden sm:inline">Block Height: 12,849,203</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline">Enc: AES-256-GCM</span>
            <span className="text-blue-600">Sync: 100% Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
