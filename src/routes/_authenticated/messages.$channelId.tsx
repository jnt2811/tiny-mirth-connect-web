import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  MultiSelect,
  NumberInput,
  Skeleton,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { useVirtualizer } from '@tanstack/react-virtual';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  IconArrowLeft,
  IconChevronDown,
  IconChevronRight,
  IconRefresh,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useChannelMessages, useMessageCount } from '@/hooks/useMessages';
import type { MessageQueryFilter } from '@/hooks/useMessages';
import { useQuery } from '@tanstack/react-query';
import { fetchMessageWithContent } from '@/lib/api/channels';
import type { ConnectorMessage, Message, MessageStatus } from '@/types/message';

export const Route = createFileRoute('/_authenticated/messages/$channelId')({
  component: MessagesPage,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_STATUSES: { value: MessageStatus; label: string }[] = [
  { value: 'RECEIVED', label: 'Received' },
  { value: 'FILTERED', label: 'Filtered' },
  { value: 'TRANSFORMED', label: 'Transformed' },
  { value: 'SENT', label: 'Sent' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'ERROR', label: 'Error' },
  { value: 'PENDING', label: 'Pending' },
];

const STATUS_COLORS: Record<MessageStatus, string> = {
  RECEIVED: 'blue',
  FILTERED: 'gray',
  TRANSFORMED: 'cyan',
  SENT: 'green',
  QUEUED: 'yellow',
  ERROR: 'red',
  PENDING: 'orange',
};

const ROW_HEIGHT = 34;
const PARENT_ROW_HEIGHT = 38;

// ─── Types ────────────────────────────────────────────────────────────────────

type FlatRow =
  | { kind: 'parent'; msg: Message; expanded: boolean }
  | { kind: 'child'; msg: Message; connKey: string; conn: ConnectorMessage };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | undefined): string {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      fractionalSecondDigits: 3,
    } as Intl.DateTimeFormatOptions);
  } catch { return d; }
}

function getConnectors(msg: Message): [string, ConnectorMessage][] {
  return Object.entries(msg.connectorMessages) as [string, ConnectorMessage][];
}

function getSource(msg: Message): ConnectorMessage | undefined {
  return msg.connectorMessages['0'] as ConnectorMessage | undefined;
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MessageStatus }) {
  return (
    <Badge color={STATUS_COLORS[status] ?? 'gray'} variant="light" size="xs" radius="sm">
      {status}
    </Badge>
  );
}

function ErrorCell({ conn }: { conn: ConnectorMessage }) {
  const err = conn.processingError ?? conn.responseError;
  if (!err) return <Text size="xs" c="dimmed">—</Text>;
  return (
    <Tooltip label={err} multiline maw={400} withArrow>
      <Badge color="red" variant="light" size="xs" style={{ cursor: 'help' }}>ERR</Badge>
    </Tooltip>
  );
}

// ─── Virtual Table ────────────────────────────────────────────────────────────

const COL_WIDTHS = [80, 220, 130, 200, 200, 60, 160, 130];
const COL_HEADERS = ['ID', 'Connector', 'Status', 'Received Date', 'Response Date', 'Errors', 'SOURCE', 'TYPE'];

