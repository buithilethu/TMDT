import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
server: {
    allowedHosts: [
      '876f-116-96-206-118.ngrok-free.app', // Add your ngrok domain here
    ],
  },
  plugins: [react()],
})
