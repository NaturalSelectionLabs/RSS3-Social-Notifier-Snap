import { useContext } from 'react';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { connectSnap, getSnap } from '../utils';
import { HeaderButtons } from './Buttons';
import { RSS3Logo } from './RSS3Logo';

export const Header = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleConnectClick = async () => {
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
  };
  return (
    <div className="flex flex-row justify-between items-center p-4 border-b border-solid">
      <div className="flex flex-row items-center space-x-4">
        <a href="/" className="w-60">
          <RSS3Logo />
        </a>
      </div>
      <div className="flex flex-row items-center">
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
      </div>
    </div>
  );
};
