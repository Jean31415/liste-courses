import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow the dev server to be reached through any host (useful for tunnels
    // like cloudflared / ngrok). Dev-only — does not affect the production build.
    allowedHosts: true,
  },
})
