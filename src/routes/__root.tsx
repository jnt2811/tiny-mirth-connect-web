import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import 'mantine-datatable/styles.layer.css'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { queryClient } from '@/lib/queryClient'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <html lang="vi">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mirth Connect Web</title>
        <HeadContent />
      </head>
      <body>
        <MantineProvider>
          <QueryClientProvider client={queryClient}>
            <Notifications />
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </QueryClientProvider>
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  )
}
