import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import {
  ChevronRight, User, Shield,
  Search, DollarSign, Filter, RefreshCw, X
} from 'lucide-react';
import { fetchAllClients, fetchAllPayments } from '../utils/database';
import { getPreviewEligibility } from '../utils/normalizeIntake';
import {
  ClientData, PaymentRecord, ClientStage, STAGE_CONFIG,
  getClientStage, getBusinessInfo, formatDate, formatCents
} from '../utils/adminTypes';

const AdminClientProfile = lazy(() => import('./AdminClientProfile'));

// ─── PIN Gate ───────────────────────────────────────────────────────
const ADMIN_PIN = '4410';

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
      <form onSubmit={handleSubmit} className="card-delivery-style rounded-3xl p-10 w-full max-w-sm text-center shadow-lg">
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

// ─── Main Admin View ────────────────────────────────────────────────
export default function AdminView() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('afterload_admin_unlocked') === 'true');
  const [clients, setClients] = useState<ClientData[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
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

  // Filtered + sorted clients
  const filteredClients = useMemo(() => {
    return clients
      .map(c => ({ ...c, stage: getClientStage(c, payments) }))
      .filter(c => {
        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const latestIntake = [...(c.intake_responses || [])]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          const answers = latestIntake?.answers || {};
          const biz = getBusinessInfo(answers);

          const matchesSearch =
            c.email?.toLowerCase().includes(q) ||
            c.first_name?.toLowerCase().includes(q) ||
            c.business_name?.toLowerCase().includes(q) ||
            biz.website?.toLowerCase().includes(q) ||
            biz.industryType?.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }
        // Stage filter
        if (stageFilter !== 'all' && c.stage !== stageFilter) return false;
        return true;
      })
      .sort((a, b) => {
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

  // Find selected client
  const selectedClient = selectedClientId
    ? clients.find(c => c.id === selectedClientId) || null
    : null;

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-brand-dark/30 text-sm font-bold uppercase tracking-widest">Loading clients...</div>
      </div>
    );
  }

  // ─── Detail View ──────────────────────────────────────────────────
  if (selectedClient) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-brand-dark/30 text-sm font-bold uppercase tracking-widest">Loading profile...</div>
        </div>
      }>
        <AdminClientProfile
          client={selectedClient}
          payments={payments}
          onBack={() => setSelectedClientId(null)}
          onDataChanged={() => loadData()}
        />
      </Suspense>
    );
  }

  // ─── List View ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto page-cream-sage-shell">

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
          <div className="card-delivery-style rounded-2xl p-4 text-center">
            <div className="text-2xl font-serif text-brand-dark">{stats.total}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Total Clients</div>
          </div>
          <div className="card-delivery-style rounded-2xl p-4 text-center">
            <div className="text-2xl font-serif text-emerald-600">{stats.depositsCollected}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Deposits</div>
          </div>
          <div className="card-delivery-style rounded-2xl p-4 text-center">
            <div className="text-2xl font-serif text-amber-600">{stats.awaitingClarity}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Awaiting Clarity Session</div>
          </div>
          <div className="card-delivery-style rounded-2xl p-4 text-center">
            <div className="text-2xl font-serif text-green-600">{stats.delivered}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mt-1">Delivered</div>
          </div>
          <div className="card-delivery-style rounded-2xl p-4 text-center col-span-2 md:col-span-1">
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
              placeholder="Search by name, email, business, or industry..."
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
          <div className="space-y-3">
            {filteredClients.map((client, idx) => {
              const latestIntake = [...(client.intake_responses || [])]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
              const answers = latestIntake?.answers || {};
              const previewEligibility = latestIntake?.answers ? getPreviewEligibility(latestIntake.answers) : null;
              const clientPayments = payments.filter(p => p.email?.toLowerCase() === client.email?.toLowerCase() && p.status === 'succeeded');
              const clarityReleased = client.admin_notes?.some((n: any) => n.note?.includes('[clarity-released]'));
              const stage = client.stage;
              const stageInfo = STAGE_CONFIG[stage];
              const biz = getBusinessInfo(answers);

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className="w-full text-left card-delivery-style rounded-2xl p-5 hover:shadow-md transition-all animate-[fadeInUp_0.4s_ease-out_both]"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0">
                        <User size={16} className="text-brand-dark/40" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif text-lg text-brand-dark truncate">
                          {client.first_name || biz.firstName || client.email.split('@')[0]}
                          {(client.business_name || biz.businessName) && (
                            <span className="text-brand-dark/30 font-sans text-sm ml-2">- {client.business_name || biz.businessName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-brand-dark/40 truncate">{client.email}</span>
                          {biz.industryType && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-dark/5 text-brand-dark/40 font-medium">
                              {biz.industryType.split('(')[0]?.trim()}
                            </span>
                          )}
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
                      {clarityReleased && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap bg-green-100 text-green-700">
                          Clarity Released
                        </span>
                      )}
                      <ChevronRight size={16} className="text-brand-dark/20" />
                    </div>
                  </div>
                  {previewEligibility && (
                    <div className="mt-3 pt-3 border-t border-brand-dark/5 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-dark/10 text-brand-dark/50">
                          Pattern {previewEligibility.metadata.pattern}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-dark/10 text-brand-dark/50">
                          Confidence {previewEligibility.metadata.confidence}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-dark/10 text-brand-dark/50">
                          Founder {previewEligibility.metadata.founderDependencyScore}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-dark/55">
                        Primary: {previewEligibility.metadata.primaryConstraint.label} ({previewEligibility.metadata.primaryConstraint.score}) ·
                        Secondary: {previewEligibility.metadata.secondaryConstraint.label} ({previewEligibility.metadata.secondaryConstraint.score})
                      </div>
                      <div className="text-[11px] text-brand-dark/45 font-lora">
                        {previewEligibility.metadata.rationale}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
