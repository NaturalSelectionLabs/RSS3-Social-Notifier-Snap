import { installSnap } from '@metamask/snaps-jest';
import { Platform } from '../..';
import {
  getOwnerProfileByUsername,
  userByUsernameApi,
  getFollowingByFidApi,
  format as FarcasterFormat,
  handler as FarcasterHandler,
  getFollowingByFidFromFarcaster,
  // type TFarcasterUser,
  // type TFarcasterError,
} from '../farcaster';
import { SocialMonitor, State } from '../../../state';
import {
  MOCK_USER_BY_USERNAME,
  MOCK_USER_BY_USERNAME_NOT_FOUND,
  MOCK_USER_BY_USERNAME_JOSHUA,
  MOCK_USER_BY_USERNAME_COOPAHTROOPA,
  MOCK_USER_BY_USERNAME_PUGSON,
  MOCK_USER_BY_USERNAME_DWR,
  MOCK_FOLLOWING,
  FARCASTER_FOLLOWING_ACTIVITIES,
} from './mocks/farcaster.data';

const MOCK_HANDLE = 'henryqw';
// mock fetch response
jest.spyOn(global, 'fetch').mockImplementation(
  jest.fn((url: string, init?: RequestInit) => {
    // mock user
    if (url === userByUsernameApi(MOCK_HANDLE)) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_USER_BY_USERNAME),
      });
    }

    // mock not found user
    if (url === userByUsernameApi('notfound')) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_USER_BY_USERNAME_NOT_FOUND),
      });
    }

    // mock request following from henryqw by farcaster api.
    if (url === getFollowingByFidApi(23901)) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_FOLLOWING),
      });
    }

    // mock request following list farcaster profile.
    if (url === userByUsernameApi('joshua')) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_USER_BY_USERNAME_JOSHUA),
      });
    }

    if (url === userByUsernameApi('coopahtroopa')) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_USER_BY_USERNAME_COOPAHTROOPA),
      });
    }

    if (url === userByUsernameApi('pugson')) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_USER_BY_USERNAME_PUGSON),
      });
    }

    if (url === userByUsernameApi('dwr.eth')) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_USER_BY_USERNAME_DWR),
      });
    }

    // mock request following new activities from rss3 api.
    if (url === 'https://testnet.rss3.io/data/accounts/activities') {
      if (
        init &&
        ((JSON.parse(init.body as string) as any).account as string[]).every(
          (item) =>
            [
              '0xcd7511cf1356950984846dfb37c0b7c36f14fec5',
              '0x2c4832db7f6eccbb4d32ee29456d0caa20673200',
              '0xd7648b9d940e051b76fc7d755138159e6ce2436e',
              '0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1',
            ].includes(item),
        )
      ) {
        return Promise.resolve({
          json: () => Promise.resolve(FARCASTER_FOLLOWING_ACTIVITIES),
        });
      }
    }

    // other url
    return console.log(url, init); // fetch(url, init);
  }) as jest.Mock,
);

