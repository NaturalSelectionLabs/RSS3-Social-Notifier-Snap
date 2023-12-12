import { useContext } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { navigate } from 'gatsby';
import {
  connectSnap,
  getSnap,
  isLocalSnap,
  sendClearState,
  shouldDisplayReconnectButton,
  testImage,
} from '@/utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  ResetButton,
} from '@/components';
import { defaultSnapOrigin, isProduction } from '@/config';
import { MetamaskActions, MetaMaskContext } from '@/hooks';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;

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

  const handleSendClearStateClick = async () => {
    try {
      await sendClearState();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetTestImageClick = async () => {
    try {
      await testImage();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <div className="container my-12">
      <h1 className="mx-auto max-w-fit text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
        Welcome to{' '}
        <span className="text-RSS3 drop-shadow-md">RSS3 Social Notifier -</span>
        <span className="text-MetaMask drop-shadow-md"> A MetaMask Snap</span>
      </h1>
      <div className="mx-auto my-5 text-base text-left max-w-4xl text-muted-foreground sm:text-lg">
        <p>
          This Snap for <span className="text-MetaMask">MetaMask</span> offers a
          quick and easy way to stay on top of your frens' social activities.
        </p>
        <p>1. Connect to the Snap and install.</p>
        <p>
          2. Your Web3 social graphs on{' '}
          <a
            className="text-Crossbell font-bold"
            href="https://crossbell.io/"
            target="_blank"
          >
            Crossbell
          </a>
          ,{' '}
          <a
            className="text-Farcaster font-bold"
            href="https://www.farcaster.xyz/"
            target="_blank"
          >
            Farcaster
          </a>
          ,{' '}
          <a
            className="text-Lens font-bold"
            href="https://www.lens.xyz/"
            target="_blank"
          >
            Lens Protocol
          </a>
          , will be automatically imported.
        </p>
        <p>
          3. When a new social activity initiated by any of your Web3 frens,{' '}
          <span>you will be notified</span>.
        </p>
      </div>
      <div className="mx-auto mb-10 text-base text-left  max-w-4xl text-muted-foreground sm:text-lg">
        <p>
          Behind the scene, this Snap works by aggregating your social graphs
          from Web3 social platforms, and retrieving your frens' social
          activities from the{' '}
          <a href="https://rss3.io" className="text-RSS3 font-bold">
            RSS3 Network
          </a>
          .
        </p>
      </div>
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
      <div className="grid lg:grid-cols-3 grid-cols-2 items-start justify-start gap-4">
        {!isMetaMaskReady && (
          <Card>
            <CardHeader>
              <CardTitle>Install MetaMask Flask</CardTitle>
              <CardDescription className="h-[120px]">
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
              <CardDescription className="h-[120px]">
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
              <CardDescription className="h-[120px]">
                Update the snap, or reinstall if something isn't right.
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
            <CardDescription className="h-[120px]">
              Reset the Snap's state, in case anything does not work properly.
              This does not affect your wallet or assets in anyway.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <ResetButton
              onClick={handleSendClearStateClick}
              disabled={!state.installedSnap}
            />
          </CardFooter>
        </Card>

        {!isProduction && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Stalk Someone</CardTitle>
                <CardDescription className="h-[120px]">
                  You can get notified if someone else's frens publish something
                  (actually, this is for debugging purpose).
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  disabled={!state.installedSnap}
                  onClick={() => {
                    navigate('/monitor/create');
                  }}
                >
                  Begin Stalking
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Snap Dialog </CardTitle>
                <CardDescription className="h-[120px]">
                  For debugging.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  disabled={!state.installedSnap}
                  onClick={handleGetTestImageClick}
                >
                  Show
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;

export const Head = () => <SEO />;
