# Task 01: Cấu hình Axios instance & định nghĩa Types

## Mô tả
Tạo Axios instance được cấu hình sẵn để gọi Mirth Connect API, và định nghĩa các TypeScript types dựa trên API schema.

## Chi tiết

### 1. Axios instance (`src/lib/api.ts`)
- Base URL: `/api` (proxy qua Rsbuild dev server)
- Default headers: `Accept: application/json`, `Content-Type: application/json`
- Request interceptor: tự động gắn cookie/session nếu có
- Response interceptor: xử lý lỗi 401 → redirect về login
- Timeout: 10s

### 2. TypeScript Types (`src/types/`)

**`src/types/auth.ts`:**
```typescript
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginStatus {
  status: 'SUCCESS' | 'SUCCESS_GRACE_PERIOD' | 'FAIL' | 'FAIL_EXPIRED' | 'FAIL_LOCKED_OUT' | 'FAIL_VERSION_MISMATCH';
  message: string;
  updatedUsername?: string;
}
```

**`src/types/channel.ts`:**
```typescript
interface Channel {
  id: string;
  name: string;
  description: string;
  revision: number;
  sourceConnector: Connector;
  destinationConnectors: Connector[];
  properties: ChannelProperties;
  enabled?: boolean;
}

interface Connector {
  metaDataId: number;
  name: string;
  transportName: string;   // protocol: HTTP, TCP, JDBC, etc.
  mode: string;             // SOURCE | DESTINATION
  enabled: boolean;
  properties: Record<string, unknown>;
}

interface ChannelProperties {
  clearGlobalChannelMap: boolean;
  messageStorageMode: string;
  encryptAttachments: boolean;
  initialState: string;     // STARTED | STOPPED | PAUSED
  storeAttachments: boolean;
}
```

**`src/types/dashboard.ts`:**
```typescript
interface DashboardStatus {
  channelId: string;
  name: string;
  state: string;            // STARTED | STOPPED | PAUSED | etc.
  deployedDate: string;
  statistics: ChannelStatistics;
  lifetimeStatistics: ChannelStatistics;
  childStatuses: DashboardStatus[];
  metaDataId: number;
  queued: number;
  statusType: string;
}

interface ChannelStatistics {
  serverId: string;
  channelId: string;
  received: number;         // inbound messages
  sent: number;             // outbound messages
  error: number;
  filtered: number;
  queued: number;
}
```

## Definition of Done
- [ ] Axios instance hoạt động, proxy request qua `/api`
- [ ] Tất cả types được định nghĩa đúng theo API schema
- [ ] Response interceptor xử lý 401 redirect
