import { Router, Wifi, WifiOff, HardDrive, RefreshCw } from 'lucide-react';
import { RouterStatus } from '../types';

interface StatusBadgeProps {
  router: RouterStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ router, loading, onRefresh }) => {
  const isOnline = router?.online ?? false;
  const lastSeen = router?.secondsSinceLastPoll;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
      {/* Top Bar: Router Status */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300">
            <Router className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">Router Ruijie OpenWrt</span>
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-emerald-400 animate-ping-slow' : 'bg-rose-500'
                  }`}
                />
                {isOnline ? 'Online' : 'Offline / Standby'}
              </div>
            </div>
            <p className="text-xs text-slate-400">
              {isOnline
                ? `Polling aktif (${lastSeen !== null ? `${lastSeen}s lalu` : 'baru saja'})`
                : 'Tidak ada respons polling > 12s'}
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Segarkan status"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Hardware Info Grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="truncate">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Target PC</span>
            <span className="font-mono text-slate-200 font-medium">ASRock B660M</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <div className="truncate">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Target MAC</span>
            <span className="font-mono text-emerald-400 font-medium">9C:6B:..:9D:6C</span>
          </div>
        </div>
      </div>
    </div>
  );
};
