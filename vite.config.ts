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
})
