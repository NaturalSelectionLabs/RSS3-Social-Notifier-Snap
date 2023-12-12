import { ComponentProps } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import { MetamaskState } from '../hooks';
import { Button } from '@/components/ui/button';
import { isProduction } from '@/config';

const WithLogoButton = ({
  label,
  ...props
}: { label: string } & ComponentProps<typeof Button>) => {
  const alt = isProduction ? 'metamask icon' : 'flask fox icon';
  return (
    <Button {...props}>
      {isProduction ? (
        <StaticImage
          src="../assets/metamask_fox.svg"
          alt={alt}
          className="mr-2"
        />
      ) : (
        <StaticImage src="../assets/flask_fox.svg" alt={alt} className="mr-2" />
      )}
      {label}
    </Button>
  );
};

export const InstallFlaskButton = () => {
  return isProduction ? (
    <a href="https://metamask.io/download/" target="_blank">
      <WithLogoButton label="Install MetaMask" />
    </a>
  ) : (
    <a href="https://metamask.io/flask/" target="_blank">
      <WithLogoButton label="Install MetaMask Flask" />
    </a>
  );
};

export const ConnectButton = (props: ComponentProps<typeof Button>) => {
  return <WithLogoButton label="Install" {...props} />;
};

export const ReconnectButton = (props: ComponentProps<typeof Button>) => {
  return <WithLogoButton label="Reinstall" {...props} />;
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
  if (!isProduction && !state.isFlask && !state.installedSnap) {
    return <InstallFlaskButton />;
  }

  if (isProduction && !state.isMetaMask && !state.installedSnap) {
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
