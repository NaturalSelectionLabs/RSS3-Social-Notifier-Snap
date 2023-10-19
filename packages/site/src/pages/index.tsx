import { useContext, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  addOwnWalletAddress,
  connectSnap,
  getSnap,
  isLocalSnap,
  sendClearState,
  sendGetState,
  sendSetState,
  shouldDisplayReconnectButton,
  showAlert,
  showAllActivities,
  showLastUpdated,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
  Button,
} from '../components';
import { defaultSnapOrigin } from '../config';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const WalletAddressContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  flex: 1;
  gap: 1rem;
  width: 100%;
`;
const WalletAddressInput = styled.input`
  padding: 1rem;
  width: 100%;
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const SubHeading = styled.h2`
  margin-top: 0;
  margin-bottom: 2.4rem;
  line-height: 1.8;
  font-size: 2rem;
  text-align: left;
  max-width: 128rem;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  items-align: center;
  gap: 2.4rem;
  max-width: 128rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

// const Notice = styled.div`
//   background-color: ${({ theme }) => theme.colors.background.alternative};
//   border: 1px solid ${({ theme }) => theme.colors.border.default};
//   color: ${({ theme }) => theme.colors.text.alternative};
//   border-radius: ${({ theme }) => theme.radii.default};
//   padding: 2.4rem;
//   margin-top: 2.4rem;
//   max-width: 60rem;
//   width: 100%;

//   & > * {
//     margin: 0;
//   }
//   ${({ theme }) => theme.mediaQueries.small} {
//     margin-top: 1.2rem;
//     padding: 1.6rem;
//   }
// `;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;
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

  const handleSendGetStateClick = async () => {
    try {
      const resp = await sendGetState();
      await showAlert('Get State', JSON.stringify(resp, null, 2));
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendAddYourWalletClick = async () => {
    try {
      const resp = await addOwnWalletAddress();
      if (resp && (resp as string[]).length > 0) {
        await showAlert('Monitored', JSON.stringify(resp, null, 2));
      } else {
        await showAlert(
          'Already Monitored',
          'the wallet address is already monitored.',
        );
      }
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

  return (
    <Container>
      <Heading>
        Welcome to <Span>RSS3 Activity Monitor Snap</Span>
      </Heading>
      <SubHeading>
        This Snap for <Span>MetaMask</Span> allows you to monitor the activities
        of any address. <br></br>
        1. Connect to the Snap and install. <br></br>
        2. Start monitoring any address. <br></br>
        3. When there is a new activity produced by any of your monitored
        addresses, <Span>you will be notified</Span>.
      </SubHeading>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
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
              <WalletAddressContainer>
                <WalletAddressInput
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
              </WalletAddressContainer>
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
      </CardContainer>
    </Container>
  );
};

export default Index;
