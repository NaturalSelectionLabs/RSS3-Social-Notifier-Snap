import { divider, heading, panel, text } from '@metamask/snaps-ui';
import { SocialMonitor } from '../state';
import { Platform } from '..';

describe('check query profile', () => {
  it('should return the profiles', async () => {
    const monitors: SocialMonitor[] = [
      {
        search: 'henryqw.eth',
        profiles: [
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
        ],
        latestUpdateTime: '2023/10/31 06:00:00',
        watchedProfiles: [
          {
            owner: {
              handle: 'henryqw.lens',
              address: '0x827431510a5D249cE4fdB7F00C83a3353F471848',
              avatar:
                'https://ik.imagekit.io/lens/media-snapshot/2b02c7846b00ac1923659e2a559ec597c83da5a82f232368047647d1ec8b3835.png',
            },
            platform: Platform.Lens,
            status: true,
            message: 'success',
            following: [
              {
                handle: 'vitalik.lens',
                address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
                avatar:
                  'https://ik.imagekit.io/lens/media-snapshot/d2762e3b5f2532c648feec96bf590923ea6c3783fee428cbb694936ce62962e0.jpg',
                activities: [
                  {
                    id: '0x000000000000000000000000adddbb314369cba162d10a997c2487d3583124c9',
                    text: 'vitalik.eth published a post "Different types of layer 2s" on Farcaster Oct 31, 2023',
                    owner: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
                  },
                ],
                lastActivities: [
                  {
                    id: '0x000000000000000000000000adddbb314369cba162d10a997c2487d3583124c9',
                    text: 'vitalik.eth published a post "Different types of layer 2s" on Farcaster Oct 31, 2023',
                    owner: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
                  },
                ],
              },
              {
                handle: 'dmoosocool.lens',
                address: '0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0',
                avatar:
                  'https://ik.imagekit.io/lens/media-snapshot/f947319b5f4c063e88cda751fde67a259d96ecca1558db949696374f583fa3f2.png',
                activities: [],
                lastActivities: [],
              },
              {
                handle: 'brucexc.lens',
                address: '0x23c46e912b34C09c4bCC97F4eD7cDd762cee408A',
                avatar:
                  'https://ik.imagekit.io/lens/media-snapshot/76c6afcf170723465c2cb3b1494367b8d7a683fbfbb04f2210524bef2d4fca48.png',
                activities: [],
                lastActivities: [],
              },
              {
                handle: 'lensprotocol',
                address: '0x05092cF69BDD435f7Ba4B8eF97c9CAecF2BA69AD',
                avatar:
                  'https://ik.imagekit.io/lens/media-snapshot/6d21d1544a4c303a3a407b9756071386955b76a3b091fded5731ca049604994a.png',
                activities: [],
                lastActivities: [],
              },
              {
                handle: 'stani.lens',
                address: '0x7241DDDec3A6aF367882eAF9651b87E1C7549Dff',
                avatar:
                  'https://ik.imagekit.io/lens/media-snapshot/e3adfb7046a549480a92c63de2d431f1ced8e516ea285970267c4dc24f941856.png',
                activities: [],
                lastActivities: [],
              },
              {
                handle: 'usagi.lens',
                address: '0xDA048BED40d40B1EBd9239Cdf56ca0c2F018ae65',
                avatar:
                  'https://ik.imagekit.io/lens/media-snapshot/bfa48a4324e29d62d46a27cbcfd506f9592021eaf063dbdfbaba90cbe9444c71.jpg',
                activities: [],
                lastActivities: [],
              },
            ],
          },
        ],
      },
    ];

    const content: any[] = [];
    monitors.forEach((item) => {
      item.watchedProfiles?.forEach((profile) => {
        const lastActivities = profile.following?.flatMap(
          (follower) =>
            follower.lastActivities?.map((activity) => activity.text) ?? [],
        );
        lastActivities?.length &&
          content.push(
            heading(`${profile.owner.handle}'s frens has new activities.`),
            text(lastActivities.join('\n')),
            divider(),
          );
      });
    });

    expect(panel(content)).toStrictEqual({
      children: [
        { type: 'heading', value: "henryqw.lens's frens has new activities." },
        {
          type: 'text',
          value:
            'vitalik.eth published a post "Different types of layer 2s" on Farcaster Oct 31, 2023',
        },
        { type: 'divider' },
      ],
      type: 'panel',
    });
  });
});
