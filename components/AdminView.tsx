import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown, ChevronUp, User, Activity, AlertTriangle, Shield,
  Wrench, ArrowRight, MessageSquare, Send, Search, DollarSign,
  CheckCircle, Filter, RefreshCw, X
} from 'lucide-react';
import { fetchAllClients, fetchAllPayments, saveAdminNote, saveAdminTaggedNote } from '../utils/database';
import { runDiagnostic, IntakeResponse } from '../utils/diagnosticEngine';

// ─── PIN Gate ───────────────────────────────────────────────────────
const ADMIN_PIN = '1234'; // Change this to your own PIN

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('afterload_admin_unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 p-10 w-full max-w-sm text-center shadow-lg">
        <div className="w-14 h-14 rounded-full bg-brand-dark/5 flex items-center justify-center mx-auto mb-6">
          <Shield size={24} className="text-brand-dark/40" />
        </div>
        <h2 className="font-serif text-2xl text-brand-dark mb-2">Admin Access</h2>
        <p className="text-xs text-brand-dark/40 mb-8">Enter your PIN to continue</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="PIN"
          autoFocus
          className={`w-full text-center text-2xl tracking-[0.5em] px-6 py-4 rounded-xl border transition-colors focus:outline-none ${
            error
              ? 'border-red-300 bg-red-50 animate-[shake_0.3s_ease-in-out]'
              : 'border-brand-dark/10 bg-white focus:border-brand-mid'
          }`}
        />
        <button
          type="submit"
          className="mt-6 w-full py-3 rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-deep transition-colors"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────
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

type PaymentRecord = {
  id: string;
  email: string;
  payment_type: string;
  amount_cents: number;
  status: string;
  created_at: string;
};

type ClientStage = 'new' | 'preview_done' | 'deposit_paid' | 'clarity_done' | 'balance_paid' | 'delivered';

const STAGE_CONFIG: Record<ClientStage, { label: string; color: string; order: number }> = {
  new:             { label: 'New Lead',      color: 'bg-gray-100 text-gray-600',   order: 0 },
  preview_done:    { label: 'Preview Done',  color: 'bg-blue-100 text-blue-700',   order: 1 },
  deposit_paid:    { label: 'Deposit Paid',  color: 'bg-emerald-100 text-emerald-700', order: 2 },
  clarity_done:    { label: 'Clarity Done',    color: 'bg-purple-100 text-purple-700', order: 3 },
  balance_paid:    { label: 'Balance Paid',  color: 'bg-amber-100 text-amber-700', order: 4 },
  delivered:       { label: 'Delivered',     color: 'bg-green-100 text-green-700',  order: 5 },
};

function getClientStage(client: any, payments: PaymentRecord[]): ClientStage {
  const clientPayments = payments.filter(p => p.email?.toLowerCase() === client.email?.toLowerCase() && p.status === 'succeeded');
  const hasDeposit = clientPayments.some(p => p.payment_type === 'deposit');
  const hasBalance = clientPayments.some(p => p.payment_type === 'balance');
  const hasClaritySession = client.intake_responses?.some((r: any) => r.mode === 'deep');
  const isDelivered = client.admin_notes?.some((n: any) => n.note?.includes('[delivered]'));

  if (isDelivered) return 'delivered';
  if (hasBalance) return 'balance_paid';
  if (hasClaritySession) return 'clarity_done';
  if (hasDeposit) return 'deposit_paid';
  if (client.intake_responses?.length > 0) return 'preview_done';
  return 'new';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function formatCents(cents: number) {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars.toFixed(0)}` : `$${dollars.toFixed(2)}`;
}

// ─── Types ──────────────────────────────────────────────────────────
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

// ─── Main Admin View ────────────────────────────────────────────────
export default function AdminView() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('afterload_admin_unlocked') === 'true');
  const [clients, setClients] = useState<ClientData[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [noteTexts, setNoteTexts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<ClientStage | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [clientData, paymentData] = await Promise.all([
      fetchAllClients(),
      fetchAllPayments(),
    ]);
    setClients(clientData as ClientData[]);
    setPayments(paymentData as PaymentRecord[]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  const handleSaveNote = async (clientId: string) => {
    const text = noteTexts[clientId]?.trim();
    if (!text) return;
    setSavingNote(true);
    await saveAdminNote(clientId, text);
    setNoteTexts(prev => ({ ...prev, [clientId]: '' }));
    setSavingNote(false);
    loadData();
  };

  const handleMarkDelivered = async (clientId: string) => {
    await saveAdminTaggedNote(clientId, `Report delivered on ${new Date().toLocaleDateString()}`, 'delivered');
    loadData();
  };

  const handleReleaseReport = async (clientId: string) => {
    await saveAdminTaggedNote(clientId, `Report released for client viewing on ${new Date().toLocaleDateString()}`, 'report-released');
    loadData();
  };

  // Filtered + sorted clients
  const filteredClients = useMemo(() => {
    return clients
      .map(c => ({ ...c, stage: getClientStage(c, payments) }))
      .filter(c => {
        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesSearch =
            c.email?.toLowerCase().includes(q) ||
            c.first_name?.toLowerCase().includes(q) ||
            c.business_name?.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }
        // Stage filter
        if (stageFilter !== 'all' && c.stage !== stageFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort: most recent first, but also group by stage priority
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [clients, payments, searchQuery, stageFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const allWithStages = clients.map(c => ({ stage: getClientStage(c, payments) }));
    const totalRevenue = payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount_cents, 0);
    return {
      total: clients.length,
      depositsCollected: payments.filter(p => p.payment_type === 'deposit' && p.status === 'succeeded').length,
      balancesCollected: payments.filter(p => p.payment_type === 'balance' && p.status === 'succeeded').length,
      delivered: allWithStages.filter(c => c.stage === 'delivered').length,
      awaitingClarity: allWithStages.filter(c => c.stage === 'deposit_paid').length,
      totalRevenue,
    };
  }, [clients, payments]);

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-brand-dark/30 text-sm font-bold uppercase tracking-widest">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 animate-[fadeInUp_0.6s_ease-out_both]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-serif text-3xl md:text-4xl text-brand-dark">Afterload Admin</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-brand-dark/10 text-xs font-bold uppercase tracking-wider text-brand-dark/50 hover:bg-white transition-colors disabled:opacity-40"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <p className="text-brand-dark/40 text-sm">{clients.length} client{clients.length !== 1 ? 's' : ''} total</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 p-4 text-center">
            <div className="text-2xl font-serif text-brand-dark">{stats.total}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Total Clients</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 p-4 text-center">
            <div className="text-2xl font-serif text-emerald-600">{stats.depositsCollected}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Deposits</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 p-4 text-center">
            <div className="text-2xl font-serif text-amber-600">{stats.awaitingClarity}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Awaiting Clarity Session</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 p-4 text-center">
            <div className="text-2xl font-serif text-green-600">{stats.delivered}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Delivered</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 p-4 text-center col-span-2 md:col-span-1">
            <div className="text-2xl font-serif text-brand-dark">{formatCents(stats.totalRevenue)}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Revenue</div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or business..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 border border-brand-dark/10 text-sm focus:outline-none focus:border-brand-mid placeholder:text-brand-dark/30"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/30 hover:text-brand-dark">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-brand-dark/30" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as ClientStage | 'all')}
              className="px-4 py-3 rounded-xl bg-white/70 border border-brand-dark/10 text-sm focus:outline-none focus:border-brand-mid text-brand-dark/70"
            >
              <option value="all">All Stages</option>
              <option value="new">New Lead</option>
              <option value="preview_done">Preview Done</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="clarity_done">Clarity Done</option>
              <option value="balance_paid">Balance Paid</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {(searchQuery || stageFilter !== 'all') && (
          <p className="text-xs text-brand-dark/40 mb-4">
            Showing {filteredClients.length} of {clients.length} clients
          </p>
        )}

        {/* Client List */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-brand-dark/20 text-sm font-bold uppercase tracking-widest mb-2">
              {clients.length === 0 ? 'No clients yet' : 'No matches'}
            </div>
            <p className="text-brand-dark/40 text-sm font-lora">
              {clients.length === 0
                ? 'Intake responses will appear here once someone completes the diagnostic.'
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client, idx) => {
              const isExpanded = expandedClient === client.id;
              const latestIntake = [...(client.intake_responses || [])]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
              const hasClaritySession = client.intake_responses?.some(r => r.mode === 'deep');
              const answers = latestIntake?.answers || {};
              const clientPayments = payments.filter(p => p.email?.toLowerCase() === client.email?.toLowerCase() && p.status === 'succeeded');
              const stage = client.stage;
              const stageInfo = STAGE_CONFIG[stage];

              // Run full diagnostic if we have clarity session data
              let fullReport = null;
              if (hasClaritySession && isExpanded) {
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
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  {/* Client header */}
                  <button
                    onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                    className="w-full text-left bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0">
                          <User size={16} className="text-brand-dark/40" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif text-lg text-brand-dark truncate">
                            {client.first_name || client.email.split('@')[0]}
                            {client.business_name && (
                              <span className="text-brand-dark/30 font-sans text-sm ml-2">- {client.business_name}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-brand-dark/40 truncate">{client.email}</span>
                            <span className="text-[9px] text-brand-dark/30">{formatDate(client.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        {/* Payment indicators */}
                        {clientPayments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <DollarSign size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600">
                              {formatCents(clientPayments.reduce((s, p) => s + p.amount_cents, 0))}
                            </span>
                          </div>
                        )}
                        {/* Stage badge */}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${stageInfo.color}`}>
                          {stageInfo.label}
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-brand-dark/30" /> : <ChevronDown size={16} className="text-brand-dark/30" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <div className={`grid transition-all duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="bg-white/50 backdrop-blur-md rounded-b-2xl border-x border-b border-white/60 -mt-2 pt-6 pb-6 px-6 space-y-6">

                        {/* Payment Timeline */}
                        {clientPayments.length > 0 && (
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
                              <DollarSign size={12} />
                              Payment History
                            </div>
                            <div className="space-y-2">
                              {clientPayments.map(p => (
                                <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    <span className="text-xs font-medium text-brand-dark/70 capitalize">{p.payment_type}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-brand-dark">{formatCents(p.amount_cents)}</span>
                                    <span className="text-[10px] text-brand-dark/30">{formatDateTime(p.created_at)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        {stage !== 'delivered' && (stage === 'balance_paid' || stage === 'clarity_done') && (
                          <div className="space-y-2">
                            {/* Release Report — makes the in-app report visible to the client */}
                            {hasClaritySession && !client.admin_notes?.some((n: any) => n.note?.includes('[report-released]')) && (
                              <button
                                onClick={() => handleReleaseReport(client.id)}
                                className="w-full py-3 rounded-xl bg-brand-deep text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                              >
                                <Shield size={14} />
                                Release Report to Client
                              </button>
                            )}
                            {client.admin_notes?.some((n: any) => n.note?.includes('[report-released]')) && (
                              <div className="flex items-center gap-2 py-2 px-3 bg-purple-50 rounded-xl">
                                <CheckCircle size={12} className="text-purple-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Report released — client can view in-app</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleMarkDelivered(client.id)}
                              className="w-full py-3 rounded-xl bg-green-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={14} />
                              Mark as Delivered
                            </button>
                          </div>
                        )}

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

                        {/* Founder's voice */}
                        {answers.biggest_frustration && (
                          <div className="bg-brand-dark/[0.02] rounded-xl p-4 border border-brand-dark/5">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">In Their Words</div>
                            <p className="font-lora italic text-brand-dark/70 leading-relaxed">"{answers.biggest_frustration}"</p>
                          </div>
                        )}

                        {/* Composite Scores */}
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

                        {/* Key Signals */}
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
                                .filter((s: string, i: number, arr: string[]) => arr.indexOf(s) === i)
                                .slice(0, 12)
                                .map((signal: string, i: number) => (
                                  <div key={i} className="text-sm text-brand-dark/60 flex items-start gap-2 py-1">
                                    <span className="text-brand-dark/20 mt-0.5">&bull;</span>
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
                                  <span className="ml-1 opacity-60">- {stage.signal}</span>
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

                        {/* Primary constraint */}
                        {fullReport && (
                          <div className="bg-brand-dark/[0.03] rounded-xl p-4 border border-brand-dark/5">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2 flex items-center gap-2">
                              <Shield size={12} />
                              Constraint: {fullReport.primaryConstraint} - {fullReport.constraintSolutionCategory}
                            </div>
                            <p className="text-sm text-brand-dark/60 leading-relaxed mb-3">{fullReport.constraintDescription}</p>
                            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-2">Success Trap</div>
                            <p className="text-sm text-brand-dark/50 font-lora leading-relaxed">{fullReport.successTrapNarrative}</p>
                          </div>
                        )}

                        {/* Raw Answers */}
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
                              {[...client.admin_notes]
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map(note => (
                                  <div key={note.id} className="bg-white/60 rounded-lg p-3">
                                    <p className="text-sm text-brand-dark/70">
                                      {note.note.startsWith('[delivered]') ? (
                                        <span className="flex items-center gap-2">
                                          <CheckCircle size={12} className="text-green-500" />
                                          <span className="text-green-700 font-medium">{note.note.replace('[delivered] ', '')}</span>
                                        </span>
                                      ) : (
                                        note.note
                                      )}
                                    </p>
                                    <p className="text-[10px] text-brand-dark/30 mt-1">
                                      {formatDateTime(note.created_at)}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={noteTexts[client.id] || ''}
                              onChange={(e) => setNoteTexts(prev => ({ ...prev, [client.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(client.id); }}
                              placeholder="Add a note..."
                              className="flex-1 px-4 py-2 rounded-xl bg-white border border-brand-dark/10 text-sm focus:outline-none focus:border-brand-mid"
                            />
                            <button
                              onClick={() => handleSaveNote(client.id)}
                              disabled={savingNote || !(noteTexts[client.id]?.trim())}
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
        )}

      </div>
    </div>
  );
}
