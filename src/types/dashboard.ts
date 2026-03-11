export interface ChannelStatistics {
  received: number;
  sent: number;
  error: number;
  filtered: number;
  queued: number;
}

export type ChannelState =
  | 'STARTED'
  | 'STOPPED'
  | 'PAUSED'
  | 'DEPLOYING'
  | 'UNDEPLOYING'
  | 'STARTING'
  | 'STOPPING'
  | 'SYNCING'
  | 'UNKNOWN';

export interface DashboardStatus {
  channelId: string;
  name: string;
  state: ChannelState;
  deployedDate?: string;
  deployedRevisionDelta?: number;
  statistics: ChannelStatistics;
  lifetimeStatistics: ChannelStatistics;
  childStatuses: DashboardStatus[];
  metaDataId: number;
  queued: number;
  queueEnabled: boolean;
  waitForPrevious: boolean;
  statusType: string;
}

// --- Raw types từ Mirth API ---

interface MirthStatEntry {
  'com.mirth.connect.donkey.model.message.Status': string;
  long: number;
}

interface MirthStatMap {
  '@class': string;
  entry: MirthStatEntry | MirthStatEntry[];
}

export interface MirthRawDashboardStatus {
  channelId: string;
  name: string;
  state: ChannelState;
  deployedDate?: { time: number; timezone: string };
  deployedRevisionDelta?: number;
  statistics: MirthStatMap;
  lifetimeStatistics: MirthStatMap;
  childStatuses: { dashboardStatus: MirthRawDashboardStatus | MirthRawDashboardStatus[] } | null;
  metaDataId: number;
  queued: number;
  queueEnabled: boolean;
  waitForPrevious: boolean;
  statusType: string;
}

export interface MirthStatusesResponse {
  list: {
    dashboardStatus: MirthRawDashboardStatus | MirthRawDashboardStatus[];
  };
}
