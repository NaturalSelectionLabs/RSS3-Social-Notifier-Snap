import nCrypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import replace from 'replace-in-file';

export async function autoAddSRI() {
  const options = {
    hash: 'sha512',
    extensions: ['css', 'js'],
    crossorigin: false,
  };
  const fileBasePath = path.join(process.cwd(), 'public');
  const patternExt =
    options.extensions.length > 1
      ? `{${options.extensions.join(',')}}`
      : options.extensions[0];
  const pattern = `**/*.${patternExt}`;

  const assets = await globSync(pattern, { cwd: fileBasePath, nodir: true });

  const assetHashes: Record<string, any> = assets.reduce((prev, curr) => {
    const content = fs.readFileSync(path.join(fileBasePath, curr), 'utf8');
    const assetHash = nCrypto
      .createHash(options.hash)
      .update(content, 'utf-8')
      .digest('base64');
    prev[`/${curr}`] = `${options.hash}-${assetHash}`;
    return prev;
  }, {});

  const _options: { files: string[]; from: (string | RegExp)[]; to: string[] } =
    {
      files: ['public/**/*.html'],
      from: [],
      to: [],
    };

  const replaceOptions = Object.keys(assetHashes).reduce((prev, curr) => {
    const hash = assetHashes[curr];
    const crossorigin = options.crossorigin ? ' crossorigin="anonymous"' : '';
    const addition = `integrity="${hash}"${crossorigin}`;
    if (curr.endsWith('.css')) {
      prev.from.push(`data-href="${curr}"`);
      prev.to.push(`data-href="${curr}" ${addition}`);
    }

    if (curr.endsWith('.js')) {
      const fpath = path.relative('/', curr);
      // eslint-disable-next-line require-unicode-regexp
      prev.from.push(new RegExp(`src="/${fpath}"`, 'g'));
      prev.to.push(`src="${curr}" ${addition}`);

      // eslint-disable-next-line require-unicode-regexp
      prev.from.push(new RegExp(`href="/${fpath}"`, 'g'));
      prev.to.push(`href="${curr}" ${addition}`);
    }
    return prev;
  }, _options);

  replace.sync(replaceOptions);
}
