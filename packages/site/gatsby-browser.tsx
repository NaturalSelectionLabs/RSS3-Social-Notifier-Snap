import React from 'react';
import { GatsbyBrowser } from 'gatsby';
import { App } from './src/App';
import { Root } from './src/Root';

// eslint-disable-next-line import/no-unassigned-import
import './src/styles/global.css';

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
