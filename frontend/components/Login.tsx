
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, CardFooter } from './ui/elements';
import { ClipboardList, Stethoscope, User, ArrowRight, CheckCircle2, ArrowLeft, UserPlus, Activity, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, setToken } from '../client';

interface LoginProps {
  onLogin: (role: 'doctor' | 'patient' | 'HOSPITAL_AUDITOR', displayName: string, username: string) => void;
}

interface Organization {
  id: number;
  name: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'doctor' | 'patient' | 'HOSPITAL_AUDITOR'>('doctor');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organizationId, setOrganizationId] = useState<number | ''>('');

  // Organization list
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);

  // Fetch organizations when switching to register mode for doctor/auditor
  useEffect(() => {
    if (isRegistering && (role === 'doctor' || role === 'HOSPITAL_AUDITOR')) {
      setOrgsLoading(true);
      apiFetch<Organization[]>('/auth/organizations', { method: 'GET' })
        .then((data) => setOrganizations(data))
        .catch(() => setOrganizations([]))
        .finally(() => setOrgsLoading(false));
    }
  }, [isRegistering, role]);

  // Reset state when switching between login/register
  useEffect(() => {
    setSuccess(false);
    setError(null);
  }, [isRegistering]);

  const showOrgDropdown = isRegistering && (role === 'doctor' || role === 'HOSPITAL_AUDITOR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const roleValue = role === 'doctor' ? 'DOCTOR' : role === 'HOSPITAL_AUDITOR' ? 'HOSPITAL_AUDITOR' : 'PATIENT';
        await apiFetch<{ message: string }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
            displayName: fullName || username,
            role: roleValue,
            organizationId: organizationId || null,
          }),
        });
        setSuccess(true);
        setTimeout(() => {
          setIsRegistering(false);
          setSuccess(false);
        }, 2000);
      } else {
        const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
        const [data] = await Promise.all([
          apiFetch<{ token: string; role: string; displayName: string; organizationName?: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          }),
          sleep(1000)
        ]);
        setToken(data.token);
        onLogin(
          data.role === 'DOCTOR' ? 'doctor' : data.role === 'HOSPITAL_AUDITOR' ? 'HOSPITAL_AUDITOR' : 'patient',
          data.displayName,
          username,
          data.organizationName
        );
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Smooth container animation respecting reduced motion
  const containerClasses = "min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-slate-100/50 transition-opacity duration-300 motion-reduce:transition-none motion-reduce:transform-none motion-safe:animate-in motion-safe:fade-in duration-200";

  return (
    <div className={containerClasses}>
      {/* Centered Shell Card - Full screen scaled layout on desktop */}
      <div className="w-[95vw] lg:w-[90vw] max-w-[1400px] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative md:h-[800px] lg:h-[85vh] min-h-[600px] transition-all duration-300">

        {/* Full-screen Load/Success Overlays within the card */}
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-[2px] flex items-center justify-center transition-all rounded-[2rem]">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-md"></div>
              <p className="text-sm font-bold text-blue-800 tracking-tight">
                {isRegistering ? 'Creating Account...' : 'Authenticating...'}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300 rounded-[2rem]">
            <div className="p-5 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Created!</h3>
            <p className="text-slate-500 mt-3 text-lg">Your decentralized identity has been generated. Redirecting...</p>
          </div>
        )}

        {/* LEFT PANEL: Form (40%) */}
        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-white relative z-10">

          {/* Static Branding Top-Left Fixed inside the panel */}
          <div className="p-8 sm:p-10 flex items-center shrink-0">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mr-4 shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <span className="font-black text-3xl text-slate-900 tracking-tighter">MyHealthChain</span>
          </div>

          {/* Scrollable Form Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col">
            <div className={`w-full max-w-sm mx-auto px-6 sm:px-8 py-8 md:py-12 flex flex-col ${!isRegistering ? 'my-auto' : ''}`}>

              <div className="text-left mb-6 transition-all duration-300">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                  {isRegistering ? 'Create an account' : 'Sign in to MyHealthChain'}
                </h1>
                <p className="text-slate-500 mt-2 text-sm font-medium">
                  {isRegistering
                    ? 'Set up your verified MyHealthChain identity'
                    : 'Access your secure healthcare workspace'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-4">
                <div className="space-y-4">
                  {/* Roles selection ONLY visible if registering */}
                  <AnimatePresence>
                    {isRegistering && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-3 gap-2 mb-5 overflow-hidden"
                      >
                        {(['doctor', 'patient', 'HOSPITAL_AUDITOR'] as const).map((r) => {
                          const Icon = r === 'doctor' ? Stethoscope : r === 'patient' ? User : ClipboardList;
                          const label = r === 'doctor' ? 'Provider' : r === 'patient' ? 'Patient' : 'Auditor';
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200 mt-1 ${role === r
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                              <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${role === r ? 'scale-110 text-blue-600' : ''}`} />
                              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{label}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1 mb-4">
                      ⚠ {error}
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${isRegistering ? 'register' : 'login'}-${role}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="flex flex-col space-y-4"
                    >
                      {/* Form Inputs */}
                      {isRegistering && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide pl-1">Full Name</label>
                          <Input
                            type="text"
                            placeholder={role === 'doctor' ? "Dr. Sarah Smith" : role === 'HOSPITAL_AUDITOR' ? "Auditor Name" : "John Doe"}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl px-4 transition-all hover:border-slate-300"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide pl-1">
                          {!isRegistering
                            ? 'NRIC or Medical ID'
                            : role === 'doctor' ? 'Medical License ID' : role === 'HOSPITAL_AUDITOR' ? 'Auditor ID' : 'NRIC'}
                        </label>
                        <Input
                          type="text"
                          placeholder={!isRegistering
                            ? "Enter your ID"
                            : role === 'doctor' ? "MD-883920" : role === 'HOSPITAL_AUDITOR' ? "AUD-001" : "990515011234"}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl px-4 transition-all hover:border-slate-300"
                        />
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide pl-1">Password</label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl px-4 tracking-widest transition-all hover:border-slate-300"
                        />
                      </div>

                      {isRegistering && (
                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide pl-1">Confirm Password</label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl px-4 tracking-widest transition-all hover:border-slate-300"
                          />
                        </div>
                      )}

                      {showOrgDropdown && (
                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide pl-1">Organization</label>
                          <select
                            value={organizationId}
                            onChange={(e) => setOrganizationId(e.target.value ? Number(e.target.value) : '')}
                            required
                            className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 focus:outline-none transition-all hover:border-slate-300 cursor-pointer appearance-none"
                          >
                            <option value="" disabled className="text-slate-400">
                              {orgsLoading ? 'Loading organizations...' : 'Select your organization'}
                            </option>
                            {organizations.map((org) => (
                              <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="pt-4 pb-2">
                        <Button
                          className={`w-full h-12 text-[15px] font-bold tracking-wide rounded-xl bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-md shadow-blue-600/20 hover:-translate-y-[1px] transition-all motion-reduce:transition-none ${loading && !isRegistering ? 'opacity-90 cursor-not-allowed' : 'active:scale-[0.98] active:shadow-sm active:translate-y-0'}`}
                          size="lg"
                          disabled={loading}
                          type="submit"
                        >
                          {loading && !isRegistering ? (
                            <span className="flex items-center">
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Signing in...
                            </span>
                          ) : isRegistering ? (
                            <span className="flex items-center">
                              Sign Up <UserPlus className="ml-2 w-4 h-4" />
                            </span>
                          ) : (
                            <span className="flex items-center">
                              Sign in <ArrowRight className="ml-2 w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </form>
            </div>
          </div>

          {/* Sticky Footer Area */}
          <div className="p-6 sm:px-8 border-t border-slate-100 bg-white shrink-0 mt-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between text-[13px] gap-2 sm:gap-0">
              <span className="text-slate-500">
                {isRegistering ? "Have an account?" : "Don't have an account?"}
                {' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors ml-1 active:scale-[0.98]"
                >
                  {isRegistering ? "Sign in" : "Sign up"}
                </button>
              </span>

              <span className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer hidden xl:block">
                Terms & Conditions
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Image / Illustration (60%) */}
        <div className="hidden md:flex flex-1 p-4 md:p-6 lg:p-8 bg-white relative">
          <div className="w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative group hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.15)] transition-all duration-300">

            {/* Photographic portrait image filling the right panel */}
            <img
              src="/images/model2.webp"
              alt="Healthcare Professional"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 z-0"
            />

            {/* Aesthetic gradient wash over the image for text readability and premium feel */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none z-10"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
