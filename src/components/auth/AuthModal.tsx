import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  CheckCircle2, 
  QrCode, 
  LogOut, 
  RefreshCw,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { apiService, getAuthToken, setAuthToken, setActiveBusinessId } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // MFA Challenge states
  const [mfaChallengeRequired, setMfaChallengeRequired] = useState(false);
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');

  // MFA Enrollment states
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<{
    factor_id: string;
    totp: { secret: string; qr_code?: string; uri?: string };
  } | null>(null);

  // User & Tenant session
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentBusiness, setCurrentBusiness] = useState<any | null>(null);
  const [supabaseHealth, setSupabaseHealth] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSession();
    }
  }, [isOpen]);

  const loadSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const [health, user, business] = await Promise.all([
        apiService.checkSupabaseHealth(),
        apiService.getCurrentUser(),
        apiService.getCurrentBusiness(),
      ]);
      setSupabaseHealth(health);
      setCurrentUser(user);
      setCurrentBusiness(business);
    } catch (err: any) {
      console.warn("Session check fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.login(email, password);
      if (res.mfa_required) {
        setMfaChallengeRequired(true);
        setActiveFactorId(res.factors?.[0]?.id || null);
        setSuccessMsg("Primary credentials accepted. Enter your 6-digit TOTP code.");
      } else {
        setSuccessMsg("Signed in successfully.");
        await loadSession();
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiService.register(
        email, 
        password, 
        fullName || 'MSME Owner', 
        'Hinglish', 
        businessName || 'Sharma General Store'
      );
      setSuccessMsg("Account registered successfully.");
      await loadSession();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length !== 6) {
      setError("Please enter a valid 6-digit TOTP code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const factorId = activeFactorId || enrollmentData?.factor_id || 'demo-factor-totp-001';
      await apiService.verifyMFA(factorId, totpCode.trim());
      setSuccessMsg("Two-Level Security (MFA) verified successfully!");
      setIsEnrollingMfa(false);
      setMfaChallengeRequired(false);
      setEnrollmentData(null);
      setTotpCode('');
      await loadSession();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Invalid TOTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMfaEnrollment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.enrollMFA();
      if (res.status === 'success' && res.totp) {
        setEnrollmentData(res);
        setIsEnrollingMfa(true);
        setActiveFactorId(res.factor_id);
      } else {
        setError('Failed to initiate TOTP enrollment.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start MFA enrollment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await apiService.logout();
      setCurrentUser(null);
      setCurrentBusiness(null);
      setSuccessMsg("Logged out successfully.");
      await loadSession();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('owner@sharmageneralstore.demo');
    setPassword('DemoPassword2026!');
    setFullName('Demo Owner');
    setBusinessName('Sharma General Store');
  };

  const copySecretToClipboard = () => {
    if (enrollmentData?.totp?.secret) {
      navigator.clipboard.writeText(enrollmentData.totp.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">MSME Security & Access</h3>
              <p className="text-[11px] text-slate-300">Supabase Multi-Tenant Auth & MFA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Supabase Status Banner */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${supabaseHealth?.connected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
            <span>Backend: {supabaseHealth?.status === 'online' ? 'Supabase Cloud Connected' : 'Grounded Demo Engine'}</span>
          </span>
          {supabaseHealth?.latency_ms && (
            <span className="font-mono text-slate-400 text-[10px]">{supabaseHealth.latency_ms} ms</span>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start space-x-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ACTIVE LOGGED-IN SESSION VIEW */}
          {currentUser && !mfaChallengeRequired && !isEnrollingMfa ? (
            <div className="space-y-4">
              
              {/* User Identity Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authenticated User</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md uppercase">
                    {currentUser.role || 'Member'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {(currentUser.full_name || 'RS').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{currentUser.full_name || 'Demo Owner'}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser.email || 'owner@sharmageneralstore.demo'}</p>
                  </div>
                </div>
              </div>

              {/* Tenant Business Card */}
              {currentBusiness && (
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active Tenant Business</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase">
                      Role: {currentBusiness.role || 'OWNER'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">{currentBusiness.name}</p>
                      <p className="text-slate-500 text-[11px]">{currentBusiness.city}, {currentBusiness.state}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* MFA / Two-Factor Security Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Two-Level Security (MFA)</span>
                  {currentUser.mfa_enabled ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>TOTP Active (AAL2)</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Single-Factor (AAL1)</span>
                    </span>
                  )}
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {currentUser.mfa_enabled
                    ? "Your account requires an authenticator code (Google or Microsoft Authenticator) for critical business actions."
                    : "Add Two-Level Security (TOTP MFA) to protect GST filings, e-invoices, and payroll reconciliation."}
                </p>

                {!currentUser.mfa_enabled ? (
                  <button
                    onClick={handleStartMfaEnrollment}
                    disabled={loading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Setup Authenticator App (MFA)</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>MFA Protection Enabled</span>
                    </span>
                    <button
                      onClick={handleStartMfaEnrollment}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                    >
                      Re-enroll TOTP
                    </button>
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign Out of Session</span>
              </button>

            </div>

          ) : isEnrollingMfa || mfaChallengeRequired ? (

            /* MFA CHALLENGE / ENROLLMENT FORM */
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center border border-emerald-200 shadow-xs">
                  <Key className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {isEnrollingMfa ? 'Scan QR with Authenticator App' : 'Two-Factor Verification (AAL2)'}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  {isEnrollingMfa 
                    ? 'Use Google Authenticator, Microsoft Authenticator, or Authy.'
                    : 'Enter the 6-digit code generated by your Authenticator app.'}
                </p>
              </div>

              {/* QR Code and Secret (Only during enrollment) */}
              {isEnrollingMfa && enrollmentData?.totp && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-center">
                  <div className="flex justify-center p-2 bg-white rounded-lg border border-slate-200 w-fit mx-auto">
                    {enrollmentData.totp.qr_code && enrollmentData.totp.qr_code.startsWith('data:image') ? (
                      <img 
                        src={enrollmentData.totp.qr_code} 
                        alt="TOTP QR Code" 
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400">
                        <QrCode className="w-12 h-12 text-slate-400" />
                        <span className="text-[10px] mt-1 font-mono">Scan TOTP URI</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Or enter key manually:</p>
                    <div className="flex items-center justify-center space-x-1.5 font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                      <span>{enrollmentData.totp.secret}</span>
                      <button
                        type="button"
                        onClick={copySecretToClipboard}
                        className="p-1 hover:text-emerald-600 transition-colors"
                        title="Copy Secret"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 6-Digit Code Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  autoFocus
                  required
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsEnrollingMfa(false);
                    setMfaChallengeRequired(false);
                    setEnrollmentData(null);
                    setTotpCode('');
                  }}
                  className="w-1/3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-2/3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Verify Code</span>
                </button>
              </div>
            </form>

          ) : (

            /* SIGN IN / REGISTER FORM */
            <div className="space-y-4">
              
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setTab('signin')}
                  className={`flex-1 pb-2 font-bold text-xs transition-colors border-b-2 ${
                    tab === 'signin'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setTab('register')}
                  className={`flex-1 pb-2 font-bold text-xs transition-colors border-b-2 ${
                    tab === 'register'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Register Business
                </button>
              </div>

              <form onSubmit={tab === 'signin' ? handleSignIn : handleRegister} className="space-y-3">
                
                {tab === 'register' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Demo Owner"
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Business Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Sharma General Store"
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@enterprise.in"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold transition-all shadow-xs flex items-center justify-center space-x-2 mt-2"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{tab === 'signin' ? 'Sign In to Workspace' : 'Create Enterprise Account'}</span>
                </button>
              </form>

              {/* Demo Credentials Quick-Fill Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Testing locally?</span>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                >
                  Fill Demo Credentials
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Multi-Tenant Row-Level Security (RLS) & DPDP Compliant</span>
        </div>

      </div>
    </div>
  );
};
