import React, { useState } from 'react';
import { 
  FileText, Upload, CheckCircle2, ShieldAlert, Sparkles, 
  RefreshCw, ClipboardList, AlertCircle, FileSpreadsheet, Eye
} from 'lucide-react';
import { Prescription, Drug } from '../types';

interface PrescriptionCenterProps {
  prescriptions: Prescription[];
  drugs: Drug[];
  onUploadPrescription: (base64Image: string, mimeType: string) => Promise<Prescription>;
  onVerifyPrescription: (id: string, status: 'verified' | 'rejected') => Promise<Prescription>;
}

export default function PrescriptionCenter({ prescriptions, drugs, onUploadPrescription, onVerifyPrescription }: PrescriptionCenterProps) {
  // Upload and parsing states
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Interactive audit view for a clicked prescription line
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  // Quick preset sample sheets so testers don't need real photos
  const PRESETS = [
    {
      title: "Antibiotic Therapy Sheet",
      doctor: "Dr. Gregory House, MD",
      patient: "Emma Watson",
      meds: "Amoxicillin 500mg, Panadol",
      // Very short mini PNG base64 representation
      mimeType: "image/png",
      base64: "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"
    },
    {
      title: "Cardiac Management Guide",
      doctor: "Dr. Catherine Vance, MD",
      patient: "Arthur Dent",
      meds: "Atorvastatin 20mg",
      mimeType: "image/png",
      base64: "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"
    }
  ];

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      await executeOcrAnalysis(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetTrigger = async (preset: typeof PRESETS[0]) => {
    await executeOcrAnalysis(preset.base64, preset.mimeType);
  };

  const executeOcrAnalysis = async (base64: string, mimeType: string) => {
    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const rx = await onUploadPrescription(base64, mimeType);
      setSelectedRx(rx);
      setSuccessMessage(`Prescription analyzed by Gemini AI! RX ID: ${rx.prescriptionNumber}`);
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to analyze prescription sheet. Ensure the format is supported.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerifyStatus = async (rxId: string, status: 'verified' | 'rejected') => {
    try {
      const updated = await onVerifyPrescription(rxId, status);
      setSelectedRx(updated);
      setSuccessMessage(`Prescription status successfully updated to '${status}'`);
    } catch (e: any) {
      setErrorMessage("Could not update prescription status: " + e.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="prescription_tab_root">
      {/* Upload Portal / Selector list */}
      <div className="lg:col-span-4 space-y-5">
        {/* Drag and Drop Zone */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Digitize Paper Prescriptions</h3>
          <p className="text-[11px] text-slate-400">
            Upload a prescription image or document. Gemini AI automatically parses patient names, licensed doctors, and drugs.
          </p>

          <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group transition bg-slate-50/50">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUploadFile}
              className="hidden" 
              disabled={isUploading}
            />
            {isUploading ? (
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition" />
            )}
            <div className="text-xs font-bold text-slate-600 group-hover:text-emerald-700 transition">
              {isUploading ? "Gemini doing OCR analysis..." : "Upload prescription scan"}
            </div>
            <span className="text-[10px] text-slate-400 block">Accepts JPEG, PNG up to 10MB</span>
          </label>

          {/* Quick interactive shortcuts */}
          <div className="border-t border-slate-50 pt-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Interactive AI Presets
            </span>
            <div className="space-y-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetTrigger(p)}
                  disabled={isUploading}
                  className="w-full text-left bg-gradient-to-r from-emerald-50/30 to-teal-50/30 border border-emerald-100 hover:border-emerald-300 p-2.5 rounded-lg text-xs hover:shadow-xs transition duration-150 disabled:opacity-50 flex items-center justify-between cursor-pointer"
                  id={`preset_trigger_${idx}`}
                >
                  <div>
                    <span className="font-bold text-slate-700 block text-[11px]">{p.title}</span>
                    <span className="text-[10.5px] text-slate-400 mt-0.5 block italic">{p.meds}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-white border border-emerald-100 px-1.5 py-0.5 rounded text-nowrap">
                    Test OCR
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message boards */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold leading-relaxed flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold leading-relaxed flex gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> {successMessage}
          </div>
        )}
      </div>

      {/* List Ledger and Auditing form */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Prescription Queue */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs flex flex-col overflow-hidden max-h-[500px]">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-4.5 h-4.5 text-slate-500" /> Dispensing Rx Queue
            </h3>
            <span className="text-[10px] bg-slate-150 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              {prescriptions.length} entries
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1" id="prescription_item_list">
            {prescriptions.map((rx) => {
              const worksAsSelected = selectedRx?.id === rx.id;
              return (
                <div 
                  key={rx.id}
                  onClick={() => { setSelectedRx(rx); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`p-3.5 hover:bg-slate-50/50 transition cursor-pointer flex justify-between items-start ${
                    worksAsSelected ? 'bg-emerald-50/30 font-medium border-l-4 border-emerald-500 pl-2.5' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700 text-xs">{rx.prescriptionNumber}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        rx.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                        rx.status === 'dispensed' ? 'bg-blue-100 text-blue-800' :
                        rx.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {rx.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-bold mt-1.5 truncate">Patient: {rx.patientName}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Dr. {rx.doctorName}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono text-nowrap">{rx.date}</span>
                </div>
              );
            })}
            {prescriptions.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Queue is empty. Upload digital prescription bills on the left.
              </div>
            )}
          </div>
        </div>

        {/* Selected Prescription Verification Panel */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between max-h-[500px]">
          {selectedRx ? (
            <>
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">RX Details Audit</span>
                <span className="font-mono text-[10px] text-slate-500">{selectedRx.prescriptionNumber}</span>
              </div>

              {/* Scroll details */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs text-slate-600">
                {/* Patient / doctor blocks */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Patient Name</span>
                    <strong className="text-slate-700 font-bold text-sm">{selectedRx.patientName}</strong>
                    {selectedRx.patientAge && <span className="text-[10px] text-slate-400 block">Age: {selectedRx.patientAge} years</span>}
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Prescribing Doctor</span>
                    <strong className="text-slate-700 font-bold text-sm">Dr. {selectedRx.doctorName}</strong>
                    {selectedRx.doctorLicense && <span className="text-[10px] font-mono text-slate-400 block truncate">License: {selectedRx.doctorLicense}</span>}
                  </div>
                </div>

                {/* Compound matching status */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">Prescribed Drugs & Inventory Match</span>
                  <div className="space-y-2">
                    {selectedRx.drugs.map((drg, idx) => {
                      // Attempt to search matching drug in local catalog
                      const localMatch = drugs.find(d => d.name.toLowerCase().includes(drg.name.toLowerCase().split(' ')[0]));
                      return (
                        <div key={idx} className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 transition bg-slate-50/30">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-700 block">{drg.name}</span>
                            {localMatch ? (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-100">
                                Stocked ({localMatch.quantity} left)
                              </span>
                            ) : (
                              <span className="bg-rose-50 text-rose-600 text-[9px] font-bold px-1.5 py-0.2 rounded border border-rose-100">
                                Drug Catalog Gap
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">Dosage: {drg.dosage} &bull; Duration: {drg.duration}</div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Instruction: {drg.instructions}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes box */}
                {selectedRx.notes && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 text-[10.5px] text-slate-600">
                    <span className="font-bold text-amber-800 block text-[9.5px] uppercase tracking-wider mb-0.5">Pharmacist Notes</span>
                    {selectedRx.notes}
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 shrink-0">
                {selectedRx.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleVerifyStatus(selectedRx.id, 'rejected')}
                      className="flex-1 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 font-bold py-2 rounded-lg text-xs cursor-pointer transition"
                      id="rx_reject_btn"
                    >
                      Reject Scan
                    </button>
                    <button
                      onClick={() => handleVerifyStatus(selectedRx.id, 'verified')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer shadow-xs transition"
                      id="rx_approve_btn"
                    >
                      Verify & Approve Rx
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-2 text-slate-400 font-semibold text-xs bg-slate-100 rounded-lg">
                    Verification Complete &mdash; status: <span className="font-bold uppercase text-slate-600">{selectedRx.status}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
              <ClipboardList className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <span>Select any prescription in queue to audit and match against your drug inventory catalog.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
