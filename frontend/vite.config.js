import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: [
        "yoroomie-dev-fe.proudocean-5e4432a6.italynorth.azurecontainerapps.io",
        "yoroomie-dev-fe.lemonsand-de32b260.swedencentral.azurecontainerapps.io"
    ]
  }
})