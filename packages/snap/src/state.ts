import { ManageStateOperation } from '@metamask/snaps-types';
import { Profile } from '@rss3/js-sdk';
import { TRelationChainResult } from '.';

export type CronActivity = {
  id: string;
  text: string;
  owner?: string;
};

export type SocialActivity = {
  address: string;
  activities: CronActivity[];
  total: number;
};

export type SocialMonitor = {
  search: string;
  profiles: Profile[];
  following?: TRelationChainResult[];
  latestUpdateTime?: string;
  activities?: SocialActivity[];
  lastUpdatedActivities?: SocialActivity[];
};

export type State = {
  socialActivities: SocialActivity[];
  lastUpdatedActivities: SocialActivity[];
  monitor: SocialMonitor[];
};

/**
 * The default state of the snap. This is returned by the {@link getState}
 * function if the state has not been set yet.
 */
const DEFAULT_STATE = {
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
    params: { operation: ManageStateOperation.GetState },
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
    params: { operation: ManageStateOperation.ClearState },
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
