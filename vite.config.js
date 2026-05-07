import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { emailApiPlugin } from './emailApiPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), emailApiPlugin()],
})
