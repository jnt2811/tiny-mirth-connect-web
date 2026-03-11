# Task 04: TanStack Query Hooks

## Mô tả
Tạo các custom hooks sử dụng TanStack Query để fetch dữ liệu từ Mirth Connect API.

## Chi tiết

### 1. Query Client (`src/lib/queryClient.ts`)
- Cấu hình QueryClient với default options:
  - `staleTime`: 30s
  - `retry`: 1
  - `refetchOnWindowFocus`: true

### 2. API Functions (`src/lib/api/`)

**`src/lib/api/channels.ts`:**
- `fetchChannels()`: `GET /api/channels` → `Channel[]`
- `fetchChannel(channelId)`: `GET /api/channels/{channelId}` → `Channel`
- `fetchChannelStatistics()`: `GET /api/channels/statistics` → `ChannelStatistics[]`
- `fetchChannelStatuses()`: `GET /api/channels/statuses` → `DashboardStatus[]`

**`src/lib/api/auth.ts`:**
- `login(username, password)`: `POST /api/users/_login`
- `logout()`: `POST /api/users/_logout`
- `getCurrentUser()`: `GET /api/users/current`

### 3. Query Hooks (`src/hooks/`)

**`src/hooks/useChannels.ts`:**
```typescript
function useChannels()           // query key: ['channels']
function useChannel(id: string)  // query key: ['channels', id]
```

**`src/hooks/useDashboard.ts`:**
```typescript
function useChannelStatistics()  // query key: ['channel-statistics']
function useChannelStatuses()    // query key: ['channel-statuses']
```

**`src/hooks/useAuth.ts`:**
```typescript
function useLogin()              // mutation
function useLogout()             // mutation, onSuccess: invalidate all queries
function useCurrentUser()        // query key: ['current-user']
```

### 4. Auto-refresh
- Dashboard data: refetch mỗi 30s (`refetchInterval: 30000`)
- Channel list: refetch khi window focus

## Definition of Done
- [ ] Tất cả hooks hoạt động và trả về data đúng type
- [ ] Loading/error states được handle
- [ ] Auto-refresh hoạt động trên dashboard
- [ ] Logout invalidate tất cả queries
