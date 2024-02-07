export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

// TODO: - share the types with the snap
export enum Platform {
  Crossbell = 'Crossbell',
  Farcaster = 'Farcaster',
  Lens = 'Lens',
}

export type PlatformInfo = { name: string; id: Platform; enabled: boolean };
