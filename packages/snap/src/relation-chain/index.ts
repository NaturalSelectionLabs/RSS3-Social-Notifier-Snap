export enum Chain {
  Lens = 'Lens',
  Crossbell = 'Crossbell',
  Farcaster = 'Farcaster',
}

export type TRelationChainResult = {
  platform: Chain;
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
