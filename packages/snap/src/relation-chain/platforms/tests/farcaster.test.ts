import { Chain } from '../..';
import {
  getOwnerProfileByUsername,
  userByUsernameApi,
  getFollowingByFidApi,
  handler as FarcasterHandler,
} from '../farcaster';

const MOCK_HANDLE = 'henryqw';
const MOCK_USER_BY_USERNAME = {
  result: {
    user: {
      fid: 23901,
      username: 'henryqw',
      displayName: 'Henry',
      pfp: {
        url: 'https://i.imgur.com/W2qp6Rg.jpg',
        verified: false,
      },
      profile: {
        bio: {
          text: "I'm a little teapot who didn't fill out my bio",
          mentions: [],
        },
        location: {
          placeId: '',
          description: '',
        },
      },
      followerCount: 4,
      followingCount: 17,
      activeOnFcNetwork: false,
      viewerContext: {
        following: false,
        followedBy: false,
        canSendDirectCasts: false,
        hasUploadedInboxKeys: true,
      },
    },
    collectionsOwned: [],
    extras: {
      fid: 23901,
      custodyAddress: '0xe25228a6525a2090be824d66bdf6db8836ecc90c',
    },
  },
};
const MOCK_USER_BY_USERNAME_NOT_FOUND = {
  errors: [
    {
      message: 'No FID associated with username notfound',
    },
  ],
};
const MOCK_FOLLOWING = {
  result: {
    users: [
      {
        fid: 949,
        username: 'joshua',
        displayName: 'Joshua',
        pfp: {
          url: 'https://i.imgur.com/G09Ruv1.jpg',
          verified: false,
        },
        profile: {
          bio: {
            text: 'Founder at rss3',
            mentions: [],
          },
          location: {
            placeId: '',
            description: '',
          },
        },
        followerCount: 14,
        followingCount: 25,
        activeOnFcNetwork: false,
        viewerContext: {
          following: false,
          followedBy: false,
        },
      },
      {
        fid: 206,
        username: 'coopahtroopa',
        displayName: 'Coop',
        pfp: {
          url: 'https://i.imgur.com/UT9Q7Fl.jpg',
          verified: false,
        },
        profile: {
          bio: {
            text: 'Onchain in the new online',
            mentions: [],
          },
          location: {
            placeId: 'ChIJE9on3F3HwoAR9AhGJW_fL-I',
            description: 'Los Angeles, CA, USA',
          },
        },
        followerCount: 3209,
        followingCount: 52,
        activeOnFcNetwork: true,
        viewerContext: {
          following: false,
          followedBy: false,
        },
      },
      {
        fid: 557,
        username: 'pugson',
        displayName: 'pugson',
        pfp: {
          url: 'https://i.seadn.io/gae/5hjYfRyqiRJV4EQ7ieSJrmb1LtO_vcAvREXSqnlY4HXXBsvgh1vumOwj5e4GwGhppEU2jLC9qJHEgEkaJ9V_B02jIFY9XmzgK1_F?w=500&auto=format',
          verified: false,
        },
        profile: {
          bio: {
            text: '✦ 𝚆𝙸𝙿: @vision 👁️ ✦ ensdata.net ✦ abidata.net ✦ 𝙿𝚁𝙴𝚅: ui engineer @ rainbow  🌈  ✦ pug.eth',
            mentions: ['vision'],
          },
          location: {
            placeId: '',
            description: '',
          },
        },
        followerCount: 12213,
        followingCount: 1563,
        activeOnFcNetwork: true,
        referrerUsername: 'dwr.eth',
        viewerContext: {
          following: false,
          followedBy: false,
        },
      },
      {
        fid: 3,
        username: 'dwr.eth',
        displayName: 'Dan Romero',
        pfp: {
          url: 'https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA',
          verified: false,
        },
        profile: {
          bio: {
            text: 'Working on Farcaster and Warpcast.',
            mentions: [],
          },
          location: {
            placeId: 'ChIJE9on3F3HwoAR9AhGJW_fL-I',
            description: 'Los Angeles, CA, USA',
          },
        },
        followerCount: 16637,
        followingCount: 2684,
        activeOnFcNetwork: true,
        referrerUsername: 'farcaster',
        viewerContext: {
          following: false,
          followedBy: false,
        },
      },
    ],
  },
};

// mock fetch response
jest.spyOn(global, 'fetch').mockImplementation(
  jest.fn((url: string, init?: RequestInit) => {
    if (url === userByUsernameApi(MOCK_HANDLE)) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_USER_BY_USERNAME),
      });
    }

    if (url === userByUsernameApi('notfound')) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_USER_BY_USERNAME_NOT_FOUND),
      });
    }

    if (url === getFollowingByFidApi(23901)) {
      return Promise.resolve({
        json: () => Promise.resolve(MOCK_FOLLOWING),
      });
    }
    return fetch(url, init);
  }) as jest.Mock,
);

describe('getOwnerProfileByUsername', () => {
  it('should return the owner profile and include fid', async () => {
    const result = await getOwnerProfileByUsername(MOCK_HANDLE);
    expect(result).toStrictEqual({
      handle: MOCK_HANDLE,
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

  it('should return following', async () => {
    const resp = await FarcasterHandler(MOCK_HANDLE);
    expect(resp).toStrictEqual({
      owner: {
        avatar: 'https://i.imgur.com/W2qp6Rg.jpg',
        handle: 'henryqw',
      },
      platform: Chain.Farcaster,
      status: true,
      message: 'success',
      following: [
        { handle: 'joshua', avatar: 'https://i.imgur.com/G09Ruv1.jpg' },
        { handle: 'coopahtroopa', avatar: 'https://i.imgur.com/UT9Q7Fl.jpg' },
        {
          handle: 'pugson',
          avatar:
            'https://i.seadn.io/gae/5hjYfRyqiRJV4EQ7ieSJrmb1LtO_vcAvREXSqnlY4HXXBsvgh1vumOwj5e4GwGhppEU2jLC9qJHEgEkaJ9V_B02jIFY9XmzgK1_F?w=500&auto=format',
        },
        {
          handle: 'dwr.eth',
          avatar:
            'https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_256/https://lh3.googleusercontent.com/MyUBL0xHzMeBu7DXQAqv0bM9y6s4i4qjnhcXz5fxZKS3gwWgtamxxmxzCJX7m2cuYeGalyseCA2Y6OBKDMR06TWg2uwknnhdkDA1AA',
        },
      ],
    });
  });
});
