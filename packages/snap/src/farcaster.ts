import { getMultiple } from './fetch';
import { Platform, TProfile, TRelationChainResult } from '.';

const API = 'https://api.warpcast.com/v2';

type TFarcasterUser = {
  fid: number;
  username: string;
  displayName: string;

  pfp: {
    url: string;
    verified: boolean;
  };
  profile: {
    bio: {
      text: string;
    };
  };
  followerCount: number;
  followingCount: number;
};

type TFarcasterError = {
  errors: {
    message: string;
  }[];
};

type TFarcasterFollowingResponse = {
  result: {
    users: TFarcasterUser[];
  };
  next?: {
    cursor: string;
  };
};

/**
 * Returns the API endpoint for a given username.
 *
 * @param username - The username to get the API endpoint for.
 * @returns The API endpoint for the given username.
 */
export const userByUsernameApi = (username: string) =>
  `${API}/user-by-username?username=${username}`;

export const getFollowingByFidApi = (fid: number) =>
  `${API}/following?fid=${fid}&limit=50`;

/**
 * Returns the owner profile for a given username.
 *
 * @param username - The username to get the owner profile for.
 * @returns The owner profile for the given username.
 */
export async function getOwnerProfileByUsername(username: string) {
  const resp = await fetch(userByUsernameApi(username));
  const json = (await resp.json()) as
    | { result: { user: TFarcasterUser } }
    | TFarcasterError;

  /**
   * If there are errors, return the handle.
   */
  if ((json as TFarcasterError)?.errors) {
    return {
      handle: username,
    };
  }

  /**
   * If there are no errors, return the owner profile.
   */
  const { result } = json as {
    result: {
      user: TFarcasterUser;
      extras: {
        fid: number;
        custodyAddress: string;
      };
    };
  };
  return {
    handle: result.user.username,
    avatar: result.user.pfp.url,
    fid: result.user.fid,
    followerCount: result.user.followerCount,
    followingCount: result.user.followingCount,
    bio: result.user.profile.bio.text,
    address: result.extras.custodyAddress,
  };
}

/**
 * Formats the response data from FarCaster API into an array of TProfile objects.
 *
 * @param data - The response data from FarCaster API.
 * @returns An array of TProfile objects.
 */
export async function format(data: TFarcasterUser[]): Promise<TProfile[]> {
  const promises = data.map(async (item) => {
    const resp = await fetch(userByUsernameApi(item.username));
    const json = (await resp.json()) as
      | { result: { user: TFarcasterUser } }
      | TFarcasterError;

    /**
     * If there are errors, return the handle.
     */
    if ((json as TFarcasterError)?.errors) {
      return {
        handle: item.username,
        avatar: item.pfp.url,
      };
    }

    /**
     * If there are no errors, return the owner profile.
     */
    const { result } = json as {
      result: {
        user: TFarcasterUser;
        extras: {
          fid: number;
          custodyAddress: string;
        };
      };
    };

    return {
      handle: item.username,
      avatar: item.pfp.url,
      address: result.extras.custodyAddress,
    };
  });

  return await Promise.all(promises);
}

/**
 * Returns the following profiles for a given Farcaster ID.
 *
 * @param fid - The Farcaster ID to get the following profiles for.
 * @returns An array of TProfile objects representing the following profiles.
 */
export async function getFollowingByFid(fid: number) {
  let cursor: string | undefined;
  let hasNextPage = true;
  const following: TProfile[] = [];
  while (hasNextPage) {
    const url =
      cursor === undefined
        ? getFollowingByFidApi(fid)
        : `${getFollowingByFidApi(fid)}&cursor=${cursor}`;
    const resp = await fetch(url);
    const data = (await resp.json()) as TFarcasterFollowingResponse;
    following.push(...(await format(data.result.users)));
    if (data.next === undefined) {
      hasNextPage = false;
    } else {
      cursor = data.next.cursor;
    }
  }

  const addresses = following
    .map((item) => item.address)
    .filter((addr) => addr !== undefined) as string[];

  const fetchedAddresses = await getMultiple(addresses);

  const fetchedFollowing = following.map((item) => {
    if (item.address !== undefined) {
      const findOut = fetchedAddresses.find((addr) => {
        if (addr.owner === undefined || item.address === undefined) {
          return false;
        }
        return addr.owner.toLowerCase() === item.address.toLowerCase();
      });

      if (findOut) {
        return {
          ...item,
          activities: findOut.activities,
          lastActivities: findOut.oldActivities,
        };
      }
    }
    return item;
  });
  return fetchedFollowing;
}

/**
 * Returns the relation chain for a given Farcaster handle.
 *
 * @param handle - The Farcaster handle to get the relation chain for.
 * @returns The relation chain for the given Farcaster handle.
 */
export async function handler(handle: string): Promise<TRelationChainResult> {
  const owner = await getOwnerProfileByUsername(handle);
  if (!owner.fid) {
    return {
      owner: {
        handle,
        address: owner.address,
      },
      status: false,
      message: `${handle} not found`,
      platform: Platform.Farcaster,
    };
  }

  const following = await getFollowingByFid(owner.fid);
  return {
    owner: {
      handle: owner.handle,
      avatar: owner.avatar,
      address: owner.address,
    },
    status: true,
    message: 'success',
    platform: Platform.Farcaster,
    following,
  };
}
