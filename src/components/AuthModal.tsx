import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, MapPin, AlertCircle, Loader2, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
  } = useAuth();

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register extra fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const result = await login(identifier, password);
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const result = await register({
      name,
      email,
      phone,
      password: regPassword,
      address,
      landmark,
    });
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const fillDemoAccount = () => {
    setIdentifier('demo@bestfoodcottage.pk');
    setPassword('sialkotfood123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => !isLoading && setIsAuthModalOpen(false)}
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-800 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl">
                {authModalMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
              </h2>
              <p className="text-xs text-stone-400">
                {authModalMode === 'login'
                  ? 'Access your orders & saved delivery addresses'
                  : 'Fast checkout & live order tracking in Sialkot'}
              </p>
            </div>
          </div>
          <button
            onClick={() => !isLoading && setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => {
              setErrorMessage(null);
              setAuthModalMode('login');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center ${
              authModalMode === 'login'
                ? 'text-red-900 border-b-2 border-red-800 bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setErrorMessage(null);
              setAuthModalMode('register');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center ${
              authModalMode === 'register'
                ? 'text-red-900 border-b-2 border-red-800 bg-white'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Credentials helper */}
          {authModalMode === 'login' && (
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs flex items-center justify-between text-amber-950">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Test demo customer account</span>
              </div>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-[11px] transition-colors"
              >
                Auto-fill Demo
              </button>
            </div>
          )}

          {authModalMode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email or Mobile Number *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="demo@bestfoodcottage.pk or 03001234567"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to Account</span>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-stone-500">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => setAuthModalMode('register')}
                  className="text-xs font-bold text-red-800 hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hamza Butt"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Create Password * (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Default Sialkot Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House #, Street, Mohallah / Sector in Sialkot"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register & Continue</span>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-stone-500">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setAuthModalMode('login')}
                  className="text-xs font-bold text-red-800 hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
