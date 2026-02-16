import React, { useState, useEffect, useMemo } from 'react';
import { Edit3, Save, RotateCcw, X, Eye } from 'lucide-react';
import {
  saveReportOverride, deleteReportOverride,
  ReportOverride
} from '../utils/database';
import { REPORT_SECTIONS } from '../utils/adminTypes';

// ─── Report Editor Component ────────────────────────────────────────
export default function ReportEditor({
  clientId,
  fullReport,
  overrides: initialOverrides,
  onOverridesChange,
}: {
  clientId: string;
  fullReport: any;
  overrides: ReportOverride[];
  onOverridesChange: () => void;
}) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<ReportOverride[]>(initialOverrides);

  // Sync with parent overrides
  useEffect(() => { setOverrides(initialOverrides); }, [initialOverrides]);

  const overrideMap = useMemo(() => {
    const map: Record<string, string> = {};
    overrides.forEach(o => { map[o.section_key] = o.custom_content; });
    return map;
  }, [overrides]);

  const handleStartEdit = (sectionKey: string, autoContent: string) => {
    setEditingSection(sectionKey);
    setEditTexts(prev => ({
      ...prev,
      [sectionKey]: overrideMap[sectionKey] || autoContent,
    }));
  };

  const handleSave = async (sectionKey: string) => {
    const text = editTexts[sectionKey]?.trim();
    if (!text) return;
    setSaving(sectionKey);
    const success = await saveReportOverride(clientId, sectionKey, text);
    if (success) {
      setOverrides(prev => {
        const existing = prev.find(o => o.section_key === sectionKey);
        if (existing) {
          return prev.map(o => o.section_key === sectionKey ? { ...o, custom_content: text } : o);
        }
        return [...prev, { section_key: sectionKey, custom_content: text }];
      });
      onOverridesChange();
    }
    setSaving(null);
    setEditingSection(null);
  };

  const handleRevert = async (sectionKey: string) => {
    setSaving(sectionKey);
    const success = await deleteReportOverride(clientId, sectionKey);
    if (success) {
      setOverrides(prev => prev.filter(o => o.section_key !== sectionKey));
      onOverridesChange();
    }
    setSaving(null);
    setEditingSection(null);
  };

  const editableSections = REPORT_SECTIONS.filter(s => {
    const auto = s.getAutoContent(fullReport);
    // Show section if it has auto content OR is additional_notes OR already has an override
    return auto || s.key === 'additional_notes' || overrideMap[s.key];
  });

  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/30 mb-3 flex items-center gap-2">
        <Edit3 size={12} />
        Report Editor
        <span className="text-brand-mid/60 ml-1">
          ({Object.keys(overrideMap).length} section{Object.keys(overrideMap).length !== 1 ? 's' : ''} customized)
        </span>
      </div>

      <div className="space-y-3">
        {editableSections.map(section => {
          const autoContent = section.getAutoContent(fullReport);
          const hasOverride = !!overrideMap[section.key];
          const isEditing = editingSection === section.key;
          const isSaving = saving === section.key;

          return (
            <div
              key={section.key}
              className={`rounded-xl border transition-all ${
                hasOverride
                  ? 'bg-purple-50/50 border-purple-200/50'
                  : 'bg-white/60 border-brand-dark/5'
              }`}
            >
              {/* Section header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-brand-dark/70">{section.label}</span>
                  {hasOverride && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                      Edited
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(section.key, autoContent)}
                      className="p-1.5 rounded-lg hover:bg-brand-dark/5 text-brand-dark/30 hover:text-brand-dark/60 transition-colors"
                      title="Edit this section"
                    >
                      <Edit3 size={12} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSave(section.key)}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors disabled:opacity-40"
                        title="Save"
                      >
                        <Save size={12} />
                      </button>
                      {hasOverride && (
                        <button
                          onClick={() => handleRevert(section.key)}
                          disabled={isSaving}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40"
                          title="Revert to auto-generated"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingSection(null)}
                        className="p-1.5 rounded-lg hover:bg-brand-dark/5 text-brand-dark/30 transition-colors"
                        title="Cancel"
                      >
                        <X size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content area */}
              {isEditing ? (
                <div className="px-3 pb-3 space-y-2">
                  {/* Auto-generated reference (collapsed by default) */}
                  {autoContent && (
                    <details className="group">
                      <summary className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/20 cursor-pointer hover:text-brand-dark/40 transition-colors flex items-center gap-1">
                        <Eye size={10} />
                        Auto-generated reference
                      </summary>
                      <p className="mt-2 text-xs text-brand-dark/40 font-lora leading-relaxed bg-white/50 rounded-lg p-3 border border-brand-dark/5">
                        {autoContent}
                      </p>
                    </details>
                  )}
                  <textarea
                    value={editTexts[section.key] || ''}
                    onChange={(e) => setEditTexts(prev => ({ ...prev, [section.key]: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 bg-white text-sm focus:outline-none focus:border-brand-mid resize-y font-lora leading-relaxed"
                    placeholder={section.key === 'additional_notes' ? 'Add custom notes to append to the report...' : 'Write your custom content for this section...'}
                  />
                </div>
              ) : (
                <div className="px-3 pb-3">
                  <p className="text-xs text-brand-dark/50 font-lora leading-relaxed line-clamp-2">
                    {hasOverride ? overrideMap[section.key] : (autoContent || 'No auto-generated content')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
