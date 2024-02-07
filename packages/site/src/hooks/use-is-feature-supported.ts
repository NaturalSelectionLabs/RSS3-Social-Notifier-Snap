import React from 'react';
import { compareVersions } from 'compare-versions';

import { useIsMetaMaskReady } from '@/hooks/use-is-meta-mask-ready';
import { type FeatureToCheck, isFeatureSupported } from '@/utils';
import { useInstalledSnapVersion } from '@/hooks/use-installed-snap-version';

export function useIsFeatureSupported(feature: FeatureToCheck) {
  const isMetaMaskReady = useIsMetaMaskReady();
  const [isSupported, setIsSupported] = React.useState<boolean>(false);
  const installedSnapVersion = useInstalledSnapVersion();

  React.useEffect(() => {
    if (
      isMetaMaskReady &&
      installedSnapVersion &&
      compareVersions(installedSnapVersion, '0.1.13') > 0
    ) {
      isFeatureSupported(feature).then(setIsSupported);
    }
  }, [isMetaMaskReady, feature, installedSnapVersion]);

  return isSupported;
}
