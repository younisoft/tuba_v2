import { describe, expect, it } from 'vitest';
import { COMPONENT_REGISTRY } from '@/registry/components/componentRegistry';
import { validateComponentRegistry } from '@/registry/components/validateComponentRegistry';
import { componentStatusForScreen, SCREEN_COMPONENT_MAP } from '@/registry/components/screenComponentMap';
import { SCREEN_MAP } from '@/registry/screens/screenRegistry';

describe('component registry', () => {
  it('has no duplicate IDs, names, or invalid screen references', () => {
    const result = validateComponentRegistry();
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('every componentId follows the TBOS-{CMP|PAT|SHL}-{CATEGORY}-{NNN} format', () => {
    for (const c of COMPONENT_REGISTRY) {
      expect(c.componentId).toMatch(/^TBOS-(CMP|PAT|SHL)-[A-Z]+-\d{3}$/);
    }
  });

  it('covers all four levels named in the master prompt taxonomy', () => {
    const levels = new Set(COMPONENT_REGISTRY.map((c) => c.level));
    expect(levels).toEqual(new Set(['primitive', 'tbos', 'pattern', 'shell']));
  });

  it('every source document reference is a non-empty traceable string', () => {
    for (const c of COMPONENT_REGISTRY) {
      expect(c.sourceDocuments.length).toBeGreaterThan(0);
      for (const doc of c.sourceDocuments) expect(doc.length).toBeGreaterThan(0);
    }
  });
});

describe('screen -> component traceability matrix', () => {
  it('every screen key in the map exists in the screen registry', () => {
    for (const screenId of Object.keys(SCREEN_COMPONENT_MAP)) {
      expect(SCREEN_MAP[screenId], `${screenId} not found in SCREEN_MAP`).toBeDefined();
    }
  });

  it('resolves LEAD-01 to a real, implemented Kanban Board', () => {
    const statuses = componentStatusForScreen('LEAD-01');
    const kanban = statuses.find((s) => s.blueprintName === 'Kanban Board');
    expect(kanban?.implemented).toBe(true);
    expect(kanban?.resolvedComponentNames).toContain('KanbanBoard');
  });

  it('honestly reports a not-yet-built component (File/Media Uploader) as unimplemented', () => {
    const statuses = componentStatusForScreen('PROP-03');
    const uploader = statuses.find((s) => s.blueprintName === 'File/Media Uploader');
    expect(uploader?.implemented).toBe(false);
  });
});
