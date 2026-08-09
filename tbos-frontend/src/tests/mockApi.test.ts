import { describe, expect, it } from 'vitest';
import { apiClient } from '@/lib/api/client';
import { notificationsApi } from '@/lib/api/endpoints/notifications';
import { walletApi } from '@/lib/api/endpoints/wallet';

describe('mock API layer', () => {
  it('resolves a success envelope for a found record', async () => {
    const res = await apiClient.request(() => ({ ok: true }), { latencyMs: 0 });
    expect(res.status).toBe('success');
  });

  it('resolves a not_found error envelope for a missing record', async () => {
    const res = await apiClient.request(() => null, { latencyMs: 0 });
    expect(res.status).toBe('error');
    if (res.status === 'error') expect(res.error.code).toBe('not_found');
  });

  it('never leaks a raw error message — simulateError maps to plain language', async () => {
    const res = await apiClient.request(() => ({}), { latencyMs: 0, simulateError: 'server_error' });
    expect(res.status).toBe('error');
    if (res.status === 'error') {
      expect(res.error.message).not.toMatch(/stack|Error:|at Object/);
      expect(res.error.recoveryAction).toBe('retry');
    }
  });

  it('returns only the recipient’s own notifications, never another agency’s', async () => {
    const res = await notificationsApi.list('tm-reem', { latencyMs: 0 });
    expect(res.status).toBe('success');
    if (res.status === 'success') {
      expect(res.data.every((n) => n.recipientId === 'tm-reem')).toBe(true);
    }
  });

  it('markRead flips read state and is reflected in a follow-up unreadCount call', async () => {
    const before = await notificationsApi.unreadCount('tm-khalid', { latencyMs: 0 });
    expect(before.status).toBe('success');

    const list = await notificationsApi.list('tm-khalid', { latencyMs: 0 });
    if (list.status !== 'success' || list.data.length === 0) throw new Error('fixture missing tm-khalid notifications');
    await notificationsApi.markRead(list.data[0]!.id, true, { latencyMs: 0 });

    const after = await notificationsApi.unreadCount('tm-khalid', { latencyMs: 0 });
    if (before.status === 'success' && after.status === 'success') {
      expect(after.data).toBe(before.data - 1);
    }
  });

  it('finds the wallet for a real agency and 404s for an unknown one', async () => {
    const found = await walletApi.get('agency-1', { latencyMs: 0 });
    expect(found.status).toBe('success');

    const missing = await walletApi.get('agency-does-not-exist', { latencyMs: 0 });
    expect(missing.status).toBe('error');
  });
});
