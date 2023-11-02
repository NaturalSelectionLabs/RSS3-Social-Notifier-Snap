import { Platform } from '..';
import { handler as LensHandler, format as LensFormat } from './platforms/lens';
import {
  handler as FarcasterHandler,
  format as FarcasterFormat,
} from './platforms/farcaster';

import {
  handler as CrossbellHandler,
  format as CrossbellFormat,
  type TCSBProfile,
} from './platforms/crossbell';

export type TSocialGraphResult = {
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
