import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { ComplianceStatus, type ComplianceState } from './ComplianceStatus';

export interface ComplianceDocumentProps {
  fileName: string;
  status: ComplianceState;
  action?: ReactNode;
}

/** TBOS-CMP-COMPLIANCE-004 — a single uploaded document row (SET-04, CONT-02). */
export function ComplianceDocument({ fileName, status, action }: ComplianceDocumentProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      <Icon name="file-text" className="h-5 w-5 shrink-0 text-icon-muted" />
      <span className="flex-1 truncate text-body text-text-primary">{fileName}</span>
      <ComplianceStatus state={status} />
      {action}
    </div>
  );
}
