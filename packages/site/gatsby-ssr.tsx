import { GatsbySSR } from 'gatsby';
import React from 'react';
import { App } from './src/App';
import { Root } from './src/Root';

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => (
  <React.StrictMode>
    <Root>{element}</Root>
  </React.StrictMode>
);

export const wrapPageElement: GatsbySSR['wrapPageElement'] = ({ element }) => (
  <App>{element}</App>
);
