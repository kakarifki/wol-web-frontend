export interface WakeLogItem {
  id: string;
  requestedAt: string;
  status: 'PENDING' | 'CONSUMED';
  consumedAt: string | null;
}

export interface RouterStatus {
  online: boolean;
  lastPoll: string | null;
  secondsSinceLastPoll: number | null;
  totalPolls: number;
}

export interface SystemStatusResponse {
  success: boolean;
  data: {
    router: RouterStatus;
    wakeState: {
      pending: boolean;
      lastWakeTime: string | null;
    };
    recentLogs: WakeLogItem[];
  };
}

