import { describe, expect, it } from 'vitest';
import { search } from '@/lib/search/searchIndex';
import { hasPermission } from '@/lib/permissions/evaluate';

/**
 * tbos-blueprint/17_ACCEPTANCE_CRITERIA.md GS-01: "Search never leaks
 * out-of-scope records... a Property Consultant searches for a keyword that
 * matches another consultant's private lead... that lead does not appear."
 * Regression test for TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md's search-scope
 * finding — searchIndex.ts previously checked agency membership only, not
 * the 'own' scope tier, for both Leads and Properties.
 */
describe('Global Search — GS-01 record-level scoping', () => {
  it('never surfaces a lead belonging to a teammate for a PC scoped to "own"', () => {
    // tm-reem is PC, agency-1, owns l-1/l-2/l-5 (customer c-1/c-2). l-4 (Bandar
    // Al-Otaibi, customer c-5) belongs to tm-faisal, same agency.
    const results = search('Bandar', {
      agencyId: 'agency-1',
      userId: 'tm-reem',
      role: 'PC',
      can: (p) => hasPermission('PC', p),
    });
    expect(results.some((r) => r.category === 'lead')).toBe(false);
  });

  it('does surface that same lead for the teammate who owns it', () => {
    const results = search('Bandar', {
      agencyId: 'agency-1',
      userId: 'tm-faisal',
      role: 'SM',
      can: (p) => hasPermission('SM', p),
    });
    expect(results.some((r) => r.category === 'lead')).toBe(true);
  });

  it('a Sales Manager (team-wide scope) can find a PC teammate’s lead', () => {
    const results = search('Ahmed', {
      agencyId: 'agency-1',
      userId: 'tm-faisal',
      role: 'SM',
      can: (p) => hasPermission('SM', p),
    });
    expect(results.some((r) => r.category === 'lead')).toBe(true);
  });

  it('never surfaces another agency’s records regardless of role', () => {
    const results = search('Omar Realty', {
      agencyId: 'agency-1',
      userId: 'tm-reem',
      role: 'PC',
      can: (p) => hasPermission('PC', p),
    });
    expect(results.length).toBe(0);
  });

  /**
   * TBOS_RELATIONSHIP_UX_AUDIT.md P0-1: Customer/Owner search had never had
   * the GS-01 'own'-scope fix applied at all (agency-membership check only) —
   * a real PII leak (name + phone), not yet shipped since Customers/Owners
   * weren't routed screens until Phase 7.
   */
  it('never surfaces a customer belonging to a teammate’s lead for a PC scoped to "own"', () => {
    // tm-reem is PC, agency-1, owns leads for customers c-1/c-2/c-1-p. c-3
    // (Saad Al-Qahtani) is linked only to l-3, assigned to tm-sara.
    const results = search('Saad', {
      agencyId: 'agency-1',
      userId: 'tm-reem',
      role: 'PC',
      can: (p) => hasPermission('PC', p),
    });
    expect(results.some((r) => r.category === 'customer')).toBe(false);
  });

  it('does surface a customer the PC is actually assigned to via a real lead', () => {
    const results = search('Ahmed', {
      agencyId: 'agency-1',
      userId: 'tm-reem',
      role: 'PC',
      can: (p) => hasPermission('PC', p),
    });
    expect(results.some((r) => r.category === 'customer')).toBe(true);
  });

  it('never surfaces an owner belonging to another agency, even for an agency-wide role', () => {
    const results = search('Huda', {
      agencyId: 'agency-1',
      userId: 'tm-sara',
      role: 'AO',
      can: (p) => hasPermission('AO', p),
    });
    expect(results.some((r) => r.category === 'owner')).toBe(false);
  });

  /**
   * TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md — Contracts search is scope-safe
   * from day one via contractsForUser(), but this regression test guards
   * against it regressing to the same class of bug fixed for Leads/
   * Customers/Owners above (agency-membership-only checks that leak an
   * 'own'-scoped teammate's record, or another agency's record entirely).
   */
  it('never surfaces a contract reachable only through a teammate’s lead for a PC scoped to "own"', () => {
    // tm-reem is PC, agency-1, owns leads for ct-2/ct-6. ct-1 (Saad Al-Qahtani,
    // customer c-3) is reachable only via l-3, assigned to tm-sara.
    const results = search('Saad', {
      agencyId: 'agency-1',
      userId: 'tm-reem',
      role: 'PC',
      can: (p) => hasPermission('PC', p),
    });
    expect(results.some((r) => r.category === 'contract')).toBe(false);
  });

  it('never surfaces a contract belonging to another agency, even for an agency-wide role', () => {
    // ct-3 (Sultan Al-Dosari, customer c-6) belongs to agency-2.
    const results = search('Sultan', {
      agencyId: 'agency-1',
      userId: 'tm-sara',
      role: 'AO',
      can: (p) => hasPermission('AO', p),
    });
    expect(results.some((r) => r.category === 'contract')).toBe(false);
  });

  /**
   * TBOS_MARKETING_UX_AUDIT.md — Campaigns search is scope-safe from day one
   * via campaignsForUser() (built directly applying the Phase 7 P0-1 lesson
   * proactively), but this regression test guards against it regressing.
   */
  it('never surfaces a campaign belonging to another agency, even for an agency-wide role', () => {
    // camp-2 ("Al Rawdah Townhouse Launch") belongs to agency-2.
    const results = search('Rawdah', {
      agencyId: 'agency-1',
      userId: 'tm-sara',
      role: 'AO',
      can: (p) => hasPermission('AO', p),
    });
    expect(results.some((r) => r.category === 'campaign')).toBe(false);
  });

  it('does surface a campaign the viewer’s own agency actually owns', () => {
    const results = search('Nakheel Villas', {
      agencyId: 'agency-1',
      userId: 'tm-sara',
      role: 'AO',
      can: (p) => hasPermission('AO', p),
    });
    expect(results.some((r) => r.category === 'campaign')).toBe(true);
  });

  it('never surfaces campaigns to a role with no marketing.view grant', () => {
    const results = search('Nakheel Villas', {
      agencyId: 'agency-1',
      userId: 'tm-khalid',
      role: 'OM',
      can: (p) => hasPermission('OM', p),
    });
    expect(results.some((r) => r.category === 'campaign')).toBe(false);
  });
});
