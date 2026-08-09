export type SearchCategory = 'screen' | 'property' | 'lead' | 'customer' | 'owner' | 'contract' | 'campaign';

export interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle?: string;
  path: string;
  /** Non-literal match explanation — Explainability applied to search
   * (tbos-blueprint/04_SCREEN_INVENTORY.md GS-01 Success state). Empty for a
   * literal title match. */
  matchReason?: string;
}

export interface CommandDefinition {
  id: string;
  label: string;
  /** Permission required for the command to even appear — commands never render
   * disabled, per tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §8. */
  permission: string | null;
  run: () => void;
}
