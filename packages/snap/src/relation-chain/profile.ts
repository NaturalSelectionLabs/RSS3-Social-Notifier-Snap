import type { Profile } from '@rss3/js-sdk';
import { isSupportedNS, isValidWalletAddress } from './utils';
import { Platform } from '.';

export const profileApi = (search: string) =>
  `https://testnet.rss3.io/data/accounts/${search}/profiles`;

/**
 * Get profiles by search key.
 *
 * @param key - The search key.
 */
export async function getProfilesBySearch(key: string) {
  if (isValidWalletAddress(key) || isSupportedNS(key)) {
    const resp = await fetch(profileApi(key));
    const { data } = (await resp.json()) as { data: Profile[] };
    // filter profile by Platform
    return data.filter((item) => item.platform in Platform);
  }
  return [];
}
