import { isValidWalletAddress } from './utils';
import { diffMonitor, getMultiple } from './fetch';
import { SocialMonitor } from './state';
import { Platform, TProfile, TSocialGraphResult } from '.';

const API = `https://indexer.crossbell.io/v1`;

export type TCSBProfile = {
  characterId: string;
  handle: string;
  owner: string;
  primary: boolean;
  metadata: {
    uri?: string;
    content?: {
      bio?: string;
      name: string;
      type: string;
      avatars: string[];
    };
  };
};

type TCSBProfiles = {
  list: TCSBProfile[];
  count: number;
  cursor: string | null;
};

type TCSBError = {
  message: string;
  error?: string;
  statusCode: number;
};

type TCharacterResult = {
  data: TCSBProfile | null;
  status: boolean;
  message: string;
};

/**
 * Retrieves the character ID associated with the given walletAddress from the Crossbell API.
 *
 * @param walletAddress - The walletAddress to retrieve the character ID for.
 * @returns The character ID associated with the given walletAddress.
 */
async function getCSBCharacterIdByWalletAddress(
  walletAddress: string,
): Promise<TCharacterResult> {
  const url = `${API}/addresses/${walletAddress}/characters?limit=50`;
  const resp = await fetch(url);
  const data = (await resp.json()) as TCSBError | TCSBProfiles;

  if ((data as TCSBError)?.error) {
    return {
      data: null,
      status: false,
      message: (data as TCSBError).message,
    };
  }

  // @TODO: missing paging logic.
  const { list } = data as TCSBProfiles;
  const defaultProfile = list.find((item) => item.primary);

  if (defaultProfile) {
    return {
      data: defaultProfile,
      status: true,
      message: 'success',
    };
  }

  if (list.length > 0) {
    return {
      data: list[0],
      status: true,
      message: 'success',
    };
  }

  return {
    data: null,
    status: false,
    message: 'cannot found primary character.',
  };
}

/**
 * Retrieves the character ID associated with the given handle from the Crossbell API.
 *
 * @param inputHandle - The handle to retrieve the character ID for.
 * @param limit - The maximum number of results to return.
 * @returns The character ID associated with the given handle.
 */
async function getCSBCharacterIdByHandle(
  inputHandle: string,
  limit = 20,
): Promise<TCharacterResult> {
  const handle = inputHandle.replace('.csb', '');
  const url = `${API}/handles/${handle}/character?limit=${limit}`;
  const resp = await fetch(url);
  const data = (await resp.json()) as TCSBProfile | null;
  if (data) {
    return {
      data,
      status: true,
      message: 'success',
    };
  }

  return {
    data: null,
    status: false,
    message: `not found: ${inputHandle}`,
  };
}

/**
 * Retrieves the character ID for the given handle from the Crossbell API.
 *
 * @param handle - The handle to retrieve the character ID for.
 * @returns The character ID for the given handle.
 */
async function getCharacterId(handle: string) {
  let result: TCharacterResult | null = null;
  if (isValidWalletAddress(handle)) {
    result = await getCSBCharacterIdByWalletAddress(handle);
  } else if (handle.endsWith('.csb')) {
    result = await getCSBCharacterIdByHandle(handle);
  }
  return result;
}

/**
 * Retrieves the followers for the given character ID from the Crossbell API.
 *
 * @param id - The character ID to retrieve the followers for.
 * @param olderMonitor - The older monitor.
 * @param handle - The handle.
 */
export async function getFollowingByCharacterId(
  id: string,
  olderMonitor: SocialMonitor,
  handle: string,
) {
  const following: TProfile[] = [];
  let hasNextPage = true;
  let cursor: string | undefined;
  while (hasNextPage) {
    const url =
      cursor === ''
        ? `${API}/characters/${id}/links?linkType=follow&limit=50`
        : `${API}/characters/${id}/links?linkType=follow&limit=50&cursor=${cursor}`;

    const resp = await fetch(url);
    if (resp.ok) {
      const data = (await resp.json()) as {
        list: { owner: string; toCharacter: TCSBProfile }[];
        count: number;
        cursor: string | null;
      };
      const csbProfiles = data.list.map((item) => item.toCharacter);
      const profiles = format(csbProfiles);
      following.push(...profiles);

      if (data.cursor === null) {
        hasNextPage = false;
      } else {
        hasNextPage = true;
        cursor = data.cursor;
      }
    } else {
      hasNextPage = false;
    }
  }

  const addresses = following
    .map((item) => item.address)
    .filter((addr) => addr !== undefined) as string[];

  const fetchedAddress = await getMultiple(addresses);
  const fetchedFollowing = following.map((item) => {
    if (item.address !== undefined) {
      const findOut = fetchedAddress.find((addr) => {
        if (addr.owner === undefined || item.address === undefined) {
          return false;
        }
        return addr.owner.toLowerCase() === item.address.toLowerCase();
      });

      if (findOut) {
        const lastActivities = diffMonitor(
          olderMonitor,
          findOut.activities,
          handle,
          item.handle,
        );

        return {
          ...item,
          activities: findOut.activities,
          lastActivities,
        };
      }
    }
    return item;
  });

  return fetchedFollowing;
}

/**
 * Converts the given Crossbell API profiles to a standard profile.
 *
 * @param profiles - The Crossbell API profiles to convert.
 * @returns The converted profiles.
 */
export function format(profiles: TCSBProfile[]): TProfile[] {
  const result: TProfile[] = profiles.map((item) => ({
    handle: `${item.handle}.csb`,
    address: item.owner,
    avatar: item.metadata.uri,
  }));

  return result;
}

/**
 * Retrieves the social graph for the given handle from the Crossbell API.
 *
 * @param handle - The handle to retrieve the social graph for.
 * @param oldMonitor - The old monitor.
 * @param fetchMethod - The method to use to fetch the following.
 * @returns The social graph for the given handle.
 */
export async function handler(
  handle: string,
  oldMonitor: SocialMonitor,
  fetchMethod: typeof getFollowingByCharacterId = getFollowingByCharacterId,
): Promise<TSocialGraphResult> {
  // 1. Get owner profile
  const characterResult = await getCharacterId(handle);
  if (characterResult === null) {
    return {
      platform: Platform.Crossbell,
      owner: {
        handle,
      },
      status: false,
      message: `unsupported handle: ${handle}, please check again.`,
    };
  }

  if (!characterResult.status) {
    return {
      platform: Platform.Crossbell,
      owner: {
        handle,
      },
      status: false,
      message: `Error by crossbell indexer: ${
        characterResult.message ?? 'Not Found'
      }`,
    };
  }
  const { data } = characterResult;
  const csbHandle = data?.handle ? `${data.handle}.csb` : handle;
  if (data?.characterId === undefined) {
    return {
      platform: Platform.Crossbell,
      owner: {
        handle: csbHandle,
      },
      status: false,
      message: `Error by crossbell indexer: ${
        characterResult.message ?? 'Not Found'
      }`,
    };
  }

  // 2. Get following
  const following = await fetchMethod(data.characterId, oldMonitor, handle);

  // 3. Return result
  return {
    platform: Platform.Crossbell,
    owner: {
      handle: csbHandle,
      address: characterResult.data?.owner,
      avatar: characterResult.data?.metadata.content?.avatars?.[0],
    },
    status: true,
    message: 'success',
    following,
  };
}
