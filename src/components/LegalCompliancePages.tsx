import React, { useState } from 'react';
import { CalculatorCategory, CalculatorId, LegalPageId } from '../data/calculatorCatalog';
import {
  getSitemapEntries,
  generateSitemapXml,
  generateRobotsTxt,
  normalizeBaseUrl,
} from '../utils/seoSitemap';
import {
  Shield,
  FileText,
  AlertTriangle,
  Info,
  Mail,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
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
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Calculator Feedback');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Dynamic Sitemap Customizer & Preview State
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(() =>
    typeof window !== 'undefined' && window.location.origin
      ? normalizeBaseUrl(window.location.origin)
      : normalizeBaseUrl()
  );
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
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError('Please complete your name, email address, and message before submitting.');
      return;
    }
    setContactError('');
    setContactSubmitted(true);
  };

  const navTabs: Array<{ id: LegalPageId; label: string }> = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'disclaimer', label: 'Disclaimer' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onNavigateHome('All')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            ← Back to All Calculators
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Trust &amp; Legal Center
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Legal & Compliance Pages"
          className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800"
        >
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activePage === tab.id}
              onClick={() => onSelectLegalPage(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
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
        <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xl font-bold">Privacy Policy &amp; Google AdSense Cookie Disclosure</h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: November 6, 2026 · Effective Immediately
          </p>

          <p>
            At <strong>OmniCalc</strong>, accessible from our web portal, protecting the privacy of our visitors is one of our highest priorities. This Privacy Policy document outlines the types of information that are collected and recorded by OmniCalc and how we use them.
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Local Browser Execution &amp; Zero Personal Data Storage
            </h3>
            <p>
              All financial, health, mathematical, and lexical calculations performed on OmniCalc execute 100% locally inside your web browser using client-side JavaScript. We do not transmit, store, or log the numbers, loan figures, health metrics, or text passages you enter into our calculators on any backend database.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Google AdSense &amp; DoubleClick DART Cookie Disclosure
            </h3>
            <p>
              Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve advertisements to our site visitors based upon their visit to OmniCalc and other sites on the internet. Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at the following URL:{' '}
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                https://policies.google.com/technologies/ads
              </span>
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting Google Ads Settings or by visiting www.aboutads.info.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Log Files &amp; Essential Preferences
            </h3>
            <p>
              OmniCalc follows a standard procedure of using log files provided by static hosting providers (such as GitHub Pages, Vercel, or Cloud Run). These files log visitors when they visit websites and include non-identifiable metadata such as browser type, ISP, date/time stamp, and referring/exit pages. We also use local storage strictly to remember your Dark/Light theme preference.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              4. GDPR &amp; CCPA Privacy Rights
            </h3>
            <p>
              Under the CCPA and GDPR, users have the right to request disclosure of data collection practices, request deletion of personal data, and opt out of the sale or sharing of personal data. Because OmniCalc does not collect or store personal user profiles, no personal financial or health inputs are retained by us.
            </p>
          </div>
        </article>
      )}

      {/* 2. Terms of Service */}
      {activePage === 'terms' && (
        <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xl font-bold">Terms of Service</h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: November 6, 2026
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Acceptance of Terms
            </h3>
            <p>
              By accessing and using OmniCalc, you accept and agree to be bound by the terms and provisions of this agreement. Our calculators and educational guides are provided free of charge for personal, academic, and professional reference.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Use License &amp; Intellectual Property
            </h3>
            <p>
              Permission is granted to use OmniCalc’s interactive calculation utilities for legitimate informational and educational purposes. You may not scrape, frame, or redistribute our proprietary educational explanations as a competing commercial directory without attribution.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Accuracy &amp; Limitation of Liability
            </h3>
            <p>
              While every mathematical formula on OmniCalc is unit-tested against industry-standard financial, clinical, and lexical benchmarks, OmniCalc makes no warranties regarding the completeness or suitability of results for binding legal, lending, tax, or medical decisions. In no event shall OmniCalc be liable for any damages arising out of the use or inability to use the tools on this portal.
            </p>
          </div>
        </article>
      )}

      {/* 3. Disclaimer */}
      {activePage === 'disclaimer' && (
        <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-xl font-bold">Financial, Health &amp; General Informational Disclaimer</h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mandatory YMYL (Your Money or Your Life) Disclosure
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Financial Disclaimer (Not Financial or Lending Advice)
            </h3>
            <p>
              The results produced by the <strong>Loan EMI &amp; Mortgage Calculator</strong> and the <strong>Compound Interest Calculator</strong> are illustrative estimates intended strictly for informational and educational planning. Actual mortgage payments, APR/APY yields, bank fees, escrow requirements, and investment returns vary by financial institution, market conditions, and tax jurisdiction. Always consult a qualified financial advisor or licensed mortgage lender before making financial commitments.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Medical &amp; Health Disclaimer (Not Medical Advice)
            </h3>
            <p>
              The <strong>Body Mass Index (BMI) Calculator</strong> and <strong>TDEE / Daily Calorie Deficit Calculator</strong> rely on population-level statistical equations (WHO guidelines and the Mifflin-St Jeor formula). They are not a substitute for professional medical diagnosis, clinical body-composition assessment, or individualized dietary counseling. Consult a licensed physician or registered dietitian before starting any calorie-restriction or exercise program.
            </p>
          </div>
        </article>
      )}

      {/* 4. About Us & Site Directory */}
      {activePage === 'about' && (
        <div className="space-y-8">
          <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h2 className="text-xl font-bold">About OmniCalc</h2>
            </div>

            <p>
              <strong>OmniCalc</strong> was built with a simple mission: to provide fast, reliable, and completely transparent calculation tools for everyday financial decisions, fitness tracking, and mathematical problem-solving.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Instant &amp; Private
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  All computations run entirely in your web browser. No personal financial or health data is ever transmitted or stored on any server.
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Verified Formulas
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Every tool includes its exact mathematical formula and step-by-step worked examples so you can verify results independently.
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  100% Free Forever
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  No subscriptions, no paywalls, and no account registrations required to access any of our calculation tools.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Editorial Review &amp; Mathematical Rigor
              </h3>
              <p>
                Our tools follow established industry standards:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong>Loan &amp; Mortgage Calculations:</strong> Standard annuity compound amortization formula used by major commercial lending institutions.</li>
                <li><strong>Health &amp; Fitness Utilities:</strong> World Health Organization (WHO) BMI classifications and the validated Mifflin-St Jeor metabolic expenditure equation.</li>
                <li><strong>Everyday Math &amp; Text:</strong> High-precision floating-point arithmetic and standardized reading velocity benchmarks (225 words per minute).</li>
              </ul>
            </div>
          </article>

          {/* Site Directory / HTML Sitemap */}
          <section
            aria-labelledby="site-directory-heading"
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <h2 id="site-directory-heading" className="text-lg font-bold text-slate-900 dark:text-white">
                    Site Directory &amp; Calculator Index
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive overview of all verified calculation tools available on OmniCalc.
                  </p>
                </div>
              </div>

              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View XML Sitemap</span>
              </a>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Calculator</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {sitemapEntries.map((entry) => (
                    <tr
                      key={entry.path}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSitemapRowNavigate(entry.path)}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                        >
                          {entry.title.split('—')[0].trim()}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-medium">
                        {entry.category}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {entry.path}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 5. Contact Us */}
      {activePage === 'contact' && (
        <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
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
              className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-6 space-y-3"
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
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
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
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
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
                  onChange={(e) => setContactCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Calculator Feedback">Calculator Formula / Feedback</option>
                  <option value="New Tool Request">Request a New Calculator</option>
                  <option value="Advertising & AdSense">Advertising & AdSense Inquiry</option>
                  <option value="Privacy & Legal">Privacy & Compliance Question</option>
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
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your question, feedback, or calculator suggestion..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-white"
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
