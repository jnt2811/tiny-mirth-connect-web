import {
  Badge,
  Box,
  Card,
  Code,
  Collapse,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowsExchange,
  IconChevronDown,
  IconChevronRight,
  IconLayoutGrid,
  IconSearch,
  IconTable,
} from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import { useChannels } from '@/hooks/useChannels';
import type { Channel, Connector } from '@/types/channel';

export const Route = createFileRoute('/_authenticated/channels')({
  component: ChannelsPage,
});

const protocolColor: Record<string, string> = {
  'HTTP Listener': 'blue',
  'HTTP Sender': 'cyan',
  'TCP Listener': 'green',
  'TCP Sender': 'teal',
  'Database Reader': 'orange',
  'Database Writer': 'yellow',
  'File Reader': 'violet',
  'File Writer': 'purple',
  'HL7 v2.x Listener': 'red',
  'HL7 v2.x Sender': 'pink',
  'SMTP Sender': 'indigo',
  'Channel Reader': 'grape',
  'Channel Writer': 'lime',
  'JavaScript Reader': 'cyan',
  'JavaScript Writer': 'cyan',
};

function ProtocolBadge({ name }: { name: string }) {
  const color = protocolColor[name] ?? 'gray';
  return (
    <Badge variant="light" color={color} size="sm">
      {name}
    </Badge>
  );
}

