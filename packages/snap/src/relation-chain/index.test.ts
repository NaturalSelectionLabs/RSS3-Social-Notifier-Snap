import { expect } from '@jest/globals';
import { CombinedError } from '@urql/core';
import { handler as LensHandler, format as LensFormat } from './platforms/lens';
import { Chain } from '.';

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
        owner: MOCK_HANDLE,
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
        owner: 'dmoosocool.lens',
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
        owner: MOCK_HANDLE,
        platform: Chain.Lens,
        status: false,
        message: '[Network] Network error',
        following: [],
      });
    });
  });
});
