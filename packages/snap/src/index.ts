import {
  DialogType,
  OnCronjobHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-types';
import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';

import { Profile } from '@rss3/js-sdk';
import moment from 'moment';
import {
  CronActivity,
  SocialActivity,
  State,
  addAddressToState,
  addMultipleAddressesToState,
  clearState,
  getState,
  setState,
} from './state';
import { diff, getSocialActivities } from './fetch';
import {
  getProfilesBySearch,
  CrossbellHandler,
  LensHandler,
  FarcasterHandler,
} from './social-graph';

export enum Platform {
  Crossbell = 'Crossbell',
  Farcaster = 'Farcaster',
  Lens = 'Lens',
}

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
  activities?: CronActivity[];
  lastActivities?: CronActivity[];
};

export type FetchSocialCountParams = {
  accounts: string[];
};
/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    /** Basic function */
    // set the state
    case 'setState': {
      const { socialActivities } = request.params as State;
      const state = await getState();
      await setState({
        ...state,
        socialActivities,
      });
      return true;
    }

    // get the state
    case 'getState': {
      return await getState();
    }

    // clear the state
    case 'clearState': {
      await clearState();
      return true;
    }

    // get accounts by own wallet
    case 'getAccounts': {
      return await getAccounts();
    }

    // add account to state
    case 'addAccount': {
      const { account } = request.params as { account: string | undefined };
      if (!account) {
        return true;
      }
      return await addAddressToState(account);
    }

    // add multiple accounts by own wallet to state
    case 'addOwnWalletAddresses': {
      const accounts = await getAccounts();
      return await addMultipleAddressesToState(accounts);
    }

    // User-defined Dialog.Alert
    case 'showAlert': {
      const { title, content } = request.params as {
        title: string;
        content: string;
      };
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([heading(title), text(content)]),
        },
      });
    }

    // fetch the social activities by @rss3/js-sdk.
    case 'fetchSocialCount': {
      const params = request.params as FetchSocialCountParams | undefined;
      assert(
        params?.accounts,
        'Required accounts parameter was not specified.',
      );
      const resultPromise = params.accounts.map((address) =>
        getSocialActivities(address),
      );

      return await Promise.all(resultPromise);
    }

    /** Helper function */

    // show the last updated activities
    case 'showLastUpdated': {
      const state = await getState();
      const content: any = [heading('Last Updated')];
      state.lastUpdatedActivities.forEach((activity) => {
        content.push(heading(`${activity.address}`));
        activity.activities.forEach((item) => {
          content.push(text(item.text));
          content.push(divider());
        });
      });
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel(content),
        },
      });
    }

    // show the all activities
    case 'showAllActivities': {
      const state = await getState();
      const content: any = [heading('All Activities')];
      state.socialActivities.forEach((activity) => {
        content.push(heading(`${activity.address}`));
        activity.activities.forEach((item) => {
          content.push(text(item.text));
          content.push(divider());
        });
      });
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel(content),
        },
      });
    }

    // show the all Followed addresses
    case 'showAllFollowedAddresses': {
      const state = await getState();
      const content: any = [heading('Your Web3 frens')];
      state.socialActivities.forEach((activity) => {
        content.push(text(activity.address));
        content.push(divider());
      });
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel(content),
        },
      });
    }

    case 'getProfilesBySearch': {
      const { search } = request.params as { search: string };
      return getProfilesBySearch(search);
    }

    case 'getSupportedSocialPlatforms': {
      return [Platform.Crossbell, Platform.Farcaster, Platform.Lens];
    }

    case 'getProfilesFilterBySearch': {
      const { search, platforms } = request.params as {
        search: string;
        platforms: string[];
      };
      const profiles = await getProfilesBySearch(search);
      return profiles.filter((item) => platforms.includes(item.platform));
    }

    case 'addProfilesToMonitorFollowing': {
      const { search, profiles } = request.params as {
        search: string;
        profiles: Profile[];
      };
      const state = await getState();
      const monitor = state.monitor.filter((item) => item.search !== search);
      await setState({
        ...state,
        monitor: [...monitor, { search, profiles }],
      });
      return true;
    }

    case 'getProfilesToMonitorFollowing': {
      const state = await getState();
      return state.monitor;
    }

    default:
      throw new Error('Method not found.');
  }
};

/**
 * Get the Ethereum accounts that the snap has access to using the `ethereum`
 * global. This is essentially the same as the `window.ethereum` global, but
 * does not have access to all methods.
 *
 * If the user hasn't given the snap access to any accounts yet, this JSON-RPC
 * method will show a prompt to the user, asking them to select the accounts to
 * give the snap access to.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @returns The selected accounts as an array of hexadecimal strings.
 * @throws If the user rejects the prompt.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 */