function ChannelDetailModal({ channel, opened, onClose }: {
  channel: Channel | null;
  opened: boolean;
  onClose: () => void;
}) {
  if (!channel) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconArrowsExchange size={18} />
          <Text fw={600}>{channel.name}</Text>
          <Badge variant="outline" size="xs" color="gray">Chỉ xem</Badge>
        </Group>
      }
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Tổng quan</Tabs.Tab>
          <Tabs.Tab value="source">Source Connector</Tabs.Tab>
          <Tabs.Tab value="destinations">Destinations ({channel.destinationConnectors.length})</Tabs.Tab>
          <Tabs.Tab value="properties">Properties</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Stack gap="xs">
            <KeyValue label="ID" value={channel.id} mono />
            <KeyValue label="Tên" value={channel.name} />
            <KeyValue label="Mô tả" value={channel.description || '—'} />
            <KeyValue label="Revision" value={String(channel.revision)} />
            <KeyValue label="Trạng thái khởi tạo" value={channel.properties.initialState} />
            <KeyValue label="Lưu trữ message" value={channel.properties.messageStorageMode} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="source" pt="md">
          <ConnectorDetail connector={channel.sourceConnector} />
        </Tabs.Panel>

        <Tabs.Panel value="destinations" pt="md">
          {channel.destinationConnectors.length === 0 ? (
            <Text c="dimmed" size="sm">Không có destination connector.</Text>
          ) : (
            <Stack gap="md">
              {channel.destinationConnectors.map((conn) => (
                <Card key={conn.metaDataId} withBorder radius="md" p="md">
                  <Group justify="space-between" mb="sm">
                    <Text fw={500} size="sm">{conn.name || `Destination ${conn.metaDataId}`}</Text>
                    <Group gap="xs">
                      <ProtocolBadge name={conn.transportName} />
                      <Badge variant="dot" color={conn.enabled ? 'green' : 'red'} size="xs">
                        {conn.enabled ? 'Bật' : 'Tắt'}
                      </Badge>
                    </Group>
                  </Group>
                  <ConnectorDetail connector={conn} compact />
                </Card>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="properties" pt="md">
          <Table withRowBorders striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Thuộc tính</Table.Th>
                <Table.Th>Giá trị</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(channel.properties).map(([k, v]) => (
                <Table.Tr key={k}>
                  <Table.Td><Code>{k}</Code></Table.Td>
                  <Table.Td><Text size="sm">{String(v)}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

function KeyValue({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Group gap="xs" align="flex-start">
      <Text size="sm" c="dimmed" w={160} style={{ flexShrink: 0 }}>{label}:</Text>
      {mono ? <Code>{value}</Code> : <Text size="sm">{value}</Text>}
    </Group>
  );
}

function ConnectorDetail({ connector, compact }: { connector: Connector; compact?: boolean }) {
  const [showProps, { toggle }] = useDisclosure(false);
  const props = connector.properties ?? {};
  const hasProps = Object.keys(props).length > 0;

  return (
    <Stack gap="xs">
      {!compact && (
        <>
          <KeyValue label="Tên" value={connector.name} />
          <KeyValue label="Mode" value={connector.mode} />
        </>
      )}
      <KeyValue label="Protocol" value={connector.transportName} />
      <KeyValue label="Enabled" value={connector.enabled ? 'Có' : 'Không'} />
      {hasProps && (
        <Box>
          <Group
            gap={4}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={toggle}
          >
            {showProps ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            <Text size="xs" c="dimmed">Properties ({Object.keys(props).length})</Text>
          </Group>
          <Collapse in={showProps}>
            <Table withRowBorders striped mt="xs" fz="xs">
              <Table.Tbody>
                {Object.entries(props).slice(0, 30).map(([k, v]) => (
                  <Table.Tr key={k}>
                    <Table.Td w={200}><Code fz="xs">{k}</Code></Table.Td>
                    <Table.Td>
                      <Text size="xs" truncate="end" maw={300}>
                        {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Collapse>
        </Box>
      )}
    </Stack>
  );
}

function ChannelsPage() {
  const { data: channels, isLoading } = useChannels();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Channel | null>(null);
  const [modalOpened, { open, close }] = useDisclosure(false);

  const filtered = useMemo(
    () =>
      (channels ?? []).filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [channels, search],
  );

  const handleSelect = (channel: Channel) => {
    setSelected(channel);
    open();
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Kênh</Title>
        {isLoading && <Loader size="xs" />}
      </Group>

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

      {isLoading ? (
        <Stack gap="xs">
          {[...Array(5)].map((_, i) => <Skeleton key={i} h={48} radius="md" />)}
        </Stack>
      ) : view === 'table' ? (
        <DataTable
          withTableBorder
          borderRadius="md"
          striped
          highlightOnHover
          records={filtered}
          onRowClick={({ record }) => handleSelect(record)}
          columns={[
            {
              accessor: 'name',
              title: 'Tên kênh',
              sortable: true,
            },
            {
              accessor: 'description',
              title: 'Mô tả',
              render: (row) => (
                <Text size="sm" c="dimmed" truncate="end" maw={300}>
                  {row.description || '—'}
                </Text>
              ),
            },
            {
              accessor: 'sourceConnector.transportName',
              title: 'Source Protocol',
              render: (row) => <ProtocolBadge name={row.sourceConnector.transportName} />,
            },
            {
              accessor: 'destinations',
              title: 'Destination Protocol(s)',
              render: (row) => (
                <Group gap={4} wrap="wrap">
                  {row.destinationConnectors.length === 0 ? (
                    <Text size="sm" c="dimmed">—</Text>
                  ) : (
                    row.destinationConnectors.slice(0, 3).map((d) => (
                      <ProtocolBadge key={d.metaDataId} name={d.transportName} />
                    ))
                  )}
                  {row.destinationConnectors.length > 3 && (
                    <Badge variant="outline" size="xs" color="gray">
                      +{row.destinationConnectors.length - 3}
                    </Badge>
                  )}
                </Group>
              ),
            },
            {
              accessor: 'properties.initialState',
              title: 'Trạng thái khởi tạo',
              render: (row) => (
                <Badge
                  variant="light"
                  color={
                    row.properties.initialState === 'STARTED'
                      ? 'green'
                      : row.properties.initialState === 'PAUSED'
                      ? 'yellow'
                      : 'red'
                  }
                  size="sm"
                >
                  {row.properties.initialState}
                </Badge>
              ),
            },
            {
              accessor: 'revision',
              title: 'Revision',
              render: (row) => <Text size="sm" c="dimmed">{row.revision}</Text>,
            },
          ]}
          noRecordsText="Không có kênh nào"
        />
      ) : (
        <Grid>
          {filtered.length === 0 ? (
            <Grid.Col>
              <Text ta="center" c="dimmed" py="xl">Không có kênh nào</Text>
            </Grid.Col>
          ) : (
            filtered.map((ch) => (
              <Grid.Col key={ch.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card
                  withBorder
                  radius="md"
                  p="md"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelect(ch)}
                >
                  <Text fw={600} size="sm" truncate="end" mb="xs">{ch.name}</Text>
                  {ch.description && (
                    <Text size="xs" c="dimmed" lineClamp={2} mb="sm">{ch.description}</Text>
                  )}
                  <Divider mb="sm" />
                  <Stack gap={6}>
                    <Group gap={6}>
                      <Text size="xs" c="dimmed" w={70}>Source:</Text>
                      <ProtocolBadge name={ch.sourceConnector.transportName} />
                    </Group>
                    {ch.destinationConnectors.length > 0 && (
                      <Group gap={6} align="flex-start">
                        <Text size="xs" c="dimmed" w={70}>Dest:</Text>
                        <Group gap={4} wrap="wrap">
                          {ch.destinationConnectors.slice(0, 2).map((d) => (
                            <ProtocolBadge key={d.metaDataId} name={d.transportName} />
                          ))}
                          {ch.destinationConnectors.length > 2 && (
                            <Badge variant="outline" size="xs" color="gray">
                              +{ch.destinationConnectors.length - 2}
                            </Badge>
                          )}
                        </Group>
                      </Group>
                    )}
                    <Group gap={6}>
                      <Text size="xs" c="dimmed" w={70}>State:</Text>
                      <Badge
                        variant="light"
                        size="xs"
                        color={ch.properties.initialState === 'STARTED' ? 'green' : ch.properties.initialState === 'PAUSED' ? 'yellow' : 'red'}
                      >
                        {ch.properties.initialState}
                      </Badge>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))
          )}
        </Grid>
      )}

      <ChannelDetailModal channel={selected} opened={modalOpened} onClose={close} />
    </Stack>
  );
}
