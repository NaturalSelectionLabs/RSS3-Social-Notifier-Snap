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
