import moment from 'moment';
import {
  type Activity,
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

/**
 * Get social count by rss3.
 *
 * @param addresses - The wallet address array.
 * @param sinceTimestamp - The timestamp.
 * @returns The social count array.
 */
export async function getMultiple(
  addresses: (string | undefined)[],
  sinceTimestamp?: string,
) {
  const activities: CronActivity[] = [];
  let hasNextPage = true;
  let cursor: string | undefined;

  const filtedAddresses = addresses.filter(
    (addr) => addr !== undefined,
  ) as string[];

  if (filtedAddresses.length === 0) {
    return [];
  }

  const executeAddresses = filtedAddresses;

  // 1 day ago
  const timestamp =
    sinceTimestamp === undefined
      ? moment().subtract(1, 'day').unix()
      : moment(sinceTimestamp).subtract(1, 'day').unix();

  while (hasNextPage) {
    const params = {
      action_limit: 10,
      limit: 500,
      account: executeAddresses,
      tag: ['social'],
      type: ['post', 'comment'],
      direction: 'out',
      since_timestamp: timestamp,
      cursor,
    };
    const resp = await fetch(
      'https://testnet.rss3.io/data/accounts/activities',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify(params),
      },
    );
    const { data, meta } = (await resp.json()) as {
      data: Activity[];
      meta: null | { cursor: string };
    };

    data.map((item) =>
      activities.push({
        id: item.id,
        text: format(item).join(''),
        owner: item.owner,
      }),
    );

    if (meta === null) {
      hasNextPage = false;
    } else {
      cursor = meta.cursor;
    }
  }

  return executeAddresses.map((addr) => {
    const groupBy = activities.filter(
      (activity) =>
        activity.owner?.toLocaleLowerCase() === addr?.toLocaleLowerCase(),
    );
    if (groupBy) {
      return {
        owner: addr,
        activities: groupBy,
        oldActivities: [],
      };
    }
    return {
      owner: addr,
      activities: [],
      oldActivities: [],
    };
  });
}
