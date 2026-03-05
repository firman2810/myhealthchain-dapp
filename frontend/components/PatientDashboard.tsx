
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from './ui/elements';
import { ShieldCheck, History, Database, Fingerprint, Activity, Calendar, Download, Lock, ArrowLeft, Zap, Globe, AlertTriangle } from 'lucide-react';
import RecordCard from './RecordCard';
import { MedicalRecord } from '../types';
import { apiFetch } from '../client';

interface PatientDashboardProps {
  username: string;   // patient's NRIC — used to fetch their own records
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ username }) => {
  const [status, setStatus] = useState<'idle' | 'confirming' | 'syncing' | 'completed'>('idle');
  const [syncStep, setSyncStep] = useState(0);
  const [myRecords, setMyRecords] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleStartFetch = () => {
    setStatus('confirming');
    setError(null);
  };

  const handleFetchData = async () => {
    setStatus('syncing');
    setSyncStep(0);
    setError(null);

    // Step 1: Visual — Query Ledger
    setSyncStep(1);
    await new Promise(r => setTimeout(r, 5000));

    // Step 2: Visual — Retrieve Hashes + actual API call
    setSyncStep(2);
    try {
      const records = await apiFetch<MedicalRecord[]>(`/patients/${encodeURIComponent(username)}/records`);

      // Step 3: Visual — Compare Hashes
      setSyncStep(3);
      await new Promise(r => setTimeout(r, 5000));

      setMyRecords(records);
      setStatus('completed');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
      setStatus('idle');
    }
  };

  const steps = [
    { label: "Locating Identity on Chain", icon: <Fingerprint className="w-5 h-5" /> },
    { label: "Decrypting Medical Blocks", icon: <Database className="w-5 h-5" /> },
    { label: "Validating Hash Integrity", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  if (status === 'idle') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Secure Health Ledger</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Your medical records are encrypted and stored across the decentralized network.
            Initiate a secure fetch to decrypt and view your history.
          </p>
        </div>

        <Card className="border-2 border-slate-200 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" /> Retrieval Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start space-x-3 text-sm text-slate-600">
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0 mt-0.5">1</div>
                <p>Establishing secure connection to <strong>MyHealthChain Mainnet</strong> nodes.</p>
              </div>
              <div className="flex items-start space-x-3 text-sm text-slate-600">
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0 mt-0.5">2</div>
                <p>Verifying decentralized identity and cryptographic signatures.</p>
              </div>
              <div className="flex items-start space-x-3 text-sm text-slate-600">
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0 mt-0.5">3</div>
                <p>Fetching and cross-referencing off-chain data hashes.</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <Button
              onClick={handleStartFetch}
              className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-5 h-5 mr-3" /> Fetch My Medical Records
            </Button>

            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">
              Manual trigger ensures you are aware of one-time decryption gas fees.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'confirming') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-in zoom-in duration-300">
        <Card className="border-2 border-slate-200 shadow-2xl">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Transaction Confirmation</CardTitle>
                <CardDescription>Authorize gas fee for ledger decryption</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-slate-900 rounded-xl p-5 text-white space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                <span>Network Operation</span>
                <span>Estimate</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <span className="text-sm font-medium">Record Decryption</span>
                <span className="text-lg font-mono font-bold text-emerald-400">0.000124 ETH</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Gwei: 12</span>
                <span className="text-slate-400">Time: ~15 seconds</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                By continuing, you authorize a small gas fee for the MyHealthChain mainnet nodes to compute and decrypt your history. This is an immutable network charge.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setStatus('idle')} className="h-12 font-bold border-slate-200">
                Cancel
              </Button>
              <Button onClick={handleFetchData} className="h-12 font-bold bg-blue-600 hover:bg-blue-700">
                Confirm & Pay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'syncing') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Synchronizing Ledger</h2>
            <p className="text-slate-500 font-medium">Communicating with nodes to rebuild your history...</p>
          </div>
        </div>

        {/* Transaction Metadata Notice */}
        <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Zap className="w-24 h-24" />
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Transaction Status</h4>
              <Badge variant="outline" className="text-[10px] border-white/20 text-white">Broadcasting...</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Gas Paid</p>
                <p className="text-sm font-mono text-emerald-400 font-bold">0.000124 ETH</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Network Load</p>
                <p className="text-sm font-bold">Low (12 Gwei)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Active Node</p>
                <div className="flex items-center text-sm font-bold">
                  <Globe className="w-3 h-3 mr-1 text-blue-400" /> SG-Ledger-Primary
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Block Index</p>
                <p className="text-sm font-mono">#12,849,203</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center p-4 rounded-xl border-2 transition-all duration-500 ${syncStep > idx ? 'bg-emerald-50 border-emerald-100 opacity-100' :
                syncStep === idx + 1 ? 'bg-blue-50 border-blue-200 scale-105 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-40'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 ${syncStep > idx ? 'bg-emerald-600 text-white' :
                syncStep === idx + 1 ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                }`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <span className={`text-sm font-bold ${syncStep === idx + 1 ? 'text-blue-700' : 'text-slate-600'}`}>{step.label}</span>
                {syncStep === idx + 1 && <div className="h-1 bg-blue-100 mt-1 rounded-full overflow-hidden w-full"><div className="h-full bg-blue-600 animate-[loading_2.5s_ease-in-out_infinite]" /></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus('idle')}
              className="h-8 w-8 rounded-full p-0 border-slate-200 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Activity className="w-3 h-3 mr-1" /> Decentralized Patient Portal
            </Badge>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Medical History</h2>
          <p className="text-slate-500 font-medium">Verified Read-Only access to your blockchain-stored records.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleStartFetch} className="h-10 px-4 font-bold text-blue-600 hover:bg-blue-50">
            <Download className="w-4 h-4 mr-2" /> Refresh Data
          </Button>
          <div className="flex items-center space-x-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global Sync Status</p>
              <p className="text-sm font-bold text-emerald-600">100% Immutable</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {myRecords.length === 0 ? (
          <Card className="border-dashed py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <History className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-lg font-bold text-slate-400">No medical records found on the ledger.</p>
            </CardContent>
          </Card>
        ) : (
          myRecords.map((record) => (
            <RecordCard key={record.id} record={record} isTampered={false} />
          ))
        )}
      </div>

      <div className="flex justify-center pt-8">
        <Button
          variant="secondary"
          onClick={() => setStatus('idle')}
          className="h-12 px-8 font-bold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard Home
        </Button>
      </div>

      <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900">Privacy Notice</h4>
            <p className="text-sm text-blue-700/80 leading-relaxed">
              These records are fetched directly from the MyHealthChain distributed ledger. Your data is encrypted with your private key and can only be decrypted by you or authorized providers you've shared access with via the protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
