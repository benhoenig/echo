import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Function extracted from listings-data-table.tsx and listing-detail-content.tsx
function calculateDaysOnMarket(
  status: string,
  daysOnMarket: number | null,
  statusChangedAt: string | null
): number | null {
  if (daysOnMarket != null) {
    if (status === "ACTIVE" && statusChangedAt) {
      const changedAt = new Date(statusChangedAt);
      const now = new Date();
      // Calculate diff in days
      return Math.floor((now.getTime() - changedAt.getTime()) / (1000 * 60 * 60 * 24));
    }
    return daysOnMarket;
  }
  return null;
}

describe('calculateDaysOnMarket', () => {
  beforeEach(() => {
    // Mock system time to a fixed date for reliable testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns stored daysOnMarket if status is not ACTIVE', () => {
    expect(calculateDaysOnMarket('SOLD', 45, '2026-01-01T12:00:00Z')).toBe(45);
    expect(calculateDaysOnMarket('INACTIVE', 10, '2026-01-01T12:00:00Z')).toBe(10);
    expect(calculateDaysOnMarket('RENTED', 0, '2026-01-01T12:00:00Z')).toBe(0);
  });

  it('calculates live days on market for ACTIVE listings based on statusChangedAt', () => {
    // Exactly 10 days ago
    const tenDaysAgo = new Date('2026-02-16T12:00:00Z').toISOString();
    expect(calculateDaysOnMarket('ACTIVE', 5, tenDaysAgo)).toBe(10);
  });

  it('rounds down to the nearest whole day for ACTIVE listings', () => {
    // 10 days and 12 hours ago
    const tenAndHalfDaysAgo = new Date('2026-02-16T00:00:00Z').toISOString();
    expect(calculateDaysOnMarket('ACTIVE', 5, tenAndHalfDaysAgo)).toBe(10);
    
    // 9 days and 23 hours ago
    const almostTenDaysAgo = new Date('2026-02-16T13:00:00Z').toISOString();
    expect(calculateDaysOnMarket('ACTIVE', 5, almostTenDaysAgo)).toBe(9);
  });

  it('returns null if daysOnMarket is null', () => {
    expect(calculateDaysOnMarket('ACTIVE', null, '2026-01-01T12:00:00Z')).toBeNull();
    expect(calculateDaysOnMarket('SOLD', null, null)).toBeNull();
  });

  it('handles ACTIVE listing missing statusChangedAt gracefully by returning stored DOM', () => {
    expect(calculateDaysOnMarket('ACTIVE', 10, null)).toBe(10);
  });
});
