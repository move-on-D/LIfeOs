import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Life OS Command Center',
        short_name: 'LifeOS',
        description: 'Personal Digital Command Center',
        theme_color: '#0a0c16',
        background_color: '#0a0c16',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/8666/8666497.png', // Temporary generic cyber icon URL
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
