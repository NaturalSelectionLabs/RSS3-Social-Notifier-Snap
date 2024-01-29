import { Platform, State } from '../state';

/**
 * Check if the platform is enabled.
 *
 * @param item - The item to check.
 * @param state - The platforms state.
 * @returns True if the platform is enabled.
 */
export function isPlatformEnabled<T extends { platform?: string | null }>(
  item: T,
  state: Pick<State, 'platforms'>,
): boolean {
  const platform = state.platforms?.[item.platform as Platform];

  return platform?.enabled ?? true;
}

/**
 * Filter items by platforms.
 *
 * @param items - The items to filter.
 * @param state - The platforms state.
 * @returns The filtered items.
 */
export function filterByPlatforms<T extends { platform?: string | null }>(
  items: T[],
  state: Pick<State, 'platforms'>,
): T[] {
  return items.filter((item) => isPlatformEnabled(item, state));
}
