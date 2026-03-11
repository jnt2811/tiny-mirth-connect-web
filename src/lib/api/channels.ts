import type { Channel } from '@/types/channel';
import type {
  ChannelStatistics,
  DashboardStatus,
  MirthRawDashboardStatus,
  MirthStatusesResponse,
} from '@/types/dashboard';
import type { Message, MessageStatus } from '@/types/message';
import api from '../api';

// Parse statistics từ Mirth linked-hash-map format
function parseStats(raw: MirthRawDashboardStatus['statistics']): ChannelStatistics {
  const entries = Array.isArray(raw.entry) ? raw.entry : raw.entry ? [raw.entry] : [];
  const map: Record<string, number> = {};
  for (const e of entries) {
    map[e['com.mirth.connect.donkey.model.message.Status']] = e.long;
  }
  return {
    received: map['RECEIVED'] ?? 0,
    sent: map['SENT'] ?? 0,
    error: map['ERROR'] ?? 0,
    filtered: map['FILTERED'] ?? 0,
    queued: 0,
  };
}

// Normalize một raw DashboardStatus thành DashboardStatus
function normalizeDashboardStatus(raw: MirthRawDashboardStatus): DashboardStatus {
  const children = raw.childStatuses?.dashboardStatus
    ? (Array.isArray(raw.childStatuses.dashboardStatus)
        ? raw.childStatuses.dashboardStatus
        : [raw.childStatuses.dashboardStatus]
      ).map(normalizeDashboardStatus)
    : [];

  return {
    channelId: raw.channelId,
    name: raw.name,
    state: raw.state,
    deployedRevisionDelta: raw.deployedRevisionDelta,
    statistics: parseStats(raw.statistics),
    lifetimeStatistics: parseStats(raw.lifetimeStatistics),
    childStatuses: children,
    metaDataId: raw.metaDataId,
    queued: raw.queued,
    queueEnabled: raw.queueEnabled,
    waitForPrevious: raw.waitForPrevious,
    statusType: raw.statusType,
  };
}

export async function fetchChannelStatuses(): Promise<DashboardStatus[]> {
  const res = await api.get<MirthStatusesResponse>('/channels/statuses');
  const raw = res.data?.list?.dashboardStatus;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(normalizeDashboardStatus);
}

// Normalize channel: destinationConnectors từ { connector: [...] } thành Connector[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeChannel(raw: any): Channel {
  const destRaw = raw.destinationConnectors?.connector;
  const destinationConnectors = destRaw
    ? Array.isArray(destRaw) ? destRaw : [destRaw]
    : [];

  return {
    ...raw,
    destinationConnectors,
  } as Channel;
}

export async function fetchChannels(): Promise<Channel[]> {
  const res = await api.get('/channels');
  const raw = res.data;
  if (Array.isArray(raw)) return raw.map(normalizeChannel);
  if (raw?.list?.channel) {
    const ch = raw.list.channel;
    const arr = Array.isArray(ch) ? ch : [ch];
    return arr.map(normalizeChannel);
  }
  return [];
}

export async function fetchChannel(channelId: string): Promise<Channel> {
  const res = await api.get<Channel>(`/channels/${channelId}`);
  return res.data;
}

export async function fetchChannelStatistics(): Promise<ChannelStatistics[]> {
  const res = await api.get('/channels/statistics');
  const raw = res.data;
  if (Array.isArray(raw)) return raw;
  return [];
}

export interface FetchMessagesParams {
  channelId: string;
  offset?: number;
  limit?: number;
  statuses?: MessageStatus[];
  startDate?: string;   // ISO string
  endDate?: string;     // ISO string
  textSearch?: string;
  includeContent?: boolean;
}

