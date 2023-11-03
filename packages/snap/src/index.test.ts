import { installSnap } from '@metamask/snaps-jest';
import { expect } from '@jest/globals';
import { type Activity } from '@rss3/js-sdk';
import { format, getSocialActivitiesUrl } from './fetch';

const DEFAULT_WALLET_ADDRESS = '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf';
const MOCK_ADDRESSES = [
  '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0', // dmoosocool.eth
  '0xc8b960d09c0078c18dcbe7eb9ab9d816bcca8944', // diygod.eth
];
const mockData = {
  data: [
    {
      owner: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
      id: '0x9d75a18af694dc99913210360a0c1d64e57c132b3a225112efef0acb7b6560ef',
      network: 'crossbell',
      from: '0xBBC2918C9003D264c25EcAE45B44a846702C0E7c',
      to: '0xa6f969045641Cf486a747A2688F3a5A6d43cd0D8',
      tag: 'social',
      type: 'post',
      platform: 'Crossbell',
      status: 'successful',
      direction: 'out',
      feeValue: '0.000126867',
      actions: [
        {
          tag: 'social',
          type: 'post',
          platform: 'xlog',
          from: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
          to: '0xa6f969045641Cf486a747A2688F3a5A6d43cd0D8',
          metadata: {
            handle: 'dmoo.csb',
            title: 'test',
            body: 'test',
            profile_id: '391',
            publication_id: '6',
            content_uri:
              'ipfs://bafkreiamnrwvdprs2tu3rgxvxxe7zififuo7sdwdsr36z3qe57jd755bs4',
            author_url: 'https://crossbell.io/@dmoo',
          },
          related_urls: [
            'https://crossbell.io/notes/391-6',
            'https://scan.crossbell.io/tx/0x9d75a18af694dc99913210360a0c1d64e57c132b3a225112efef0acb7b6560ef',
          ],
        },
      ],
      timestamp: 1697101313,
    },
  ],
  meta: {
    cursor:
      '0x9d75a18af694dc99913210360a0c1d64e57c132b3a225112efef0acb7b6560ef:crossbell',
  },
};
const mockActivities = mockData.data.map((item: unknown) => {
  return {
    id: (item as Activity).id,
    text: format(item as Activity).join(''),
  };
});
describe('onRpcRequest', () => {
  describe('getAccounts', () => {
    it('returns the addresses granted access to by the user', async () => {
      const { request, close } = await installSnap();
      const response = await request({
        method: 'getAccounts',
      });
      // Currently, snaps-jest will always return this account.
      expect(response).toRespondWith([DEFAULT_WALLET_ADDRESS]);
      await close();
    });
  });

  describe('fetchSocialCount', () => {
    it('fetch social count by account', async () => {
      const { request, close, mock } = await installSnap();
      const address = MOCK_ADDRESSES[0];
      const url = getSocialActivitiesUrl(address);
      mock({
        url,
        response: {
          contentType: 'application/json',
          body: JSON.stringify(mockData),
        },
      });

      const resp = {
        address,
        activities: mockActivities,
        total: mockData.data.length,
      };
      const response = await request({
        method: 'fetchSocialCount',
        params: {
          accounts: [address],
        },
      });
      expect(response).toRespondWith([resp]);
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
            socialActivities: [
              {
                address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
                activities: '',
                total: 0,
              },
              {
                address: '0xc8b960d09c0078c18dcbe7eb9ab9d816bcca8944',
                activities: '',
                total: 0,
              },
            ],
            lastUpdatedActivities: [],
          },
        }),
      ).toRespondWith(true);

      expect(await request({ method: 'getState' })).toRespondWith({
        lastUpdatedActivities: [],
        monitor: [],
        socialActivities: [
          {
            activities: '',
            address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
            total: 0,
          },
          {
            activities: '',
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
        lastUpdatedActivities: [],
        monitor: [],
        socialActivities: [],
      });
      await close();
    });

    it('returns the state', async () => {
      const { request, close } = await installSnap();
      await request({
        method: 'setState',
        params: {
          socialActivities: [
            {
              address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
              activities: mockData.data,
              total: mockData.data.length,
            },
          ],
          lastUpdatedActivities: [],
        },
      });

      const response = await request({ method: 'getState' });

      expect(response).toRespondWith({
        socialActivities: [
          {
            address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
            activities: mockData.data,
            total: mockData.data.length,
          },
        ],
        monitor: [],
        lastUpdatedActivities: [],
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
          socialActivities: [
            {
              address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
              activities: mockData,
              total: 0,
            },
          ],
          lastUpdatedActivities: [],
        },
      });

      expect(await request({ method: 'clearState' })).toRespondWith(true);
      expect(await request({ method: 'getState' })).toRespondWith({
        socialActivities: [],
        lastUpdatedActivities: [],
        monitor: [],
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
    it('defaults to not showing a dialog', async () => {
      const { runCronjob } = await installSnap();
      expect(
        await runCronjob({
          method: 'execute',
        }),
      ).toRespondWith({ result: false, message: 'No accounts' });
    });

    it('not update state if no new feed', async () => {
      const { runCronjob, request, mock } = await installSnap();

      // mock to add own wallet addresses
      await request({
        method: 'addOwnWalletAddresses',
      });
      const state = await request({ method: 'getState' });
      expect(state).toRespondWith({
        socialActivities: [
          {
            activities: [],
            address: DEFAULT_WALLET_ADDRESS,
            total: 0,
          },
        ],
        monitor: [],
        lastUpdatedActivities: [],
      });

      // mock to fetched social activities
      const url = getSocialActivitiesUrl(DEFAULT_WALLET_ADDRESS);
      mock({
        url,
        response: {
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        },
      });

      expect(
        await runCronjob({
          method: 'execute',
        }),
      ).toRespondWith({
        cached: [
          {
            activities: [],
            address: '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
            total: 0,
          },
        ],
        data: [
          {
            activities: [],
            address: '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
            total: 0,
          },
        ],
        message: 'No new feed',
        result: false,
      });
    });

    it('shows a dialog', async () => {
      const { request, runCronjob, mock } = await installSnap();
      // mock to add own wallet addresses
      await request({
        method: 'addOwnWalletAddresses',
      });
      const state = await request({ method: 'getState' });
      expect(state).toRespondWith({
        socialActivities: [
          {
            address: DEFAULT_WALLET_ADDRESS,
            activities: [],
            total: 0,
          },
        ],
        lastUpdatedActivities: [],
        monitor: [],
      });

      const execute = runCronjob({
        method: 'executeForTest',
      });

      // mock to fetched social activities
      const url = getSocialActivitiesUrl(DEFAULT_WALLET_ADDRESS);
      mock({
        url,
        response: {
          contentType: 'application/json',
          body: JSON.stringify(mockData),
        },
      });
      const response = await execute;

      expect(await request({ method: 'getState' })).toRespondWith({
        lastUpdatedActivities: [
          {
            activities: [
              {
                id: '0x9d75a18af694dc99913210360a0c1d64e57c132b3a225112efef0acb7b6560ef',
                text: 'dmoo.csb published a post "test" on xlog Oct 12, 2023',
              },
            ],
            address: '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
            total: 1,
          },
        ],
        monitor: [],
        socialActivities: [
          {
            activities: [
              {
                id: '0x9d75a18af694dc99913210360a0c1d64e57c132b3a225112efef0acb7b6560ef',
                text: 'dmoo.csb published a post "test" on xlog Oct 12, 2023',
              },
            ],
            address: '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
            total: 1,
          },
        ],
      });

      expect(response).toRespondWith({
        content: {
          children: [
            { type: 'heading', value: 'New Social Count' },
            {
              type: 'heading',
              value: '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
            },
            {
              type: 'text',
              value: 'dmoo.csb published a post "test" on xlog Oct 12, 2023',
            },
            { type: 'divider' },
          ],
          type: 'panel',
        },
        result: true,
      });
    });
  });
});
