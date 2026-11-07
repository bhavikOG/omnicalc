import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { generateSitemapXml, generateRobotsTxt } from './src/utils/seoSitemap.ts';

function omnicalcDynamicSitemapPlugin(appUrl?: string): Plugin {
  const syncSeoAssets = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const rootDir = import.meta.dirname || path.resolve();
    const publicDir = path.resolve(rootDir, 'public');
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(
      path.join(publicDir, 'sitemap.xml'),
      generateSitemapXml(appUrl, todayIso),
      'utf8'
    );
    fs.writeFileSync(
      path.join(publicDir, 'robots.txt'),
      generateRobotsTxt(appUrl),
      'utf8'
    );
  };

  return {
    name: 'omnicalc-dynamic-sitemap',
    buildStart() {
      syncSeoAssets();
    },
    configureServer() {
      syncSeoAssets();
    },
    closeBundle() {
      const rootDir = import.meta.dirname || path.resolve();
      const distDir = path.resolve(rootDir, 'dist');
      const indexHtml = path.join(distDir, 'index.html');
      const notFoundHtml = path.join(distDir, '404.html');
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml);
      }
    },
  };
}

const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-DNS-Prefetch-Control': 'off',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.google.com https://*.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://*.google.com https://*.googlesyndication.com; connect-src 'self' https://pagead2.googlesyndication.com https://*.google.com https://*.googlesyndication.com; frame-src 'self' https://googleads.g.doubleclick.net https://*.google.com https://*.googlesyndication.com; frame-ancestors *; object-src 'none'; base-uri 'self'; form-action 'self';",
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appUrl = env.VITE_SITE_URL || env.APP_URL || 'https://omnicalc.me';

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      omnicalcDynamicSitemapPlugin(appUrl),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'sitemap.xml', 'robots.txt'],
        manifest: {
          id: '/',
          name: 'OmniCalc — Precision Online Calculators',
          short_name: 'OmniCalc',
          description:
            '100% client-side calculator suite for Finance, Health, Math, and Text with offline PWA support.',
          theme_color: '#10b981',
          background_color: '#0a0d14',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,xml,txt}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      headers: SECURITY_HEADERS,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      headers: SECURITY_HEADERS,
    },
    build: {
      sourcemap: false,
      cssMinify: true,
    },
  };
});