function VirtualTable({
  rows,
  onToggle,
  onConnectorClick,
}: {
  rows: FlatRow[];
  onToggle: (msgId: number) => void;
  onConnectorClick: (conn: ConnectorMessage, msg: Message) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (rows[i].kind === 'parent' ? PARENT_ROW_HEIGHT : ROW_HEIGHT),
    overscan: 20,
  });

  const totalWidth = COL_WIDTHS.reduce((a, b) => a + b, 0);

  return (
    <Box
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          background: 'var(--mantine-color-default-hover)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
          minWidth: totalWidth,
          flexShrink: 0,
        }}
      >
        {COL_HEADERS.map((h, i) => (
          <Box
            key={h}
            style={{
              width: COL_WIDTHS[i],
              minWidth: COL_WIDTHS[i],
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--mantine-color-dimmed)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRight: i < COL_HEADERS.length - 1 ? '1px solid var(--mantine-color-default-border)' : 'none',
            }}
          >
            {h}
          </Box>
        ))}
      </Box>

      {/* Scroll body */}
      <Box
        ref={parentRef}
        style={{ height: 600, overflowY: 'auto', overflowX: 'auto', position: 'relative' }}
      >
        <Box style={{ height: virtualizer.getTotalSize(), position: 'relative', minWidth: totalWidth }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const row = rows[vItem.index];
            const isEven = vItem.index % 2 === 0;
            const baseBg = isEven ? 'transparent' : 'var(--mantine-color-default-hover)';

            if (row.kind === 'parent') {
              const src = getSource(row.msg);
              return (
                <Box
                  key={vItem.key}
                  data-index={vItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: vItem.start,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--mantine-color-blue-light)',
                    borderBottom: '1px solid var(--mantine-color-default-border)',
                    cursor: 'pointer',
                    minWidth: totalWidth,
                  }}
                  onClick={() => onToggle(row.msg.messageId)}
                >
                  {/* ID col */}
                  <Box style={{ width: COL_WIDTHS[0], minWidth: COL_WIDTHS[0], padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {row.expanded
                      ? <IconChevronDown size={13} style={{ flexShrink: 0 }} />
                      : <IconChevronRight size={13} style={{ flexShrink: 0 }} />}
                    <Text size="xs" fw={600} ff="monospace">{row.msg.messageId}</Text>
                  </Box>
                  {/* Connector (Source name) */}
                  <Box style={{ width: COL_WIDTHS[1], minWidth: COL_WIDTHS[1], padding: '6px 10px' }}>
                    <Text size="xs" c="dimmed">Source</Text>
                  </Box>
                  {/* Status */}
                  <Box style={{ width: COL_WIDTHS[2], minWidth: COL_WIDTHS[2], padding: '6px 10px' }}>
                    {src?.status && <StatusBadge status={src.status} />}
                  </Box>
                  {/* Received */}
                  <Box style={{ width: COL_WIDTHS[3], minWidth: COL_WIDTHS[3], padding: '6px 10px' }}>
                    <Text size="xs">{formatDate(row.msg.receivedDate)}</Text>
                  </Box>
                  {/* Response */}
                  <Box style={{ width: COL_WIDTHS[4], minWidth: COL_WIDTHS[4], padding: '6px 10px' }}>
                    <Text size="xs">{formatDate(src?.responseDate)}</Text>
                  </Box>
                  {/* Errors */}
                  <Box style={{ width: COL_WIDTHS[5], minWidth: COL_WIDTHS[5], padding: '6px 10px' }}>
                    {src && <ErrorCell conn={src} />}
                  </Box>
                  {/* SOURCE metadata */}
                  <Box style={{ width: COL_WIDTHS[6], minWidth: COL_WIDTHS[6], padding: '6px 10px' }}>
                    <Text size="xs" truncate="end">{src?.metaDataMap?.SOURCE ?? src?.metaDataMap?.source ?? '—'}</Text>
                  </Box>
                  {/* TYPE metadata */}
                  <Box style={{ width: COL_WIDTHS[7], minWidth: COL_WIDTHS[7], padding: '6px 10px' }}>
                    <Text size="xs">{src?.metaDataMap?.TYPE ?? src?.metaDataMap?.type ?? src?.metaDataMap?.messageType ?? '—'}</Text>
                  </Box>
                </Box>
              );
            }

            // Child row
            const { conn, msg } = row;
            return (
              <Box
                key={vItem.key}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: vItem.start,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  background: baseBg,
                  borderBottom: '1px solid var(--mantine-color-default-border)',
                  cursor: 'pointer',
                  minWidth: totalWidth,
                }}
                onClick={() => onConnectorClick(conn, msg)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--mantine-color-default-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = baseBg; }}
              >
                {/* ID (blank for children) */}
                <Box style={{ width: COL_WIDTHS[0], minWidth: COL_WIDTHS[0], padding: '5px 10px 5px 28px' }} />
                {/* Connector name */}
                <Box style={{ width: COL_WIDTHS[1], minWidth: COL_WIDTHS[1], padding: '5px 10px' }}>
                  <Text size="xs" truncate="end">{conn.connectorName}</Text>
                </Box>
                {/* Status */}
                <Box style={{ width: COL_WIDTHS[2], minWidth: COL_WIDTHS[2], padding: '5px 10px' }}>
                  <StatusBadge status={conn.status} />
                </Box>
                {/* Received */}
                <Box style={{ width: COL_WIDTHS[3], minWidth: COL_WIDTHS[3], padding: '5px 10px' }}>
                  <Text size="xs">{formatDate(conn.receivedDate)}</Text>
                </Box>
                {/* Response */}
                <Box style={{ width: COL_WIDTHS[4], minWidth: COL_WIDTHS[4], padding: '5px 10px' }}>
                  <Text size="xs">{formatDate(conn.responseDate)}</Text>
                </Box>
                {/* Errors */}
                <Box style={{ width: COL_WIDTHS[5], minWidth: COL_WIDTHS[5], padding: '5px 10px' }}>
                  <ErrorCell conn={conn} />
                </Box>
                {/* SOURCE */}
                <Box style={{ width: COL_WIDTHS[6], minWidth: COL_WIDTHS[6], padding: '5px 10px' }}>
                  <Text size="xs" truncate="end">{conn.metaDataMap?.SOURCE ?? conn.metaDataMap?.source ?? '—'}</Text>
                </Box>
                {/* TYPE */}
                <Box style={{ width: COL_WIDTHS[7], minWidth: COL_WIDTHS[7], padding: '5px 10px' }}>
                  <Text size="xs">{conn.metaDataMap?.TYPE ?? conn.metaDataMap?.type ?? conn.metaDataMap?.messageType ?? '—'}</Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Connector Detail Modal ───────────────────────────────────────────────────

