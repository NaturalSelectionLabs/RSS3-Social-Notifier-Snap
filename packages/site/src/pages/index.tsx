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
        await showAlert('added', JSON.stringify(resp, null, 2));
      } else {
        await showAlert('added', 'your wallet address is already added.');
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
            'already added',
            `your wallet address:[${walletAddress}] is already added.`,
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
          'added',
          `your wallet address:[${walletAddress}] is added.`,
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
          'Clear state success',
          'You can choose to add a new address or use a suffix supported by RSS3 for monitoring.',
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
        Welcome to <Span>RSS3 Cron</Span>
      </Heading>
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
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
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
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
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
            title: 'Send clean state',
            description: 'Clean all data in MetaMask.',
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

        <Card
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
        />

        <Card
          content={{
            title: 'Add Your wallet',
            description: 'Auto add your wallet addresses to monitor.',
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
        />

        <Card
          content={{
            title: 'Show last updated',
            description: 'Show the last updated activities.',
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
            title: 'show all activities',
            description: 'Show all activities.',
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
            title: 'Add Wallet Address',
            description: (
              <>
                <p>Add Wallet Address or Namespace to monitor</p>
                <p>Supported NS list: ${supportedNSList.join(', ')}</p>
              </>
            ),
            button: (
              <WalletAddressContainer>
                <WalletAddressInput
                  type="text"
                  placeholder="wallet address"
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
