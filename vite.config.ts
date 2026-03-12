import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsConfigPaths(), tanstackStart()],
  server: {
    proxy: {
      '/api': {
        target: 'https://10.8.0.184:8443',
        secure: false,
        changeOrigin: true,
      },
    },
  },
  ssr: {
    // Bundle UI-only packages into the server assets so they don't need to be
    // installed in node_modules at runtime, reducing Docker image size significantly.
    noExternal: [
      '@mantine/core',
      '@mantine/dates',
      '@mantine/hooks',
      '@mantine/notifications',
      '@mantine/store',
      '@tabler/icons-react',
      '@tanstack/react-virtual',
      '@tanstack/virtual-core',
      '@floating-ui/react',
      '@floating-ui/dom',
      '@floating-ui/core',
      '@floating-ui/utils',
      'mantine-datatable',
      'clsx',
      'dayjs',
      'react-number-format',
      'react-remove-scroll',
      'react-remove-scroll-bar',
      'react-transition-group',
      'react-style-singleton',
      '@babel/runtime',
      '@floating-ui/react-dom',
      'tslib',
      'use-callback-ref',
      'use-sidecar',
      'get-nonce',
    ],
  },
})
