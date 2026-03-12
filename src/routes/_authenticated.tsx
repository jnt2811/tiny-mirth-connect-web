import { AppShell } from '@mantine/core';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { useCurrentUser } from '@/hooks/useAuth';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const { isError } = useCurrentUser();

  useEffect(() => {
    if (isError) {
      void navigate({ to: '/login' });
    }
  }, [isError, navigate]);

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
