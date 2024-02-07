import React from 'react';
import { MetaMaskContext } from '@/hooks/MetamaskContext';
import { isLocalSnap } from '@/utils';
import { defaultSnapOrigin, isProduction } from '@/config';

export function useIsMetaMaskReady(): boolean {
  const [state] = React.useContext(MetaMaskContext);

  if (isLocalSnap(defaultSnapOrigin)) {
    return isProduction ? state.isMetaMask : state.isFlask;
  }

  return state.snapsDetected;
}
