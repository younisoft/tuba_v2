import { Link } from 'react-router-dom';
import type { SearchResult } from '@/lib/search/types';

const CATEGORY_LABELS: Record<SearchResult['category'], string> = {
  screen: 'Screens',
  property: 'Properties',
  lead: 'Leads',
  customer: 'Customers',
  owner: 'Owners',
  contract: 'Contracts',
  campaign: 'Campaigns',
};

/**
 * TBOS-PAT-SEARCH-001 — a labeled group of results for a full-page search
 * surface (GS-01). CommandPalette (Foundation phase) renders screens/entities
 * inline without category headings, appropriate for its compact popover; this
 * pattern is the not-yet-built GS-01 full-page results screen's building block.
 */
export function SearchResultGroup({ category, results }: { category: SearchResult['category']; results: SearchResult[] }) {
  if (results.length === 0) return null;
  return (
    <div>
      <h2 className="mb-1.5 text-label text-text-muted">{CATEGORY_LABELS[category]}</h2>
      <ul>
        {results.map((r) => (
          <li key={r.id}>
            <Link to={r.path} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-body text-text-primary hover:bg-bg-sunken">
              <span>{r.title}</span>
              {r.subtitle && <span className="text-caption text-text-muted">{r.subtitle}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
