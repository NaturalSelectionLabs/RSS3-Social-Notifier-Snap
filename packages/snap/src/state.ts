import { ManageStateOperation } from '@metamask/snaps-types';
import { Profile } from '@rss3/js-sdk';
import { TSocialGraphResult } from '.';

// TODO: - share the types with the site
export enum Platform {
  Crossbell = 'Crossbell',
  Farcaster = 'Farcaster',
  Lens = 'Lens',
}

export type PlatformInfo = { name: string; id: Platform; enabled: boolean };

export type CronActivity = {
  id: string;
  text: string;
  image?: string;
  owner?: string;
  platform: string | null;
};

export type SocialActivity = {
  address: string;
  activities: CronActivity[];
  total: number;
};

export type SocialMonitor = {
  search: string;
  profiles: Profile[];
  watchedProfiles?: TSocialGraphResult[];
  latestUpdateTime?: string;
};

// `State` should mark its properties as optional to avoid the error of missing properties.
// Because the user might have installed an older version.
export type State = {
  // We might have more platforms in the future,
  // so we use `Partial` here to make it future-proof.
  platforms?: Partial<Record<Platform, { enabled: boolean }>>;
  socialActivities: SocialActivity[];
  lastUpdatedActivities: SocialActivity[];
  monitor: SocialMonitor[];
};

/**
 * The default state of the snap. This is returned by the {@link getState}
 * function if the state has not been set yet.
 */
const DEFAULT_STATE: State = {
  platforms: {
    [Platform.Crossbell]: { enabled: true },
    [Platform.Farcaster]: { enabled: true },
    [Platform.Lens]: { enabled: true },
  },
  socialActivities: [],
  lastUpdatedActivities: [],
  monitor: [],
};

/**
 * Get the current state of the snap. If the snap does not have state, the
 * {@link DEFAULT_STATE} is returned instead.
 *
 * This uses the `snap_manageState` JSON-RPC method to get the state.
 *
 * @returns The current state of the snap.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function getState(): Promise<State> {
  const state = await snap.request({
    method: 'snap_manageState',

    // For this particular example, we use the `ManageStateOperation.GetState`
    // enum value, but you can also use the string value `'get'` instead.
    params: { operation: ManageStateOperation.GetState, encrypted: false },
  });

  // If the snap does not have state, `state` will be `null`. Instead, we return
  // the default state.
  return (state as State | null) ?? DEFAULT_STATE;
}

/**
 * Set the state of the snap. This will overwrite the current state.
 *
 * This uses the `snap_manageState` JSON-RPC method to set the state. The state
 * is encrypted with the user's secret recovery phrase and stored in the user's
 * browser.
 *
 * @param newState - The new state of the snap.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function setState(newState: State) {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.UpdateState,
      newState,
      encrypted: false,
    },
  });
}

/**
 * Clear the state of the snap. This will set the state to the
 * {@link DEFAULT_STATE}.
 *
 * This uses the `snap_manageState` JSON-RPC method to clear the state.
 *
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function clearState() {
  await snap.request({
    method: 'snap_manageState',
    // For this particular example, we use the `ManageStateOperation.ClearState`
    // enum value, but you can also use the string value `'clear'` instead.

    params: { operation: ManageStateOperation.ClearState, encrypted: false },
  });
}

/**
 * Add a new address to the state's social activities.
 *
 * @param address - The address to add to the state's social activities.
 */
export async function addAddressToState(address: string) {
  const state = await getState();
  const alreadyExist = state.socialActivities.find(
    (item) => item.address === address,
  );
  if (alreadyExist) {
    return;
  }

  await setState({
    ...state,
    socialActivities: [
      ...state.socialActivities,
      {
        address,
        activities: [],
        total: 0,
      },
    ],
  });
}

/**
 * Add multiple addresses to the state's social activities.
 *
 * @param addresses - An array of addresses to add to the state's social activities.
 */
export async function addMultipleAddressesToState(addresses: string[]) {
  const state = await getState();
  const needToAddAccounts = addresses.filter(
    (address) =>
      !state.socialActivities.some((item) => item.address === address),
  );

  if (needToAddAccounts.length === 0) {
    return [];
  }

  const newAccounts: SocialActivity[] = needToAddAccounts.map((account) => {
    return {
      address: account,
      activities: [],
      total: 0,
    };
  });

  await setState({
    ...state,
    socialActivities: [...new Set([...state.socialActivities, ...newAccounts])],
  });

  return needToAddAccounts;
}