// Parse Mirth date: có thể là ISO string hoặc { time: number, timezone: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMirthDate(d: any): string | undefined {
  if (!d) return undefined;
  if (typeof d === 'string') return d;
  if (typeof d === 'object' && d.time) return new Date(d.time as number).toISOString();
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMetaDataMap(raw: any): Record<string, string> {
  if (!raw) return {};
  if (raw.entry) {
    const entries = Array.isArray(raw.entry) ? raw.entry : [raw.entry];
    const map: Record<string, string> = {};
    for (const e of entries) {
      const str = e.string;
      if (Array.isArray(str) && str.length >= 2) {
        // {"string": ["KEY", "VALUE"]}
        map[String(str[0])] = String(str[1]);
      } else if (typeof str === 'string') {
        // {"string": "KEY", "big-decimal": 123}
        const val = e['big-decimal'] ?? e.long ?? e.int ?? '';
        map[str] = String(val);
      }
    }
    return map;
  }
  if (typeof raw === 'object') return raw as Record<string, string>;
  return {};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeConnectorMessage(raw: any) {
  return {
    ...raw,
    receivedDate: parseMirthDate(raw.receivedDate),
    sendDate: parseMirthDate(raw.sendDate),
    responseDate: parseMirthDate(raw.responseDate),
    metaDataMap: parseMetaDataMap(raw.metaDataMap),
    // Mirth field names: raw, transformed, encoded, sent, response
    rawContent: raw.raw?.encrypted === false ? raw.raw : undefined,
    transformedContent: raw.transformed?.encrypted === false ? raw.transformed : undefined,
    encodedContent: raw.encoded?.encrypted === false ? raw.encoded : undefined,
    sentContent: raw.sent?.encrypted === false ? raw.sent : undefined,
    responseContent: raw.response?.encrypted === false ? raw.response : undefined,
    responseTransformedContent: raw.responseTransformed?.encrypted === false ? raw.responseTransformed : undefined,
  };
}

// Mirth trả messages dạng { list: { message: [...] } } hoặc array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMessage(raw: any): Message {
  let connectorMessages: Record<string, unknown> = {};
  const rawCm = raw.connectorMessages;
  if (rawCm) {
    if (rawCm.entry) {
      const entries = Array.isArray(rawCm.entry) ? rawCm.entry : [rawCm.entry];
      for (const e of entries) {
        const key = String(e.int ?? e.string ?? e.key ?? Object.keys(e)[0]);
        const val = e.value ?? e[Object.keys(e).find((k) => !['int', 'string', 'key'].includes(k)) ?? ''];
        if (val) connectorMessages[key] = normalizeConnectorMessage(val);
      }
    } else {
      Object.entries(rawCm).forEach(([k, v]) => {
        connectorMessages[k] = normalizeConnectorMessage(v);
      });
    }
  }
  return {
    ...raw,
    receivedDate: parseMirthDate(raw.receivedDate),
    connectorMessages,
  } as Message;
}

export async function fetchMessages(params: FetchMessagesParams): Promise<Message[]> {
  const { channelId, offset = 0, limit = 20, statuses, startDate, endDate, textSearch, includeContent = false } = params;
  const queryParams: Record<string, unknown> = { offset, limit, includeContent };
  if (statuses?.length) queryParams['status'] = statuses;
  if (startDate) queryParams['startDate'] = startDate;
  if (endDate) queryParams['endDate'] = endDate;
  if (textSearch) queryParams['textSearch'] = textSearch;

  const res = await api.get(`/channels/${channelId}/messages`, { params: queryParams });
  const raw = res.data;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizeMessage);
  if (raw?.list?.message) {
    const msgs = raw.list.message;
    const arr = Array.isArray(msgs) ? msgs : [msgs];
    return arr.map(normalizeMessage);
  }
  return [];
}

export async function fetchMessageCount(params: Omit<FetchMessagesParams, 'offset' | 'limit' | 'includeContent'>): Promise<number> {
  const { channelId, statuses, startDate, endDate, textSearch } = params;
  const queryParams: Record<string, unknown> = {};
  if (statuses?.length) queryParams['status'] = statuses;
  if (startDate) queryParams['startDate'] = startDate;
  if (endDate) queryParams['endDate'] = endDate;
  if (textSearch) queryParams['textSearch'] = textSearch;

  const res = await api.get(`/channels/${channelId}/messages/count`, { params: queryParams });
  const data = res.data;
  if (typeof data === 'number') return data;
  if (data && typeof data === 'object' && 'long' in data) return Number(data.long);
  return 0;
}

export async function fetchMessageWithContent(channelId: string, messageId: number): Promise<import('@/types/message').Message | null> {
  const res = await api.get(`/channels/${channelId}/messages/${messageId}`, {
    params: { includeContent: true },
  });
  if (!res.data) return null;
  // Single message response (not wrapped in list)
  const raw = res.data?.message ?? res.data;
  return normalizeMessage(raw);
}
