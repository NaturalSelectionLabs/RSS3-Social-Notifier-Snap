import {
  DialogType,
  OnCronjobHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-types';
import { divider, heading, panel, text, image } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';

import { Profile } from '@rss3/js-sdk';
import {
  CronActivity,
  SocialActivity,
  State,
  // addAddressToState,
  addMultipleAddressesToState,
  clearState,
  getState,
  setState,
  Platform,
  PlatformInfo,
} from './state';
import { diff, getSocialActivities } from './fetch';
import { getProfilesBySearch } from './social-graph';
import {
  coverIpfsToUrl,
  imageBufferToBase64,
  wrapBase64ToSvg,
} from './utils/image';
import {
  addWatchedProfilesToState,
  buildNeedToNotifyContents,
} from './utils/activitiy';
import { getPlatformDisplayName } from './utils/platform-display-name';
import { filterByPlatforms } from './utils/filter-by-platforms';

// import imageToBase64 from './utils/imageToBase64';

export { Platform };

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
      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([
            heading('Clear State'),
            text('Are you sure you want to clear the state?'),
          ]) as any,
        },
      });

      if (result === true) {
        await clearState();
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: DialogType.Alert,
            content: panel([
              heading('Clear Succeeded'),
              text('Start adding some new addresses now!'),
            ]) as any,
          },
        });
      }

      return true;
    }

    // get accounts by own wallet
    case 'getAccounts': {
      return await getAccounts();
    }

    // add account to state, unused for now.
    // case 'addAccount': {
    //   const { account } = request.params as { account: string | undefined };
    //   if (!account) {
    //     return true;
    //   }
    //   const result = await snap.request({
    //     method: 'snap_dialog',
    //     params: {
    //       type: DialogType.Confirmation,
    //       content: panel([
    //         heading('Add Account'),
    //         text(`Are you sure you want to add ${account}?`),
    //       ]) as any,
    //     },
    //   });

    //   if (result === true) {
    //     await addAddressToState(account);
    //     await snap.request({
    //       method: 'snap_dialog',
    //       params: {
    //         type: DialogType.Alert,
    //         content: panel([
    //           heading('Add Succeeded'),
    //           text(`${account} has been added to the state!`),
    //         ]) as any,
    //       },
    //     });
    //   }
    //   return true;
    // }

    // add multiple accounts by own wallet to state
    case 'addOwnWalletAddresses': {
      const accounts = await getAccounts();
      return await addMultipleAddressesToState(accounts);
    }

    // User-defined Dialog.Alert, but it is not recommended to use it.
    // case 'showAlert': {
    //   const { title, content } = request.params as {
    //     title: string;
    //     content: string;
    //   };
    //   return snap.request({
    //     method: 'snap_dialog',
    //     params: {
    //       type: DialogType.Alert,
    //       content: panel([heading(title), text(content)]) as any,
    //     },
    //   });
    // }

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
          content: panel(content) as any,
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
          content: panel(content) as any,
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
          content: panel(content) as any,
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

    case 'test-image': {
      const url = 'ipfs://QmWF6jJkEC2hMhFX3jTsPqZyouTHZJdz3rGwo5MdEGNWgT';
      const resp = await fetch(coverIpfsToUrl(url));
      const buffer = await Buffer.from(await resp.arrayBuffer());
      const base64 = await imageBufferToBase64(buffer);
      // const data = await resp.json();
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([
            heading('Test Image'),
            image(wrapBase64ToSvg(base64)),
            text(coverIpfsToUrl(url)),
          ]) as any,
        },
      });
    }

    case 'togglePlatform': {
      const state = await getState();
      const { enabled, platform } = request.params as {
        platform: Platform;
        enabled: boolean;
      };

      return setState({
        ...state,
        platforms: { ...state.platforms, [platform]: { enabled } },
      });
    }

    case 'getPlatformInfos': {
      const { platforms } = await getState();

      return Object.values(Platform).map((platform) => ({
        enabled: platforms?.[platform]?.enabled ?? true,
        id: platform,
        name: getPlatformDisplayName(platform),
      })) satisfies PlatformInfo[];
    }

    case 'isFeatureSupported': {
      const { feature } = request.params as { feature: string };

      switch (feature) {
        case 'togglePlatform':
          return true;
        default:
          return false;
      }
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

      // remove duplicates by following list address

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
      const content: Parameters<typeof panel>[0] = [
        heading('New Social Count'),
      ];

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

        if (filterByPlatforms(diffActivities, state).length > 0) {
          content.push(heading(`${activity.address}`));
          diffActivities.forEach((item) => {
            content.push(text(item.text));
            content.push(divider());
          });
        }
      }

      await setState({
        ...state,
        socialActivities,
        lastUpdatedActivities: diffArray,
      });

      if (content.length > 1) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: DialogType.Alert,
            content: panel(content),
          },
        });
      }

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

        if (filterByPlatforms(diffActivities, state).length > 0) {
          content.push(heading(`${activity.address}`));
          diffActivities.forEach((item) => {
            content.push(text(item.text));
            content.push(divider());
          });
        }
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
      await addWatchedProfilesToState();
      const { count, panelContent } = await buildNeedToNotifyContents();
      if (count > 0) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: DialogType.Alert,
            content: panelContent as any,
          },
        });
      }
      return true;
    }

    default:
      throw new Error(`Method:[${request.method}] not found.`);
  }
};
