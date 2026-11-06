import fs from 'node:fs';
import path from 'node:path';
import { generateSitemapXml, generateRobotsTxt, getSitemapEntries } from '../src/utils/seoSitemap';

export function writePublicSeoFiles(baseUrl?: string): {
  sitemapPath: string;
  robotsPath: string;
  urlCount: number;
} {
  const resolvedBaseUrl =
    baseUrl ||
    process.env.VITE_SITE_URL ||
    process.env.APP_URL ||
    'https://bhavikog.github.io/omnicalc';

  const todayIso = new Date().toISOString().slice(0, 10);
  const publicDir = path.resolve(process.cwd(), 'public');
  fs.mkdirSync(publicDir, { recursive: true });

  const entries = getSitemapEntries(resolvedBaseUrl, todayIso);
  const sitemapXml = generateSitemapXml(resolvedBaseUrl, todayIso);
  const robotsTxt = generateRobotsTxt(resolvedBaseUrl);

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  const robotsPath = path.join(publicDir, 'robots.txt');

  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  fs.writeFileSync(robotsPath, robotsTxt, 'utf8');

  return {
    sitemapPath,
    robotsPath,
    urlCount: entries.length,
  };
}

// Execute when invoked directly via `npx tsx scripts/generate-sitemap.ts`
const result = writePublicSeoFiles();
console.log(
  `[OmniCalc SEO] Generated ${result.urlCount} canonical routes in ${result.sitemapPath} and ${result.robotsPath}`
);
