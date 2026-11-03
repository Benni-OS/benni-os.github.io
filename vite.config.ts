import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'assets/icon-192.svg'],
      manifest: {
        name: 'BENNI·OS — Sovereign Autonomy System',
        short_name: 'BENNI·OS',
        description: 'The Sovereign Autonomy System — Built from first principles.',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/assets/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 60 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,woff2,svg,ico,txt}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:mp4|webm|webp|png|jpg|jpeg)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'media-cache-v2',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'cdn-assets' }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      input: (() => {
        const inputs: Record<string, string> = {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html')
        };
        const blogDir = path.resolve(__dirname, 'blog');
        if (fs.existsSync(blogDir)) {
          const files = fs.readdirSync(blogDir);
          for (const f of files) {
            if (f.endsWith('.html')) {
              const name = f === 'index.html' ? 'blog' : `blog-${f.replace('.html', '')}`;
              inputs[name] = path.resolve(blogDir, f);
            }
          }
        }
        return inputs;
      })()
    }
  },
  publicDir: 'public'
});
