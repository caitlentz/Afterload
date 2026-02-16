import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronUp, ChevronDown, X, Edit3, Plus, Search, RotateCcw,
  Send, Save, Package, Layers, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';
import { ClarityQuestion, CLARITY_SESSION_QUESTIONS } from '../utils/claritySessionQuestions';
import { buildDeepDiveQuestionSet, PackMeta } from '../utils/deepDiveBuilder';
import { saveQuestionPack, QuestionPack } from '../utils/database';
import type { IntakeResponse } from '../utils/diagnosticEngine';
import type { PreviewResult } from '../utils/previewEngine';

// ─── Constants ──────────────────────────────────────────────────────

const DIMENSION_LABELS: Record<string, string> = {
  founderCentralization: 'Founder Dependency',
  structuralFragility: 'System Fragility',
  decisionBottleneck: 'Decision Bottleneck',
  capacityConstraint: 'Capacity Constraint',
};

const TRACK_LABELS: Record<string, string> = {
  A: 'Time-Bound Services',
  B: 'Decision-Heavy Services',
  C: 'Founder-Led Services',
};

const TYPE_COLORS: Record<string, string> = {
  single: 'bg-blue-100 text-blue-700',
  multi: 'bg-indigo-100 text-indigo-700',
  text: 'bg-amber-100 text-amber-700',
  dollar: 'bg-emerald-100 text-emerald-700',
  form: 'bg-purple-100 text-purple-700',
};

const MODULE_COLORS: Record<string, string> = {
  'Decision Load': 'bg-red-50 text-red-600',
  'Context Switching': 'bg-orange-50 text-orange-600',
  'Sustainability Horizon': 'bg-yellow-50 text-yellow-700',
  'Financial Health': 'bg-emerald-50 text-emerald-600',
  'Process Heatmap': 'bg-cyan-50 text-cyan-700',
  'System Health': 'bg-blue-50 text-blue-600',
  'Workload Analysis': 'bg-violet-50 text-violet-600',
  'Flow Friction': 'bg-pink-50 text-pink-600',
  'Diagnosis & Roadmap': 'bg-gray-50 text-gray-600',
  'Founder Reality': 'bg-brand-dark/5 text-brand-dark/60',
};

// ─── Props ──────────────────────────────────────────────────────────

interface QuestionPackEditorProps {
  clientId: string;
  clientEmail: string;
  intakeAnswers: IntakeResponse;
  previewResult: PreviewResult | null;
  existingPack: QuestionPack | null;
  onPackSaved: () => void;
}

// ─── Component ──────────────────────────────────────────────────────

