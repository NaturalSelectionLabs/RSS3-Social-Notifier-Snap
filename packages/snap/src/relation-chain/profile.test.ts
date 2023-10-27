import { profileApi, getProfilesBySearch } from './profile';
import { Platform } from '.';

const MOCK_HANDLE = 'henryqw.eth';
const MOCK_PROFILES = {
  data: [
    {
      address: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
      handle: 'nothenry.csb',
      bio: "The awesome Henry's secondary account.",
      name: 'Not Henry',
      platform: 'Crossbell',
      network: 'crossbell',
      url: 'https://crossbell.io/@nothenry',
      profileURI: [
        'https://ipfs.io/ipfs/QmSX9QiwjTGBk5m22UscTg3vrbMwUfFsmxVzMH57hkPD5U/1021.png/',
      ],
    },
    {
      address: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
      handle: 'henryqw.csb',
      bio: 'A wealth of information creates a poverty of attention. - Herbert A. Simon',
      name: 'Henry',
      platform: 'Crossbell',
      network: 'crossbell',
      url: 'https://crossbell.io/@henryqw',
      profileURI: [
        'https://ipfs.io/ipfs/bafkreiados455ozxxvhdq3hug6zlnxmpreswebv6vi5q44xw6lsaulkrfm/',
      ],
    },
    {
      address: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
      handle: 'henryqw.eth',
      name: 'henryqw',
      platform: 'ENS Registrar',
      network: 'ethereum',
      expireAt: '2032-01-02T21:28:35Z',
    },
    {
      address: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
      handle: 'henryqw.lens',
      name: 'henryqw.lens',
      platform: 'Lens',
      network: 'polygon',
      url: 'https://lenster.xyz/u/henryqw.lens',
      profileURI: [
        'https://ipfs.io/ipfs/QmW8p2NuAEbuSgzGrR5zYXezQpyoMHHY3RwHTaCDLSUj5c',
      ],
    },
    {
      address: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
      handle: 'henryqw',
      bio: "I'm a little teapot who didn't fill out my bio",
      name: 'Henry',
      platform: 'Farcaster',
      network: 'farcaster',
      url: 'https://warpcast.com/henryqw',
    },
  ],
};

// mock fetch response
jest.spyOn(global, 'fetch').mockImplementation(
  jest.fn((url: string, init?: RequestInit) => {
    if (url === profileApi(MOCK_HANDLE)) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_PROFILES),
      });
    }

    return fetch(url, init);
  }) as jest.Mock,
);

describe('check query profile', () => {
  it('should return the profiles', async () => {
    const profiles = await getProfilesBySearch(MOCK_HANDLE);
    const filtered = MOCK_PROFILES.data.filter(
      (item) => item.platform in Platform,
    );
    expect(profiles).toStrictEqual(filtered);
  });
});
