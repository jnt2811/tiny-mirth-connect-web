import { notifications } from '@mantine/notifications';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Anchor,
  Box,
  Button,
  Center,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useLogin } from '@/hooks/useAuth';
import type { LoginStatus } from '@/types/auth';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    // Nếu đã auth rồi thì redirect về dashboard
    const ctx = context as { isAuthenticated?: boolean };
    if (ctx.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: LoginPage,
});

const errorMessages: Record<LoginStatus['status'], string> = {
  SUCCESS: '',
  SUCCESS_GRACE_PERIOD: '',
  FAIL: 'Tên đăng nhập hoặc mật khẩu không đúng.',
  FAIL_EXPIRED: 'Mật khẩu đã hết hạn. Vui lòng liên hệ quản trị viên.',
  FAIL_LOCKED_OUT: 'Tài khoản bị khóa. Vui lòng liên hệ quản trị viên.',
  FAIL_VERSION_MISMATCH: 'Phiên bản không tương thích.',
};

function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { username, password },
      {
        onSuccess: (data) => {
          if (data.status === 'SUCCESS' || data.status === 'SUCCESS_GRACE_PERIOD') {
            notifications.show({
              title: 'Đăng nhập thành công',
              message: `Chào mừng, ${data.updatedUsername ?? username}!`,
              color: 'green',
            });
            void router.navigate({ to: '/dashboard' });
          } else {
            notifications.show({
              title: 'Đăng nhập thất bại',
              message: errorMessages[data.status] ?? 'Đã có lỗi xảy ra.',
              color: 'red',
            });
          }
        },
        onError: () => {
          notifications.show({
            title: 'Lỗi kết nối',
            message: 'Không thể kết nối tới server. Vui lòng thử lại.',
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <Center h="100vh" bg="gray.0">
      <Box w={400}>
        <Title ta="center" mb="xs">
          Mirth Connect
        </Title>
        <Text ta="center" c="dimmed" size="sm" mb="xl">
          Đăng nhập để tiếp tục
        </Text>

        <Paper withBorder shadow="md" p="xl" radius="md">
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Tên đăng nhập"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              mb="md"
              required
            />
            <PasswordInput
              label="Mật khẩu"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              mb="xl"
              required
            />
            <Button type="submit" fullWidth loading={login.isPending}>
              Đăng nhập
            </Button>
          </form>
        </Paper>

        <Text ta="center" mt="md" size="xs" c="dimmed">
          <Anchor href="https://www.nextgen.com/solutions/nextgen-mirth-connect" target="_blank" size="xs">
            NextGen Mirth Connect
          </Anchor>
        </Text>
      </Box>
    </Center>
  );
}