describe('getOwnerProfileByUsername', () => {
  it('should return the owner profile and include fid', async () => {
    const result = await getOwnerProfileByUsername(MOCK_HANDLE);
    expect(result).toStrictEqual({
      handle: MOCK_HANDLE,
      address: '0xe25228a6525a2090be824d66bdf6db8836ecc90c',
      avatar: 'https://i.imgur.com/W2qp6Rg.jpg',
      bio: "I'm a little teapot who didn't fill out my bio",
      fid: 23901,
      followerCount: 4,
      followingCount: 17,
    });
  });

  it('should return handle if not found', async () => {
    const result = await getOwnerProfileByUsername('notfound');
    expect(result).toStrictEqual({
      handle: 'notfound',
    });
  });

  it('should return following by farcaster', async () => {
    const result = await getFollowingByFidFromFarcaster(23901);
    expect(result).toStrictEqual(MOCK_FOLLOWING.result.users);
  });

  it('should return following format', async () => {
    const farcasterUsers = MOCK_FOLLOWING.result.users;
    // const profiles: TProfile[] = [];

    const profiles = await FarcasterFormat(farcasterUsers);
    expect(profiles).toStrictEqual([
      {
        address: '0xcd7511cf1356950984846dfb37c0b7c36f14fec5',
        handle: 'joshua',
        avatar: 'https://i.imgur.com/G09Ruv1.jpg',
      },

      {
        address: '0x2c4832db7f6eccbb4d32ee29456d0caa20673200',
        handle: 'coopahtroopa',
        avatar: 'https://i.imgur.com/UT9Q7Fl.jpg',
      },

      {
        address: '0xd7648b9d940e051b76fc7d755138159e6ce2436e',
        handle: 'pugson',
        avatar:
          'https://i.seadn.io/gae/5hjYfRyqiRJV4EQ7ieSJrmb1LtO_vcAvREXSqnlY4HXXBsvgh1vumOwj5e4GwGhppEU2jLC9qJHEgEkaJ9V_B02jIFY9XmzgK1_F?w=500&auto=format',
      },

      {
        address: '0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1',
        handle: 'dwr.eth',
        avatar:
          'https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA',
      },
    ]);
  });

  it('should return following by full', async () => {
    const { request } = await installSnap();
    const response = await request({ method: 'getState' });
    const currentMonitor =
      (response as unknown as State).monitor?.find(
        (item) => item.search === MOCK_HANDLE,
      ) ?? ({ search: MOCK_HANDLE } as SocialMonitor);

    const resp = await FarcasterHandler(MOCK_HANDLE, currentMonitor);
    expect(resp).toStrictEqual({
      owner: {
        avatar: 'https://i.imgur.com/W2qp6Rg.jpg',
        handle: 'henryqw',
        address: '0xe25228a6525a2090be824d66bdf6db8836ecc90c',
      },
      platform: Platform.Farcaster,
      status: true,
      message: 'success',
      following: [
        {
          activities: [],
          lastActivities: [],
          address: '0xcd7511cf1356950984846dfb37c0b7c36f14fec5',
          handle: 'joshua',
          avatar: 'https://i.imgur.com/G09Ruv1.jpg',
        },
        {
          activities: [
            {
              id: '0x000000000000000000000000426397e4de8587cdc7360dfb61efb41f7fad023f',
              owner: '0x2C4832DB7F6eCCbb4d32EE29456d0CAa20673200',
              text: 'coopahtroopa published a post "Do you ever feel like we’re all just here because ..." on Farcaster',
            },
            {
              id: '0x00000000000000000000000030ffd796796e24c53372078fefef6753cbdc446c',
              owner: '0x2C4832DB7F6eCCbb4d32EE29456d0CAa20673200',
              text: 'coopahtroopa made a comment "Incredible. Thank you so sharing!" on Farcaster',
            },
          ],
          lastActivities: [
            {
              id: '0x000000000000000000000000426397e4de8587cdc7360dfb61efb41f7fad023f',
              owner: '0x2C4832DB7F6eCCbb4d32EE29456d0CAa20673200',
              text: 'coopahtroopa published a post "Do you ever feel like we’re all just here because ..." on Farcaster',
            },
            {
              id: '0x00000000000000000000000030ffd796796e24c53372078fefef6753cbdc446c',
              owner: '0x2C4832DB7F6eCCbb4d32EE29456d0CAa20673200',
              text: 'coopahtroopa made a comment "Incredible. Thank you so sharing!" on Farcaster',
            },
          ],
          address: '0x2c4832db7f6eccbb4d32ee29456d0caa20673200',
          handle: 'coopahtroopa',
          avatar: 'https://i.imgur.com/UT9Q7Fl.jpg',
        },
        {
          activities: [],
          lastActivities: [],
          address: '0xd7648b9d940e051b76fc7d755138159e6ce2436e',
          handle: 'pugson',
          avatar:
            'https://i.seadn.io/gae/5hjYfRyqiRJV4EQ7ieSJrmb1LtO_vcAvREXSqnlY4HXXBsvgh1vumOwj5e4GwGhppEU2jLC9qJHEgEkaJ9V_B02jIFY9XmzgK1_F?w=500&auto=format',
        },
        {
          activities: [
            {
              id: '0x000000000000000000000000340c22cb04e56c029d4d33b39d40337fa90e7e9b',
              owner: '0x6b0bdA3f2fFEd5efc83fa8c024acfF1Dd45793f1',
              text: 'dwr.eth published a post "Hello! Noticing a lot of Vietnamese speakers on Fa..." on Farcaster',
            },
          ],
          lastActivities: [
            {
              id: '0x000000000000000000000000340c22cb04e56c029d4d33b39d40337fa90e7e9b',
              owner: '0x6b0bdA3f2fFEd5efc83fa8c024acfF1Dd45793f1',
              text: 'dwr.eth published a post "Hello! Noticing a lot of Vietnamese speakers on Fa..." on Farcaster',
            },
          ],
          address: '0x6b0bda3f2ffed5efc83fa8c024acff1dd45793f1',
          handle: 'dwr.eth',
          avatar:
            'https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA',
        },
      ],
    });
  });
});
