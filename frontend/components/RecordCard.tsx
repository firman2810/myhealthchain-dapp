
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Alert, AlertTitle, AlertDescription } from './ui/elements';
import { ShieldCheck, AlertTriangle, Fingerprint, Database, Link as LinkIcon, Lock, Calendar } from 'lucide-react';
import { MedicalRecord } from '../types';

interface RecordCardProps {
  record: MedicalRecord;
  isTampered: boolean;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, isTampered }) => {
  const displayedDbHash = isTampered ? record.dbHash.replace('7', 'f') : record.dbHash;
  const isMatch = displayedDbHash === record.chainHash;

  return (
    <Card className={`border-none shadow-xl overflow-hidden transition-all duration-300 ${isMatch ? 'ring-1 ring-slate-200' : 'ring-2 ring-red-500 bg-red-50/10'}`}>
      <div className={`h-1.5 w-full ${isMatch ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />

      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              <Calendar className="w-3 h-3 mr-1" /> Verified Entry: {record.date}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Medical Entry #{record.id}
            </CardTitle>
            <p className="text-sm font-semibold text-blue-600">Attending Provider: {record.doctorName}</p>
          </div>

          {isMatch ? (
            <Badge variant="success" className="h-7 px-3 bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Immutable
            </Badge>
          ) : (
            <Badge variant="destructive" className="h-7 px-3 font-bold animate-bounce">
              <AlertTriangle className="w-4 h-4 mr-1.5" /> Tampered
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Verification Logic Box */}
        <div className={`rounded-xl border p-4 ${isMatch ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-200 shadow-lg shadow-red-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center">
              <Fingerprint className="w-4 h-4 mr-2 text-slate-400" /> Proof of Integrity
            </h4>
            {isMatch && <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-100 rounded-full">HASH MATCH</span>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <Database className="w-3 h-3 mr-1" /> Storage Node Hash
              </div>
              <div className={`p-2.5 rounded-lg border font-mono text-[10px] break-all leading-tight ${isMatch ? 'bg-white border-slate-200' : 'bg-red-100 border-red-200 text-red-700 font-bold'}`}>
                {displayedDbHash}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <LinkIcon className="w-3 h-3 mr-1" /> Blockchain Ledger Hash
              </div>
              <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 font-mono text-[10px] break-all leading-tight text-blue-700">
                {record.chainHash}
              </div>
            </div>
          </div>

          {!isMatch && (
            <Alert variant="destructive" className="mt-4 bg-white border-red-200 shadow-sm">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-bold">Security Compromise Detected</AlertTitle>
              <AlertDescription className="text-xs font-medium">
                CRITICAL: The local database record has been altered. The cryptographic fingerprint does not match the blockchain's immutable truth. Access to this record should be revoked.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Content Section */}
        <div className={`grid gap-6 ${!isMatch ? 'opacity-20 blur-sm grayscale' : ''} transition-all duration-500`}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Clinical Diagnosis</label>
            <p className="text-lg font-bold text-slate-800 leading-tight">{record.diagnosis}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Plan & Prescription</label>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm leading-relaxed text-slate-700 font-medium">
              {record.treatment}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-4">
            <div className="flex items-center">
              <Lock className="w-3 h-3 mr-1 text-emerald-500" /> End-to-End Encrypted
            </div>
            <div className="flex items-center">
              MyHealthChain Ledger Protocol v1.0
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordCard;
