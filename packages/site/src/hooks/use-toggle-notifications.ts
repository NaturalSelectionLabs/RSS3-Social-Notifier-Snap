import React from 'react';
import { useIsMetaMaskReady } from '@/hooks/use-is-meta-mask-ready';
import { getPlatformInfos, togglePlatform } from '@/utils';
import { Platform, PlatformInfo } from '@/types';

export function useToggleNotifications(deps: React.DependencyList = []) {
  const isMetaMaskReady = useIsMetaMaskReady();
  const [platforms, setPlatforms] = React.useState<PlatformInfo[]>([]);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const toggle = React.useCallback(
    async (platformId: Platform, enabled?: boolean) => {
      try {
        const platform = platforms.find((p) => p.id === platformId);
        const enabled_ = enabled ?? !platform?.enabled;

        if (!platform) {
          throw new Error(`Platform ${platformId} not found`);
        }

        setIsUpdating(true);
        await togglePlatform(platform.id, enabled_);
        setPlatforms(await getPlatformInfos());
      } catch (e) {
        console.error(e);
      } finally {
        setIsUpdating(false);
      }
    },
    [platforms],
  );

  React.useEffect(() => {
    if (isMetaMaskReady) {
      getPlatformInfos().then(setPlatforms);
    }
  }, [isMetaMaskReady, ...deps]);

  return {
    platforms,
    toggle,
    isUpdating,
  };
}
