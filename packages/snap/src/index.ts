import {
  DialogType,
  OnCronjobHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import { State, clearState, getState, setState } from './state';

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
      const { socialCounts } = request.params as State;
      const state = await getState();
      await setState({
        ...state,
        socialCounts,
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
      const resultPromise = params.accounts.map(async (address) => {
        const resp = await getSocialCount(address);
        return {
          address,
          total: resp.total,
        };
      });
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

/**
 * Get social count by rss3.
 *
 * @param address - The wallet address.
 * @returns The social count.
 */
async function getSocialCount(address: string) {
  // https://api.rss3.io/v1/notes/dmoosocool.eth?tag=social
  const resp = await fetch(
    `https://api.rss3.io/v1/notes/${address}?tag=social`,
  );
  return await resp.json();
}

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'execute': {
      // return snap.request({
      //   method: 'snap_dialog',
      //   params: {
      //     type: 'alert',
      //     content: panel([
      //       heading('Cronjob'),
      //       text('This dialog was triggered by a cronjob.'),
      //     ]),
      //   },
      // });
      const accounts = await getAccounts();
      const resultPromise = accounts.map(async (address) => {
        const resp = await getSocialCount(address);
        return {
          address,
          total: resp.total,
        };
      });
      const socialCounts = await Promise.all(resultPromise);
      const state = await getState();

      // initial state
      if (state.socialCounts.length === 0) {
        await setState({
          socialCounts,
        });

        const content: any = [heading('Social Count')];
        socialCounts.forEach((socialCount) => {
          content.push(
            text(
              `address: ${socialCount.address}, count: ${socialCount.total}`,
            ),
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
      const changedSocialCounts = socialCounts.filter((socialCount) =>
        state.socialCounts.find(
          (item) =>
            item.address === socialCount.address &&
            item.total !== socialCount.total,
        ),
      );

      if (changedSocialCounts.length === 0) {
        // not need to notify.
        return true;
      }

      const content: any = [heading('Social Count')];
      changedSocialCounts.forEach((socialCount) => {
        content.push(
          text(`address: ${socialCount.address}, count: ${socialCount.total}`),
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

    default:
      throw new Error(`Method:[${request.method}] not found.`);
  }
};
