import { installSnap } from '@metamask/snaps-jest';
import { expect } from '@jest/globals';
import {
  CrossbellHandler,
  CrossbellFormat,
  type TCSBProfile,
  Platform,
} from '../..';
import { SocialMonitor, State } from '../../../state';

const MOCK_CSB_WALLET_ADDRESS = '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0';
const MOCK_CSB_FOLLOWING_LIST = [
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
describe('get following by crossbell', () => {
  const mockFetchFollowingMethod = async (_characterId: string) => {
    return CrossbellFormat(MOCK_CSB_FOLLOWING_LIST as unknown as TCSBProfile[]);
  };

  it('should return following by query wallet address', async () => {
    const { request } = await installSnap();
    const response = await request({ method: 'getState' });
    const currentMonitor =
      (response as unknown as State).monitor?.find(
        (item) => item.search === MOCK_CSB_WALLET_ADDRESS,
      ) ?? ({ search: MOCK_CSB_WALLET_ADDRESS } as SocialMonitor);

    const resp = await CrossbellHandler(
      MOCK_CSB_WALLET_ADDRESS,
      currentMonitor ?? ({ search: MOCK_CSB_WALLET_ADDRESS } as SocialMonitor),
      mockFetchFollowingMethod,
    );
    expect(resp).toStrictEqual({
      owner: {
        handle: 'dmoo.csb',
        address: '0xe584ca8f30b93b3ed47270297a3e920e2d6d25f0',
        avatar:
          'ipfs://bafkreid5l4tpl2sefl4sgtmv44ksgsbf56lpzxlh6nbpdmqnclnuw6hu6q',
      },
      platform: Platform.Crossbell,
      status: true,
      message: 'success',
      following: CrossbellFormat(
        MOCK_CSB_FOLLOWING_LIST as unknown as TCSBProfile[],
      ),
    });
  });

  it('should return following by query handle', async () => {
    const MOCK_CSB_HANDLE = 'dmoo.csb';
    const { request } = await installSnap();
    const response = await request({ method: 'getState' });
    const currentMonitor =
      (response as unknown as State).monitor?.find(
        (item) => item.search === MOCK_CSB_HANDLE,
      ) ?? ({ search: MOCK_CSB_HANDLE } as SocialMonitor);

    const resp = await CrossbellHandler(
      MOCK_CSB_HANDLE,
      currentMonitor ?? ({ search: MOCK_CSB_HANDLE } as SocialMonitor),
      mockFetchFollowingMethod,
    );

    expect(resp).toStrictEqual({
      owner: {
        address: '0xe584ca8f30b93b3ed47270297a3e920e2d6d25f0',
        avatar:
          'ipfs://bafkreid5l4tpl2sefl4sgtmv44ksgsbf56lpzxlh6nbpdmqnclnuw6hu6q',
        handle: 'dmoo.csb',
      },
      platform: Platform.Crossbell,
      status: true,
      message: 'success',
      following: CrossbellFormat(
        MOCK_CSB_FOLLOWING_LIST as unknown as TCSBProfile[],
      ),
    });
  });
});
