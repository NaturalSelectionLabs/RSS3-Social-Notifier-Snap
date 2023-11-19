import { ComponentProps } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import { MetamaskState } from '../hooks';
import { shouldDisplayReconnectButton } from '../utils';
import { Button } from '@/components/ui/button';

export const InstallFlaskButton = () => (
  <a href="https://metamask.io/flask/" target="_blank">
    <Button>
      <StaticImage
        src="../assets/flask_fox.svg"
        alt="flask fox icon"
        className="mr-2"
      />
      Install MetaMask Flask
    </Button>
  </a>
);

export const ConnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <StaticImage
        src="../assets/flask_fox.svg"
        alt="flask fox icon"
        className="mr-2"
      />
      Install
    </Button>
  );
};

export const ReconnectButton = (props: ComponentProps<typeof Button>) => {
  return (
    <Button {...props}>
      <StaticImage
        src="../assets/flask_fox.svg"
        alt="flask fox icon"
        className="mr-2"
      />
      Reinstall
    </Button>
  );
};

export const ResetButton = (props: ComponentProps<typeof Button>) => {
  return <Button {...props}>Reset Now</Button>;
};

export const HeaderButtons = ({
  state,
  onConnectClick,
}: {
  state: MetamaskState;
  onConnectClick(): unknown;
}) => {
  if (!state.isFlask && !state.installedSnap) {
    return <InstallFlaskButton />;
  }

  if (!state.installedSnap) {
    return <ConnectButton onClick={onConnectClick} />;
  }

  // if (shouldDisplayReconnectButton(state.installedSnap)) {
  return <ReconnectButton onClick={onConnectClick} />;
  // }

  // return <div>Connected</div>;
};
