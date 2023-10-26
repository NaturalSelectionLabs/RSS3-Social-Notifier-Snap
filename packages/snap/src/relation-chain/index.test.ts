import { expect } from '@jest/globals';
import { CombinedError } from '@urql/core';
import { handler as CrossbellHandler } from './platforms/crossbell';
import { LensHandler, LensFormat, Chain } from '.';

// const MOCK_ADDRESS = '0x7241dddec3a6af367882eaf9651b87e1c7549dff'; // stani.lens
// const MOCK_ADDRESS = '0x7ea1bb15c6d91827a37697c75b2eeee930c0c188'; // jeanayala.lens
const MOCK_HANDLE = '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0'; // dmoo.lens

describe('get following from relation chain', () => {
  describe('get following by lens', () => {
    it('should return following by query wallet address', async () => {
      const mockData = {
        following: {
          items: [
            {
              profile: {
                handle: 'henryqw.lens',
                ownedBy: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
              },
            },
            {
              profile: {
                handle: 'usagi.lens',
                ownedBy: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
                picture: {
                  original: {
                    url: 'https://ik.imagekit.io/lens/media-snapshot/bfa48a4324e29d62d46a27cbcfd506f9592021eaf063dbdfbaba90cbe9444c71.jpg',
                    width: null,
                    height: null,
                    mimeType: null,
                  },
                },
              },
            },
          ],
          pageInfo: {
            next: null,
          },
        },
      };
      const mockQueryMethod = async (
        _handle: string,
        _limit: number,
        _cursor?: string,
      ) => {
        const error: CombinedError | undefined = undefined;
        return {
          data: mockData as any,
          error,
        };
      };
      const result = await LensHandler(MOCK_HANDLE, 20, mockQueryMethod);
      expect(result).toStrictEqual({
        owner: {
          address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
          avatar:
            'https://ik.imagekit.io/lens/media-snapshot/f947319b5f4c063e88cda751fde67a259d96ecca1558db949696374f583fa3f2.png',
          handle: 'dmoosocool.lens',
        },
        platform: Chain.Lens,
        status: true,
        message: 'success',
        following: LensFormat(mockData),
      });

      expect(result.following).toHaveLength(2);
    });

    it('should return following by query handle', async () => {
      const mockData = {
        following: {
          items: [
            {
              profile: {
                handle: 'henryqw.lens',
                ownedBy: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
              },
            },
            {
              profile: {
                handle: 'usagi.lens',
                ownedBy: '0x827431510a5d249ce4fdb7f00c83a3353f471848',
                picture: {
                  original: {
                    url: 'https://ik.imagekit.io/lens/media-snapshot/bfa48a4324e29d62d46a27cbcfd506f9592021eaf063dbdfbaba90cbe9444c71.jpg',
                    width: null,
                    height: null,
                    mimeType: null,
                  },
                },
              },
            },
          ],
          pageInfo: {
            next: null,
          },
        },
      };
      const mockQueryMethod = async (
        _handle: string,
        _limit: number,
        _cursor?: string,
      ) => {
        const error: CombinedError | undefined = undefined;
        return {
          data: mockData as any,
          error,
        };
      };
      const result = await LensHandler('dmoosocool.lens', 20, mockQueryMethod);
      expect(result).toStrictEqual({
        owner: {
          address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
          avatar:
            'https://ik.imagekit.io/lens/media-snapshot/f947319b5f4c063e88cda751fde67a259d96ecca1558db949696374f583fa3f2.png',
          handle: 'dmoosocool.lens',
        },
        platform: Chain.Lens,
        status: true,
        message: 'success',
        following: LensFormat(mockData),
      });

      expect(result.following).toHaveLength(2);
    });

    it('should return error', async () => {
      const mockQueryMethod = async (
        _handle: string,
        _limit: number,
        _cursor?: string,
      ) => {
        const error: CombinedError | undefined = new CombinedError({
          networkError: new Error('Network error'),
        });
        return {
          data: null,
          error,
        };
      };
      const result = await LensHandler(MOCK_HANDLE, 20, mockQueryMethod);

      expect(result).toStrictEqual({
        owner: {
          address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
          avatar:
            'https://ik.imagekit.io/lens/media-snapshot/f947319b5f4c063e88cda751fde67a259d96ecca1558db949696374f583fa3f2.png',
          handle: 'dmoosocool.lens',
        },
        platform: Chain.Lens,
        status: false,
        message: '[Network] Network error',
        following: [],
      });
    });
  });

  describe('get following by crossbell', () => {
    const mockFollowing = [
      {
        address: '0x7eaf842d9a88db0372341150294f0285514f19ca',
        avatar:
          'ipfs://bafkreifhxbbfsfi2q636najxfdviqqljitd537ijynsdgcmsi55oiiz6we',
        handle: 'niracler.csb',
      },
      {
        address: '0xb461c1521ee9d96a9c950337f0851b79bd66cae1',
        avatar:
          'ipfs://bafkreid2sck4s4oydbzwyfyh4ebg4xgl2azhkm2ozwsg56gba2hqv7thve',
        handle: 'pseudoyu.csb',
      },
    ];

    const mockFetchFollowingMethod = async (_characterId: string) => {
      return mockFollowing;
    };

    it('should return following by query wallet address', async () => {
      const MOCK_CSB_WALLET_ADDRESS =
        '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0';
      const resp = await CrossbellHandler(
        MOCK_CSB_WALLET_ADDRESS,
        mockFetchFollowingMethod,
      );
      expect(resp).toStrictEqual({
        owner: {
          handle: 'dmoo.csb',
          address: '0xe584ca8f30b93b3ed47270297a3e920e2d6d25f0',
          avatar:
            'ipfs://bafkreih4o2egau6vewd6xjyklalp5emtcwdtwglgefiypbstqovpqevkn4',
        },
        platform: Chain.Crossbell,
        status: true,
        message: 'success',
        following: mockFollowing,
      });
    });

    it('should return following by query handle', async () => {
      const MOCK_CSB_HANDLE = 'dmoo.csb';
      const resp = await CrossbellHandler(
        MOCK_CSB_HANDLE,
        mockFetchFollowingMethod,
      );

      expect(resp).toStrictEqual({
        owner: {
          address: '0xe584ca8f30b93b3ed47270297a3e920e2d6d25f0',
          avatar:
            'ipfs://bafkreih4o2egau6vewd6xjyklalp5emtcwdtwglgefiypbstqovpqevkn4',
          handle: 'dmoo.csb',
        },
        platform: Chain.Crossbell,
        status: true,
        message: 'success',
        following: mockFollowing,
      });
    });
  });
});
