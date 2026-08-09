import { apiClient, type RequestOptions } from '@/lib/api/client';
import { findWalletByAgency } from '@/mocks/api/db';
import type { WalletSummary } from '@/types/entities';

export const walletApi = {
  get: (agencyId: string, options?: RequestOptions) => apiClient.request<WalletSummary>(() => findWalletByAgency(agencyId), options),
};
