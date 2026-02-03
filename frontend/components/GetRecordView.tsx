
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Badge } from './ui/elements';
import { Search, Loader2, ShieldCheck, Database, AlertTriangle, Fingerprint, History, User, Activity } from 'lucide-react';
import RecordCard from './RecordCard';
import { MedicalRecord } from '../types';

const GetRecordView: React.FC = () => {
  const [nric, setNric] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [foundRecords, setFoundRecords] = useState<MedicalRecord[]>([]);
  const [showTamperDemo, setShowTamperDemo] = useState(false);

  // Scenario B: Mock multiple results for a single patient search
  const mockResults: MedicalRecord[] = [
    {
      id: "REC-99201",
      patientName: "John Doe",
      doctorName: "Dr. Sarah Smith",
      diagnosis: "Hypertension Type II",
      treatment: "Prescribed Lisinopril 10mg daily. Patient advised to maintain low-sodium diet and daily cardiovascular exercise for 30 mins. Re-eval in 3 months.",
      date: "Feb 12, 2024",
      dbHash: "0x7a2c8e9b1f3d5a7c9e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4",
      chainHash: "0x7a2c8e9b1f3d5a7c9e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4"
    },
    {
      id: "REC-98105",
      patientName: "John Doe",
      doctorName: "Dr. Alan Grant",
      diagnosis: "Acute Bronchitis",
      treatment: "Course of antibiotics (Amoxicillin 500mg). Rest and high fluid intake. Follow up if symptoms persist beyond 10 days.",
      date: "Jan 15, 2024",
      dbHash: "0x5e2c3b8f1d0a4c6e9b2a7d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4",
      chainHash: "0x5e2c3b8f1d0a4c6e9b2a7d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4"
    }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nric) return;

    setIsSearching(true);
    setFoundRecords([]);
    
    // Scenario B: Step-by-step verification
    setVerificationStep(1); // Query Ledger
    await new Promise(r => setTimeout(r, 1200));
    
    setVerificationStep(2); // Fetch from Secure DB
    await new Promise(r => setTimeout(r, 1000));
    
    setVerificationStep(3); // Hash Comparison
    await new Promise(r => setTimeout(r, 1500));

    setFoundRecords(mockResults);
    setIsSearching(false);
    setVerificationStep(0);
  };

  const steps = [
    { label: "Querying Blockchain Ledger", icon: <ShieldCheck className="w-5 h-5" /> },
    { label: "Fetching Encrypted Data from DB", icon: <Database className="w-5 h-5" /> },
    { label: "Verifying Cryptographic Integrity", icon: <Fingerprint className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl">Retrieve Patient History</CardTitle>
            <CardDescription>Search the medical ledger using a Patient NRIC.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Patient NRIC (e.g. S1234567A)" 
                  className="pl-10 h-11"
                  value={nric}
                  onChange={(e) => setNric(e.target.value)}
                  disabled={isSearching}
                />
              </div>
              <Button type="submit" disabled={isSearching || !nric} className="h-11 px-6 bg-blue-600 hover:bg-blue-700">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch History"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {isSearching && (
        <div className="max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {steps.map((step, idx) => (
            <div key={idx} className={`flex items-center p-4 rounded-xl border-2 transition-all duration-300 ${verificationStep > idx + 1 ? 'bg-emerald-50 border-emerald-100 opacity-60' : verificationStep === idx + 1 ? 'bg-blue-50 border-blue-200 scale-105 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${verificationStep > idx + 1 ? 'bg-emerald-600 text-white' : verificationStep === idx + 1 ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                {step.icon}
              </div>
              <span className={`text-sm font-bold ${verificationStep === idx + 1 ? 'text-blue-700' : 'text-slate-600'}`}>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {!isSearching && foundRecords.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{foundRecords[0].patientName}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono text-[10px]">{nric}</Badge>
                  <span className="text-xs text-slate-400 font-medium">• {foundRecords.length} Clinical Records Found</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Test Resilience</span>
                <span className="text-xs font-semibold text-slate-600">Tamper Simulation</span>
              </div>
              <button 
                onClick={() => setShowTamperDemo(!showTamperDemo)}
                className={`w-12 h-6 rounded-full relative transition-colors ${showTamperDemo ? 'bg-red-500' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${showTamperDemo ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
             {foundRecords.map((record, index) => (
               <div key={record.id} className="relative">
                 {index < foundRecords.length - 1 && (
                    <div className="absolute left-6 top-full h-6 w-0.5 bg-slate-100" />
                 )}
                 <RecordCard record={record} isTampered={showTamperDemo && index === 0} />
               </div>
             ))}
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
             <p className="text-xs text-emerald-700 flex items-center justify-center font-bold uppercase tracking-wider">
               <ShieldCheck className="w-4 h-4 mr-2" /> Decentralized Integrity Verified via mainnet-node-01
             </p>
          </div>
        </div>
      )}

      {!isSearching && foundRecords.length === 0 && nric && (
         <div className="max-w-xl mx-auto text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No History Found</h3>
            <p className="text-sm text-slate-500 mt-1">This NRIC has no recorded transactions on the blockchain.</p>
         </div>
      )}
    </div>
  );
};

export default GetRecordView;
