/** Simulated network latency for the mock API — keeps loading states real without
 * a real network. Kept short by default so the dev loop stays fast. */
export function simulateLatency(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
