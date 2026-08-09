import { useTranslation } from '@/lib/i18n/useTranslation';

/**
 * The official Tuba logo — two source variants placed by Tuba, traced here
 * (not redrawn): public/ar-color-TubaLogo2.svg (Arabic wordmark, viewBox
 * 0 0 377.46 118.06) and public/en_coloredLogo.svg (Latin wordmark, viewBox
 * 0 0 184.6 53.13, authored white-on-dark). Selected automatically from the
 * active locale — the same "correct asset per language," never a mirrored or
 * mechanically-translated logo, that design-system/15_INTERNATIONALIZATION.md
 * already requires of every other piece of UI.
 *
 * Inlined rather than <img>-referenced so each variant's two brand colors can
 * be controlled independently per theme: the source files hardcode a wordmark
 * color that only reads on one kind of surface (dark purple in the Arabic
 * file — invisible on a dark rail; white in the English file — invisible on a
 * light one). The wordmark uses `currentColor` so it inherits `text.brand`
 * (exact Tuba purple in light mode, a lighter on-brand purple in dark mode —
 * "dark mode is selected, not an automatic filter/invert," design-system/
 * 14_DARK_MODE.md). The house mark stays the exact, undiluted canonical
 * `--tuba-coral` token in both themes and both locales, since it's a fixed
 * brand mark, not UI chrome — both source files' coral values were
 * within rounding of the canonical token and are normalized to it here for
 * exact consistency with every other coral use in the app.
 */
