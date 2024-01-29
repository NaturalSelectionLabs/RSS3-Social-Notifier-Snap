import { MetaMaskInpageProvider } from '@metamask/providers';
import type { Profile } from '@rss3/js-sdk';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap, Platform, PlatformInfo } from '../types';

/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export type SocialActivity = {
  address: string;
  activities: string[];
  total: number;
};

export type CronActivity = {
  id: string;
  text: string;
  owner?: string;
};

export type TProfile = {
  handle: string;
  address?: string;
  avatar?: string;
  activities?: CronActivity[];
  lastActivities?: CronActivity[];
};

export type TSocialGraphResult = {
  platform: Platform;
  status: boolean;
  message: string;
  owner: TProfile;
  followers?: TProfile[];
  following?: TProfile[];
};

export type SocialMonitor = {
  search: string;
  profiles: Profile[];
  watchedProfiles?: TSocialGraphResult[];
  latestUpdateTime?: string;
};

/**
 * Invoke the "getState" method from the example snap.
 */
export const sendGetState = async () => {
  const resp = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: { snapId: defaultSnapOrigin, request: { method: 'getState' } },
  });
  return resp as {
    socialActivities: SocialActivity[];
    lastUpdatedActivities: SocialActivity[];
    monitor: SocialMonitor[];
  };
};

/**
 * Invoke the "setState" method from the example snap.
 *
 * @param socialActivities - SocialCount[] to set.
 */
export const sendSetState = async (socialActivities: SocialActivity[]) => {
  const resp = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'setState',
        params: {
          socialActivities,
        },
      },
    },
  });
  return resp as boolean;
};

export const sendClearState = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'clearState',
      },
    },
  });
};

export const addOwnWalletAddress = async () => {
  const resp = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'addOwnWalletAddresses',
      },
    },
  });

  return resp;
};

// export const showAlert = async (title: string, content: string) => {
//   await window.ethereum.request({
//     method: 'wallet_invokeSnap',
//     params: {
//       snapId: defaultSnapOrigin,
//       request: {
//         method: 'showAlert',
//         params: {
//           title,
//           content,
//         },
//       },
//     },
//   });
// };

export const showLastUpdated = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'showLastUpdated',
      },
    },
  });
};

export const showAllActivities = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'showAllActivities',
      },
    },
  });
};

export const showAllFollowedAddresses = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'showAllFollowedAddresses',
      },
    },
  });
};

export const showAllSocialPlatforms = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'getSupportedSocialPlatforms',
      },
    },
  });
};

export const getProfilesFilterBySearch = async (
  search: string,
  platforms: string[],
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'getProfilesFilterBySearch',
        params: {
          search,
          platforms,
        },
      },
    },
  });
};

export const addProfilesToMonitorFollowing = async (
  search: string,
  profiles: Profile[],
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'addProfilesToMonitorFollowing',
        params: {
          search,
          profiles,
        },
      },
    },
  });
};

export const getProfilesToMonitorFollowing = async () => {
  return (await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'getProfilesToMonitorFollowing',
      },
    },
  })) as SocialMonitor[];
};

export const testImage = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'test-image',
      },
    },
  });
};

export const togglePlatform = async (platform: string, enabled: boolean) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'togglePlatform',
        params: { platform, enabled },
      },
    },
  });
};

export const getPlatformInfos = async () => {
  return (await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'getPlatformInfos',
      },
    },
  })) as PlatformInfo[];
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
