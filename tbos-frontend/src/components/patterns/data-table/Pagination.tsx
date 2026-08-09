import { Button } from '@/components/ui/Button';
import type { Pagination as PaginationData } from '@/types/api';

export interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

/** TBOS-PAT-DATA-002 — paired with DataTable, consumes the same
 * `Pagination` shape lib/api already returns (types/api.ts), so a real
 * backend's paginated response needs no adapter to feed this component. */
export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = pagination;
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between px-1 py-2 text-caption text-text-secondary">
      <span>
        Page {page} of {totalPages} — {total} total
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}
