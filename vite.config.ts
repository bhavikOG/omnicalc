import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import { generateSitemapXml, generateRobotsTxt } from './src/utils/seoSitemap';

function omnicalcDynamicSitemapPlugin(appUrl?: string): Plugin {
  const syncSeoAssets = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const publicDir = path.resolve(__dirname, 'public');
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
      const distDir = path.resolve(__dirname, 'dist');
      const indexHtml = path.join(distDir, 'index.html');
      const notFoundHtml = path.join(distDir, '404.html');
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appUrl =
    env.VITE_SITE_URL ||
    env.APP_URL ||
    'https://omnicalc.me';

  return {
    plugins: [react(), tailwindcss(), omnicalcDynamicSitemapPlugin(appUrl)],
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
