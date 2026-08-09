import { ScreenPlaceholder } from '@/components/screens/ScreenPlaceholder';
import { SCREEN_MAP } from '@/registry/screens/screenRegistry';
import { useAi } from '@/lib/ai/AiProvider';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Badge } from '@/components/ui/Badge';

/** AICP-02 — the audit trail every AI action platform-wide writes into (mock
 * adapter proof only; see AiCopilotScreen.tsx for the request-side demo). */
export function AiAuditLogScreen() {
  const { auditLog } = useAi();

  return (
    <div className="space-y-8">
      <ScreenPlaceholder screen={SCREEN_MAP['AICP-02']} />

      <div className="mx-auto max-w-2xl">
        {auditLog.length === 0 ? (
          <EmptyState title="No AI actions yet" body="Ask the Copilot something on AICP-01 to see an entry appear here." />
        ) : (
          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="border-b border-border text-start text-label text-text-muted">
                <th scope="col" className="py-2 text-start">
                  Kind
                </th>
                <th scope="col" className="py-2 text-start">
                  Response
                </th>
                <th scope="col" className="py-2 text-start">
                  Confidence
                </th>
                <th scope="col" className="py-2 text-start">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((entry) => (
                <tr key={entry.id} className="border-b border-border">
                  <td className="py-2 text-text-primary">{entry.kind}</td>
                  <td className="max-w-xs truncate py-2 text-text-secondary">{entry.response}</td>
                  <td className="py-2">
                    <Badge tone={entry.confidence === 'high' ? 'success' : entry.confidence === 'low' ? 'danger' : 'warning'}>
                      {entry.confidence}
                    </Badge>
                  </td>
                  <td className="py-2 text-text-secondary">{entry.reviewStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
