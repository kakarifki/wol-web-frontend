import { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, EyeOff, Lock, Zap, ShieldCheck, AlertCircle } from 'lucide-react';
import { PowerButton } from './components/PowerButton';
import { StatusBadge } from './components/StatusBadge';
import { ActivityLog } from './components/ActivityLog';
import { RouterStatus, WakeLogItem, SystemStatusResponse } from './types';

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://wakeup.kakarifki.web.id';
// Ensure no trailing slashes to avoid double-slash URLs (e.g. //api/status)
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

const STORAGE_KEY_PASSWORD = 'wol_saved_password';
const STORAGE_KEY_REMEMBER = 'wol_remember_pref';

export default function App() {
  // Password state
  const [password, setPassword] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_PASSWORD) || '';
  });
  const [rememberPassword, setRememberPassword] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_REMEMBER) !== 'false';
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status & Button state
  const [buttonStatus, setButtonStatus] = useState<
    'idle' | 'loading' | 'success' | 'error' | 'cooldown'
  >('idle');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // System Live Status
  const [routerStatus, setRouterStatus] = useState<RouterStatus | null>(null);
  const [recentLogs, setRecentLogs] = useState<WakeLogItem[]>([]);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState<boolean>(false);

  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save or clear remember password
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REMEMBER, String(rememberPassword));
    if (rememberPassword && password) {
      localStorage.setItem(STORAGE_KEY_PASSWORD, password);
    } else if (!rememberPassword) {
      localStorage.removeItem(STORAGE_KEY_PASSWORD);
    }
  }, [password, rememberPassword]);

  // Fetch status from backend
  const fetchStatus = useCallback(async () => {
    try {
      setIsRefreshingStatus(true);
      // Query param ?_t avoids browser cache without needing custom headers that trigger CORS preflight
      const res = await fetch(`${API_BASE_URL}/api/status?_t=${Date.now()}`);
      if (res.ok) {
        const json: SystemStatusResponse = await res.json();
        if (json.success && json.data) {
          setRouterStatus(json.data.router);
          setRecentLogs(json.data.recentLogs || []);
        }
      }
    } catch {
      // Backend may be offline or initializing
    } finally {
      setIsRefreshingStatus(false);
    }
  }, []);

  // Poll status every 4 seconds for live router heartbeat
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Handle countdown timer
  const startCooldown = (seconds: number = 5) => {
    setCooldownSeconds(seconds);
    setButtonStatus('cooldown');

    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current!);
          setButtonStatus('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Trigger Wake API
  const handleWake = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setErrorMessage('Silakan masukkan password keamanan terlebih dahulu.');
      return;
    }

    setButtonStatus('loading');

    try {
      const res = await fetch(`${API_BASE_URL}/api/wake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: trimmedPassword, pin: trimmedPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setButtonStatus('success');
        setSuccessMessage('Sinyal bangun berhasil disuntikkan ke antrean router!');
        // Refresh status immediately
        setTimeout(fetchStatus, 800);

        // After 2.5s show cooldown
        setTimeout(() => {
          startCooldown(5);
        }, 2500);
      } else {
        setButtonStatus('error');
        setErrorMessage(data.message || 'Gagal mengirim sinyal bangun.');
        setTimeout(() => setButtonStatus('idle'), 3000);
      }
    } catch (err: any) {
      setButtonStatus('error');
      setErrorMessage(
        'Koneksi gagal: Tidak dapat menghubungi server VPS. Periksa koneksi internet.'
      );
      setTimeout(() => setButtonStatus('idle'), 3000);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 max-w-md mx-auto selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="w-full text-center pt-2 pb-4">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Remote Wake-on-LAN</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Nyalakan Komputer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Bypass CGNAT via HTTP Poller Ruijie RG-MA3063
        </p>
      </header>

      {/* Main Content Area */}
      <section className="w-full flex flex-col items-center my-auto">
        {/* Router Status Badge */}
        <StatusBadge
          router={routerStatus}
          loading={isRefreshingStatus}
          onRefresh={fetchStatus}
        />

        {/* Big Power Trigger Button */}
        <PowerButton
          onClick={handleWake}
          status={buttonStatus}
          cooldownSeconds={cooldownSeconds}
        />

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <div className="w-full flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in duration-200 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="w-full flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in duration-200 mb-3">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Security Password Box */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Password Keamanan Web
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-3 text-slate-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              autoComplete="current-password"
              className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 text-slate-500 hover:text-slate-300 p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Remember Password Checkbox */}
          <div className="flex items-center justify-between mt-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 focus:ring-1"
              />
              <span>Ingat di perangkat ini</span>
            </label>

            {password && (
              <button
                type="button"
                onClick={() => setPassword('')}
                className="text-slate-500 hover:text-rose-400 transition-colors"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <ActivityLog logs={recentLogs} />
      </section>

      {/* Footer */}
      <footer className="w-full text-center pt-6 pb-2 text-[11px] text-slate-400">
        <p>wol.kakarifki.web.id • Dedicated WoL Poller</p>
      </footer>
    </main>
  );
}
