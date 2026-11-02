import { Power, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PowerButtonProps {
  onClick: () => void;
  status: 'idle' | 'loading' | 'success' | 'error' | 'cooldown';
  cooldownSeconds: number;
  disabled?: boolean;
}

export const PowerButton: React.FC<PowerButtonProps> = ({
  onClick,
  status,
  cooldownSeconds,
  disabled = false,
}) => {
  const handleClick = () => {
    if (disabled || status === 'loading' || status === 'cooldown') return;
    
    // Mobile tactile haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    onClick();
  };

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative group">
        {/* Ambient Glow */}
        <div
          className={`absolute -inset-1 rounded-full blur-xl transition-all duration-700 opacity-70 ${
            status === 'success'
              ? 'bg-emerald-400 opacity-90 animate-pulse'
              : status === 'error'
              ? 'bg-rose-500 opacity-80'
              : status === 'loading'
              ? 'bg-cyan-500 animate-spin opacity-80'
              : status === 'cooldown'
              ? 'bg-slate-700 opacity-40'
              : 'bg-emerald-500 group-hover:opacity-100 group-hover:scale-105'
          }`}
        />

        {/* Circular Button */}
        <button
          onClick={handleClick}
          disabled={disabled || status === 'loading' || status === 'cooldown'}
          aria-label="Nyalakan Komputer"
          className={`relative flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 transition-all duration-300 select-none shadow-2xl active:scale-95 disabled:active:scale-100 ${
            status === 'success'
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 glow-emerald-active'
              : status === 'error'
              ? 'bg-rose-950/80 border-rose-500 text-rose-300'
              : status === 'loading'
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
              : status === 'cooldown'
              ? 'bg-slate-900 border-slate-750 text-slate-500 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/80 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 cursor-pointer glow-emerald'
          }`}
        >
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border border-slate-800/80 pointer-events-none" />

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 animate-spin text-cyan-400" />
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-cyan-300">
                Mengirim...
              </span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-2 animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-400 animate-bounce" />
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-300 text-center px-4">
                Sinyal Masuk Antrean!
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-2">
              <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 text-rose-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-rose-300">
                Gagal Kirim
              </span>
            </div>
          )}

          {status === 'cooldown' && (
            <div className="flex flex-col items-center gap-1">
              <Power className="w-14 h-14 sm:w-16 sm:h-16 text-slate-600" />
              <span className="text-sm font-bold tracking-wider text-slate-400">
                Tunggu ({cooldownSeconds}s)
              </span>
            </div>
          )}

          {status === 'idle' && (
            <div className="flex flex-col items-center gap-3">
              <Power className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
              <span className="text-sm sm:text-base font-bold tracking-widest uppercase text-slate-200 group-hover:text-white">
                Nyalakan PC
              </span>
            </div>
          )}
        </button>
      </div>

      <p className="mt-4 text-xs text-slate-400 tracking-wide text-center">
        {status === 'loading'
          ? 'Menghubungkan ke server VPS...'
          : status === 'success'
          ? 'Router akan menyuntikkan paket Magic Packet dalam < 3 detik'
          : status === 'cooldown'
          ? `Mencegah spam sinyal: tombol terkunci ${cooldownSeconds} detik`
          : 'Tekan untuk menyuntikkan Magic Packet (WoL)'}
      </p>
    </div>
  );
};
