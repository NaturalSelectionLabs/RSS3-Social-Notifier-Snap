import * as path from 'path';
import { autoAddSRI } from './plugins/sri';

export const onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/lib/utils': path.resolve(__dirname, 'src/lib/utils'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/config': path.resolve(__dirname, 'src/config'),
      },
    },
  });
};

export const onPostBuild = async () => {
  await autoAddSRI();
};
