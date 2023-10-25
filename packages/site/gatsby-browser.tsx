import { GatsbyBrowser } from 'gatsby';
import React from 'react';
import { App } from './src/App';
import { Root } from './src/Root';

export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({
  element,
}) => (
  <React.StrictMode>
    <Root>{element}</Root>
  </React.StrictMode>
);

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
}) => <App>{element}</App>;