async function getAccounts() {
  const accounts = await ethereum.request<string[]>({
    method: 'eth_requestAccounts',
  });

  assert(accounts, 'Ethereum provider did not return accounts');
  return accounts as string[];
}

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'execute': {
      const state = await getState();
      const accounts = state.socialActivities.map((item) =>
        item.address.toLocaleLowerCase(),
      );

      // no accounts
      if (accounts.length === 0) {
        return { result: false, message: 'No accounts' };
      }

      const resultPromise = accounts.map((address) =>
        getSocialActivities(address),
      );
      const socialActivities = await Promise.all(resultPromise);

      // filter the changed social count
      const changedSocialCounts = socialActivities.filter((activity) =>
        state.socialActivities.find(
          (item) =>
            item.address.toLocaleLowerCase() ===
              activity.address.toLocaleLowerCase() &&
            item.total < activity.total,
        ),
      );

      // not need to notify.
      if (changedSocialCounts.length === 0) {
        return {
          result: false,
          message: 'No new feed',
          cached: state.socialActivities,
          data: socialActivities,
        };
      }

      const diffArray: SocialActivity[] = [];
      const content: any = [heading('New Social Count')];

      for (const activity of changedSocialCounts) {
        const cachedActivity = state.socialActivities.find(
          (item) =>
            item.address.toLocaleLowerCase() ===
            activity.address.toLocaleLowerCase(),
        );

        if (!cachedActivity) {
          continue;
        }

        const diffActivities = diff(
          cachedActivity.activities,
          activity.activities,
        );

        diffArray.push({
          address: cachedActivity.address,
          activities: diffActivities,
          total: diffActivities.length,
        });

        content.push(heading(`${activity.address}`));
        diffActivities.forEach((item) => {
          content.push(text(item.text));
          content.push(divider());
        });
      }

      await setState({
        ...state,
        socialActivities,
        lastUpdatedActivities: diffArray,
      });

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel(content),
        },
      });
      return { result: true };
    }

    // Don't know the reason why the Dialog.Alert component cannot be detected in e2e testing.
    // This is a temporary solution. It will be deleted once a better resolution is found in the future.
    case 'executeForTest': {
      const state = await getState();
      const accounts = state.socialActivities.map((item) =>
        item.address.toLocaleLowerCase(),
      );

      // no accounts
      if (accounts.length === 0) {
        return { result: false, message: 'No accounts' };
      }

      const resultPromise = accounts.map((address) =>
        getSocialActivities(address),
      );
      const socialActivities = await Promise.all(resultPromise);

      // filter the changed social count
      const changedSocialCounts = socialActivities.filter((activity) =>
        state.socialActivities.find(
          (item) =>
            item.address.toLocaleLowerCase() ===
              activity.address.toLocaleLowerCase() &&
            item.total < activity.total,
        ),
      );

      // not need to notify.
      if (changedSocialCounts.length === 0) {
        return {
          result: false,
          message: 'No new feed',
          cached: state.socialActivities,
          data: socialActivities,
        };
      }

      const diffArray: SocialActivity[] = [];
      const content: any = [heading('New Social Count')];

      for (const activity of changedSocialCounts) {
        const cachedActivity = state.socialActivities.find(
          (item) =>
            item.address.toLocaleLowerCase() ===
            activity.address.toLocaleLowerCase(),
        );

        if (!cachedActivity) {
          continue;
        }

        const diffActivities = diff(
          cachedActivity.activities,
          activity.activities,
        );

        diffArray.push({
          address: cachedActivity.address,
          activities: diffActivities,
          total: diffActivities.length,
        });

        content.push(heading(`${activity.address}`));
        diffActivities.forEach((item) => {
          content.push(text(item.text));
          content.push(divider());
        });
      }

      await setState({
        ...state,
        socialActivities,
        lastUpdatedActivities: diffArray,
      });

      return { result: true, content: panel(content) };
    }

    case 'checkConnectedUserProfiles': {
      const state = await getState();

      const accounts = await getAccounts();
      const profilesPromises = accounts.map(async (account) => {
        const profiles = await getProfilesBySearch(account);
        const monitor = state.monitor.filter((item) => item.search !== account);
        await setState({
          ...state,
          monitor: [...monitor, { search: account, profiles }],
        });
      });
      await Promise.all(profilesPromises);

      return true;
    }

    case 'executeFollow': {
      const state = await getState();
      const monitorPromises = state.monitor.map(async (item) => {
        item.latestUpdateTime = moment().format('YYYY/MM/DD hh:mm:ss');
        const handles = item.profiles
          .filter((profile) => profile.handle !== undefined)
          .map((profile) => {
            if (profile.platform === Platform.Crossbell) {
              return {
                handle: profile.handle,
                execute: CrossbellHandler,
              };
            }

            if (profile.platform === Platform.Lens) {
              return {
                handle: profile.handle,
                execute: LensHandler,
              };
            }

            if (profile.platform === Platform.Farcaster) {
              return {
                handle: profile.handle,
                execute: FarcasterHandler,
              };
            }

            return undefined;
          });

        const watchedProfiles: TSocialGraphResult[] = [];
        const promises = handles.map(async (exec) => {
          if (exec?.handle) {
            const fol = await exec.execute(exec.handle, item);
            if (fol) {
              watchedProfiles.push(fol);
            }
          }
        });
        await Promise.all(promises);
        return {
          ...item,
          watchedProfiles,
        };
      });
      const monitor = await Promise.all(monitorPromises);
      await setState({
        ...state,
        monitor,
      });

      // notify the latest social activities by the monitor
      const content: any[] = [];
      monitor.forEach((item) => {
        item.watchedProfiles?.forEach((profile) => {
          const lastActivities = profile.following?.flatMap(
            (follower) =>
              follower.lastActivities?.map((activity) => activity.text) ?? [],
          );

          if (lastActivities && lastActivities.length > 0) {
            content.push(
              heading(`${profile.owner.handle}'s frens has new activities.`),
            );

            lastActivities.forEach((activity) => {
              content.push(text(activity));
              content.push(divider());
            });
          }
        });
      });

      if (content.length > 0) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: DialogType.Alert,
            content: panel(content),
          },
        });
      }
      return true;
    }

    default:
      throw new Error(`Method:[${request.method}] not found.`);
  }
};
