import { useContext, useState } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
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
} from '../components';
import { defaultSnapOrigin } from '../config';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

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
    <div className="container my-12">
      <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
        Welcome to{' '}
        <span className="text-[#0072ff] drop-shadow-lg">
          RSS3 Activity Monitor Snap
        </span>
      </h1>
      <h2 className="mt-5 mb-10 text-base text-left max-2xl text-muted-foreground sm:text-lg">
        <p>
          This Snap for <span>MetaMask</span> allows you to monitor the
          activities of any address.
        </p>
        <p>1. Connect to the Snap and install.</p>
        <p>2. Start monitoring any address.</p>
        <p>
          3. When there is a new activity produced by any of your monitored
          addresses, <span>you will be notified</span>.
        </p>
      </h2>
      {state.error && (
        <div className="max-w-[600px] my-4">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <b>An error happened:</b> {state.error.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="grid grid-cols-4 items-start justify-start gap-4">
        {!isMetaMaskReady && (
          <Card>
            <CardHeader>
              <CardTitle>Install</CardTitle>
              <CardDescription>
                Snaps is pre-release software only available in MetaMask Flask,
                a canary distribution for developers with access to upcoming
                features.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <InstallFlaskButton />
            </CardFooter>
          </Card>
        )}
        {!state.installedSnap && (
          <Card>
            <CardHeader>
              <CardTitle>Install</CardTitle>
              <CardDescription>
                Get started by installing this snap.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <ConnectButton
                onClick={handleConnectClick}
                disabled={!isMetaMaskReady}
              />
            </CardFooter>
          </Card>
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card>
            <CardHeader>
              <CardTitle>Reinstall</CardTitle>
              <CardDescription>
                Reinstall to update the snap, or if something isn't right.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <ReconnectButton
                onClick={handleConnectClick}
                disabled={!state.installedSnap}
              />
            </CardFooter>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Reset Snap State</CardTitle>
            <CardDescription>
              Clean all the data saved in this Snap. This does not affect your
              wallet in anyway.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <SendHelloButton
              onClick={handleSendClearStateClick}
              disabled={!state.installedSnap}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Show Last Updated</CardTitle>
            <CardDescription>
              Show the activities included in the last updated
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <SendHelloButton
              onClick={handleShowLastUpdatedClick}
              disabled={!state.installedSnap}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Show All Activities</CardTitle>
            <CardDescription>
              View all activities from all the addresses monitored.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <SendHelloButton
              onClick={handleShowAllActivitiesClick}
              disabled={!state.installedSnap}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Show All Addresses</CardTitle>
            <CardDescription>
              View all addresses from all the addresses monitored.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <SendHelloButton
              onClick={handleShowAllAddressesClick}
              disabled={!state.installedSnap}
            />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitor Any Address</CardTitle>
            <CardDescription>
              <p>Start monitoring a new address.</p>
              <p>Supported Web3 Name Service: {supportedNSList.join(', ')}.</p>
              <p>
                And of course, your favorite and easy-to-memorize 0x address.
              </p>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-row items-center gap-4">
              <Input
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
