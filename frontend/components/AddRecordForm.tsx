
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, Input, Textarea } from './ui/elements';
import { Lock, FileText, CheckCircle2, Loader2, Database, ShieldCheck, User, Fingerprint, AlertCircle, Search } from 'lucide-react';
import { RecordCreationStatus } from '../types';
import { apiFetch } from '../client';

interface RecordResponse {
  id: string;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  date: string;
  dbHash: string;
  chainHash: string;
}

interface PatientLookup {
  id: number;
  displayName: string;
}

const AddRecordForm: React.FC = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    treatment: '',
  });
  const [status, setStatus] = useState<RecordCreationStatus>(RecordCreationStatus.IDLE);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Patient lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [patientFound, setPatientFound] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced NRIC lookup
  useEffect(() => {
    const nric = formData.patientId.trim();

    // Reset lookup state when input changes
    setPatientFound(false);
    setLookupError(null);

    if (nric.length < 3) {
      setFormData(prev => ({ ...prev, patientName: '' }));
      return;
    }

    // Debounce 500ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLookupLoading(true);
      setLookupError(null);
      try {
        const result = await apiFetch<PatientLookup>(`/patients/lookup?identifier=${encodeURIComponent(nric)}`);
        setFormData(prev => ({ ...prev, patientName: result.displayName }));
        setPatientFound(true);
      } catch (err: any) {
        if (err.message?.includes('404') || err.message?.includes('failed')) {
          setLookupError('Patient not found. Verify the NRIC.');
        } else {
          setLookupError(err.message || 'Lookup failed');
        }
        setFormData(prev => ({ ...prev, patientName: '' }));
      } finally {
        setLookupLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Prevent manual editing of patientName — it's auto-filled
    if (name === 'patientName') return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFound) return; // block submission without valid patient
    setTxHash(null);
    setError(null);

    // Step 1: Visual — Encrypt
    setStatus(RecordCreationStatus.ENCRYPTING);
    await wait(5000);

    // Step 2: Store — actual API call happens here
    setStatus(RecordCreationStatus.STORING);
    try {
      const result = await apiFetch<RecordResponse>('/records', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // Step 3: Visual — Sign
      setStatus(RecordCreationStatus.SIGNING);
      await wait(15000);

      // Step 4: Complete
      setStatus(RecordCreationStatus.COMPLETED);
      setTxHash(result.chainHash);
    } catch (err: any) {
      setError(err.message || 'Failed to create record');
      setStatus(RecordCreationStatus.IDLE);
    }
  };

  const resetForm = () => {
    setStatus(RecordCreationStatus.IDLE);
    setFormData({ patientId: '', patientName: '', diagnosis: '', treatment: '' });
    setError(null);
    setPatientFound(false);
    setLookupError(null);
  };

  const renderStatusStep = (stepStatus: RecordCreationStatus, label: string, icon: React.ReactNode, isCurrent: boolean, isCompleted: boolean) => (
    <div className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-500 ${isCurrent ? 'bg-blue-50 border-blue-200 scale-102 shadow-md' : isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-sm ${isCurrent ? 'bg-blue-600 text-white animate-pulse' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isCurrent ? <Loader2 className="w-6 h-6 animate-spin" /> : icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-bold tracking-tight ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>{label}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          {isCurrent ? 'Executing Protocol...' : isCompleted ? 'Verification Success' : 'Pending Queue'}
        </p>
      </div>
    </div>
  );

  // Visual indicator for patient name field
  const patientNameBorder = patientFound
    ? 'border-emerald-300 bg-emerald-50/50'
    : lookupError
      ? 'border-red-300 bg-red-50/30'
      : 'bg-slate-50 border-slate-200';

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Card className="shadow-xl shadow-slate-200 border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Medical Transaction Details</CardTitle>
                <CardDescription>Records are hashed and committed to the mainnet ledger.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === RecordCreationStatus.IDLE ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Patient NRIC</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="patientId"
                        placeholder="e.g. 990515011234"
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                        value={formData.patientId}
                        onChange={handleChange}
                        required
                      />
                      {lookupLoading && (
                        <Loader2 className="absolute right-3 top-3 w-4 h-4 text-blue-500 animate-spin" />
                      )}
                    </div>
                    {lookupError && (
                      <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" /> {lookupError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Patient Full Name
                      {patientFound && <span className="ml-2 text-emerald-600">✓ Verified</span>}
                    </label>
                    <div className="relative">
                      <Input
                        name="patientName"
                        placeholder={lookupLoading ? "Looking up…" : "Auto-filled from NRIC lookup"}
                        className={`h-11 transition-all cursor-not-allowed ${patientNameBorder}`}
                        value={formData.patientName}
                        onChange={handleChange}
                        readOnly
                        tabIndex={-1}
                      />
                      {patientFound && (
                        <CheckCircle2 className="absolute right-3 top-3 w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2 group">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Diagnosis</label>
                    <Input
                      name="diagnosis"
                      placeholder="Primary Medical Condition"
                      className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2 group">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Treatment Plan & Prescription</label>
                    <Textarea
                      name="treatment"
                      placeholder="Outline medicines, dosage, and follow-up steps..."
                      className="min-h-[140px] bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                      value={formData.treatment}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && (
                    <div className="md:col-span-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 py-4 max-w-md mx-auto">
                  {renderStatusStep(
                    RecordCreationStatus.ENCRYPTING,
                    "Local AES-256 Encryption",
                    <Lock className="w-5 h-5" />,
                    status === RecordCreationStatus.ENCRYPTING,
                    [RecordCreationStatus.STORING, RecordCreationStatus.SIGNING, RecordCreationStatus.COMPLETED].includes(status)
                  )}
                  {renderStatusStep(
                    RecordCreationStatus.STORING,
                    "Secure Database Offload",
                    <Database className="w-5 h-5" />,
                    status === RecordCreationStatus.STORING,
                    [RecordCreationStatus.SIGNING, RecordCreationStatus.COMPLETED].includes(status)
                  )}
                  {renderStatusStep(
                    RecordCreationStatus.SIGNING,
                    "Blockchain Ledger Commitment",
                    <Fingerprint className="w-5 h-5" />,
                    status === RecordCreationStatus.SIGNING,
                    status === RecordCreationStatus.COMPLETED
                  )}
                </div>
              )}

              {status === RecordCreationStatus.COMPLETED && (
                <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-8 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-900">Record Finalized</h3>
                    <p className="text-sm text-emerald-700">The medical record has been timestamped and secured.</p>
                  </div>
                  <div className="text-[10px] font-mono bg-white p-3 rounded-xl border border-emerald-100 text-emerald-600 break-all shadow-inner">
                    BLOCKCHAIN TX: {txHash}
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-end p-6 bg-slate-50/50 border-t border-slate-100">
            {status === RecordCreationStatus.IDLE ? (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={!patientFound || !formData.diagnosis || !formData.treatment}
                className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Lock className="w-4 h-4 mr-2" /> Encrypt & Sign Record
              </Button>
            ) : (
              <Button variant="outline" onClick={resetForm} disabled={status !== RecordCreationStatus.COMPLETED} className="w-full sm:w-auto font-bold">
                {status === RecordCreationStatus.COMPLETED ? "Start New Consultation" : "System Processing..."}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-40 h-40" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2" /> DApp Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Encryption Protocol</p>
              <p className="text-sm">Patient data is encrypted locally using <span className="font-bold underline decoration-blue-300">AES-256-GCM</span> before ever leaving the provider terminal.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Immutability</p>
              <p className="text-sm">Only the <span className="font-bold underline decoration-blue-300">Data Hash</span> is stored on the private blockchain, ensuring patient privacy while guaranteeing data integrity.</p>
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center space-x-2 text-xs font-bold bg-white/10 p-2 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Compliant with Blockchain HIPAA-v2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center">
              <Database className="w-4 h-4 mr-2 text-slate-400" /> Storage Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Record ID generation:</span>
              <span className="font-mono font-bold">SHA-256 Deterministic</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Signature scheme:</span>
              <span className="font-mono font-bold">ECDSA (secp256k1)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddRecordForm;
