import {
  Badge,
  Box,
  Drawer,
  Group,
  Loader,
  MultiSelect,
  Pagination,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import { useChannelMessages, useMessageCount } from '@/hooks/useMessages';
import type { DashboardStatus } from '@/types/dashboard';
import type { ConnectorMessage, Message, MessageStatus } from '@/types/message';

const STATUS_COLORS: Record<MessageStatus, string> = {
  RECEIVED: 'blue',
  FILTERED: 'gray',
  TRANSFORMED: 'cyan',
  SENT: 'green',
  QUEUED: 'yellow',
  ERROR: 'red',
  PENDING: 'orange',
};

const STATUS_LABELS: Record<MessageStatus, string> = {
  RECEIVED: 'Nhận',
  FILTERED: 'Bị lọc',
  TRANSFORMED: 'Đã xử lý',
  SENT: 'Đã gửi',
  QUEUED: 'Hàng đợi',
  ERROR: 'Lỗi',
  PENDING: 'Đang chờ',
};

function StatusBadge({ status }: { status: MessageStatus }) {
  return (
    <Badge color={STATUS_COLORS[status] ?? 'gray'} variant="light" size="sm">
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// Lấy source ConnectorMessage (metaDataId = 0)
function getSource(msg: Message): ConnectorMessage | undefined {
  return msg.connectorMessages['0'] as ConnectorMessage | undefined;
}

// Lấy danh sách destination ConnectorMessages (metaDataId >= 1)
function getDestinations(msg: Message): ConnectorMessage[] {
  return Object.entries(msg.connectorMessages)
    .filter(([k]) => k !== '0')
    .map(([, v]) => v as ConnectorMessage);
}

const PAGE_SIZE = 20;
const ALL_STATUSES: MessageStatus[] = ['RECEIVED', 'FILTERED', 'SENT', 'ERROR', 'QUEUED', 'PENDING'];

interface Props {
  channel: DashboardStatus | null;
  opened: boolean;
  onClose: () => void;
}

export function ChannelMessageDrawer({ channel, opened, onClose }: Props) {
  const [page, setPage] = useState(0);
  const [selectedStatuses, setSelectedStatuses] = useState<MessageStatus[]>([]);

  const channelId = channel?.channelId ?? null;
  const filter = { limit: PAGE_SIZE, statuses: selectedStatuses.length ? selectedStatuses : undefined };
  const { data: messages, isLoading } = useChannelMessages(channelId, filter, page);
  const { data: totalCount } = useMessageCount(channelId, {});

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE);

  const records = useMemo(
    () =>
      (messages ?? []).map((msg) => {
        const src = getSource(msg);
        const dests = getDestinations(msg);
        return { ...msg, _src: src, _dests: dests };
      }),
    [messages],
  );

  const handleClose = () => {
    setPage(0);
    setSelectedStatuses([]);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <Text fw={600}>{channel?.name ?? ''}</Text>
          <Badge variant="light" color="blue" size="sm">Message Log</Badge>
        </Group>
      }
      position="right"
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        {/* Filter */}
        <MultiSelect
          placeholder="Lọc theo trạng thái..."
          data={ALL_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          value={selectedStatuses}
          onChange={(v) => { setSelectedStatuses(v as MessageStatus[]); setPage(0); }}
          clearable
        />

        {/* Table */}
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">Đang tải messages...</Text>
          </Group>
        ) : (
          <DataTable
            withTableBorder
            borderRadius="md"
            striped
            highlightOnHover
            records={records}
            minHeight={200}
            columns={[
              {
                accessor: 'messageId',
                title: 'ID',
                width: 80,
                render: (row) => <Text size="xs" c="dimmed" ff="monospace">{row.messageId}</Text>,
              },
              {
                accessor: 'receivedDate',
                title: 'Thời gian',
                width: 150,
                render: (row) => (
                  <Text size="xs">{formatDate(row.receivedDate)}</Text>
                ),
              },
              {
                accessor: '_src',
                title: (
                  <Group gap={4}>
                    <IconArrowDown size={13} />
                    <Text size="xs">Source</Text>
                  </Group>
                ),
                render: (row) =>
                  row._src ? (
                    <Stack gap={2}>
                      <StatusBadge status={row._src.status} />
                      {row._src.processingError && (
                        <Tooltip label={row._src.processingError} multiline maw={300}>
                          <Text size="xs" c="red" truncate="end" maw={120}>
                            {row._src.processingError}
                          </Text>
                        </Tooltip>
                      )}
                    </Stack>
                  ) : (
                    <Text size="xs" c="dimmed">—</Text>
                  ),
              },
              {
                accessor: '_dests',
                title: (
                  <Group gap={4}>
                    <IconArrowUp size={13} />
                    <Text size="xs">Destinations</Text>
                  </Group>
                ),
                render: (row) =>
                  row._dests.length === 0 ? (
                    <Text size="xs" c="dimmed">—</Text>
                  ) : (
                    <Stack gap={4}>
                      {row._dests.map((d, i) => (
                        <Group key={i} gap={6} wrap="nowrap">
                          <StatusBadge status={d.status} />
                          <Text size="xs" c="dimmed" truncate="end" maw={100}>
                            {d.connectorName}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  ),
              },
            ]}
            noRecordsText="Không có message nào"
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box ta="center">
            <Pagination
              total={totalPages}
              value={page + 1}
              onChange={(p) => setPage(p - 1)}
              size="sm"
            />
            <Text size="xs" c="dimmed" mt={4}>
              Tổng: {totalCount?.toLocaleString('vi-VN')} messages
            </Text>
          </Box>
        )}
        {totalCount !== undefined && totalCount > 0 && totalPages <= 1 && (
          <Text size="xs" c="dimmed" ta="center">
            {totalCount} message{totalCount > 1 ? 's' : ''}
          </Text>
        )}
      </Stack>
    </Drawer>
  );
}
