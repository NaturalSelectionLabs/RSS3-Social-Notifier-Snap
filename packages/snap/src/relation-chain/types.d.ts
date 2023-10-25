import { Chain } from '.';

export type TRelationChainResult = {
  platform: Chain;
  status: boolean;
  message: string;
  owner: string;
  followers?: TProfile[];
  following?: TProfile[];
};

export type TProfile = {
  handle: string;
  address: `0x${string}`;
  avatar?: string;
};
