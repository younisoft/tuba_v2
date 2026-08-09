/**
 * The five-meaning status system every lifecycle in TBOS maps onto —
 * design-system/03_COLOR_SYSTEM.md §3. A module's state names (Property's
 * 8-state lifecycle, Lead's 7-stage pipeline, Contract's 6-state lifecycle,
 * Marketing Request's 4-state, Wallet's 5-state) never invent a new color;
 * they each map their own state list onto these five meanings.
 */
export type StatusMeaning = 'neutral' | 'info' | 'warning' | 'success' | 'danger';
