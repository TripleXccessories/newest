import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import IINTLogo from '@/components/layout/IINTLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <IINTLogo size="lg" showTagline />
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8">
          {!sent ? (
            <>
              <h2 className="text-xl font-bold text-[#f1f5f9] mb-1">Reset your password</h2>
              <p className="text-sm text-[#64748b] mb-6">Enter your email and we'll send a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-[#64748b] mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-4 py-3 pl-10 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#00d4aa] transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#00d4aa] text-[#070b14] rounded-xl text-sm font-bold hover:bg-[#00d4aa]/90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-[#00d4aa]" />
              </div>
              <h2 className="text-xl font-bold text-[#f1f5f9] mb-2">Check your email</h2>
              <p className="text-sm text-[#64748b] mb-1">We've sent a password reset link to</p>
              <p className="text-sm font-semibold text-[#00d4aa]">{email}</p>
              <p className="text-xs text-[#64748b] mt-4">Didn't receive it?{' '}
                <button onClick={() => setSent(false)} className="text-[#00d4aa] hover:underline">Try again</button>
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-[#64748b] hover:text-[#f1f5f9] transition-colors">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}