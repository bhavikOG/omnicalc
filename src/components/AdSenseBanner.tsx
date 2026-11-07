import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdSenseBannerProps {
  slotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
  label?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotId,
  format = 'auto',
  className = '',
  label = 'Sponsored Advertisement',
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // Quietly ignore if ad blocker or duplicate initialization
    }
  }, []);

  return (
    <aside
      aria-label={label}
      data-testid="adsense-banner-unit"
      className={`w-full rounded-2xl liquid-glass p-4 sm:p-5 text-center transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5">
        <span>Sponsored · Google Partner</span>
        <span className="px-2 py-0.5 rounded liquid-well text-[9px] border border-slate-300/40 dark:border-slate-800/80">
          Advertisement
        </span>
      </div>

      <div className="min-h-[90px] sm:min-h-[100px] flex items-center justify-center overflow-hidden rounded-xl">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-3945008383296931"
          {...(slotId ? { 'data-ad-slot': slotId } : {})}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
};
