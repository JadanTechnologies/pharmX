import { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle, AlertTriangle, AlertOctagon, 
  RefreshCw, TrendingUp, HelpCircle, ShieldAlert, BadgeInfo
} from 'lucide-react';

interface AIAnalystProps {
  drugsSnapshot: any[];
}

export default function AIAnalyst({ drugsSnapshot }: AIAnalystProps) {
  const [activeSegment, setActiveSegment] = useState<'safety' | 'demand'>('safety');

  // SAFETY CHECK STATE
  const [typedDrug, setTypedDrug] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [safetyReport, setSafetyReport] = useState<any | null>(null);
  const [isSafetyChecking, setIsSafetyChecking] = useState(false);
  const [safetyError, setSafetyError] = useState('');

  // DEMAND FORECAST STATE
  const [forecastReport, setForecastReport] = useState<any | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');

  // Fetch forecast report once on tab loading
  useEffect(() => {
    if (activeSegment === 'demand' && !forecastReport) {
      triggerDemandForecast();
    }
  }, [activeSegment]);

  const handleAddDrugTag = () => {
    if (!typedDrug.trim()) return;
    if (selectedDrugs.includes(typedDrug.trim())) {
      setTypedDrug('');
      return;
    }
    setSelectedDrugs(prev => [...prev, typedDrug.trim()]);
    setTypedDrug('');
    setSafetyReport(null);
    setSafetyError('');
  };

  const handleRemoveDrugTag = (name: string) => {
    setSelectedDrugs(prev => prev.filter(d => d !== name));
    setSafetyReport(null);
  };

  const triggerSafetyCheck = async () => {
    if (selectedDrugs.length < 2) {
      setSafetyError("At least 2 medications must be specified for drug-drug interaction audits.");
      return;
    }

    setIsSafetyChecking(true);
    setSafetyError('');
    setSafetyReport(null);

    try {
      const res = await fetch("/api/ai/check-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugNames: selectedDrugs })
      });

      if (!res.ok) {
        throw new Error("Safety check call failed");
      }

      const data = await res.json();
      setSafetyReport(data);
    } catch (e: any) {
      setSafetyError("Failed to obtain clinical safety report. Ensure backend server is connected and retry.");
    } finally {
      setIsSafetyChecking(false);
    }
  };

  const triggerDemandForecast = async () => {
    setIsForecastLoading(true);
    setForecastError('');
    try {
      const res = await fetch("/api/ai/forecast");
      if (!res.ok) {
        throw new Error("Forecast API failed");
      }
      const data = await res.json();
      setForecastReport(data);
    } catch (e: any) {
      setForecastError("AI forecast calculations defaulted. Tap Refresh to try again.");
    } finally {
      setIsForecastLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="ai_analyst_root">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> GEMINI AI FLASH AGENT
          </div>
          <h2 className="text-xl font-bold tracking-tight mt-2.5">AI Clinical Intelligence Module</h2>
          <p className="mt-1.5 text-slate-300 text-xs leading-relaxed">
            Protect patients and optimize operations. Verify multi-drug pharmacology interactions on POS checkouts and compile quarterly stock demand forecasts using Gemini's semantic model.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveSegment('safety')}
              className={`font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition ${
                activeSegment === 'safety' 
                  ? 'bg-white text-slate-900 font-bold' 
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
              id="ai_safety_trigger"
            >
              Drug Interaction Safety Checker
            </button>
            <button
              onClick={() => setActiveSegment('demand')}
              className={`font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition ${
                activeSegment === 'demand' 
                  ? 'bg-white text-slate-900 font-bold' 
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
              id="ai_demand_trigger"
            >
              Demand Prediction Forecasts
            </button>
          </div>
        </div>
      </div>

      {activeSegment === 'safety' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in" id="ai_safety_subpanel">
          {/* Tag Selector Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Clinical Interaction Checkers</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Before dispensing co-prescriptions, enter medical compounds here to scan international pharmacopoeias for kinetic interference flags.
            </p>

            <div className="space-y-3.5">
              {/* Input field */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type med name, e.g. Metformin"
                  value={typedDrug}
                  onChange={(e) => setTypedDrug(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDrugTag()}
                  className="flex-1 bg-slate-50 border border-slate-200 outline-hidden focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                  id="typed_drug_input"
                />
                <button
                  type="button"
                  onClick={handleAddDrugTag}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-705 font-bold text-xs px-3.5 py-1.5 rounded cursor-pointer"
                  id="add_drug_tag_btn"
                >
                  Add
                </button>
              </div>

              {/* Tag wrapper */}
              <div className="flex flex-wrap gap-1.5 min-h-12 p-2 bg-slate-50 border border-slate-150 rounded-lg">
                {selectedDrugs.map(name => (
                  <span 
                    key={name}
                    className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-semibold px-2 py-1 rounded text-xs border border-emerald-100 uppercase"
                  >
                    {name}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveDrugTag(name)}
                      className="text-slate-400 hover:text-rose-500 text-[10px] w-3 h-3 flex items-center justify-center font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {selectedDrugs.length === 0 && (
                  <span className="text-[11px] text-slate-400 my-auto mx-auto italic select-none">No active drug tags entered.</span>
                )}
              </div>

              {safetyError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2 text-[11px] rounded font-semibold leading-relaxed">
                  {safetyError}
                </div>
              )}

              <button
                type="button"
                onClick={triggerSafetyCheck}
                disabled={isSafetyChecking || selectedDrugs.length < 2}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider uppercase transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                id="do_safety_check_btn"
              >
                {isSafetyChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Cross-referencing Pharmacopoeia...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Run safety checker
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Outcome report */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 p-5 shadow-xs min-h-[350px] flex flex-col justify-between">
            {isSafetyChecking ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <RefreshCw className="w-12 h-12 stroke-1 text-slate-300 mb-2 animate-spin-reverse" />
                <span>Generating clinical reasoning report via Gemini...</span>
              </div>
            ) : safetyReport ? (
              <div className="space-y-4 animate-fade-in text-xs text-slate-600">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Analysis Evaluation</span>
                    <strong className="text-slate-800 font-bold block mt-0.5">
                      {safetyReport.interactions.length > 0 ? "Potential drug conflicts identified" : "Clinically approved combination"}
                    </strong>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-1 roundeduppercase ${
                    safetyReport.severityLevel === 'high' ? 'bg-rose-500 text-white' :
                    safetyReport.severityLevel === 'moderate' ? 'bg-amber-400 text-slate-905 font-bold' :
                    safetyReport.severityLevel === 'low' ? 'bg-teal-100 text-teal-800 font-bold' : 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-100'
                  }`}>
                    Risk: {safetyReport.severityLevel.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Executive summary</span>
                  <p className="leading-relaxed text-slate-600 text-[11px] bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {safetyReport.reportSummary}
                  </p>
                </div>

                {safetyReport.interactions.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Recorded kinetic clashes</span>
                    {safetyReport.interactions.map((it: any, idx: number) => (
                      <div key={idx} className="p-3 border border-rose-100 bg-rose-50/10 rounded-lg space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{it.drugA} &harr; {it.drugB}</span>
                          <span className="text-rose-600 uppercase text-[9px]">{it.severity} action</span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-500">{it.mechanism}</p>
                        <div className="text-[10px] text-rose-700 bg-rose-50/50 p-1.5 rounded-md mt-1.5 italic font-semibold leading-relaxed">
                          Recommendation: {it.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {safetyReport.isSimulated && (
                  <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 flex items-center gap-2">
                    <BadgeInfo className="w-4 h-4 text-slate-500 shrink-0" />
                    <p className="text-[9.5px] text-slate-500 leading-snug">
                      Simulation Disclaimer: System running offline simulation backup. Define process.env.GEMINI_API_KEY inside Secrets panel to activate live clinical pharmacopoeia audits.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-8">
                <HelpCircle className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
                <span>No reports generated. Pick at least 2 drugs (e.g. Atorvastatin and Insulin Glargine) on left column and execute diagnostics.</span>
              </div>
            )}

            <div className="border-t border-slate-50 pt-3 text-slate-400 text-[9px] uppercase tracking-wider text-right flex items-center justify-end gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Powered by Gemini LLM
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in" id="ai_demand_subpanel">
          {/* Executive forecast report summary details */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">AI Stockout Risk and Demand Predictor</h3>
                <p className="text-[11px] text-slate-400">Quarterly inventory demand forecasting models aligned with local sales velocities.</p>
              </div>
              <button 
                onClick={triggerDemandForecast}
                disabled={isForecastLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs p-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition border border-slate-200 disabled:opacity-50"
                id="refresh_demand_btn"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isForecastLoading ? 'animate-spin' : ''}`} /> Refresh analytics
              </button>
            </div>

            {isForecastLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
                <RefreshCw className="w-12 h-12 stroke-1 text-emerald-600 mb-2 animate-spin" />
                <span>Gemini compiling neural demand analytics...</span>
              </div>
            ) : forecastError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold">
                {forecastError}
              </div>
            ) : forecastReport ? (
              <div className="space-y-5 text-xs text-slate-600">
                <div className="p-3.5 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border border-emerald-150 rounded-xl space-y-1 text-slate-700">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider text-[9.5px] block font-mono">Executive analyst summary</span>
                  <p className="text-[11.5px] leading-relaxed font-sans">{forecastReport.executiveSummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Stockout risks predictions list */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-slate-700 tracking-wider text-[10.5px] uppercase">Stocks Depletion Ratings</h4>
                    <div className="space-y-2.5">
                      {forecastReport.predictions.map((p: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-800 text-sm">{p.drugName}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              p.riskRating === 'high' ? 'bg-rose-100 text-rose-700' :
                              p.riskRating === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-teal-50 text-teal-800'
                            }`}>
                              Risk: {p.riskRating}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Trend: <span className="uppercase text-slate-600 font-bold">{p.expectedDemandTrend}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">{p.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-reorder warnings suggestions */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-slate-700 tracking-wider text-[10.5px] uppercase">Auto Reorder Recommendations</h4>
                    <div className="space-y-2.5">
                      {forecastReport.reorderSuggestions.map((r: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span className="text-slate-800">{r.drugName}</span>
                            <span className="text-emerald-700 text-xs font-bold font-mono">Suggest: +{r.suggestedReorderQuantity} qnt</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">Current Available: {r.currentStock} units</div>
                          <p className="text-[10.5px] text-slate-500 mt-1 leading-normal italic font-medium">"{r.justification}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {forecastReport.isSimulated && (
                  <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 flex items-center gap-2">
                    <BadgeInfo className="w-4 h-4 text-slate-500 shrink-0" />
                    <p className="text-[9.5px] text-slate-500 leading-snug">
                      Simulation Disclaimer: Forecast compiles based on default database metrics due to offline sandbox mode. Active process.env.GEMINI_API_KEY required for real-time live learning regressions.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-405 text-xs">
                Tap 'Refresh analytics' above to kickstart the AI neural modeling pipeline.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