export default function QuestionPackEditor({
  clientId,
  clientEmail,
  intakeAnswers,
  previewResult,
  existingPack,
  onPackSaved,
}: QuestionPackEditorProps) {
  const [questions, setQuestions] = useState<ClarityQuestion[]>([]);
  const [packMeta, setPackMeta] = useState<PackMeta | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddSearch, setShowAddSearch] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [packStatus, setPackStatus] = useState<'draft' | 'shipped' | 'custom' | 'none'>(
    existingPack?.status || 'none'
  );

  // Generate or load pack on mount
  useEffect(() => {
    if (existingPack) {
      setQuestions(existingPack.questions as ClarityQuestion[]);
      setPackMeta(existingPack.pack_meta as PackMeta);
      setPackStatus(existingPack.status);
    } else if (previewResult) {
      generatePack();
    }
  }, [existingPack, previewResult]);

  const generatePack = () => {
    if (!previewResult) return;
    const result = buildDeepDiveQuestionSet({
      intake: intakeAnswers,
      preview: previewResult,
    });
    setQuestions(result.questions);
    setPackMeta(result.packMeta);
    setHasChanges(true);
  };

  // Available questions for "Add" feature
  const currentIds = useMemo(() => new Set(questions.map(q => q.id)), [questions]);
  const availableQuestions = useMemo(() => {
    return CLARITY_SESSION_QUESTIONS.filter(q => !currentIds.has(q.id));
  }, [currentIds]);

  const filteredAvailable = useMemo(() => {
    if (!addSearchQuery.trim()) return availableQuestions.slice(0, 20);
    const q = addSearchQuery.toLowerCase();
    return availableQuestions.filter(
      question =>
        question.text.toLowerCase().includes(q) ||
        question.module.toLowerCase().includes(q) ||
        question.id.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [availableQuestions, addSearchQuery]);

  // ─── Actions ────────────────────────────────────────────────────

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
    setHasChanges(true);
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setHasChanges(true);
  };

  const addQuestion = (question: ClarityQuestion) => {
    setQuestions(prev => [...prev, question]);
    setShowAddSearch(false);
    setAddSearchQuery('');
    setHasChanges(true);
  };

  const startEditQuestion = (q: ClarityQuestion) => {
    setEditingQuestionId(q.id);
    setEditText(q.text);
  };

  const saveQuestionEdit = (id: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, text: trimmed } : q)
    );
    setEditingQuestionId(null);
    setEditText('');
    setHasChanges(true);
  };

  const handleSaveDraft = async () => {
    if (!packMeta) return;
    setSaving(true);
    await saveQuestionPack(clientId, questions, packMeta, 'draft');
    setPackStatus('draft');
    setHasChanges(false);
    setSaving(false);
    onPackSaved();
  };

  const handleShip = async () => {
    if (!packMeta) return;
    setSaving(true);
    await saveQuestionPack(clientId, questions, packMeta, 'shipped');
    setPackStatus('shipped');
    setHasChanges(false);
    setSaving(false);
    onPackSaved();
  };

  const handleReset = () => {
    generatePack();
    setPackStatus('none');
  };

  if (!previewResult && !existingPack) {
    return (
      <div className="bg-brand-dark/[0.02] rounded-xl p-6 border border-brand-dark/5 text-center">
        <Package size={24} className="text-brand-dark/20 mx-auto mb-3" />
        <p className="text-sm text-brand-dark/40">No preview result available. Complete the initial intake to generate a question pack.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Section Header ─── */}
      <div className="flex items-center justify-between">
        <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 flex items-center gap-2">
          <Package size={12} />
          Clarity Session Question Pack
        </div>
        <div className="flex items-center gap-2">
          {packStatus === 'shipped' && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle size={10} />
              Shipped
            </span>
          )}
          {packStatus === 'draft' && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              Draft
            </span>
          )}
          {hasChanges && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-dark/5 text-brand-dark/40">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* ─── Pack Metadata Card ─── */}
      {packMeta && (
        <div className="bg-gradient-to-br from-brand-dark/[0.03] to-brand-dark/[0.01] rounded-xl p-5 border border-brand-dark/5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Track</div>
              <div className="text-sm text-brand-dark font-medium">
                {packMeta.track} — {TRACK_LABELS[packMeta.track] || packMeta.track}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Primary Constraint</div>
              <div className="text-sm text-brand-dark font-medium">
                {DIMENSION_LABELS[packMeta.primaryConstraint || ''] || packMeta.primaryConstraint || '—'}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Secondary Constraint</div>
              <div className="text-sm text-brand-dark font-medium">
                {DIMENSION_LABELS[packMeta.secondaryConstraint || ''] || packMeta.secondaryConstraint || '—'}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Selected Modules</div>
              <div className="flex flex-wrap gap-1">
                {packMeta.selectedModules.map(m => (
                  <span key={m} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${MODULE_COLORS[m] || 'bg-gray-50 text-gray-500'}`}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Breakdown</div>
              <div className="text-xs text-brand-dark/60">
                {packMeta.spineCount} spine · {packMeta.moduleCount} module · {packMeta.trackCount} track · {packMeta.personableCount} personable
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/25 mb-1">Estimated Time</div>
              <div className="text-sm text-brand-dark font-medium flex items-center gap-1.5">
                <Clock size={12} className="text-brand-dark/30" />
                ~{packMeta.estimatedMinutes} min
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Question List ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30">
            Questions ({questions.length})
          </div>
          <button
            onClick={() => setShowAddSearch(!showAddSearch)}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-mid hover:text-brand-dark transition-colors"
          >
            <Plus size={12} />
            Add Question
          </button>
        </div>

        {/* Add question search */}
        {showAddSearch && (
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-brand-dark/10 p-4 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/30" />
              <input
                type="text"
                value={addSearchQuery}
                onChange={e => setAddSearchQuery(e.target.value)}
                placeholder="Search questions by text, module, or ID..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-brand-dark/10 text-sm focus:outline-none focus:border-brand-mid"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredAvailable.length === 0 ? (
                <p className="text-xs text-brand-dark/30 text-center py-4">No matching questions found</p>
              ) : (
                filteredAvailable.map(q => (
                  <button
                    key={q.id}
                    onClick={() => addQuestion(q)}
                    className="w-full text-left p-3 rounded-lg hover:bg-brand-dark/5 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <Plus size={12} className="text-brand-dark/20 group-hover:text-brand-mid mt-0.5 shrink-0 transition-colors" />
                      <div className="min-w-0">
                        <div className="text-xs text-brand-dark/70 leading-relaxed">{q.text}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${MODULE_COLORS[q.module] || 'bg-gray-50 text-gray-500'}`}>
                            {q.module}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[q.type] || 'bg-gray-100 text-gray-500'}`}>
                            {q.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => { setShowAddSearch(false); setAddSearchQuery(''); }}
              className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-brand-dark/30 hover:text-brand-dark/50 py-1 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Question items */}
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white/60 rounded-xl border border-brand-dark/5 p-3 group hover:border-brand-dark/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Number + reorder */}
              <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                <button
                  onClick={() => moveQuestion(idx, -1)}
                  disabled={idx === 0}
                  className="p-0.5 rounded text-brand-dark/15 hover:text-brand-dark/40 disabled:opacity-30 transition-colors"
                >
                  <ChevronUp size={10} />
                </button>
                <span className="text-[9px] font-bold text-brand-dark/25 w-5 text-center">{idx + 1}</span>
                <button
                  onClick={() => moveQuestion(idx, 1)}
                  disabled={idx === questions.length - 1}
                  className="p-0.5 rounded text-brand-dark/15 hover:text-brand-dark/40 disabled:opacity-30 transition-colors"
                >
                  <ChevronDown size={10} />
                </button>
              </div>

              {/* Question content */}
              <div className="flex-1 min-w-0">
                {editingQuestionId === q.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 bg-white text-sm focus:outline-none focus:border-brand-mid resize-y"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveQuestionEdit(q.id)}
                        className="text-[9px] font-bold uppercase tracking-wider text-green-600 hover:text-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQuestionId(null)}
                        className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 hover:text-brand-dark/50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-brand-dark/70 leading-relaxed">{q.text}</p>
                )}

                {/* Badges */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${MODULE_COLORS[q.module] || 'bg-gray-50 text-gray-500'}`}>
                    {q.module}
                  </span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[q.type] || 'bg-gray-100 text-gray-500'}`}>
                    {q.type}
                  </span>
                  {q.tracks.map(t => (
                    <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-brand-dark/5 text-brand-dark/30">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingQuestionId !== q.id && (
                  <button
                    onClick={() => startEditQuestion(q)}
                    className="p-1.5 rounded-lg hover:bg-brand-dark/5 text-brand-dark/20 hover:text-brand-dark/50 transition-colors"
                    title="Edit question text"
                  >
                    <Edit3 size={11} />
                  </button>
                )}
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-brand-dark/20 hover:text-red-500 transition-colors"
                  title="Remove question"
                >
                  <X size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          onClick={handleSaveDraft}
          disabled={saving || questions.length === 0}
          className="flex-1 py-3 rounded-xl bg-white border border-brand-dark/10 text-xs font-bold uppercase tracking-widest text-brand-dark/60 hover:bg-brand-dark/5 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Save size={14} />
          Save as Draft
        </button>
        <button
          onClick={handleShip}
          disabled={saving || questions.length === 0}
          className="flex-1 py-3 rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-deep transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Send size={14} />
          {packStatus === 'shipped' ? 'Update & Re-ship' : 'Ship to Client'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving}
          className="py-3 px-4 rounded-xl border border-brand-dark/10 text-xs font-bold uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark/60 hover:bg-brand-dark/5 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          title="Re-generate from intake data"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
