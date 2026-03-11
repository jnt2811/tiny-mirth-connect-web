import {
  ActionIcon,
  Avatar,
  Box,
  Burger,
  Divider,
  Drawer,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArrowsExchange,
  IconDashboard,
  IconLogout,
  IconMoon,
  IconSun,
  IconUser,
} from '@tabler/icons-react';
import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { useLogout } from '@/hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Bảng điều khiển', icon: <IconDashboard size={18} /> },
  { to: '/channels', label: 'Kênh', icon: <IconArrowsExchange size={18} /> },
] as const;

export function AppHeader() {
  const router = useRouter();
  const routerState = useRouterState();
  const logout = useLogout();
  const [drawerOpen, { open, close }] = useDisclosure(false);
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('light');

  const currentPath = routerState.location.pathname;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        notifications.show({
          title: 'Đã đăng xuất',
          message: 'Hẹn gặp lại!',
          color: 'blue',
        });
        void router.navigate({ to: '/login' });
      },
    });
  };

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      {/* Logo */}
      <Group gap="sm">
        <Burger opened={drawerOpen} onClick={open} hiddenFrom="sm" size="sm" />
        <Title order={4} c="blue">
          Mirth Connect
        </Title>

        {/* Desktop nav */}
        <Group gap={4} visibleFrom="sm" ml="lg">
          {navItems.map((item) => (
            <Box
              key={item.to}
              component={Link}
              to={item.to}
              px="sm"
              py={6}
              style={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: theme.radius.sm,
                textDecoration: 'none',
                color:
                  currentPath === item.to
                    ? theme.colors.blue[6]
                    : theme.colors.gray[7],
                fontWeight: currentPath === item.to ? 600 : 400,
                backgroundColor:
                  currentPath === item.to ? theme.colors.blue[0] : 'transparent',
                fontSize: theme.fontSizes.sm,
                transition: 'background 0.15s',
              })}
            >
              {item.icon}
              {item.label}
            </Box>
          ))}
        </Group>
      </Group>

      {/* Right side */}
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={toggleColorScheme} aria-label="Toggle color scheme">
          {colorScheme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </ActionIcon>

        <Menu shadow="md" width={180}>
          <Menu.Target>
            <ActionIcon variant="subtle" radius="xl" size="lg" aria-label="User menu">
              <Avatar size="sm" color="blue" radius="xl">
                <IconUser size={16} />
              </Avatar>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Tài khoản</Menu.Label>
            <Menu.Item
              leftSection={<IconLogout size={16} />}
              color="red"
              onClick={handleLogout}
            >
              Đăng xuất
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Mobile drawer */}
      <Drawer opened={drawerOpen} onClose={close} title="Menu" size="xs">
        <Stack gap={4}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={item.label}
              leftSection={item.icon}
              active={currentPath === item.to}
              onClick={close}
            />
          ))}
          <Divider my="sm" />
          <NavLink
            label="Đăng xuất"
            leftSection={<IconLogout size={18} />}
            color="red"
            onClick={() => { handleLogout(); close(); }}
          />
        </Stack>
        <Text size="xs" c="dimmed" mt="xl">
          Mirth Connect Web v1.0
        </Text>
      </Drawer>
    </Group>
  );
}
