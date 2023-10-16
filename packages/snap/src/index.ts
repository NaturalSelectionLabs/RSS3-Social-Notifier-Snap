import {
  DialogType,
  OnCronjobHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-types';
import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';

import { State, clearState, getState, setState } from './state';
import { getSocialActivities } from './fetch';

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
    case 'setState': {
      const { socialActivities } = request.params as State;
      const state = await getState();
      await setState({
        ...state,
        socialActivities,
      });
      return true;
    }

    case 'getState': {
      return await getState();
    }

    case 'clearState': {
      await clearState();
      return true;
    }

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

    case 'getAccounts': {
      return await getAccounts();
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
      let accounts = await getAccounts();

      const stateAddress = state.socialActivities.map((item) =>
        item.address.toLocaleLowerCase(),
      );

      accounts = [
        ...new Set([
          ...stateAddress,
          ...accounts.map((item) => item.toLocaleLowerCase()),
        ]),
      ];

      const resultPromise = accounts.map(async (address) => {
        const resp = await getSocialActivities(address);
        return resp;
      });
      const socialActivities = await Promise.all(resultPromise);

      // initial state
      if (state.socialActivities.length === 0) {
        await setState({
          socialActivities,
        });

        const content: any = [heading('Social Count')];
        socialActivities.forEach((activity) => {
          content.push(
            text(`address: ${activity.address}, count: ${activity.total}`),
          );
        });

        return snap.request({
          method: 'snap_dialog',
          params: {
            type: DialogType.Alert,
            content: panel(content),
          },
        });
      }

      // filter the changed social count
      const changedSocialCounts = socialActivities.filter((activity) =>
        state.socialActivities.find(
          (item) =>
            item.address === activity.address && item.total !== activity.total,
        ),
      );

      if (changedSocialCounts.length === 0) {
        // not need to notify.
        return true;
      }

      await setState({
        socialActivities,
      });

      const content: any = [heading('Content from Readable Web3 by INDEX')];
      changedSocialCounts.forEach((activity, i) => {
        content.push(text(`${activity.address} has new feed`));

        activity.activities.split('|').forEach((item) => {
          content.push(text(item));
        });

        if (i !== changedSocialCounts.length) {
          content.push(divider());
        }
      });

      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel(content),
        },
      });
    }

    default:
      throw new Error(`Method:[${request.method}] not found.`);
  }
};