export function TubaLogo({ className }: { className?: string }) {
  const { locale, t } = useTranslation();
  const label = t('app.name');

  if (locale === 'ar') {
    return (
      <svg viewBox="0 0 377.46 118.06" className={className} role="img" aria-label={label}>
        <path
          fill="var(--tuba-coral)"
          d="m377.46,33.99l-4.67-2.99V10.78h-12.31c-4.18,0-7.61,3.13-8.1,7.17L324.31,0h0s0,0,0,0h0s-53.15,33.99-53.15,33.99l7.14,11.17.04-.03c-1.22,4.24-1.89,8.72-1.88,13.34.08,26.49,21.66,48.02,48.17,48.02,14.94,0,28.31-6.83,37.15-17.54,0,0,0,0,0-.01,6.87-8.33,11.01-19,11.01-30.61h0v-17.03l4.67-7.31Zm-52.84,52.06c-15.26,0-27.68-12.42-27.68-27.68s12.42-27.68,27.68-27.68,27.68,12.42,27.68,27.68-12.42,27.68-27.68,27.68Z"
        />
        <g fill="currentColor">
          <circle cx="24.25" cy="16.93" r="5.59" />
          <circle cx="39.93" cy="16.93" r="5.59" />
          <circle cx="100.64" cy="100.52" r="5.59" />
          <path d="m221.08,35.04c-6.4,0-12.34,2.02-17.21,5.46v-21.5h-5.05c-4.25,0-7.69,3.44-7.69,7.69v55.51h-15.44v-17.22c0-8.27-3.36-15.76-8.79-21.18-5.43-5.43-12.92-8.79-21.18-8.79-16.49,0-29.92,13.4-29.97,29.89-.02,6.66,2.17,12.84,5.86,17.84,2.56,3.46,5.85,6.36,9.63,8.46,4.22,2.35,9.06,3.71,14.2,3.76h17.47c-.24,3.89-1.79,7.43-4.2,10.2-1.53,1.75-1.59,4.35-.22,6.23l4.87,6.69c5.25-3.84,9.22-9.34,11.1-15.72.79-2.66,1.21-4.48,1.22-7.39h45.4c16.52,0,29.95-13.44,29.95-29.95s-13.44-29.95-29.95-29.95Zm-58.17,29.94v17.22h-17.2c-6.08,0-11.44-3.17-14.5-7.94-1.73-2.68-2.72-5.87-2.72-9.28,0-9.5,7.73-17.23,17.22-17.23s17.23,7.73,17.23,17.23h-.03Zm58.17,17.23h0s-17.21,0-17.21,0v-17.21c0-9.49,7.72-17.21,17.21-17.21s17.21,7.73,17.21,17.21-7.73,17.21-17.21,17.21Z" />
          <path d="m97.66,55.87v8.8c0,.1,0,.2,0,.3,0,9.72-8.09,17.58-17.89,17.2-5.21-.2-9.76-2.77-12.77-6.63-1.35,4.38-3.52,8.4-6.35,11.88,5.45,4.81,12.65,7.68,20.51,7.5,16.35-.39,29.23-14.15,29.23-30.5v-16.15h-5.13c-4.2,0-7.61,3.41-7.61,7.61Z" />
          <path d="m63.24,65.2v-10.59l2.91-4.55-2.91-1.86v-12.59h-7.66c-2.6,0-4.73,1.95-5.04,4.46l-17.46-11.17h0s0,0,0,0h0s0,0,0,0L0,50.06l4.44,6.95.02-.02c-.76,2.64-1.17,5.42-1.17,8.3.05,16.48,13.48,29.88,29.97,29.88,9.29,0,17.61-4.25,23.12-10.91,0,0,0,0,0,0,4.28-5.18,6.85-11.82,6.85-19.05h0Zm-29.97,17.26c-9.5,0-17.23-7.73-17.23-17.23s7.73-17.23,17.23-17.23,17.23,7.73,17.23,17.23-7.73,17.23-17.23,17.23Z" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 184.6 53.13" className={className} role="img" aria-label={label}>
      <path
        fill="var(--tuba-coral)"
        d="M53,17l-2.33-1.49V5.38H44.57a4.06,4.06,0,0,0-4,3.57L26.52,0,0,17l3.56,5.57h0a23.64,23.64,0,0,0-.93,6.65A24,24,0,0,0,45.21,44.38h0A23.89,23.89,0,0,0,50.71,29.1V20.6ZM26.68,42.94A13.82,13.82,0,1,1,40.49,29.12,13.83,13.83,0,0,1,26.68,42.94"
      />
      <g fill="currentColor">
        <path d="M114.05,17.59h-2.5V32.53h0a8.6,8.6,0,0,1-8.93,8.58,8.72,8.72,0,0,1-8.25-8.79V21.62a4,4,0,0,0-4-4H88V32.53h0a15,15,0,0,0,15.3,14.94A15.12,15.12,0,0,0,117.9,32.25V21.45a3.85,3.85,0,0,0-3.85-3.86" />
        <path d="M144.18,20.31a14.91,14.91,0,0,0-17.17,0V9.75a4.09,4.09,0,0,0-4.1-4.09h-2.26V32.53h0c0,.39,0,.77,0,1.15s.07.75.13,1.12a5.43,5.43,0,0,0,.09.56c.07.36.16.72.25,1.08,0,.18.1.35.16.53s.15.47.23.69.09.23.13.34.19.45.29.68a13.39,13.39,0,0,0,.84,1.59,15.58,15.58,0,0,0,1,1.48,12.12,12.12,0,0,0,.94,1.08,14.85,14.85,0,0,0,10.27,4.63,15.12,15.12,0,0,0,15.48-14.69,14.9,14.9,0,0,0-6.36-12.46M135.6,41.12a8.59,8.59,0,1,1,8.58-8.74.76.76,0,0,1,0,.15,8.6,8.6,0,0,1-8.59,8.59" />
        <path d="M82.31,41.11h-.42a8.6,8.6,0,0,1-8.59-8.49h0V24h9.27V21.39a3.8,3.8,0,0,0-3.79-3.8H73.3v-8a3.94,3.94,0,0,0-3.94-3.94H66.94V32.53a15,15,0,0,0,15,14.95h.65l.27,0,.39,0,.23,0,.47-.06H84a14.91,14.91,0,0,0,6.35-2.51,17.68,17.68,0,0,1-3.55-5.26,8.52,8.52,0,0,1-4.52,1.55" />
        <path d="M184.6,25,168.1,14.42h0L151.6,25l2.17,3.39a14.92,14.92,0,0,0,14.36,19.11,14.9,14.9,0,0,0,8.59-2.72,2.54,2.54,0,0,0,2.54,2.55h3.82V32.53a14.75,14.75,0,0,0-.61-4.22ZM168.13,41.13a8.6,8.6,0,1,1,8.59-8.6,8.61,8.61,0,0,1-8.59,8.6" />
      </g>
    </svg>
  );
}
