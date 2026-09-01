import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Habitation, ExpertValidation } from '../types';
import { Badge } from '../components/Badge';
import { CheckCircle2, Edit3, UserCheck } from 'lucide-react';

export const ExpertValidationPage: React.FC = () => {
  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [validations, setValidations] = useState<ExpertValidation[]>([]);
  const [selectedHabId, setSelectedHabId] = useState<number>(1);
  const [decision, setDecision] = useState<'ACCEPTED' | 'REJECTED' | 'MODIFIED'>('ACCEPTED');
  const [overridePriority, setOverridePriority] = useState<string>('IMMEDIATE');
  const [comments, setComments] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [habs, vals] = await Promise.all([api.getHabitations(), api.getValidations()]);
    setHabitations(habs);
    setValidations(vals);
  };

  const handleValidationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitValidation({
        habitation_id: selectedHabId,
        validated_priority: overridePriority,
        decision,
        comments,
      });
      setSubmittedMsg('Expert validation recorded and decision log updated!');
      setComments('');
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSubmittedMsg(''), 4000);
    }
  };

  const activeHab = habitations.find((h) => h.id === selectedHabId) || habitations[0];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#CBD5E1] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#4F46E5]" />
            <span>Domain Expert Review & Validation Portal</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Human-in-the-loop expert sign-off and priority override audit trail (AI Prediction → Expert Review → Final Approval)
          </p>
        </div>
      </div>

      {/* Form & Audit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expert Sign-off Form Card */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#4F46E5]" />
            <span>Submit Expert Decision</span>
          </h3>

          {submittedMsg && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{submittedMsg}</span>
            </div>
          )}

          <form onSubmit={handleValidationSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Select Settlement for Review</label>
              <select
                value={selectedHabId}
                onChange={(e) => setSelectedHabId(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                {habitations.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.district}) - AI Priority: {h.relocation_priority}
                  </option>
                ))}
              </select>
            </div>

            {activeHab && (
              <div className="p-3 bg-[#E2E8F0]/60 rounded-xl border border-[#CBD5E1] text-xs flex justify-between items-center text-[#334155]">
                <span>AI Prediction Score: <strong className="text-amber-700">{activeHab.hazard_score}/100</strong></span>
                <Badge priority={activeHab.relocation_priority} size="sm" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Expert Decision</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('ACCEPTED')}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${decision === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs' : 'bg-[#E2E8F0]/60 border-[#CBD5E1] text-[#64748B]'}`}
                >
                  Accept AI Priority
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('MODIFIED')}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${decision === 'MODIFIED' ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs' : 'bg-[#E2E8F0]/60 border-[#CBD5E1] text-[#64748B]'}`}
                >
                  Modify Priority
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${decision === 'REJECTED' ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-xs' : 'bg-[#E2E8F0]/60 border-[#CBD5E1] text-[#64748B]'}`}
                >
                  Reject Prediction
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Validated Relocation Priority</label>
              <select
                value={overridePriority}
                onChange={(e) => setOverridePriority(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="IMMEDIATE">Immediate Relocation Required</option>
                <option value="SHORT_TERM">Short-Term Assessment</option>
                <option value="MEDIUM_TERM">Medium-Term Monitoring</option>
                <option value="MONITOR">Continuous Monitoring Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">Expert Technical Justification & Notes</label>
              <textarea
                rows={3}
                placeholder="Enter geological survey observations or field findings..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#E2E8F0]/60 border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-xs transition"
            >
              Sign-Off & Confirm Expert Validation
            </button>
          </form>
        </div>

        {/* Validation Audit Log List */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0F172A]">Validation Audit Trail Log</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {validations.map((v) => (
              <div key={v.id} className="p-4 bg-[#E2E8F0]/50 rounded-xl border border-[#CBD5E1] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">{v.expert_name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.decision === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                    {v.decision}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#64748B] text-[11px]">
                  <span>AI Priority: <Badge priority={v.original_priority} size="sm" /></span>
                  <span>➔</span>
                  <span>Validated: <Badge priority={v.validated_priority} size="sm" /></span>
                </div>
                {v.comments && (
                  <p className="text-[#334155] italic bg-[#F8FAFC] p-2.5 rounded-lg border border-[#CBD5E1]">
                    "{v.comments}"
                  </p>
                )}
                <span className="text-[10px] text-[#64748B] block">{v.created_at}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
