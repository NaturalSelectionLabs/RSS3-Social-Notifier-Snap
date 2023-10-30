import { Platform } from '..';
import {
  handler as LensHandler,
  format as LensFormat,
  query as LensQuery,
} from './platforms/lens';
import {
  handler as FarcasterHandler,
  format as FarcasterFormat,
} from './platforms/farcaster';

import {
  handler as CrossbellHandler,
  format as CrossbellFormat,
  getFollowingByCharacterId as CrossBellQueryMethod,
  type TCSBProfile,
} from './platforms/crossbell';

export type TRelationChainResult = {
  platform: Platform;
  status: boolean;
  message: string;
  owner: TProfile;
  followers?: TProfile[];
  following?: TProfile[];
};

export type TProfile = {
  handle: string;
  address?: string;
  avatar?: string;
};

export { Platform };

export { LensHandler, LensFormat };
export { FarcasterHandler, FarcasterFormat };
export { CrossbellHandler, CrossbellFormat, type TCSBProfile };

export const executeLens = async (key: string) => {
  const resp = await LensHandler(key, 20, LensQuery);
  const following = LensFormat(resp);
  return following;
};

export const executeCrossbell = async (key: string) => {
  const { following } = await CrossbellHandler(key, CrossBellQueryMethod);
  return following;
};

export const executeFarcaster = async (key: string) => {
  const { following } = await FarcasterHandler(key);
  return following;
};
