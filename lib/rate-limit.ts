type CounterEntry = {
  count: number;
  resetAt: number;
};

const counterStore = new Map<string, CounterEntry>();
const cooldownStore = new Map<string, number>();

export async function enforceCooldown(key: string, minimumIntervalMs = 2500) {
  const now = Date.now();
  const lastSeen = cooldownStore.get(key) ?? 0;
  const waitMs = minimumIntervalMs - (now - lastSeen);

  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  cooldownStore.set(key, Date.now());
}

export function checkRateLimit(
  key: string,
  maxRequests = 6,
  windowMs = 60_000
) {
  const now = Date.now();
  const entry = counterStore.get(key);

  if (!entry || entry.resetAt <= now) {
    const nextEntry = {
      count: 1,
      resetAt: now + windowMs
    };
    counterStore.set(key, nextEntry);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: nextEntry.resetAt
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  entry.count += 1;
  counterStore.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt
  };
}
