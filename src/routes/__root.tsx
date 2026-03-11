import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.layer.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { queryClient } from '@/lib/queryClient';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <Notifications />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </QueryClientProvider>
    </MantineProvider>
  );
}
