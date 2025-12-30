import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'  // ← Add this import

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),  // ← Add this line
    VitePWA({
      // your existing PWA config
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Octavian Dynamics Invoice Generator',
        short_name: 'InvoiceGen',
        description: 'Professional invoice generator for Octavian Dynamics',
        theme_color: '#022142',
        background_color: '#f8f9fa',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg}']
      }
    })
  ],
})