import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // 👇 ADICIONADO AQUI: Define o caminho base do projeto na Vercel
  base: '/data-planning/', 
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Data-Planner',
        short_name: 'DPlanner',
        description: 'Gestão estratégica e monitoramento de métricas para startups.',
        
        theme_color: '#000000', 
        background_color: '#000000', 
        
        display: 'standalone', 
        
        orientation: 'portrait',
        // 👇 ALTERADO AQUI: Atualizado para refletir o novo caminho base do PWA
        start_url: '/data-planning/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      }
    })
  ],
})