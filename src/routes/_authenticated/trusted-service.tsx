import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Stack,
  Switch,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconPencil, IconPlus, IconSearch } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from 'mantine-datatable'
import { useMemo, useState } from 'react'
import {
  createTrustedService,
  getTrustedServices,
  updateTrustedService,
  updateTrustedServiceStatus,
  type TrustedService,
} from '@/server/trustedService'

export const Route = createFileRoute('/_authenticated/trusted-service')({
  component: TrustedServicePage,
})

const EMPTY_FORM = { SERVICE_NAME: '', SERVICE_HOST: '', STATUS: 1 }

function TrustedServicePage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [opened, { open, close }] = useDisclosure(false)
  const [editRecord, setEditRecord] = useState<TrustedService | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data = [], isLoading } = useQuery({
    queryKey: ['trusted-services'],
    queryFn: () => getTrustedServices(),
  })

  const filtered = useMemo(
    () =>
      data.filter(
        (r) =>
          r.SERVICE_NAME.toLowerCase().includes(search.toLowerCase()) ||
          r.SERVICE_HOST.toLowerCase().includes(search.toLowerCase()),
      ),
    [data, search],
  )

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['trusted-services'] })

  const createMutation = useMutation({
    mutationFn: (d: typeof EMPTY_FORM) => createTrustedService({ data: d }),
    onSuccess: () => {
      notifications.show({ message: 'Đã thêm dịch vụ', color: 'green' })
      invalidate()
      close()
    },
    onError: () => notifications.show({ message: 'Lỗi khi thêm dịch vụ', color: 'red' }),
  })

  const updateMutation = useMutation({
    mutationFn: (d: typeof EMPTY_FORM & { ID: number }) => updateTrustedService({ data: d }),
    onSuccess: () => {
      notifications.show({ message: 'Đã cập nhật dịch vụ', color: 'green' })
      invalidate()
      close()
    },
    onError: () => notifications.show({ message: 'Lỗi khi cập nhật dịch vụ', color: 'red' }),
  })

  const statusMutation = useMutation({
    mutationFn: (d: { ID: number; STATUS: number }) => updateTrustedServiceStatus({ data: d }),
    onSuccess: () => invalidate(),
    onError: () => notifications.show({ message: 'Lỗi khi cập nhật trạng thái', color: 'red' }),
  })

  const openAdd = () => {
    setEditRecord(null)
    setForm(EMPTY_FORM)
    open()
  }

  const openEdit = (record: TrustedService) => {
    setEditRecord(record)
    setForm({
      SERVICE_NAME: record.SERVICE_NAME,
      SERVICE_HOST: record.SERVICE_HOST,
      STATUS: record.STATUS,
    })
    open()
  }

  const handleSubmit = () => {
    if (!form.SERVICE_NAME.trim() || !form.SERVICE_HOST.trim()) {
      notifications.show({ message: 'Vui lòng điền đầy đủ thông tin', color: 'orange' })
      return
    }
    if (editRecord) {
      updateMutation.mutate({ ...form, ID: editRecord.ID })
    } else {
      createMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Dịch vụ tin cậy</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
          Thêm mới
        </Button>
      </Group>

      <TextInput
        placeholder="Tìm theo tên dịch vụ hoặc host..."
        leftSection={<IconSearch size={14} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        w={320}
      />

      <DataTable
        withTableBorder
        borderRadius="md"
        striped
        highlightOnHover
        fetching={isLoading}
        records={filtered}
        columns={[
          { accessor: 'ID', title: 'ID', width: 80 },
          { accessor: 'SERVICE_NAME', title: 'Tên dịch vụ' },
          { accessor: 'SERVICE_HOST', title: 'Tên host' },
          {
            accessor: 'STATUS',
            title: 'Trạng thái',
            render: (row) =>
              row.STATUS === 1 ? (
                <Badge color="green">Hoạt động</Badge>
              ) : (
                <Badge color="red">Đã dừng</Badge>
              ),
          },
          {
            accessor: 'actions',
            title: '',
            width: 100,
            render: (row) => (
              <Group gap="xs" wrap="nowrap">
                <Switch
                  checked={row.STATUS === 1}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    statusMutation.mutate({ ID: row.ID, STATUS: checked ? 1 : 0 })
                  }}
                />
                <ActionIcon variant="subtle" onClick={() => openEdit(row)}>
                  <IconPencil size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        noRecordsText="Không có dịch vụ nào"
      />

      <Modal
        opened={opened}
        onClose={close}
        title={editRecord ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
      >
        <Stack gap="sm">
          <TextInput
            label="Tên dịch vụ"
            placeholder="Nhập tên dịch vụ"
            required
            value={form.SERVICE_NAME}
            onChange={(e) => setForm((f) => ({ ...f, SERVICE_NAME: e.currentTarget.value }))}
          />
          <TextInput
            label="Tên host"
            placeholder="Nhập tên host"
            required
            value={form.SERVICE_HOST}
            onChange={(e) => setForm((f) => ({ ...f, SERVICE_HOST: e.currentTarget.value }))}
          />
          <Switch
            label="Trạng thái"
            checked={form.STATUS === 1}
            onChange={(e) => setForm((f) => ({ ...f, STATUS: e.currentTarget.checked ? 1 : 0 }))}
          />
          <TextInput label="Service secret" value="1" readOnly />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={close}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} loading={isPending}>
              {editRecord ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