function ContentBlock({ content, color }: { content: string | undefined; color?: string }) {
  if (!content) return <Text size="xs" c="dimmed">— không có nội dung —</Text>;
  return (
    <Box
      style={{
        background: color ?? 'var(--mantine-color-default-hover)',
        borderRadius: 4,
        padding: '10px 12px',
        fontSize: 12,
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        maxHeight: 400,
        overflowY: 'auto',
      }}
    >
      {content}
    </Box>
  );
}

function ConnectorDetailModal({
  conn,
  msg,
  channelId,
  onClose,
}: {
  conn: ConnectorMessage | null;
  msg: Message | null;
  channelId: string;
  onClose: () => void;
}) {
  const { data: fullMsg, isLoading } = useQuery({
    queryKey: ['message-content', channelId, msg?.messageId],
    queryFn: () => fetchMessageWithContent(channelId, msg!.messageId),
    enabled: Boolean(msg),
    staleTime: 60_000,
  });

  if (!conn || !msg) return null;

  // Get the connector with content from the full message
  const fullConn = fullMsg?.connectorMessages[String(conn.metaDataId)] ?? conn;

  return (
    <Box
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <Box
        style={{
          background: 'var(--mantine-color-body)',
          borderRadius: 8,
          padding: 24,
          width: '92%',
          maxWidth: 860,
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <Text fw={600}>{conn.connectorName}</Text>
            <StatusBadge status={conn.status} />
            <Text size="xs" c="dimmed">#{msg.messageId}</Text>
          </Group>
          <ActionIcon variant="subtle" onClick={onClose}><IconX size={16} /></ActionIcon>
        </Group>

        <Tabs defaultValue="info">
          <Tabs.List mb="sm">
            <Tabs.Tab value="info">Info</Tabs.Tab>
            <Tabs.Tab value="raw">Raw</Tabs.Tab>
            <Tabs.Tab value="transformed">Transformed</Tabs.Tab>
            <Tabs.Tab value="encoded">Encoded</Tabs.Tab>
            <Tabs.Tab value="sent">Sent</Tabs.Tab>
            <Tabs.Tab value="response">Response</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="info">
            <Stack gap="xs">
              <InfoRow label="Channel" value={conn.channelName} />
              <InfoRow label="Connector" value={conn.connectorName} />
              <InfoRow label="Status" value={conn.status} />
              <InfoRow label="Received" value={formatDate(conn.receivedDate)} />
              <InfoRow label="Send Date" value={formatDate(conn.sendDate)} />
              <InfoRow label="Response Date" value={formatDate(conn.responseDate)} />
              <InfoRow label="Send Attempts" value={String(conn.sendAttempts ?? 0)} />

              {conn.processingError && (
                <Box>
                  <Text size="xs" c="dimmed" fw={600} mb={4}>Processing Error:</Text>
                  <ContentBlock content={conn.processingError} color="var(--mantine-color-red-light)" />
                </Box>
              )}
              {conn.responseError && (
                <Box>
                  <Text size="xs" c="dimmed" fw={600} mb={4}>Response Error:</Text>
                  <ContentBlock content={conn.responseError} color="var(--mantine-color-orange-light)" />
                </Box>
              )}
              {conn.metaDataMap && Object.keys(conn.metaDataMap).length > 0 && (
                <Box>
                  <Text size="xs" c="dimmed" fw={600} mb={4}>Metadata:</Text>
                  <Stack gap={2}>
                    {Object.entries(conn.metaDataMap).map(([k, v]) => (
                      <Group key={k} gap="xs">
                        <Text size="xs" c="dimmed" w={120} style={{ flexShrink: 0 }}>{k}:</Text>
                        <Text size="xs" ff="monospace">{String(v)}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Tabs.Panel>

          {isLoading ? (
            <Tabs.Panel value="raw">
              <Group justify="center" py="xl"><Loader size="sm" /></Group>
            </Tabs.Panel>
          ) : (
            <>
              <Tabs.Panel value="raw">
                <Text size="xs" c="dimmed" mb={6}>Data type: {fullConn.rawContent?.dataType ?? '—'}</Text>
                <ContentBlock content={fullConn.rawContent?.content} />
              </Tabs.Panel>
              <Tabs.Panel value="transformed">
                <Text size="xs" c="dimmed" mb={6}>Data type: {fullConn.transformedContent?.dataType ?? '—'}</Text>
                <ContentBlock content={fullConn.transformedContent?.content} />
              </Tabs.Panel>
              <Tabs.Panel value="encoded">
                <Text size="xs" c="dimmed" mb={6}>Data type: {fullConn.encodedContent?.dataType ?? '—'}</Text>
                <ContentBlock content={fullConn.encodedContent?.content} />
              </Tabs.Panel>
              <Tabs.Panel value="sent">
                <Text size="xs" c="dimmed" mb={6}>Data type: {fullConn.sentContent?.dataType ?? '—'}</Text>
                <ContentBlock content={fullConn.sentContent?.content} />
              </Tabs.Panel>
              <Tabs.Panel value="response">
                <Text size="xs" c="dimmed" mb={6}>Data type: {fullConn.responseContent?.dataType ?? '—'}</Text>
                <ContentBlock content={fullConn.responseContent?.content} />
              </Tabs.Panel>
            </>
          )}
        </Tabs>
      </Box>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Group gap="xs" align="flex-start">
      <Text size="xs" c="dimmed" w={130} style={{ flexShrink: 0 }}>{label}:</Text>
      <Text size="xs" ff="monospace">{value || '—'}</Text>
    </Group>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_FILTER: MessageQueryFilter = { limit: 50, statuses: [], textSearch: '', startDate: undefined, endDate: undefined };

function MessagesPage() {
  const { channelId } = Route.useParams();
  const searchParams = Route.useSearch() as { channelName?: string };
  const channelName = searchParams.channelName ?? channelId;

  // Draft filter (chưa apply)
  const [draft, setDraft] = useState<MessageQueryFilter>({ ...DEFAULT_FILTER });
  // Applied filter (đã bấm Tìm kiếm)
  const [appliedFilter, setAppliedFilter] = useState<MessageQueryFilter>({ ...DEFAULT_FILTER });

  // Expanded rows
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Selected connector for detail
  const [detailConn, setDetailConn] = useState<ConnectorMessage | null>(null);
  const [detailMsg, setDetailMsg] = useState<Message | null>(null);

  const { data: messages, isLoading, isFetching } = useChannelMessages(channelId, appliedFilter, 0);
  const { data: totalCount } = useMessageCount(channelId, appliedFilter);

  // Flatten rows for virtual table
  const flatRows = useMemo<FlatRow[]>(() => {
    const result: FlatRow[] = [];
    for (const msg of messages ?? []) {
      const isExpanded = expanded.has(msg.messageId);
      result.push({ kind: 'parent', msg, expanded: isExpanded });
      if (isExpanded) {
        for (const [key, conn] of getConnectors(msg)) {
          result.push({ kind: 'child', msg, connKey: key, conn: conn as ConnectorMessage });
        }
      }
    }
    return result;
  }, [messages, expanded]);

  const handleToggle = useCallback((msgId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  }, []);

  const handleSearch = () => {
    setExpanded(new Set());
    setAppliedFilter({ ...draft });
  };

  const handleReset = () => {
    const reset = { ...DEFAULT_FILTER };
    setDraft(reset);
    setAppliedFilter(reset);
    setExpanded(new Set());
  };

  const expandAll = () => {
    const ids = new Set((messages ?? []).map((m) => m.messageId));
    setExpanded(ids);
  };
  const collapseAll = () => setExpanded(new Set());

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <Group gap="sm">
          <ActionIcon component={Link} to="/dashboard" variant="subtle" size="lg">
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={4}>Message Log</Title>
          <Text c="dimmed" size="sm">—</Text>
          <Text size="sm" fw={500}>{channelName}</Text>
        </Group>
        {isFetching && <Loader size="xs" />}
      </Group>

      {/* Filter panel */}
      <Box
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: 8,
          padding: '14px 16px',
        }}
      >
        <Stack gap="sm">
          <Group gap="sm" align="flex-end" wrap="wrap">
            <TextInput
              label="Tìm kiếm"
              placeholder="Nội dung message..."
              leftSection={<IconSearch size={14} />}
              value={draft.textSearch ?? ''}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setDraft((d) => ({ ...d, textSearch: value }));
              }}
              w={240}
            />
            <MultiSelect
              label="Trạng thái"
              placeholder="Tất cả"
              data={ALL_STATUSES}
              value={draft.statuses ?? []}
              onChange={(v) => setDraft((d) => ({ ...d, statuses: v as MessageStatus[] }))}
              w={240}
              clearable
            />
            <DatePickerInput
              label="Từ ngày"
              placeholder="Chọn ngày..."
              value={draft.startDate ?? null}
              onChange={(d) => setDraft((prev) => ({ ...prev, startDate: d ?? undefined }))}
              clearable
              w={160}
            />
            <DatePickerInput
              label="Đến ngày"
              placeholder="Chọn ngày..."
              value={draft.endDate ?? null}
              onChange={(d) => setDraft((prev) => ({ ...prev, endDate: d ?? undefined }))}
              clearable
              w={160}
            />
            <NumberInput
              label="Limit"
              value={draft.limit ?? 50}
              onChange={(v) => {
                const n = typeof v === 'number' ? v : Number(v);
                const clamped = isNaN(n) || n < 1 ? 1 : Math.round(n);
                setDraft((d) => ({ ...d, limit: clamped }));
              }}
              min={1}
              max={1000}
              step={1}
              allowDecimal={false}
              w={100}
            />
            <Group gap="xs" style={{ alignSelf: 'flex-end' }}>
              <Button leftSection={<IconSearch size={14} />} onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button variant="default" leftSection={<IconRefresh size={14} />} onClick={handleReset}>
                Reset
              </Button>
            </Group>
          </Group>

          {/* Stats + expand/collapse */}
          <Group justify="space-between">
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Tổng:
                {totalCount !== undefined
                  ? <Text span fw={600} c="blue"> {totalCount.toLocaleString('vi-VN')}</Text>
                  : ' …'}
                {' '}messages
                {(messages?.length ?? 0) > 0 && (
                  <Text span c="dimmed"> · Hiển thị {messages!.length}</Text>
                )}
              </Text>
            </Group>
            <Group gap="xs">
              <Button variant="subtle" size="xs" onClick={expandAll}>Mở tất cả</Button>
              <Button variant="subtle" size="xs" onClick={collapseAll}>Đóng tất cả</Button>
            </Group>
          </Group>
        </Stack>
      </Box>

      {/* Table */}
      {isLoading ? (
        <Stack gap="xs">
          {[...Array(8)].map((_, i) => <Skeleton key={i} h={36} radius="md" />)}
        </Stack>
      ) : (messages?.length ?? 0) === 0 ? (
        <Box ta="center" py="xl">
          <Text c="dimmed">Không có message nào phù hợp</Text>
        </Box>
      ) : (
        <VirtualTable
          rows={flatRows}
          onToggle={handleToggle}
          onConnectorClick={(conn, msg) => { setDetailConn(conn); setDetailMsg(msg); }}
        />
      )}

      {/* Connector detail overlay */}
      <ConnectorDetailModal
        conn={detailConn}
        msg={detailMsg}
        channelId={channelId}
        onClose={() => { setDetailConn(null); setDetailMsg(null); }}
      />
    </Stack>
  );
}
