import moment from 'moment';
import { type Activity, getActivities } from '@rss3/api-core';
import {
  formatAddressAndNS,
  format as sdkFormat,
  formatContent,
  themePlain,
  type Theme,
} from '@rss3/api-utils';

import { CronActivity, SocialMonitor } from './state';

export const getSocialActivitiesUrl = (address: string) =>
  `https://testnet.rss3.io/data/accounts/${address}/activities?tag=social&direction=out`;

/**
 * Get social activities by rss3.
 *
 * @param address - The wallet address.
 * @returns The social activities.
 */
export async function getSocialActivities(address: string) {
  const { data } = await getActivities({
    account: address,
    tag: ['social'],
    direction: 'out',
  });
  const activities = data.map((item): CronActivity => {
    // formatContent only for social and governance tag.
    const content = formatContent(item);

    const { id } = item;
    const text = format(item).join('');
    const image = content?.media?.[0]?.address;
    return content ? { id, text, image } : { id, text };
  });

  return {
    address,
    activities,
    total: activities.length,
  };
}

/**
 * Returns the difference between the cached social activities and the fetched social activities.
 *
 * @param cacheActivities - The cached social activities.
 * @param fetchActivities - The fetched social activities.
 * @returns The difference between the cached social activities and the fetched social activities.
 */
export function diff(
  cacheActivities: CronActivity[],
  fetchActivities: CronActivity[],
): CronActivity[] {
  const diffActivities: CronActivity[] = [];

  if (cacheActivities.length > fetchActivities.length) {
    return diffActivities;
  }

  fetchActivities.forEach((activity) => {
    if (
      !cacheActivities.some((cacheActivity) => cacheActivity.id === activity.id)
    ) {
      diffActivities.push(activity);
    }
  });
  return diffActivities;
}

/**
 * Format activity.
 *
 * @param activity - Activity object.
 * @returns The formatted activity.
 */
export function format(activity: Activity) {
  const theme: Theme<string> = {
    ...themePlain,
    address: (c) => formatAddressAndNS(c),
    time: (c) => moment(c).format('ll'),
  };
  return sdkFormat(activity, theme);
}

/**
 * Get social count by rss3.
 *
 * @param addresses - The wallet address array.
 * @returns The social count array.
 */
export async function getMultiple(addresses: string[]) {
  const filteredAddresses = addresses.filter(
    (addr) => addr !== undefined,
  ) as string[];

  if (filteredAddresses.length === 0) {
    return [];
  }

  // 1 hour ago
  const timestamp = moment().subtract(1, 'hour').unix();

  const activities = (
    await Promise.all(
      filteredAddresses.map(async (account) => {
        let cursor: string | undefined;
        const result: CronActivity[] = [];

        do {
          const res = await getActivities({
            account,
            actionLimit: 10,
            limit: 500,
            tag: ['social'],
            type: ['post', 'comment'],
            direction: 'out',
            sinceTimestamp: timestamp,
            cursor,
          });

          res.data.forEach((item) => {
            const content = formatContent(item);
            const { id, owner } = item;
            const text = format(item).join('');
            const image = content?.media?.[0]?.address;

            if (content) {
              result.push({ id, text, image, owner });
            } else {
              result.push({ id, text, owner });
            }
          });

          cursor = res.cursor;
        } while (cursor);

        return result;
      }),
    )
  ).flat();

  return filteredAddresses.map((addr) => {
    const groupBy = activities.filter(
      (activity) =>
        activity.owner?.toLocaleLowerCase() === addr?.toLocaleLowerCase(),
    );
    if (groupBy) {
      return {
        owner: addr,
        activities: groupBy,
      };
    }
    return {
      owner: addr,
      activities: [],
    };
  });
}

/**
 * Social monitor.
 *
 * @param olderMonitor - The old monitor.
 * @param newer - The newer cron activities.
 * @param ownerHandle - The owner handle.
 * @param handle - The handle.
 * @returns The difference between the cached social activities and the fetched social activities.
 */
export function diffMonitor(
  olderMonitor: SocialMonitor,
  newer: CronActivity[],
  ownerHandle: string,
  handle: string,
) {
  let lastActivities: CronActivity[] = newer;

  const cachedProfiles = olderMonitor.watchedProfiles?.find(
    (wProfile) =>
      wProfile.owner.handle.toLocaleLowerCase() ===
      ownerHandle.toLocaleLowerCase(),
  );
  if (cachedProfiles) {
    const cachedProfilesFollowingProfiles = cachedProfiles.following;
    if (cachedProfilesFollowingProfiles) {
      const cachedProfilesFollowingProfile =
        cachedProfilesFollowingProfiles.find(
          (cProfile) =>
            cProfile.handle.toLocaleLowerCase() === handle.toLocaleLowerCase(),
        );
      if (cachedProfilesFollowingProfile) {
        const cachedProfilesFollowingProfilesActivities =
          cachedProfilesFollowingProfile.activities;

        if (cachedProfilesFollowingProfilesActivities !== undefined) {
          lastActivities = newer
            .map((activity) => {
              if (
                !cachedProfilesFollowingProfilesActivities.some(
                  (cacheActivity) => cacheActivity.id === activity.id,
                )
              ) {
                return activity;
              }
              return null;
            })
            .filter((item) => item !== null) as CronActivity[];
        }
      }
    }
  }
  return lastActivities;
}
