import React, { useContext } from 'react';

import { connectSnap, getSnap } from '@/utils';
import { MetamaskActions, MetaMaskContext } from '@/hooks/MetamaskContext';

export function useInstallSnap() {
  const [, dispatch] = useContext(MetaMaskContext);

  return React.useCallback(async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  }, []);
}
