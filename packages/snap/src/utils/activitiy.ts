import {
  divider,
  heading,
  text,
  image,
  panel,
  type Component,
} from '@metamask/snaps-ui';
import moment from 'moment';
import { CronActivity, getState, setState } from '../state';
import {
  CrossbellHandler,
  FarcasterHandler,
  LensHandler,
  Platform,
  Profile,
} from '../social-graph';
import { TSocialGraphResult } from '..';
import { downloadAndCovertImage, wrapBase64ToSvg } from './image';

/**
 * Build alert content.
 *
 * @param lastActivities - Following latest social activities.
 * @param owner - Owner name.
 * @returns Panel content array.
 */
export async function buildAlertContent(
  lastActivities: CronActivity[],
  owner: string,
) {
  const content: Component[] = [];
  content.push(heading(`${owner}'s frens has new activities.`));
  const contentPromises = lastActivities.map(async (activity) => {
    if (activity.image) {
      const base64 = await downloadAndCovertImage(activity.image);
      content.push(text(activity.text));
      content.push(image(wrapBase64ToSvg(base64)));
      content.push(divider());
    } else {
      content.push(text(activity.text));
      content.push(divider());
    }
  });

  await Promise.all(contentPromises);
  return content;
}

/**
 * Build need to notify contents.
 */
export async function buildNeedToNotifyContents() {
  const { monitor } = await getState();
  const watchedProfiles = monitor?.flatMap(
    (item) => item.watchedProfiles ?? [],
  );

  const tempAddresses = new Set();
  const filteredProfiles = watchedProfiles
    .map((profile) => {
      const filteredFollowing =
        profile.following?.filter((item) => {
          const { address } = item;
          if (!tempAddresses.has(address)) {
            tempAddresses.add(address);
            return true;
          }
          return false;
        }) || [];

      return filteredFollowing.length > 0
        ? { ...profile, following: filteredFollowing }
        : null;
    })
    .filter(Boolean) as TSocialGraphResult[];

  const AllContents: Component[][] = [];
  const contentPromises = filteredProfiles.flatMap(async (profile) => {
    const latestActivities =
      profile.following?.flatMap((fProfile) => fProfile.lastActivities ?? []) ??
      [];
    if (latestActivities.length > 0) {
      const content = await buildAlertContent(
        latestActivities,
        profile.owner.handle,
      );
      AllContents.push(content);
    }
  });

  await Promise.all(contentPromises);

  const panelContent = panel(AllContents.flat());

  return {
    panelContent,
    count: AllContents.length,
  };
}

type ExecuteHandler = {
  handle?: string;
  execute: (...args: any[]) => Promise<TSocialGraphResult | void>;
};

/**
 * Get Execute handler.
 *
 * @param profile - The RSS3 Profile.
 * @returns Execute handler.
 */
export function getExecuteHandler(profile: Profile): ExecuteHandler {
  if (profile.platform === Platform.Crossbell) {
    return {
      handle: profile.handle,
      execute: CrossbellHandler,
    };
  }

  if (profile.platform === Platform.Lens) {
    return {
      handle: profile.handle,
      execute: LensHandler,
    };
  }

  if (profile.platform === Platform.Farcaster) {
    return {
      handle: profile.handle,
      execute: FarcasterHandler,
    };
  }

  return {
    handle: profile.handle,
    execute: async () => {
      // unsupported.
    },
  };
}

/**
 * Add watched profiles to state.
 */
export async function addWatchedProfilesToState() {
  const state = await getState();
  const monitorsPromises = state.monitor.flatMap(async (monitor) => {
    monitor.latestUpdateTime = moment().format('YYYY/MM/DD HH:mm:ss');
    const profilesPromises = monitor.profiles.flatMap(async (rss3Profile) => {
      const { handle, execute } = getExecuteHandler(rss3Profile);
      return handle ? await execute(rss3Profile.handle, monitor) : undefined;
    });

    const profiles = await Promise.all(profilesPromises);
    return {
      ...monitor,
      watchedProfiles: profiles.filter(
        (item) => item !== undefined,
      ) as TSocialGraphResult[],
    };
  });
  const monitor = await Promise.all(monitorsPromises);
  await setState({
    ...state,
    monitor,
  });
}
