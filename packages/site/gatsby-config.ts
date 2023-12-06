import { GatsbyConfig } from 'gatsby';
import dotenv from 'dotenv';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

const config: GatsbyConfig = {
  // This is required to make use of the React 17+ JSX transform.
  jsxRuntime: 'automatic',
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-plugin-postcss',
    // {
    //   resolve: 'gatsby-plugin-sri',
    //   options: {
    //     hash: 'sha512',
    //     crossorigin: false,
    //   },
    // },
    {
      resolve: 'gatsby-plugin-csp',
      options: {
        disableOnDev: true,
        reportOnly: false,
        mergeScriptHashes: false,
        mergeStyleHashes: false,
        mergeDefaultDirectives: true,
        directives: {
          'script-src': "'self' 'unsafe-inline' www.google-analytics.com",
          'style-src': "'self' 'unsafe-inline'",
          'img-src': "'self' data: www.google-analytics.com",
        },
      },
    },
    {
      resolve: `gatsby-plugin-env-variables`,
      options: {
        allowList: ['SNAP_ORIGIN', 'ENVIRONMENT'],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Template Snap',
        icon: 'src/assets/RSS3.svg',
        theme_color: '#0072FF',
        background_color: '#FFFFFF',
        display: 'standalone',
      },
    },
  ],
};

export default config;
