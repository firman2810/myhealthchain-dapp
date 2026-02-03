
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, CardFooter } from './ui/elements';
import { Activity, Stethoscope, User, ArrowRight, CheckCircle2, ArrowLeft, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'doctor' | 'patient') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Reset success state when switching between login/register
  useEffect(() => {
    setSuccess(false);
  }, [isRegistering]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      if (isRegistering) {
        setSuccess(true);
        // After 2 seconds of success message, flip to login
        setTimeout(() => {
          setIsRegistering(false);
          setSuccess(false);
        }, 2000);
      } else {
        onLogin(role);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 transition-colors duration-500">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-lg mb-4 hover:scale-110 transition-transform cursor-default">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">MyHealthChain</h1>
          <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Secure Blockchain Healthcare</p>
        </div>

        <Card className="border-slate-200 shadow-2xl overflow-hidden relative">
          {/* Progress overlay for loading */}
          {loading && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-blue-700">{isRegistering ? 'Creating Account...' : 'Authenticating...'}</p>
              </div>
            </div>
          )}

          {/* Success overlay for registration */}
          {success && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Account Created!</h3>
              <p className="text-slate-500 mt-2">Your decentralized identity has been generated. Redirecting to sign in...</p>
            </div>
          )}

          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center font-bold">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegistering 
                ? 'Register your credentials on the MyHealthChain network' 
                : 'Enter your details to access the decentralized ledger'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                  role === 'doctor'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-inner'
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${role === 'doctor' ? 'bg-blue-600 text-white' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold mt-2">Provider</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                  role === 'patient'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-inner'
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${role === 'patient' ? 'bg-blue-600 text-white' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                  <User className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold mt-2">Patient</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-slate-700 group-focus-within:text-blue-600 transition-colors">
                  {role === 'doctor' ? 'Medical License ID' : 'NRIC'}
                </label>
                <Input
                  type="text"
                  placeholder={role === 'doctor' ? "MD-883920" : "S1234567A"}
                  required
                  className="bg-slate-50/50 focus:bg-white transition-all border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-slate-700 group-focus-within:text-blue-600 transition-colors">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-slate-50/50 focus:bg-white transition-all border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {isRegistering && (
                <div className="space-y-2 group animate-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700 group-focus-within:text-blue-600 transition-colors">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-slate-50/50 focus:bg-white transition-all border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              )}

              <Button className="w-full mt-2 h-12 text-md shadow-lg shadow-blue-200 active:scale-95 transition-transform" size="lg" disabled={loading}>
                {isRegistering ? (
                  <>
                    Create Account <UserPlus className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-tighter">or</span>
              </div>
            </div>

            {isRegistering ? (
              <button 
                type="button" 
                onClick={() => setIsRegistering(false)}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center justify-center w-full transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Already have an account? Sign In
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => setIsRegistering(true)}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center w-full transition-all"
              >
                No account? Create a secure identity
              </button>
            )}
            
            <p className="text-[10px] text-center text-slate-300 uppercase tracking-widest pt-4">
              Protected by MyHealthChain Secure Enclave v2.4
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
