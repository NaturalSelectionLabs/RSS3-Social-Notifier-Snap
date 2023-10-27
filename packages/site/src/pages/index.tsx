import { useContext, useState } from 'react';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  // addOwnWalletAddress,
  connectSnap,
  getSnap,
  isLocalSnap,
  sendClearState,
  sendGetState,
  sendSetState,
  shouldDisplayReconnectButton,
  showAlert,
  showAllActivities,
  showAllMonitoredAddresses,
  showLastUpdated,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
  // Button,
} from '../components';
import { defaultSnapOrigin } from '../config';
import { Button } from '@/components/ui/button';

const supportedNSList = [
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
const isValidNS = (handle: string | null) => {
  if (!handle) {
    return false;
  }
  let valid = false;
  supportedNSList.forEach((ns) => {
    if (handle.endsWith(ns)) {
      valid = true;
    }
  });
  return valid;
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;

  const [walletAddress, setWalletAddress] = useState('');

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

  const handleSendSetStateClick = async () => {
    if (
      isValidNS(walletAddress) ||
      (walletAddress?.startsWith('0x') && walletAddress.length === 42)
    ) {
      try {
        const originalState = await sendGetState();

        // check address is already added
        const isAlreadyAdded = originalState.socialActivities.find(
          (account) =>
            account.address.toLocaleLowerCase() ===
            walletAddress.toLocaleLowerCase(),
        );

        if (isAlreadyAdded) {
          await showAlert(
            'Already Monitored',
            `The wallet address: ${walletAddress}  is already monitored.`,
          );
          return;
        }

        // add address
        await sendSetState([
          ...originalState.socialActivities,
          {
            address: walletAddress,
            activities: [],
            total: 0,
          },
        ]);

        await showAlert(
          'Succeeded',
          `The wallet address: ${walletAddress} is being monitored.`,
        );
      } catch (e) {
        console.error(e);
        dispatch({ type: MetamaskActions.SetError, payload: e });
      }
    } else {
      await showAlert(
        'invalid wallet address',
        `please check your input. supported ns: ${supportedNSList.join(', ')}`,
      );
    }
  };

  const handleSendClearStateClick = async () => {
    try {
      const resp = await sendClearState();
      if (resp) {
        await showAlert(
          'Clear Succeeded',
          'Start adding some new addresses now!',
        );
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleShowLastUpdatedClick = async () => {
    try {
      await showLastUpdated();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleShowAllActivitiesClick = async () => {
    try {
      await showAllActivities();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleShowAllAddressesClick = async () => {
    try {
      await showAllMonitoredAddresses();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 my-32">
      <h1 className="mt-0 mb-10 text-center text-4xl">
        Welcome to{' '}
        <span className="text-[#0072ff]">RSS3 Activity Monitor Snap</span>
      </h1>
      <h2 className="mt-0 mb-10 leading-10 text-lg text-left max-2xl">
        This Snap for <span>MetaMask</span> allows you to monitor the activities
        of any address. <br></br>
        1. Connect to the Snap and install. <br></br>
        2. Start monitoring any address. <br></br>
        3. When there is a new activity produced by any of your monitored
        addresses, <span>you will be notified</span>.
      </h2>
      {state.error && (
        <div>
          <b>An error happened:</b> {state.error.message}
        </div>
      )}
      <div>
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Install',
              description: 'Get started by installing this snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reinstall',
              description:
                "Reinstall to update the snap, or if something isn't right.",
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}

        <Card
          content={{
            title: 'Reset Snap State',
            description:
              'Clean all the data saved in this Snap. This does not affect your wallet in anyway.',
            button: (
              <SendHelloButton
                onClick={handleSendClearStateClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />

        {/* <Card
          content={{
            title: 'Send Get State',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendGetStateClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        /> */}

        {/* <Card
          content={{
            title: 'Add Your wallet',
            description: 'Monitor your current wallet address.',
            button: (
              <SendHelloButton
                onClick={handleSendAddYourWalletClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        /> */}

        <Card
          content={{
            title: 'Show Last Updated',
            description: 'Show the activities included in the last updated',
            button: (
              <SendHelloButton
                onClick={handleShowLastUpdatedClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />

        <Card
          content={{
            title: 'Show All Activities',
            description:
              'View all activities from all the addresses monitored.',
            button: (
              <SendHelloButton
                onClick={handleShowAllActivitiesClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />

        <Card
          content={{
            title: 'Show All Addresses',
            description: 'View all addresses from all the addresses monitored.',
            button: (
              <SendHelloButton
                onClick={handleShowAllAddressesClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />

        <Card
          content={{
            title: 'Monitor Any Address',
            description: (
              <>
                <p>Start monitoring a new address.</p>
                <p>
                  Supported Web3 Name Service: {supportedNSList.join(', ')}.
                </p>
                <p>
                  And of course, your favorite and easy-to-memorize 0x address.
                </p>
              </>
            ),
            button: (
              <div className="flex flex-row items-center justify-center gap-4 w-full">
                <input
                  type="text"
                  placeholder="someone.eth, or 0x..."
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
                <Button
                  onClick={handleSendSetStateClick}
                  disabled={!state.installedSnap}
                >
                  Add
                </Button>
              </div>
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
      </div>
    </div>
  );
};

export default Index;
