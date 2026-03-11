import {
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconExclamationCircle,
  IconLayoutGrid,
  IconSearch,
  IconTable,
} from '@tabler/icons-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import { useChannels } from '@/hooks/useChannels';
import { useChannelStatuses } from '@/hooks/useDashboard';
import type { ChannelState, DashboardStatus } from '@/types/dashboard';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

const stateBadgeColor: Record<ChannelState, string> = {
  STARTED: 'green',
  STOPPED: 'red',
  PAUSED: 'yellow',
  DEPLOYING: 'blue',
  UNDEPLOYING: 'orange',
  STARTING: 'teal',
  STOPPING: 'orange',
  SYNCING: 'violet',
  UNKNOWN: 'gray',
};

const stateLabel: Record<ChannelState, string> = {
  STARTED: 'Đang chạy',
  STOPPED: 'Đã dừng',
  PAUSED: 'Tạm dừng',
  DEPLOYING: 'Đang triển khai',
  UNDEPLOYING: 'Đang thu hồi',
  STARTING: 'Đang khởi động',
  STOPPING: 'Đang dừng',
  SYNCING: 'Đang đồng bộ',
  UNKNOWN: 'Không xác định',
};

function StateBadge({ state }: { state: ChannelState }) {
  return (
    <Badge color={stateBadgeColor[state] ?? 'gray'} variant="light" size="sm">
      {stateLabel[state] ?? state}
    </Badge>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fz={28} fw={700} c={color} mt={4}>
        {value}
      </Text>
    </Paper>
  );
}

function DashboardPage() {
  const { data: statuses, isLoading: loadingStatuses } = useChannelStatuses();
  const { data: channels, isLoading: loadingChannels } = useChannels();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleRowClick = (row: DashboardStatus) => {
    void navigate({
      to: '/messages/$channelId',
      params: { channelId: row.channelId },
      search: { channelName: row.name },
    });
  };

  // Map channelId → protocol từ channel list
  const protocolMap = useMemo(() => {
    const map = new Map<string, string>();
    channels?.forEach((ch) => {
      map.set(ch.id, ch.sourceConnector.transportName);
    });
    return map;
  }, [channels]);

  const filtered = useMemo(
    () =>
      (statuses ?? []).filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [statuses, search],
  );

  const totalChannels = statuses?.length ?? 0;
  const startedCount = statuses?.filter((s) => s.state === 'STARTED').length ?? 0;
  const stoppedCount = statuses?.filter((s) => s.state === 'STOPPED').length ?? 0;
  const totalErrors = statuses?.reduce((sum, s) => sum + (s.statistics?.error ?? 0), 0) ?? 0;

  const isLoading = loadingStatuses || loadingChannels;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Bảng điều khiển</Title>
        {isLoading && <Loader size="xs" />}
      </Group>

      {/* Summary cards */}
      {isLoading ? (
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} h={80} radius="md" />)}
        </SimpleGrid>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <SummaryCard label="Tổng kênh" value={totalChannels} color="blue" />
          <SummaryCard label="Đang chạy" value={startedCount} color="green" />
          <SummaryCard label="Đã dừng" value={stoppedCount} color="red" />
          <SummaryCard label="Tổng lỗi" value={totalErrors} color="orange" />
        </SimpleGrid>
      )}

      {/* Toolbar */}
      <Group justify="space-between">
        <TextInput
          placeholder="Tìm theo tên kênh..."
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={280}
        />
        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as 'table' | 'grid')}
          data={[
            { value: 'table', label: <IconTable size={16} /> },
            { value: 'grid', label: <IconLayoutGrid size={16} /> },
          ]}
        />
      </Group>

      {/* Content */}
      {isLoading ? (
        <Stack gap="xs">
          {[...Array(5)].map((_, i) => <Skeleton key={i} h={48} radius="md" />)}
        </Stack>
      ) : view === 'table' ? (
        <TableView rows={filtered} protocolMap={protocolMap} onRowClick={handleRowClick} />
      ) : (
        <GridView rows={filtered} protocolMap={protocolMap} onRowClick={handleRowClick} />
      )}
    </Stack>
  );
}

