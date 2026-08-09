import type { SVGProps } from 'react';

/**
 * A small, hand-authored icon set — avoids pulling in an icon library for a
 * foundation phase with no real screen content yet (master prompt §4's "no
 * unnecessary framework" instruction, extended here to icon deps). Every icon is
 * a 24×24 stroke-based glyph so `icon.default`/`icon.muted` tokens (currentColor)
 * apply uniformly. Non-directional icons (home, building, document…) never mirror
 * in RTL; directional ones (chevrons) are flipped by IconButton/consumers, per
 * design-system/15_INTERNATIONALIZATION.md §2.
 */
const PATHS: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9',
  zap: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  'check-square': 'M9 12l2 2 4-4M4 5h16v14H4z',
  building: 'M4 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M4 21h16M9 8h2M9 12h2M9 16h2M14 21v-6h4v6',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  'user-check': 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-1 2 2 4-4',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h8M8 9h2',
  megaphone: 'M3 11v2a2 2 0 0 0 2 2h1l2 6h2l-1-6h6l5 4V5l-5 4H8a2 2 0 0 0-2 2H5a2 2 0 0 0-2 2Z',
  banknote: 'M2 6h20v12H2zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 9v.01M18 15v-.01',
  wallet: 'M21 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm0 0V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v1M16 13h2',
  'bar-chart': 'M4 20V10M12 20V4M20 20v-7',
  'clipboard-list':
    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M8 11h8M8 15h5',
  workflow: 'M5 4h5v5H5zM14 15h5v5h-5zM7.5 9v3a3 3 0 0 0 3 3H14M17 9V4h-3',
  sparkles: 'm12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  'book-open': 'M2 5a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2Zm20 0a2 2 0 0 0-2-2h-5a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8Z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3-1.8-.5a6.9 6.9 0 0 0-.6-1.5l1-1.6-1.7-1.7-1.6 1a6.9 6.9 0 0 0-1.5-.6L13.3 4h-2.6l-.5 1.8a6.9 6.9 0 0 0-1.5.6l-1.6-1L5.4 7.1l1 1.6a6.9 6.9 0 0 0-.6 1.5L4 11v2.6l1.8.5c.15.53.35 1.03.6 1.5l-1 1.6 1.7 1.7 1.6-1a6.9 6.9 0 0 0 1.5.6l.5 1.8h2.6l.5-1.8a6.9 6.9 0 0 0 1.5-.6l1.6 1 1.7-1.7-1-1.6a6.9 6.9 0 0 0 .6-1.5L20 13.6Z',
  shield: 'M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5Z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
  command: 'M9 3a3 3 0 0 0-3 3v12a3 3 0 1 0 3-3h6a3 3 0 1 0-3 3V6a3 3 0 1 0 3 3H9a3 3 0 1 0-3-3',
  plus: 'M12 5v14M5 12h14',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-right': 'm9 6 6 6-6 6',
  x: 'M18 6 6 18M6 6l12 12',
  sun: 'M12 3v2m0 14v2M5.6 5.6l1.4 1.4m9.9 9.9 1.4 1.4M3 12h2m14 0h2M5.6 18.4l1.4-1.4m9.9-9.9 1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  moon: 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  'more-horizontal': 'M5 12h.01M12 12h.01M19 12h.01',
  check: 'm5 12 5 5 9-9',
  'alert-triangle': 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7v.01',
  'log-out': 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  circle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 3',
  upload: 'M12 16V4m0 0L7 9m5-5 5 5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  filter: 'M4 5h16l-6 8v5l-4 2v-7L4 5Z',
  'arrow-up': 'M12 19V5m0 0-6 6m6-6 6 6',
  'arrow-down': 'M12 5v14m0 0 6-6m-6 6-6-6',
  'chevrons-up-down': 'm7 15 5 5 5-5M7 9l5-5 5 5',
  'trending-up': 'M3 17 9 11l4 4 8-8M15 7h6v6',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className, ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
