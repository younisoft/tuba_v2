/**
 * Standardized data-state taxonomy — tbos-blueprint/06_STATE_ARCHITECTURE.md §1.
 * Every screen/widget that fetches data reports one of these instead of inventing
 * its own idle/loading/error vocabulary.
 */
export type DataState = 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'refreshing' | 'mutating';

export type UniversalScreenState =
  'empty' | 'loading' | 'offline' | 'no-permission' | 'error' | 'restricted' | 'archived' | 'deleted' | 'success';