function TableView({
  rows,
  protocolMap,
  onRowClick,
}: {
  rows: DashboardStatus[];
  protocolMap: Map<string, string>;
  onRowClick: (row: DashboardStatus) => void;
}) {
  return (
    <DataTable
      withTableBorder
      borderRadius="md"
      striped
      highlightOnHover
      records={rows}
      onRowClick={({ record }) => onRowClick(record)}
      columns={[
        {
          accessor: 'name',
          title: 'Tên kênh',
          sortable: true,
        },
        {
          accessor: 'state',
          title: 'Trạng thái',
          sortable: true,
          render: (row) => <StateBadge state={row.state} />,
        },
        {
          accessor: 'protocol',
          title: 'Protocol',
          render: (row) => (
            <Badge variant="outline" size="sm" color="blue">
              {protocolMap.get(row.channelId) ?? '—'}
            </Badge>
          ),
        },
        {
          accessor: 'statistics.received',
          title: 'Nhận',
          render: (row) => (
            <Group gap={4}>
              <IconArrowDown size={14} color="teal" />
              <Text size="sm">{row.statistics?.received ?? 0}</Text>
            </Group>
          ),
        },
        {
          accessor: 'statistics.sent',
          title: 'Gửi',
          render: (row) => (
            <Group gap={4}>
              <IconArrowUp size={14} color="blue" />
              <Text size="sm">{row.statistics?.sent ?? 0}</Text>
            </Group>
          ),
        },
        {
          accessor: 'statistics.error',
          title: 'Lỗi',
          render: (row) => {
            const err = row.statistics?.error ?? 0;
            return (
              <Group gap={4}>
                <IconExclamationCircle size={14} color={err > 0 ? 'red' : 'gray'} />
                <Text size="sm" c={err > 0 ? 'red' : undefined} fw={err > 0 ? 600 : undefined}>
                  {err}
                </Text>
              </Group>
            );
          },
        },
        {
          accessor: 'statistics.filtered',
          title: 'Bị lọc',
          render: (row) => <Text size="sm">{row.statistics?.filtered ?? 0}</Text>,
        },
        {
          accessor: 'queued',
          title: 'Hàng đợi',
          render: (row) => <Text size="sm">{row.queued ?? 0}</Text>,
        },
      ]}
      noRecordsText="Không có kênh nào"
    />
  );
}

function GridView({
  rows,
  protocolMap,
  onRowClick,
}: {
  rows: DashboardStatus[];
  protocolMap: Map<string, string>;
  onRowClick: (row: DashboardStatus) => void;
}) {
  if (rows.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        Không có kênh nào
      </Text>
    );
  }

  return (
    <Grid>
      {rows.map((row) => {
        const err = row.statistics?.error ?? 0;
        return (
          <Grid.Col key={row.channelId} span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder radius="md" p="md" h="100%" style={{ cursor: 'pointer' }} onClick={() => onRowClick(row)}>
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm" truncate="end" maw={160}>
                  {row.name}
                </Text>
                <StateBadge state={row.state} />
              </Group>
              <Badge variant="outline" size="xs" color="blue" mb="sm">
                {protocolMap.get(row.channelId) ?? '—'}
              </Badge>
              <SimpleGrid cols={2} spacing="xs">
                <Box>
                  <Text size="xs" c="dimmed">Nhận</Text>
                  <Text size="sm" fw={500}>{row.statistics?.received ?? 0}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Gửi</Text>
                  <Text size="sm" fw={500}>{row.statistics?.sent ?? 0}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Lỗi</Text>
                  <Text size="sm" fw={500} c={err > 0 ? 'red' : undefined}>{err}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Hàng đợi</Text>
                  <Text size="sm" fw={500}>{row.queued ?? 0}</Text>
                </Box>
              </SimpleGrid>
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
