import { Platform } from '../state';

/**
 * Get the display name for a platform.
 *
 * @param platform - The platform to get the display name for.
 * @returns The display name for the platform.
 */
export function getPlatformDisplayName(platform: Platform): string {
  switch (platform) {
    case Platform.Crossbell:
      return 'Crossbell';
    case Platform.Farcaster:
      return 'Farcaster';
    case Platform.Lens:
      return 'Lens Protocol';
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
