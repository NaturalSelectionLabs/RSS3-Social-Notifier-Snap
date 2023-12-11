const site =
  process.env.NODE_ENV === 'production'
    ? 'https://snap.rss3.io'
    : 'http://localhost:8000';

export const SEO_DATA = {
  title: 'RSS3 Snap - The Open Information Snap',
  description:
    "RSS3 Snap for MetaMask offers a quick and easy way to stay on top of your frens' social activities.",
  language: 'en-US',
  url: site,
  image: `${site}/images/og.png`,
  logo: 'https://rss3.io/images/logo.svg',
  twitter: '@rss3_',
  website: {
    context: 'https://schema.org',
    type: 'WebSite',
    name: 'RSS3',
    url: 'https://rss3.io',
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
    'notifier',
    'RSS3 Notifier',
    'decentralization',
    'RSS3 Metamask snap',
    'Metamask snap',
    'Open Information',
    'Open Information Layer',
    'Open Web',
    'RSS3',
    'RSS3 Explorer',
    'web3',
    'web3 activities',
  ],
};
