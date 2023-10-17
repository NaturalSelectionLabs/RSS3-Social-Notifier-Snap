import moment from 'moment';
import {
  Activity,
  formatAddressAndNS,
  format as sdkFormat,
} from '@rss3/js-sdk';
import {
  type Theme,
  themePlain,
} from '@rss3/js-sdk/lib/readable/activity/theme';

/**
 * Get social count by rss3.
 *
 * @param address - The wallet address.
 * @returns The social count.
 */
export async function getSocialActivities(address: string) {
  const resp = await fetch(
    `https://testnet.rss3.io/data/accounts/${address}/activities?tag=social&direction=out`,
  );
  const { data } = (await resp.json()) as { data: Activity[] };
  const activities = data.map((item: Activity) => format(item).join(''));

  return {
    address,
    activities,
    total: activities.length,
  };
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
