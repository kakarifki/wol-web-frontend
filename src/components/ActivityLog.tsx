import { History, Clock, CheckCircle } from 'lucide-react';
import { WakeLogItem } from '../types';

interface ActivityLogProps {
  logs: WakeLogItem[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: 'numeric',
        month: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 mt-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 text-slate-300">
        <History className="w-4 h-4 text-slate-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Riwayat Perintah Bangun
        </h3>
      </div>

      <div className="space-y-2">
        {logs.slice(0, 4).map((log) => {
          const isConsumed = log.status === 'CONSUMED';
          return (
            <div
              key={log.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/50 text-xs"
            >
              <div className="flex items-center gap-2.5">
                {isConsumed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                )}
                <div>
                  <span className="text-slate-200 font-medium block">
                    {isConsumed ? 'Terkirim ke PC' : 'Menunggu Router...'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {formatTime(log.requestedAt)}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                  isConsumed
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}
              >
                {log.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
