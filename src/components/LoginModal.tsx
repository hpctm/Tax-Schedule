import React, { useState } from 'react';
import { getSupabaseConfig, createSupabaseClient } from '../lib/supabase';
import { Lock, Mail, Key, ShieldCheck, AlertCircle, LogIn, UserPlus, Database, Check } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: any, client: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const initialConfig = getSupabaseConfig();
  const [showConfig, setShowConfig] = useState(!initialConfig.isConfigured);
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(initialConfig.key);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setError('Supabase URL과 Anon Key를 모두 입력해주세요.');
      return;
    }
    localStorage.setItem('supabase_url', supabaseUrl.trim());
    localStorage.setItem('supabase_anon_key', supabaseKey.trim());
    setError(null);
    setMessage('Supabase 설정이 저장되었습니다. 이제 로그인해주세요.');
    setShowConfig(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = createSupabaseClient();
    if (!client) {
      setError('Supabase가 올바르게 설정되지 않았습니다. 설정 정보를 확인해주세요.');
      setShowConfig(true);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('회원가입이 완료되었습니다! 이메일 확인 후 로그인해주세요.');
        setIsSignUp(false);
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user, client);
        }
      }
    } catch (err: any) {
      setError(err.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    onLoginSuccess({ email: 'demo.admin@company.com', id: 'demo-user-id' }, null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">사내 세무 일정 관리</h2>
          <p className="text-sm text-slate-500 mt-1">Supabase 인가 사용자 로그인</p>
        </div>

        {showConfig ? (
          <form onSubmit={handleSaveConfig} className="space-y-4 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 mb-4">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm mb-1">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Supabase 프로젝트 연결 설정</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Supabase 대시보드(Project Settings &gt; API)에서 <code className="bg-white px-1 rounded">Project URL</code>과 <code className="bg-white px-1 rounded">anon public key</code>를 복사하여 입력하세요.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Supabase URL</label>
              <input
                type="text"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxx.supabase.co"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Supabase Anon Key</label>
              <input
                type="password"
                required
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                설정 저장 및 연결
              </button>
              {initialConfig.isConfigured && (
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-3 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="mb-4 flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-xl text-xs text-emerald-800">
            <span className="font-medium flex items-center">
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Supabase 연결됨
            </span>
            <button
              type="button"
              onClick={() => setShowConfig(true)}
              className="text-emerald-700 underline font-semibold hover:text-emerald-900"
            >
              설정 변경
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
            {message}
          </div>
        )}

        {!showConfig && (
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                사내 이메일 계정
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                비밀번호
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>회원가입 요청</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>로그인</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          {!showConfig && (
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '신규 회원가입'}
            </button>
          )}
          <button
            type="button"
            onClick={handleDemoBypass}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 ml-auto"
          >
            체험 모드로 입장
          </button>
        </div>
      </div>
    </div>
  );
};
