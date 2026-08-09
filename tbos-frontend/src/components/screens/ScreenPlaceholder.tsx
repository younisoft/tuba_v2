import { useParams } from 'react-router-dom';
import type { ScreenDefinition } from '@/types/screens';
import { MODULE_MAP } from '@/registry/modules/moduleRegistry';
import { Badge } from '@/components/ui/Badge';

/**
 * The generic dev-scaffold every routed screen renders in this phase (master
 * prompt §8: "a development scaffold, not final UI"). Traces back to its
 * registry entry so the placeholder never drifts from tbos-blueprint/04_SCREEN_INVENTORY.md.
 */
export function ScreenPlaceholder({ screen }: { screen: ScreenDefinition }) {
  const params = useParams();
  const module = MODULE_MAP[screen.moduleId];
  const hasParams = Object.keys(params).length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="brand">{screen.id}</Badge>
        <Badge tone="neutral">{module?.name ?? screen.moduleId}</Badge>
        {screen.permission && <Badge tone="info">{screen.permission}</Badge>}
        <Badge tone={screen.status === 'ready' ? 'success' : 'warning'}>{screen.status}</Badge>
      </div>
      <h1 className="mb-2 text-h1 text-text-primary">{screen.name}</h1>
      <p className="text-body-lg text-text-secondary">{screen.purpose}</p>

      {hasParams && (
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-border bg-bg-sunken p-4 text-body">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="text-text-muted">{key}</dt>
              <dd className="text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="mt-8 rounded-md border border-dashed border-border p-4 text-caption text-text-muted">
        This is a foundation-phase scaffold. Screen content, data, and interactions are business-feature work for a later implementation
        phase — see tbos-frontend/ARCHITECTURE.md.
      </p>
    </div>
  );
}
