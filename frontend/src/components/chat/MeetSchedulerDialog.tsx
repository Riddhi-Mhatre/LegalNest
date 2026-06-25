import { useState } from 'react';
import { X, Calendar, FileText, Loader2 } from 'lucide-react';
import { proposeMeet } from '../../services/chatService';
import { useChatStore } from '../../store/chatStore';

interface MeetSchedulerDialogProps {
  roomId: string;
  onClose: () => void;
}

const inputClass =
  'w-full bg-black border border-dark-border rounded-lg px-3 py-2 text-white text-sm placeholder-muted focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all';
const labelClass = 'block text-xs text-muted font-bold uppercase tracking-wider mb-1.5';

export const MeetSchedulerDialog = ({ roomId, onClose }: MeetSchedulerDialogProps) => {
  const { addMessage } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    primaryDate: '', primaryTime: '',
    alt1Date: '', alt1Time: '',
    alt2Date: '', alt2Time: '',
    notes: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const isValid = form.primaryDate && form.primaryTime;

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const msg = await proposeMeet(roomId, form);
      addMessage(roomId, msg);
      onClose();
    } catch {
      alert('Failed to send meeting proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-dark-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border bg-black/40">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Calendar size={20} className="text-secondary" />
              Schedule Offline Meeting
            </h2>
            <p className="text-xs text-muted mt-1">Provide your preferred dates — buyer will confirm one</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-dark-hover hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Primary slot */}
          <div className="p-4 rounded-xl border border-secondary/30 bg-secondary/5">
            <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-secondary text-black text-[10px] flex items-center justify-center font-black">1</span>
              Primary Date (Required)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" className={inputClass} value={form.primaryDate}
                  onChange={e => set('primaryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input type="time" className={inputClass} value={form.primaryTime}
                  onChange={e => set('primaryTime', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Alternative 1 */}
          <div className="p-4 rounded-xl border border-dark-border bg-dark-card/40">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-dark-border text-muted text-[10px] flex items-center justify-center font-black">2</span>
              Alternative 1 (Optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" className={inputClass} value={form.alt1Date}
                  onChange={e => set('alt1Date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input type="time" className={inputClass} value={form.alt1Time}
                  onChange={e => set('alt1Time', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Alternative 2 */}
          <div className="p-4 rounded-xl border border-dark-border bg-dark-card/40">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-dark-border text-muted text-[10px] flex items-center justify-center font-black">3</span>
              Alternative 2 (Optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" className={inputClass} value={form.alt2Date}
                  onChange={e => set('alt2Date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input type="time" className={inputClass} value={form.alt2Time}
                  onChange={e => set('alt2Time', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>
              <FileText size={12} className="inline mr-1" />Notes / Agenda
            </label>
            <textarea
              className={`${inputClass} resize-none h-20`}
              placeholder="Location, documents to bring, any other notes..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-dark-border text-muted hover:text-white hover:border-white/30 transition-colors text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="flex-1 py-3 rounded-xl bg-secondary text-black font-bold text-sm hover:bg-teal-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
            Send Proposal
          </button>
        </div>
      </div>
    </div>
  );
};
