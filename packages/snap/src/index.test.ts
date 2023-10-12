import { installSnap } from '@metamask/snaps-jest';
import { expect } from '@jest/globals';
import { heading, panel, text } from '@metamask/snaps-ui';

const MOCK_ADDRESSES = [
  '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0', // dmoosocool.eth
  '0xc8b960d09c0078c18dcbe7eb9ab9d816bcca8944', // diygod.eth
];

describe('onRpcRequest', () => {
  describe('getAccounts', () => {
    it('returns the addresses granted access to by the user', async () => {
      const { request, close } = await installSnap();
      const response = await request({
        method: 'getAccounts',
      });
      // Currently, snaps-jest will always return this account.
      expect(response).toRespondWith([
        '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
      ]);
      await close();
    });
  });

  describe('fetchSocialCount', () => {
    it('fetch social count by account', async () => {
      const { request, close, mock } = await installSnap();
      const address = MOCK_ADDRESSES[0];
      const url = `https://api.rss3.io/v1/notes/${address}?tag=social`;
      await mock({
        url,
        response: {
          contentType: 'application/json',
          body: JSON.stringify({
            total: 100,
          }),
        },
      });
      const response = await request({
        method: 'fetchSocialCount',
        params: {
          accounts: [address],
        },
      });
      expect(response).toRespondWith([{ address, total: 100 }]);
      await close();
    });
  });

  describe('setState', () => {
    it('sets the state to the params', async () => {
      const { request, close } = await installSnap();
      expect(
        await request({
          method: 'setState',
          params: {
            socialCounts: [
              {
                address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
                total: 0,
              },
              {
                address: '0xc8b960d09c0078c18dcbe7eb9ab9d816bcca8944',
                total: 0,
              },
            ],
          },
        }),
      ).toRespondWith(true);

      expect(await request({ method: 'getState' })).toRespondWith({
        socialCounts: [
          {
            address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
            total: 0,
          },
          {
            address: '0xc8b960d09c0078c18dcbe7eb9ab9d816bcca8944',
            total: 0,
          },
        ],
      });

      await close();
    });
  });

  describe('getState', () => {
    it('returns the state if no state has been set', async () => {
      const { request, close } = await installSnap();
      const response = await request({
        method: 'getState',
      });

      expect(response).toRespondWith({
        socialCounts: [],
      });
      await close();
    });

    it('returns the state', async () => {
      const { request, close } = await installSnap();
      await request({
        method: 'setState',
        params: {
          socialCounts: [
            {
              address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
              total: 0,
            },
          ],
        },
      });

      const response = await request({ method: 'getState' });

      expect(response).toRespondWith({
        socialCounts: [
          {
            address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
            total: 0,
          },
        ],
      });

      await close();
    });
  });

  describe('clearState', () => {
    it('clear the state', async () => {
      const { request, close } = await installSnap();
      await request({
        method: 'setState',
        params: {
          socialCounts: [
            {
              address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
              total: 0,
            },
          ],
        },
      });

      expect(await request({ method: 'clearState' })).toRespondWith(true);
      expect(await request({ method: 'getState' })).toRespondWith({
        socialCounts: [],
      });

      await close();
    });
  });

  it('throws an error if the requested method does not exist', async () => {
    const { request, close } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'Internal JSON-RPC error.',
      data: {
        cause: {
          message: 'Method not found.',
          stack: expect.any(String),
        },
      },
    });

    await close();
  });
});

describe('onCronjob', () => {
  describe('execute', () => {
    it('shows a dialog', async () => {
      const { runCronjob } = await installSnap();
      const request = runCronjob({
        method: 'execute',
      });

      const ui = await request.getInterface();

      expect(ui).toRender(
        panel([
          heading('Social Count'),
          text('address: 0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf, count: 0'),
        ]),
      );

      await ui.ok();
      const response = await request;
      expect(response).toRespondWith(null);
    });
  });
});
