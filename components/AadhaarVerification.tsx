import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, ArrowRight, RotateCcw, CheckCircle2, AlertCircle, Loader2, X, LockKeyhole } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ============================================================
// AADHAAR VERIFICATION COMPONENT
// 3-step wizard: Aadhaar Input → OTP Verification → Success
// ============================================================

type VerificationStep = 'aadhaar' | 'otp' | 'success';

interface AadhaarVerificationProps {
  /** If true, renders as an inline card. If false/undefined, renders as a modal overlay. */
  inline?: boolean;
  /** Called when verification is complete */
  onVerified?: (kycData: any) => void;
  /** Called when the modal/card is closed */
  onClose?: () => void;
  /** Called when the user skips verification */
  onSkip?: () => void;
}

// Format Aadhaar as XXXX XXXX XXXX
function formatAadhaar(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

// Mask Aadhaar for display: •••• •••• 1234
function maskAadhaar(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return value;
  return `•••• •••• ${digits.slice(-4)}`;
}

const AadhaarVerification: React.FC<AadhaarVerificationProps> = ({
  inline = false,
  onVerified,
  onClose,
  onSkip,
}) => {
  const { user, updateUser } = useAuth();

  // Step state
  const [step, setStep] = useState<VerificationStep>('aadhaar');

  // Aadhaar step
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [consent, setConsent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // OTP step
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [referenceId, setReferenceId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Success step
  const [kycData, setKycData] = useState<any>(null);

  // Error
  const [error, setError] = useState('');

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Aadhaar validation
  const rawAadhaar = aadhaarInput.replace(/\D/g, '');
  const isAadhaarValid = rawAadhaar.length === 12;

  // ---- HANDLERS ----

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaar(e.target.value);
    setAadhaarInput(formatted);
    setError('');
  };

  const handleSendOtp = async () => {
    if (!isAadhaarValid || !consent) return;
    setSendingOtp(true);
    setError('');

    try {
      const res = await fetch('/api/aadhaar/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_number: rawAadhaar }),
      });
      const data = await res.json();

      if (data.success) {
        setReferenceId(data.reference_id);
        setStep('otp');
        setResendCooldown(30);
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData.length === 6) {
      setOtp(pasteData.split(''));
      otpRefs.current[5]?.focus();
    }
  }, []);

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6 || !user) return;
    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/aadhaar/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: referenceId,
          otp: otpString,
          user_id: user.id,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setKycData(data.data);
        setStep('success');
        // Update local user state
        updateUser({ ...user, is_verified: true, aadhaar_verified_at: new Date().toISOString() });
        onVerified?.(data.data);
      } else {
        setError(data.message || 'Verification failed.');

        // If max attempts or session expired, go back to aadhaar step
        if (data.error === 'MAX_ATTEMPTS' || data.error === 'SESSION_EXPIRED' || data.error === 'INVALID_REFERENCE') {
          setTimeout(() => {
            setStep('aadhaar');
            setOtp(['', '', '', '', '', '']);
            setReferenceId('');
          }, 2000);
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    await handleSendOtp();
  };

  // ---- RENDER ----

  const renderAadhaarStep = () => (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Shield size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verify Your Identity</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quick Aadhaar verification to keep the community safe</p>
      </div>

      {/* Aadhaar Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Aadhaar Number
        </label>
        <div className="relative">
          <input
            type="text"
            value={aadhaarInput}
            onChange={handleAadhaarChange}
            placeholder="XXXX XXXX XXXX"
            maxLength={14}
            className={`w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-700 border-2 
              ${isAadhaarValid ? 'border-green-400 dark:border-green-500' : 'border-gray-200 dark:border-gray-600'}
              text-gray-900 dark:text-white placeholder-gray-400 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none 
              transition-all text-lg tracking-[0.2em] font-mono text-center`}
            id="aadhaar-input"
          />
          {isAadhaarValid && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
          For testing: use <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono">999999990019</code>
        </p>
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          id="aadhaar-consent"
        />
        <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          I voluntarily consent to verifying my identity via Aadhaar OTP verification for the purpose of account safety.
          My Aadhaar number will <strong>not</strong> be stored.
        </span>
      </label>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSendOtp}
        disabled={!isAadhaarValid || !consent || sendingOtp}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-white
          bg-gradient-to-r from-blue-600 to-indigo-600 
          hover:from-blue-700 hover:to-indigo-700 
          disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
          transition-all duration-200 shadow-lg shadow-blue-500/20 
          disabled:shadow-none flex items-center justify-center gap-2"
        id="send-otp-btn"
      >
        {sendingOtp ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Sending OTP...
          </>
        ) : (
          <>
            Send OTP <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Skip */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-2 transition-colors"
        >
          Skip for now →
        </button>
      )}
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <LockKeyhole size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter OTP</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Sent to Aadhaar-linked mobile ({maskAadhaar(rawAadhaar)})
        </p>
      </div>

      {/* OTP Boxes */}
      <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={el => { otpRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2
              ${digit ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700'}
              text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
              transition-all duration-150`}
            id={`otp-input-${idx}`}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Test OTP: <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono">123456</code>
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleVerifyOtp}
          disabled={otp.join('').length !== 6 || verifying}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-white
            bg-gradient-to-r from-blue-600 to-indigo-600 
            hover:from-blue-700 hover:to-indigo-700 
            disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
            transition-all duration-200 shadow-lg shadow-blue-500/20 
            disabled:shadow-none flex items-center justify-center gap-2"
          id="verify-otp-btn"
        >
          {verifying ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify <CheckCircle2 size={18} />
            </>
          )}
        </button>

        <div className="flex items-center justify-between">
          <button
            onClick={() => { setStep('aadhaar'); setOtp(['', '', '', '', '', '']); setError(''); }}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
          >
            ← Change Aadhaar
          </button>
          <button
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || sendingOtp}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-5 animate-fade-in text-center">
      {/* Animated Checkmark */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping opacity-30" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
          <CheckCircle2 size={36} className="text-white" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Identity Verified! ✅</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your account is now verified and trusted.</p>
      </div>

      {/* KYC data preview */}
      {kycData && (
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Name</span>
            <span className="font-semibold text-gray-900 dark:text-white">{kycData.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Aadhaar</span>
            <span className="font-mono text-gray-900 dark:text-white">{kycData.maskedAadhaar}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => onClose?.()}
        className="w-full py-3 px-6 rounded-xl font-bold text-white
          bg-gradient-to-r from-green-500 to-emerald-600 
          hover:from-green-600 hover:to-emerald-700
          transition-all duration-200 shadow-lg shadow-green-500/20"
        id="verification-done-btn"
      >
        Done
      </button>
    </div>
  );

  const content = (
    <div className="p-6 max-w-md w-full">
      {step === 'aadhaar' && renderAadhaarStep()}
      {step === 'otp' && renderOtpStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  );

  // Inline mode: render as a card
  if (inline) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {content}
      </div>
    );
  }

  // Modal mode: render as overlay
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => step !== 'success' && onClose?.()} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        {step !== 'success' && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <X size={16} />
          </button>
        )}
        {content}
      </div>
    </div>
  );
};

// ============================================================
// VERIFIED BADGE COMPONENT
// Reusable inline badge for displaying next to user names
// ============================================================
export const VerifiedBadge: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <span
    className={`inline-flex items-center justify-center text-blue-500 dark:text-blue-400 ${className}`}
    title="Verified Identity"
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 12.75L11.25 15L15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  </span>
);

export default AadhaarVerification;
