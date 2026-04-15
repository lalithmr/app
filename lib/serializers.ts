export function serializeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => serializeValue(entry)) as T;
  }

  if (value && typeof value === "object") {
    const maybeTimestamp = value as { toDate?: () => Date };

    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate().toISOString() as T;
    }

    return Object.entries(value).reduce<Record<string, unknown>>((accumulator, [key, entry]) => {
      accumulator[key] = serializeValue(entry);
      return accumulator;
    }, {}) as T;
  }

  return value;
}
