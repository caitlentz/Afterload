import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, User, Activity, AlertTriangle, Shield, Heart, Wrench, ArrowRight, MessageSquare, Send } from 'lucide-react';
import { fetchAllClients, saveAdminNote } from '../utils/database';
import { runDiagnostic, IntakeResponse } from '../utils/diagnosticEngine';

// Score badge color helper
function scoreColor(level: string): string {
  if (['CRITICAL', 'HIGH', 'RED', 'BROKEN', 'BLOCKED'].includes(level)) return 'bg-red-100 text-red-700';
  if (['MODERATE', 'YELLOW', 'FRAGILE', 'NOT_YET', 'ADEQUATE'].includes(level)) return 'bg-amber-100 text-amber-700';
  if (['LOW', 'GREEN', 'STRONG', 'READY', 'CLOSE'].includes(level)) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-500';
}

function ScoreBadge({ label, level, score }: { label: string; level: string; score: number }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-xl">
      <span className="text-xs font-medium text-brand-dark/60">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-brand-dark/40">{score}/100</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${scoreColor(level)}`}>
          {level}
        </span>
      </div>
    </div>
  );
}

type ClientData = {
  id: string;
  email: string;
  first_name: string | null;
  business_name: string | null;
  created_at: string;
  intake_responses: Array<{
    id: string;
    mode: string;
    track: string;
    answers: IntakeResponse;
    created_at: string;
  }>;
  diagnostic_results: Array<{
    id: string;
    result_type: string;
    report: any;
    created_at: string;
  }>;
  admin_notes: Array<{
    id: string;
    note: string;
    created_at: string;
  }>;
};

