import { Client, cacheExchange, fetchExchange, gql } from '@urql/core';
import CrossFetch from 'cross-fetch';
import { TRelationChainResult, type TProfile } from '../types';
import { Chain } from '..';

// only need handle, ownedBy and picture.
const QueryFollowing = gql`
  query Following(
    $address: EthereumAddress!
    $limit: LimitScalar!
    $cursor: Cursor
  ) {
    following(request: { address: $address, limit: $limit, cursor: $cursor }) {
      items {
        profile {
          handle
          ownedBy
          picture {
            ... on NftImage {
              contractAddress
              tokenId
              uri
              verified
            }
            ... on MediaSet {
              original {
                url
                width
                height
                mimeType
              }
            }
          }
        }
      }
      pageInfo {
        prev
        next
      }
    }
  }
`;

const QueryProfileByHandle = gql`
  query Profile($handle: Handle) {
    profile(request: { handle: $handle }) {
      id
      name
      ownedBy
    }
  }
`;

const QueryProfileByWalletAddress = gql`
  query Profile($address: EthereumAddress!) {
    defaultProfile(request: { ethereumAddress: $address }) {
      id
      name
      ownedBy
      handle
    }
  }
`;

// the urql client by lens API.
const client = new Client({
  url: 'https://api.lens.dev/',
  exchanges: [cacheExchange, fetchExchange],
  // issue from https://github.com/urql-graphql/urql/issues/1700
  fetch: CrossFetch,
});

/**
 * Format the lens api response to the standard format.
 *
 * @param data - The lens api response.
 * @returns The standard format.
 */
export const format = (data: any): TProfile[] => {
  const items = data?.following.items;
  if (!items) {
    return [];
  }

  const list: TProfile[] = items.map((item: any) => {
    const avatar = item.profile.picture?.original?.url || undefined;
    return {
      handle: item.profile.handle,
      address: item.profile.ownedBy,
      avatar,
    };
  });
  return list;
};

/**
 * Queries the Lens API for a user's following relation chain.
 *
 * @param handle - The user's handle.
 * @param limit - The pagination limit.
 * @param cursor - The cursor for pagination.
 * @returns An object containing the user's following relation chain information.
 */
const query = async (handle: string, limit: number, cursor?: string) => {
  const queryOptions = {
    address: handle,
    limit,
    cursor: cursor?.trim() || undefined,
  };
  const { data, error } = await client.query(QueryFollowing, queryOptions);
  return { data, error };
};

/**
 * Returns the user's wallet address.
 *
 * @param handle - The user's handle.
 */
export async function getAddressByHandle(handle: string) {
  if (handle.startsWith('0x') && handle.length === 42) {
    const { data } = await client.query(QueryProfileByWalletAddress, {
      address: handle,
    });
    if (data.defaultProfile?.handle) {
      return {
        walletAddress: handle,
        handle: data.defaultProfile.handle,
      };
    }
  }

  if (handle.endsWith('.lens')) {
    const { data } = await client.query(QueryProfileByHandle, { handle });
    if (data.profile?.ownedBy) {
      return {
        walletAddress: data.profile.ownedBy as `0x${string}`,
        handle,
      };
    }
  }

  return null;
}

/**
 * Returns an object containing information about a user's relation chain.
 *
 * @param handle - The user's handle.
 * @param limit - The pagination limit.
 * @param queryMethod - The query method.
 * @returns An object containing the user's relation chain information.
 */
export async function handler(
  handle: string,
  limit = 20,
  queryMethod: typeof query = query,
): Promise<TRelationChainResult> {
  const following: TProfile[] = [];
  let cursor: string | undefined;
  let hasNextPage = true;
  let errorMessage = '';

  const lendProfile = await getAddressByHandle(handle);

  if (lendProfile === null) {
    return {
      owner: handle,
      platform: Chain.Lens,
      status: false,
      message: `invalid handle: ${handle}, please check again.`,
    };
  }

  while (hasNextPage) {
    const { data, error } = await queryMethod(
      lendProfile.walletAddress,
      limit,
      cursor,
    );
    if (error) {
      errorMessage = error.message;
      hasNextPage = false;
      break;
    }
    const formattedData = format(data);
    following.push(...formattedData);
    if (!data?.following.pageInfo.next) {
      break;
    }
    cursor = data.following.pageInfo.next;
    if (cursor === null) {
      hasNextPage = false;
    }
  }

  return {
    owner: handle,
    platform: Chain.Lens,
    status: errorMessage === '',
    message: errorMessage || 'success',
    following,
  };
}
