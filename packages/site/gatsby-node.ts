import * as path from 'path';

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
