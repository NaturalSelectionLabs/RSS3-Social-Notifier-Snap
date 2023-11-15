/**
 * Converts an image Buffer to a base64 string.
 *
 * @param buffer - Buffer of image.
 * @returns A Promise that resolves with the base64 string of the image.
 */
export async function imageBufferToBase64(buffer: Buffer) {
  const suffix = await getSuffixFromBuffer(buffer);
  return await getImageSourceString(suffix, buffer.toString('base64'));
}

/**
 * Get the suffix of an image from a buffer.
 *
 * @param buffer - The buffer to get the suffix from.
 * @returns The suffix of the image.
 */
export async function getSuffixFromBuffer(buffer: Buffer) {
  const imageBufferHeaders = [
    { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: '.jpeg' },
    { bufBegin: [0x00, 0x00, 0x02, 0x00, 0x00], suffix: '.tga' },
    { bufBegin: [0x00, 0x00, 0x10, 0x00, 0x00], suffix: '.rle' },
    {
      bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      suffix: '.png',
    },
    { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: '.gif' },
    { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: '.gif' },
    { bufBegin: [0x42, 0x4d], suffix: '.bmp' },
    { bufBegin: [0x0a], suffix: '.pcx' },
    { bufBegin: [0x49, 0x49], suffix: '.tif' },
    { bufBegin: [0x4d, 0x4d], suffix: '.tif' },
    {
      bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20],
      suffix: '.ico',
    },
    {
      bufBegin: [0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x20, 0x20],
      suffix: '.cur',
    },
    { bufBegin: [0x46, 0x4f, 0x52, 0x4d], suffix: '.iff' },
    { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: '.ani' },
  ];

  for (const imageBufferHeader of imageBufferHeaders) {
    let isEqual = false;
    if (imageBufferHeader.bufBegin) {
      isEqual = buffer.equals(
        buffer.slice(0, imageBufferHeader.bufBegin.length),
      );
    }

    if (isEqual && imageBufferHeader.bufEnd) {
      isEqual = buffer.equals(
        buffer.slice(
          buffer.length - imageBufferHeader.bufEnd.length,
          buffer.length,
        ),
      );
    }

    if (isEqual) {
      return imageBufferHeader.suffix;
    }
  }
  return '';
}

/**
 * Get the image source string from a suffix and base64 string.
 *
 * @param suffix - The suffix of the image.
 * @param base64 - The base64 string of the image.
 * @returns The image source string.
 */
export async function getImageSourceString(suffix: string, base64: string) {
  const type = suffix === '' ? 'jpeg' : suffix.slice(1, suffix.length);
  return `data:image/${type};base64,${base64}`;
}

/**
 * Cover ipfs url to link url.
 *
 * @param ipfs - IPFS address.
 * @returns Link url.
 */
export function coverIpfsToUrl(ipfs: string) {
  if (ipfs.startsWith('ipfs://')) {
    return ipfs.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return ipfs;
}

/**
 * Wrap the base64 string to svg element.
 *
 * @param base64 - The base64 string.
 * @returns SVG element string.
 */
export function wrapBase64ToSvg(base64: string) {
  return `<svg width="20" height="20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="${base64}" x="0" y="0" height="100" width="100" /></svg>`;
}

/**
 * Download and covert image to base64.
 *
 * @param imageUrl - The image url.
 * @returns Image base64 string.
 */
export async function downloadAndCovertImage(imageUrl: string) {
  const resp = await fetch(coverIpfsToUrl(imageUrl));
  const buffer = await Buffer.from(await resp.arrayBuffer());
  return await imageBufferToBase64(buffer);
}
