import { GatsbyConfig } from 'gatsby';
import dotenv from 'dotenv';
import { SEO_DATA } from './seo-data';

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
        name: 'RSS3 Social Notifier Snap',
        icon: 'src/assets/RSS3.svg',
        theme_color: '#0072FF',
        background_color: '#FFFFFF',
        display: 'standalone',
      },
    },
  ],
  siteMetadata: SEO_DATA,
};

export default config;