export default function AdminView() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await fetchAllClients();
    setClients(data as ClientData[]);
    setLoading(false);
  };

  const handleSaveNote = async (clientId: string) => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    await saveAdminNote(clientId, noteText.trim());
    setNoteText('');
    setSavingNote(false);
    loadClients(); // Refresh to show new note
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-brand-dark/30 text-sm font-bold uppercase tracking-widest">Loading clients...</div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-brand-dark/20 text-sm font-bold uppercase tracking-widest mb-2">No clients yet</div>
          <p className="text-brand-dark/40 text-sm font-lora">Intake responses will appear here once someone completes the diagnostic.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          className="mb-10 animate-[fadeInUp_0.6s_ease-out_both]"
        >
          <h1 className="font-serif text-3xl md:text-4xl text-brand-dark mb-2">Client Review</h1>
          <p className="text-brand-dark/40 text-sm">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="space-y-4">
          {clients.map((client, idx) => {
            const isExpanded = expandedClient === client.id;
            const latestIntake = client.intake_responses
              ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            const latestDiagnostic = client.diagnostic_results
              ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            const hasDeepDive = client.intake_responses?.some(r => r.mode === 'deep');
            const answers = latestIntake?.answers || {};

            // Run full diagnostic if we have deep dive data
            let fullReport = null;
            if (hasDeepDive) {
              const deepIntake = client.intake_responses.find(r => r.mode === 'deep');
              if (deepIntake) {
                try {
                  fullReport = runDiagnostic(deepIntake.answers).report;
                } catch (e) {
                  console.error('Error running diagnostic for', client.email, e);
                }
              }
            }

            return (
              <div
                key={client.id}
                className="animate-[fadeInUp_0.4s_ease-out_both]"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Client header (always visible) */}
                <button
                  onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                  className="w-full text-left bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-dark/5 flex items-center justify-center">
                        <User size={16} className="text-brand-dark/40" />
                      </div>
                      <div>
                        <div className="font-serif text-lg text-brand-dark">
                          {client.first_name || client.email.split('@')[0]}
                          {client.business_name && (
                            <span className="text-brand-dark/30 font-sans text-sm ml-2">— {client.business_name}</span>
                          )}
                        </div>
                        <div className="text-xs text-brand-dark/40">{client.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasDeepDive && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-brand-dark text-white">
                          Deep Dive
                        </span>
                      )}
                      {latestIntake && !hasDeepDive && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-brand-dark/10 text-brand-dark/50">
                          Preview Only
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-brand-dark/30" /> : <ChevronDown size={16} className="text-brand-dark/30" />}
                    </div>
                  </div>
                </button>

                {/* Expanded client detail */}
                <div className={`grid transition-all duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                      <div className="bg-white/50 backdrop-blur-md rounded-b-2xl border-x border-b border-white/60 -mt-2 pt-6 pb-6 px-6 space-y-6">

                        {/* Quick context */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {answers.business_type && (
                            <div className="bg-white/60 rounded-xl p-3">
                              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">Model</div>
                              <div className="text-sm text-brand-dark font-medium">{answers.business_type?.split('(')[0]?.trim()}</div>
                            </div>
                          )}
                          {latestIntake?.track && (
                            <div className="bg-white/60 rounded-xl p-3">
                              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">Track</div>
                              <div className="text-sm text-brand-dark font-medium">
                                {latestIntake.track === 'A' ? 'Time-Bound' : latestIntake.track === 'B' ? 'Decision-Heavy' : 'Founder-Led'}
                              </div>
                            </div>
                          )}
                          {answers.team_size && (
                            <div className="bg-white/60 rounded-xl p-3">
                              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">Team</div>
                              <div className="text-sm text-brand-dark font-medium">{answers.team_size}</div>
                            </div>
                          )}
                          {answers.hourly_rate && (
                            <div className="bg-white/60 rounded-xl p-3">
                              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-1">Rate</div>
                              <div className="text-sm text-brand-dark font-medium">{answers.hourly_rate}</div>
                            </div>
                          )}
                        </div>

                        {/* Founder's voice — their own words */}
                        {answers.biggest_frustration && (
                          <div className="bg-brand-dark/[0.02] rounded-xl p-4 border border-brand-dark/5">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">In Their Words</div>
                            <p className="font-lora italic text-brand-dark/70 leading-relaxed">"{answers.biggest_frustration}"</p>
                          </div>
                        )}

                        {/* Composite Scores (if full report available) */}
                        {fullReport?.compositeScores && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                              <Activity size={12} />
                              Automated Scores
                            </div>
                            <div className="space-y-2">
                              <ScoreBadge label="Founder Risk" level={fullReport.compositeScores.founderRisk.level} score={fullReport.compositeScores.founderRisk.score} />
                              <ScoreBadge label="System Health" level={fullReport.compositeScores.systemHealth.level} score={fullReport.compositeScores.systemHealth.score} />
                              <ScoreBadge label="Delegation Readiness" level={fullReport.compositeScores.delegationReadiness.level} score={fullReport.compositeScores.delegationReadiness.score} />
                              <ScoreBadge label="Burnout Risk" level={fullReport.compositeScores.burnoutRisk.level} score={fullReport.compositeScores.burnoutRisk.score} />
                            </div>
                          </div>
                        )}

                        {/* Signals (the stuff automation found) */}
                        {fullReport?.compositeScores && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                              <AlertTriangle size={12} />
                              Key Signals
                            </div>
                            <div className="space-y-1.5">
                              {[
                                ...fullReport.compositeScores.founderRisk.signals,
                                ...fullReport.compositeScores.burnoutRisk.signals,
                                ...fullReport.compositeScores.systemHealth.signals,
                                ...fullReport.compositeScores.delegationReadiness.signals,
                              ]
                                .filter((s, i, arr) => arr.indexOf(s) === i) // dedupe
                                .slice(0, 12) // cap at 12
                                .map((signal, i) => (
                                  <div key={i} className="text-sm text-brand-dark/60 flex items-start gap-2 py-1">
                                    <span className="text-brand-dark/20 mt-0.5">•</span>
                                    {signal}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Process Heatmap */}
                        {fullReport?.heatmap && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                              <Wrench size={12} />
                              Process Map
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {fullReport.heatmap.map((stage: any) => (
                                <div
                                  key={stage.name}
                                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                                    stage.status === 'RED' ? 'bg-red-100 text-red-700' :
                                    stage.status === 'YELLOW' ? 'bg-amber-100 text-amber-700' :
                                    stage.status === 'GREEN' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-400'
                                  }`}
                                  title={stage.signal}
                                >
                                  {stage.name}
                                  <span className="ml-1 opacity-60">— {stage.signal}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Phases / Roadmap */}
                        {fullReport?.phases && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                              <ArrowRight size={12} />
                              Automated Roadmap
                            </div>
                            <div className="space-y-2">
                              {fullReport.phases.map((phase: any, i: number) => (
                                <div key={i} className="bg-white/60 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-brand-dark/30">Phase {i + 1}</span>
                                    <span className="font-medium text-sm text-brand-dark">{phase.name}</span>
                                  </div>
                                  <p className="text-xs text-brand-dark/50 mb-1">{phase.description}</p>
                                  <p className="text-xs text-brand-dark/70 font-medium">{phase.actionItem}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Primary constraint + success trap */}
                        {fullReport && (
                          <div className="bg-brand-dark/[0.03] rounded-xl p-4 border border-brand-dark/5">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2 flex items-center gap-2">
                              <Shield size={12} />
                              Constraint: {fullReport.primaryConstraint} — {fullReport.constraintSolutionCategory}
                            </div>
                            <p className="text-sm text-brand-dark/60 leading-relaxed mb-3">{fullReport.constraintDescription}</p>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">Success Trap</div>
                            <p className="text-sm text-brand-dark/50 font-lora leading-relaxed">{fullReport.successTrapNarrative}</p>
                          </div>
                        )}

                        {/* All raw answers (collapsible) */}
                        <details className="group">
                          <summary className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 cursor-pointer hover:text-brand-dark/50 transition-colors">
                            Raw Answers ({Object.keys(answers).length} fields)
                          </summary>
                          <div className="mt-3 space-y-2">
                            {Object.entries(answers)
                              .filter(([_, v]) => v !== null && v !== undefined && v !== '')
                              .map(([key, value]) => (
                                <div key={key} className="flex items-start gap-3 py-1 border-b border-brand-dark/5 last:border-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/30 w-40 shrink-0">{key}</span>
                                  <span className="text-sm text-brand-dark/70">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </details>

                        {/* Admin notes */}
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                            <MessageSquare size={12} />
                            Your Notes
                          </div>

                          {client.admin_notes?.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {client.admin_notes
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map(note => (
                                  <div key={note.id} className="bg-white/60 rounded-lg p-3">
                                    <p className="text-sm text-brand-dark/70">{note.note}</p>
                                    <p className="text-[10px] text-brand-dark/30 mt-1">
                                      {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={expandedClient === client.id ? noteText : ''}
                              onChange={(e) => setNoteText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(client.id); }}
                              placeholder="Add a note..."
                              className="flex-1 px-4 py-2 rounded-xl bg-white border border-brand-dark/10 text-sm focus:outline-none focus:border-brand-mid"
                            />
                            <button
                              onClick={() => handleSaveNote(client.id)}
                              disabled={savingNote || !noteText.trim()}
                              className="px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 hover:bg-brand-deep transition-colors flex items-center gap-1"
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        </div>

                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
