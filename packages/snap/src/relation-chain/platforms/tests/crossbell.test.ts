import { expect } from '@jest/globals';
import {
  CrossbellHandler,
  CrossbellFormat,
  type TCSBProfile,
  Chain,
} from '../..';

describe('get following by crossbell', () => {
  const mockFollowing = [
    {
      owner: '0x7eaf842d9a88db0372341150294f0285514f19ca',
      metadata: {
        uri: 'ipfs://bafkreifhxbbfsfi2q636najxfdviqqljitd537ijynsdgcmsi55oiiz6we',
      },
      handle: 'niracler',
    },
    {
      address: '0xb461c1521ee9d96a9c950337f0851b79bd66cae1',
      metadata: {
        uri: 'ipfs://bafkreid2sck4s4oydbzwyfyh4ebg4xgl2azhkm2ozwsg56gba2hqv7thve',
      },
      handle: 'pseudoyu',
    },
  ];

  const mockFetchFollowingMethod = async (_characterId: string) => {
    return CrossbellFormat(mockFollowing as unknown as TCSBProfile[]);
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
      following: CrossbellFormat(mockFollowing as unknown as TCSBProfile[]),
    });
  });

  it('should return following by query handle', async () => {
    const MOCK_CSB_HANDLE = 'dmoo.csb';
    const resp = await CrossbellHandler(
      MOCK_CSB_HANDLE,
      mockFetchFollowingMethod,
    );

    const following = CrossbellFormat(
      mockFollowing as unknown as TCSBProfile[],
    );
    console.log(following);

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
      following: CrossbellFormat(mockFollowing as unknown as TCSBProfile[]),
    });
  });
});
