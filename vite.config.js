import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Zoro AI Chat Bot',
      short_name: 'Zoro',
      description: 'My Awesome App description',
      theme_color: '#ffffff',
      icons: [
        {
          "src": "/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
      },
      {
          "src": "/android-chrome-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
      }
      ]
    }
  })
],base: '/zoro_ai_chatbot_beta/'
})
