const site =
  process.env.NODE_ENV === 'production'
    ? 'https://snap.rss3.io'
    : 'http://localhost:8000';

const title = 'RSS3 Social Notifier Snap - The Open Information Snap';

export const SEO_DATA = {
  title,
  description:
    "RSS3 Social Notifier Snap for MetaMask offers a quick and easy way to stay on top of your frens' social activities.",
  language: 'en-US',
  url: site,
  image: `${site}/images/og.png`,
  logo: 'https://rss3.io/images/logo.svg',
  twitter: '@rss3_',
  website: {
    context: 'https://schema.org',
    type: 'WebSite',
    name: title,
    url: site,
  },
  organization: {
    context: 'https://schema.org',
    type: 'Organization',
    name: 'RSS3',
    url: 'https://rss3.io/',
    logo: 'https://rss3.io/images/logo.svg',
    sameAs: ['https://twitter.com/rss3_'],
  },
  keywords: [
    'blockchain',
    'Metamask snap',
    'Open Information',
    'Open Information Layer',
    'Open Web',
    'RSS3',
    'RSS3 Explorer',
    'RSS3 Metamask snap',
    'RSS3 Notifier',
    'RSS3 Social Notifier Snap',
    'web3',
    'web3 activity',
    'web3 social',
    'web3 social activity',
  ],
};
