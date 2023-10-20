import moment from 'moment';
import {
  Activity,
  formatAddressAndNS,
  format as sdkFormat,
  type Theme,
} from '@rss3/js-sdk';

import { themePlain } from '@rss3/js-sdk/lib/readable/activity/theme';
import { CronActivity } from './state';

export const getSocialActivitiesUrl = (address: string) =>
  `https://testnet.rss3.io/data/accounts/${address}/activities?tag=social&direction=out`;

/**
 * Get social count by rss3.
 *
 * @param address - The wallet address.
 * @returns The social count.
 */
export async function getSocialActivities(address: string) {
  const resp = await fetch(getSocialActivitiesUrl(address));
  const { data } = (await resp.json()) as { data: Activity[] };
  const activities = data.map((item: Activity) => {
    return {
      id: item.id,
      text: format(item).join(''),
    };
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
