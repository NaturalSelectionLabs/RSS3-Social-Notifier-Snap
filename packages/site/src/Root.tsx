import { createContext, FunctionComponent, ReactNode } from 'react';
import { MetaMaskProvider } from './hooks';

export type RootProps = {
  children: ReactNode;
};

type ToggleTheme = () => void;

export const ToggleThemeContext = createContext<ToggleTheme>(
  (): void => undefined,
);

export const Root: FunctionComponent<RootProps> = ({ children }) => {
  return <MetaMaskProvider>{children}</MetaMaskProvider>;
};
