export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

// TODO: share this type with the `snap` package
export type Profile = {
  action?: 'create' | 'renew' | 'unwrap' | 'update' | 'wrap';
  address?: string;
  bannerURI?: string[];
  bio?: string;
  expireAt?: string | null;
  expiry?: string | null;
  handle?: string;
  image_uri?: string;
  key?: string;
  name?: string;
  network: string;
  platform: string;
  profileURI?: string[];
  profile_id?: string;
  socialURI?: string[];
  url?: string;
  value?: string;
};
