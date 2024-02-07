import React from 'react';

import { MetaMaskContext } from '@/hooks/MetamaskContext';

export function useInstalledSnapVersion() {
  const [state] = React.useContext(MetaMaskContext);
  return state.installedSnap?.version ?? null;
}
