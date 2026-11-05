/** Ignore Google's example slot rather than sending requests that will be rejected. */
export function resolveAdSenseSlot(slot?: string, defaultSlot?: string): string {
  return [slot, defaultSlot]
    .map((value) => value?.trim() || '')
    .find((value) => /^\d+$/.test(value) && value !== '1234567890') || '';
}

export function resolveAdSenseFormat<T extends string>(format: T, layoutKey?: string): T | 'auto' {
  return format === 'fluid' && !layoutKey?.trim() ? 'auto' : format;
}
// Public IDs from Otakuz's general responsive Display ad unit.
export const ADSENSE_CLIENT_ID = 'ca-pub-8820415871877478';
export const ADSENSE_GENERAL_SLOT = '1252363648';

