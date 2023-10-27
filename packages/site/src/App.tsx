import { FunctionComponent, ReactNode } from 'react';
import { Footer, Header } from './components';

export type AppProps = {
  children: ReactNode;
};

export const App: FunctionComponent<AppProps> = ({ children }) => {
  return (
    <>
      <div className="flex flex-col w-full min-h-screen max-w-[100vw]">
        <Header />
        {children}
        <Footer />
      </div>
    </>
  );
};
