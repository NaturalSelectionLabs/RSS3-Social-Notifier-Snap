import { Platform } from '..';

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

export { handler as LensHandler, format as LensFormat } from './platforms/lens';
export {
  handler as CrossbellHandler,
  format as CrossbellFormat,
  type TCSBProfile,
} from './platforms/crossbell';
export { Platform };
