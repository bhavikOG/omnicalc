import React, { useState } from 'react';
import { CalculatorCategory, CalculatorId, LegalPageId } from '../data/calculatorCatalog';
import {
  getSitemapEntries,
  generateSitemapXml,
  generateRobotsTxt,
  normalizeBaseUrl,
} from '../utils/seoSitemap';
import { sanitizeSingleLineInput, sanitizeUserText } from '../utils/security';
import {
  Shield,
  FileText,
  AlertTriangle,
  Info,
  Mail,
  CheckCircle2,
  Copy,
  Check,
  Lock,
  Globe,
  Download,
  ExternalLink,
} from 'lucide-react';

interface LegalCompliancePagesProps {
  activePage: LegalPageId;
  onSelectLegalPage: (page: LegalPageId) => void;
  onSelectCalculator: (id: CalculatorId) => void;
  onNavigateHome: (cat?: CalculatorCategory | 'All') => void;
}

export const LegalCompliancePages: React.FC<LegalCompliancePagesProps> = ({
  activePage,
  onSelectLegalPage,
  onSelectCalculator,
  onNavigateHome,
}) => {
  // Contact Form State (Zero owner identity leaked; sanitized client-side)
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Calculator Feedback');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');

  // Dynamic Sitemap Customizer & Preview State (Always defaults to sanitized production domain)
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(() => normalizeBaseUrl());
  const [activeSeoPreviewTab, setActiveSeoPreviewTab] = useState<'table' | 'sitemap-xml' | 'robots-txt'>('table');
  const [copiedXml, setCopiedXml] = useState(false);

  const todayIso = '2026-11-06';
  const sitemapEntries = getSitemapEntries(customBaseUrl, todayIso);
  const sitemapXmlString = generateSitemapXml(customBaseUrl, todayIso);
  const robotsTxtString = generateRobotsTxt(customBaseUrl);

  const handleDownloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSitemapRowNavigate = (path: string) => {
    if (path === '/') {
      onNavigateHome('All');
      return;
    }
    if (path.startsWith('/calculators/')) {
      const id = path.replace('/calculators/', '') as CalculatorId;
      onSelectCalculator(id);
      return;
    }
    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '').toLowerCase();
      const map: Record<string, CalculatorCategory> = {
        finance: 'Finance',
        health: 'Health',
        math: 'Math',
        text: 'Text',
      };
      if (map[slug]) {
        onNavigateHome(map[slug]);
      }
      return;
    }
    if (path.startsWith('/legal/')) {
      const page = path.replace('/legal/', '') as LegalPageId;
      onSelectLegalPage(page);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeSingleLineInput(contactName, 80);
    const cleanEmail = sanitizeSingleLineInput(contactEmail, 120);
    const cleanMessage = sanitizeUserText(contactMessage, 2000);

    if (!cleanName.trim() || !cleanEmail.trim() || !cleanMessage.trim()) {
      setContactError('Please complete your name, email address, and message before submitting.');
      return;
    }
    setContactName(cleanName);
    setContactEmail(cleanEmail);
    setContactMessage(cleanMessage);
    setContactError('');
    setContactSubmitted(true);
  };

  const navTabs: Array<{ id: LegalPageId; label: string }> = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'disclaimer', label: 'Disclaimer' },
    { id: 'about', label: 'About & SEO Sitemap' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800/70 pb-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onNavigateHome('All')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            ← Back to All Calculators
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Privacy, Terms &amp; Site Information
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Legal & Compliance Pages"
          className="flex flex-wrap items-center gap-1.5 liquid-well p-1 rounded-xl"
        >
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activePage === tab.id}
              onClick={() => onSelectLegalPage(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activePage === tab.id
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Privacy Policy */}
      {activePage === 'privacy' && (
        <article className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xl font-bold">Privacy Policy &amp; Cookie Notice</h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: November 6, 2026 · Effective Immediately
          </p>

          <p>
            At <strong>OmniCalc</strong>, your privacy comes first. This Privacy Policy explains how our calculators work on your device and how your information stays private.
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. 100% On-Device Calculations (We Never Store Your Numbers)
            </h3>
            <p>
              All financial, health, math, and text calculations on OmniCalc run directly inside your web browser. We do not send, store, or log the numbers, loan details, health stats, or text you type into our calculators on any server. Any saved results or pinned tools are stored only in your own browser and can be cleared with one click at any time.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Google AdSense &amp; Advertising Cookies
            </h3>
            <p>
              Google is a third-party advertising partner on our site. Google uses cookies (such as DART cookies) to show ads based on your visit to OmniCalc and other websites. You can opt out of personalized advertising cookies at any time by visiting Google’s Ad Settings page at:{' '}
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all">
                https://policies.google.com/technologies/ads
              </span>
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on a visitor&apos;s prior visits to this website or other websites.
              </li>
              <li>
                Google&apos;s advertising cookies allow it and its partners to show relevant ads to visitors.
              </li>
              <li>
                You can turn off personalized ads in Google Ads Settings or at www.aboutads.info.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Local Browser Preferences
            </h3>
            <p>
              OmniCalc uses your browser&apos;s local storage only to remember your Dark or Light theme choice, your favorite pinned calculators, and any results you choose to save on your own device.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              4. GDPR &amp; CCPA Privacy Rights
            </h3>
            <p>
              Under GDPR and CCPA, you have the right to know what personal data is collected and to request its deletion. Because OmniCalc never uploads your calculator inputs to a server, we hold no personal financial or health records about you.
            </p>
          </div>
        </article>
      )}

      {/* 2. Terms of Service */}
      {activePage === 'terms' && (
        <article className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xl font-bold">Terms of Service</h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: November 6, 2026
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Using OmniCalc
            </h3>
            <p>
              By using OmniCalc, you agree to these terms. Our calculators and guides are provided free of charge for personal, school, and everyday work use.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Fair Use
            </h3>
            <p>
              You are welcome to use OmniCalc’s calculators and share links to your calculations. Please do not copy or republish our written guides on competing websites without credit.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Accuracy &amp; Responsibility
            </h3>
            <p>
              Every calculator on OmniCalc is carefully tested against standard banking, health, and math formulas. However, results are estimates for planning purposes and should not replace official quotes from your lender, tax advisor, or doctor.
            </p>
          </div>
        </article>
      )}

      {/* 3. Disclaimer */}
      {activePage === 'disclaimer' && (
        <article className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-xl font-bold">Financial &amp; Health Disclaimer</h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Important Information About Financial and Health Estimates
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Financial Disclaimer (Not Financial or Lending Advice)
            </h3>
            <p>
              Results from the <strong>Loan EMI &amp; Mortgage Calculator</strong>, <strong>Compound Interest Calculator</strong>, and <strong>Retirement Planner</strong> are estimates for planning and comparison. Actual loan payments, interest rates, property taxes, and investment returns depend on your lender, market conditions, and local tax rules. Always check with a qualified financial professional or lender before making major financial decisions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Health Disclaimer (Not Medical Advice)
            </h3>
            <p>
              The <strong>Body Mass Index (BMI) Calculator</strong> and <strong>Daily Calorie (TDEE) Calculator</strong> use standard formulas (WHO guidelines and the Mifflin-St Jeor equation). They are general educational estimates and not a substitute for advice from a doctor or registered dietitian.
            </p>
          </div>
        </article>
      )}

      {/* 4. About Us, Security Hardening & Dynamic Sitemap (/sitemap.xml) */}
      {activePage === 'about' && (
        <div className="space-y-8">
          <article className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h2 className="text-xl font-bold">About OmniCalc &amp; How We Protect Your Privacy</h2>
            </div>

            <p>
              <strong>OmniCalc</strong> is built to give you fast, accurate answers without clutter, popups, or tracking. Every calculator runs right on your device and includes step-by-step examples, worked formulas, and common questions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="liquid-well rounded-xl p-4">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  100% On-Device Privacy
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Your numbers stay in your browser. We never upload your inputs to a database or third-party server.
                </p>
              </div>
              <div className="liquid-well rounded-xl p-4">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Safe &amp; Verified Inputs
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  All inputs and CSV downloads are checked for safety so formulas always run smoothly on every device.
                </p>
              </div>
              <div className="liquid-well rounded-xl p-4">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Distraction-Free Layout
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Sponsor placements sit neatly below the calculator so they never block your buttons, sliders, or results.
                </p>
              </div>
            </div>

            <div className="liquid-well rounded-xl p-5 flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="font-bold text-slate-900 dark:text-white">
                  Built for Every Screen Size
                </div>
                <p>
                  OmniCalc is tested across phones, tablets, laptops, and desktop monitors with both Light and Dark themes so you can calculate comfortably anywhere.
                </p>
              </div>
            </div>
          </article>

          {/* Interactive Dynamic Sitemap & Robots.txt Inspector */}
          <section
            aria-labelledby="sitemap-inspector-heading"
            className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <h2 id="sitemap-inspector-heading" className="text-lg font-bold text-slate-900 dark:text-white">
                    Dynamic Sitemap (<code className="font-mono text-sm">/sitemap.xml</code>) &amp; Crawler Inspector
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {sitemapEntries.length} Canonical Indexable Routes · Served from <code className="font-mono">/public/sitemap.xml</code> &amp; <code className="font-mono">/public/robots.txt</code>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open /sitemap.xml</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleDownloadFile('sitemap.xml', sitemapXmlString, 'application/xml')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download sitemap.xml</span>
                </button>
              </div>
            </div>

            {/* Domain Base URL Configurator */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end liquid-well p-4 rounded-xl">
              <div className="sm:col-span-8 space-y-1">
                <label
                  htmlFor="sitemap-base-url"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Production Canonical Base URL (for XML Sitemap Generation)
                </label>
                <input
                  id="sitemap-base-url"
                  type="url"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(sanitizeSingleLineInput(e.target.value, 120))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-4 flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveSeoPreviewTab('table')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeSeoPreviewTab === 'table'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Routes ({sitemapEntries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSeoPreviewTab('sitemap-xml')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeSeoPreviewTab === 'sitemap-xml'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  sitemap.xml
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSeoPreviewTab('robots-txt')}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeSeoPreviewTab === 'robots-txt'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  robots.txt
                </button>
              </div>
            </div>

            {activeSeoPreviewTab === 'table' && (
              <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800/80 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">Canonical Path</th>
                      <th className="py-2.5 px-3 font-semibold">Indexed Page Title</th>
                      <th className="py-2.5 px-3 font-semibold">Freq</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {sitemapEntries.map((entry) => (
                      <tr
                        key={entry.path}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSitemapRowNavigate(entry.path)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                          >
                            {entry.path}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {entry.title}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                          {entry.changefreq}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-right text-slate-900 dark:text-white tabular-nums">
                          {entry.priority}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSeoPreviewTab === 'sitemap-xml' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">/public/sitemap.xml</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(sitemapXmlString);
                        setCopiedXml(true);
                        setTimeout(() => setCopiedXml(false), 1800);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {copiedXml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedXml ? 'Copied XML' : 'Copy XML Sitemap'}</span>
                  </button>
                </div>
                <pre
                  data-testid="sitemap-xml-preview"
                  className="rounded-xl bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800"
                >
                  {sitemapXmlString}
                </pre>
              </div>
            )}

            {activeSeoPreviewTab === 'robots-txt' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">/public/robots.txt</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile('robots.txt', robotsTxtString, 'text/plain')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download robots.txt</span>
                  </button>
                </div>
                <pre className="rounded-xl bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                  {robotsTxtString}
                </pre>
              </div>
            )}
          </section>
        </div>
      )}

      {/* 5. Contact Us */}
      {activePage === 'contact' && (
        <article className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xl font-bold">Contact Us</h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Have a question about one of our mathematical formulas, spotted an edge case, or want to request a new calculator utility? Send our editorial and engineering team a message below.
          </p>

          {contactSubmitted ? (
            <div
              data-testid="contact-success-banner"
              className="rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-6 space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Thank you, {contactName}! Your message has been recorded.</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-200/80">
                We have logged your inquiry under <strong>{contactCategory}</strong> ({contactEmail}) and typically respond within 1–2 business days.
              </p>
              <button
                type="button"
                onClick={() => {
                  setContactSubmitted(false);
                  setContactName('');
                  setContactEmail('');
                  setContactMessage('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl" noValidate>
              {contactError && (
                <div
                  role="alert"
                  className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-3 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {contactError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(sanitizeSingleLineInput(e.target.value, 80))}
                    placeholder="Alex Morgan"
                    className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(sanitizeSingleLineInput(e.target.value, 120))}
                    placeholder="alex@example.com"
                    className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-topic"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Inquiry Category
                </label>
                <select
                  id="contact-topic"
                  value={contactCategory}
                  onChange={(e) => setContactCategory(sanitizeSingleLineInput(e.target.value, 60))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Calculator Feedback">Calculator Formula / Feedback</option>
                  <option value="New Tool Request">Request a New Calculator</option>
                  <option value="Advertising & AdSense">Advertising &amp; AdSense Inquiry</option>
                  <option value="Privacy & Legal">Privacy &amp; Compliance Question</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(sanitizeUserText(e.target.value, 2000))}
                  placeholder="Describe your question, feedback, or calculator suggestion..."
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 p-3.5 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Send Message
              </button>
            </form>
          )}
        </article>
      )}
    </div>
  );
};
