import { AppShell } from '@mantine/core';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getCurrentUser } from '@/lib/api/auth';
import { AppHeader } from '@/components/AppHeader';
import { queryClient } from '@/lib/queryClient';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return; // skip auth check on SSR, client will handle
    try {
      await queryClient.ensureQueryData({
        queryKey: ['current-user'],
        queryFn: getCurrentUser,
        staleTime: Infinity, // chỉ fetch 1 lần, logout sẽ clear cache
      });
    } catch {
      queryClient.removeQueries({ queryKey: ['current-user'] });
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
