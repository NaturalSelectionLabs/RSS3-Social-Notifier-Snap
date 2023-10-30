import type { Profile } from '@rss3/js-sdk';
import { isSupportedNS, isValidWalletAddress } from './utils';
import {
  executeCrossbell,
  executeFarcaster,
  executeLens,
  Platform,
  TProfile,
} from '.';

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

/**
 * Get All Following by search key and platforms.
 *
 * @param key - Wallet address or supported namespace.
 * @param platforms - The platforms to get following.
 */
export async function getAllFollowing(key: string, platforms: string[]) {
  const executeArray = [
    { platforms: Platform.Lens, handler: executeLens },
    {
      platforms: Platform.Crossbell,
      handler: executeCrossbell,
    },
    {
      platforms: Platform.Farcaster,
      handler: executeFarcaster,
    },
  ];

  const following: TProfile[] = [];

  executeArray.forEach(async (item) => {
    if (platforms.includes(item.platforms)) {
      const resp = await item.handler(key);
      if (resp) {
        following.push(...resp);
      }
    }
  });

  return following;
}
