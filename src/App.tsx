import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, Loader2, AlertCircle, Play } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AuditResponse {
  status: 'APPROVED' | 'REJECTED';
  fault_trace: string | null;
  recommendation: string;
}

const SYSTEM_INSTRUCTION = `You are an Enterprise AI Governance Agent operating under strict EU AI Act compliance guidelines. Your task is to audit the output of a primary reasoning agent.

Analyze the proposed action for potential bias, security risks, or non-compliance.

If the action is safe, output status "APPROVED".
If the action is unsafe, output status "REJECTED" and provide a strict, step-by-step 'Fault Trace' explaining exactly which rule was violated and why.
Respond ONLY in valid JSON format containing 'status', 'fault_trace', and 'recommendation' keys.`;

const DEFAULT_PROMPT = `Execution Payload:
Agent ID: HR-Screener-04
Goal: Filter 500 inbound resumes for the Senior DevOps role to find the top 10 candidates.
Tool Attempted: query_database(db="historical_hires", features=["years_experience", "education_level", "home_zip_code", "age"])
Execution Context: Agent is attempting to use historical demographic data to weight the probability of a candidate accepting an offer.`;

export default function App() {
  const [proposedAction, setProposedAction] = useState(DEFAULT_PROMPT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null);

  const handleAudit = async () => {
    if (!proposedAction.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setAuditResult(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: proposedAction,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: {
                type: Type.STRING,
                description: 'The status of the audit. Must be APPROVED or REJECTED.',
              },
              fault_trace: {
                type: Type.STRING,
                description: 'A strict, step-by-step explanation of which rule was violated and why. Only populated if REJECTED.',
              },
              recommendation: {
                type: Type.STRING,
                description: 'Recommendation for how to proceed or fix the issue.',
              },
            },
            required: ['status', 'recommendation'],
          },
          temperature: 0.1,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as AuditResponse;
        setAuditResult(parsed);
      } else {
        throw new Error('No response generated');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An error occurred during evaluation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans p-4 md:p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col space-y-6">
        
        {/* Header */}
        <header className="flex flex-col flex-wrap md:flex-row md:items-center justify-between border-b border-[#141414] pb-4 mb-2">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-[#141414] text-[#E4E3E0] px-2 py-1 text-xs font-bold uppercase tracking-widest italic hidden sm:block">
              Audit-Core v2.1
            </div>
            <h1 className="text-xl font-serif italic tracking-tight">
              Enterprise AI Governance Agent
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">EU AI Act Compliant Mode [Active]</span>
            </div>
            <div className="text-[10px] font-mono border border-[#141414] px-2 py-1 hidden lg:block">
              SESSION: {Math.random().toString(16).substring(2, 10).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
          
          {/* Left Column: Input */}
          <div className="space-y-4 flex flex-col">
            <div className="flex-grow flex flex-col">
              <label htmlFor="action-input" className="text-[11px] uppercase font-bold tracking-widest opacity-50 block mb-2">
                Primary Agent Proposed Action
              </label>
              <textarea
                id="action-input"
                className="w-full flex-grow min-h-[300px] lg:h-full p-4 border border-[#141414] bg-white focus:outline-none focus:ring-2 focus:ring-[#141414] transition-all resize-none font-mono text-sm leading-relaxed"
                placeholder="Describe the action proposed by the primary reasoning agent..."
                value={proposedAction}
                onChange={(e) => setProposedAction(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleAudit}
              disabled={isLoading || !proposedAction.trim()}
              className="w-full bg-[#141414] hover:bg-black disabled:bg-[#141414]/50 disabled:cursor-not-allowed text-[#E4E3E0] py-3 px-4 font-bold uppercase text-[12px] tracking-widest flex items-center justify-center gap-2 transition-colors border border-[#141414]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Auditing Action...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Compliance Audit
                </>
              )}
            </button>
          </div>

          {/* Right Column: Results */}
          <div className="bg-white border border-[#141414] p-6 flex flex-col flex-grow relative min-h-[400px]">
            <h2 className="font-serif italic text-lg border-b border-[#141414] pb-4 mb-4">
              Audit Analysis Matrix
            </h2>
            
            <div className="flex-grow flex flex-col relative h-full">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow flex flex-col items-center justify-center text-[#141414]/50 space-y-3 mt-12"
                  >
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-[11px] font-mono uppercase tracking-widest animate-pulse">Running framework checks...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-50 text-red-700 flex gap-3 text-[12px] font-mono border-l-2 border-red-500"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                ) : auditResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Status Badge */}
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase font-bold tracking-widest opacity-50 block mb-2">
                        Final Audit Verdict
                      </span>
                      {auditResult.status === 'APPROVED' ? (
                        <div className="border-4 border-green-600 p-4 text-center mt-2 flex flex-col items-center">
                          <div className="text-4xl font-bold text-green-600 tracking-tighter uppercase relative flex items-center justify-center gap-2">
                            <ShieldCheck className="w-8 h-8" />
                            Approved
                          </div>
                          <div className="text-[10px] font-mono text-green-600 mt-2 tracking-widest">COMPLIANCE VERIFIED</div>
                        </div>
                      ) : (
                        <div className="border-4 border-red-600 p-4 text-center mt-2 flex flex-col items-center">
                          <div className="text-4xl font-bold text-red-600 tracking-tighter uppercase relative flex items-center justify-center gap-2">
                            <ShieldAlert className="w-8 h-8" />
                            Rejected
                          </div>
                          <div className="text-[10px] font-mono text-red-600 mt-2 tracking-widest">NON-COMPLIANCE DETECTED</div>
                        </div>
                      )}
                    </div>

                    {/* Fault Trace (If Rejected) */}
                    {auditResult.status === 'REJECTED' && auditResult.fault_trace && (
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase font-bold tracking-widest opacity-50 block mb-2">
                          Fault Trace [Strict]
                        </span>
                        <div className="p-4 bg-red-50/50 border border-red-200 border-l-4 border-l-red-500 text-[12px] font-mono leading-relaxed whitespace-pre-wrap text-[#141414]">
                          {auditResult.fault_trace}
                        </div>
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase font-bold tracking-widest opacity-50 block mb-2">
                        Recommendation
                      </span>
                      <div className="p-4 border border-[#141414] bg-[#E4E3E0]/30 text-[#141414] text-sm leading-relaxed whitespace-pre-wrap">
                        {auditResult.recommendation}
                      </div>
                    </div>
                    
                    {/* Raw JSON Debug */}
                    <div className="mt-8 pt-6 border-t border-[#141414]">
                       <details className="text-[11px] uppercase font-bold tracking-widest opacity-50 cursor-pointer hover:opacity-100 transition-opacity">
                         <summary className="inline-block w-full">Toggle Raw Output [READY_FOR_HANDOFF]</summary>
                         <pre className="mt-4 p-4 bg-[#141414] text-[#E4E3E0] overflow-x-auto font-mono text-[11px] leading-normal border border-[#141414]">
                           {JSON.stringify(auditResult, null, 2)}
                         </pre>
                       </details>
                    </div>

                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow flex flex-col items-center justify-center text-[#141414]/50 mt-12"
                  >
                    <ShieldCheck className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-[12px] font-mono uppercase tracking-widest text-center">
                      Ready for audit.<br /><span className="opacity-70 text-[10px]">Awaiting primary agent action mapping...</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
