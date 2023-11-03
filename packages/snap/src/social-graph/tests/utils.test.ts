import { isValidWalletAddress, isSupportedNS } from '../utils';

describe('check utils', () => {
  it('should return true when address is valid', () => {
    expect(
      isValidWalletAddress('0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f0'),
    ).toBe(true);
  });

  it('should return false when address is invalid', () => {
    expect(
      isValidWalletAddress('0xE584Ca8F30b93b3Ed47270297a3E920e2D6D25f'),
    ).toBe(false);
  });

  it('should return true when handle is supported', () => {
    expect(isSupportedNS('dmoosocool.eth')).toBe(true);
  });

  it('should return false when handle is not supported', () => {
    expect(isSupportedNS('dmoosocool')).toBe(false);
  });
});
