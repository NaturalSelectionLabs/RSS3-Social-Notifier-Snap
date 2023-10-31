/**
 * Returns an array of supported namespaces.
 *
 * @returns An array of supported namespaces.
 */
export function getSupportedNS() {
  return [
    '.eth',
    '.lens',
    '.csb',
    '.bnb',
    '.bit',
    '.crypto',
    '.zil',
    '.nft',
    '.x',
    '.wallet',
    '.bitcoin',
    '.dao',
    '.888',
    '.blockchain',
    '.avax',
    '.arb',
    '.cyber',
  ];
}

/**
 * Checks if the given string is a valid Ethereum wallet address.
 *
 * @param address - The address to check.
 * @returns A boolean indicating whether the address is valid or not.
 */
export function isValidWalletAddress(address: string) {
  return address.startsWith('0x') && address.length === 42;
}

/**
 * Checks if the given handle is supported.
 *
 * @param handle - The handle to check.
 * @returns A boolean indicating whether the namespace is supported or not.
 */
export function isSupportedNS(handle: string) {
  if (!handle.includes('.')) {
    return false;
  }
  // get ns from handle
  const ns = `.${handle.split('.').pop()}`;
  return getSupportedNS().includes(ns);
}
