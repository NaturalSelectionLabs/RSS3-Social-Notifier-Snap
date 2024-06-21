import { isSupportedNS } from '@rss3/api-utils';

import { isValidWalletAddress } from './utils';
import { Platform } from '.';

// TODO: share this type with the `site` package
export type Profile = {
  action?: 'create' | 'renew' | 'unwrap' | 'update' | 'wrap';
  address?: string;
  bannerURI?: string[];
  bio?: string;
  expireAt?: string | null;
  expiry?: string | null;
  handle?: string;
  image_uri?: string;
  key?: string;
  name?: string;
  network: string;
  platform: string;
  profileURI?: string[];
  profile_id?: string;
  socialURI?: string[];
  url?: string;
  value?: string;
};

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
