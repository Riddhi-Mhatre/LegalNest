import { useState } from 'react';
import { X, CreditCard, CheckCircle, Loader2, Shield, Building2 } from 'lucide-react';
import { payDealFee } from '../../services/chatService';
import { useChatStore } from '../../store/chatStore';

interface DemoPaymentModalProps {
  roomId: string;
  role: 'buyer' | 'seller';
  propertyTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DemoPaymentModal = ({ roomId, role, propertyTitle, onClose, onSuccess }: DemoPaymentModalProps) => {
  const [step, setStep] = useState<'info' | 'processing' | 'done'>('info');
  const { addMessage } = useChatStore();

  const handlePay = async () => {
    setStep('processing');
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2000));
    try {
      const msg = await payDealFee(roomId, role);
      addMessage(roomId, msg);
      setStep('done');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch {
      alert('Payment failed. Please try again.');
      setStep('info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-dark-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">

        {step === 'done' ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-muted text-sm">Platform fee of ₹999 received. Processing deal closure...</p>
          </div>
        ) : step === 'processing' ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-6">
              <Loader2 size={40} className="text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Processing Payment</h2>
            <p className="text-muted text-sm">Please wait while we confirm your payment...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white">Platform Fee</h2>
                  <p className="text-xs text-muted capitalize">{role} payment</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-dark-hover hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-muted" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Property info */}
              {propertyTitle && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-dark-card border border-dark-border">
                  <Building2 size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted uppercase tracking-widest font-bold mb-0.5">Property</p>
                    <p className="text-sm font-semibold text-white">{propertyTitle}</p>
                  </div>
                </div>
              )}

              {/* Fee breakdown */}
              <div className="rounded-xl border border-dark-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-dark-card">
                  <span className="text-sm text-muted">Platform Listing / Deal Fee</span>
                  <span className="text-sm font-bold text-white">₹999</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-dark-card border-t border-dark-border">
                  <span className="text-sm text-muted">GST (18%)</span>
                  <span className="text-sm font-bold text-white">₹179.82</span>
                </div>
                <div className="flex items-center justify-between px-4 py-4 bg-primary/5 border-t border-primary/20">
                  <span className="text-sm font-bold text-white uppercase tracking-wide">Total</span>
                  <span className="text-xl font-display font-black text-primary">₹1,178.82</span>
                </div>
              </div>

              {/* Demo notice */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <Shield size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-300/80">
                  <span className="font-bold">Demo Mode:</span> No real payment will be processed. Click below to simulate payment. Razorpay integration coming soon.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-dark-border text-muted hover:text-white hover:border-white/30 transition-colors text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
              >
                <CreditCard size={16} />
                Pay ₹1,178.82 (Demo)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
