import { AppShell } from '@mantine/core';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getCurrentUser } from '@/lib/api/auth';
import { AppHeader } from '@/components/AppHeader';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return; // skip auth check on SSR, client will handle
    try {
      await getCurrentUser();
    } catch {
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
