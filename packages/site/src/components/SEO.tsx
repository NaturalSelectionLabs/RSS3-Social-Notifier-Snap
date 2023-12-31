import React from 'react';
import { useSiteMetadata } from '@/hooks/use-site-metadata';

export type ISEOProps = {
  title?: string;
  description?: string;
  pathname?: string;
};
export const SEO = ({
  title = '',
  description = '',
  pathname = '',
  children,
}: React.PropsWithChildren & ISEOProps) => {
  const {
    title: defaultTitle,
    description: defaultDescription,
    language,
    url,
    image,
    logo,
    twitter,
    website,
    organization,
    keywords,
  } = useSiteMetadata();

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    language,
    url: `${url}${pathname}`,
    image,
    logo,
    twitter,
    website,
    organization,
    keywords,
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:creator" content={seo.twitter} />
      <meta name="keywords" content={seo.keywords.join(',')} />

      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      {/** Icons */}
      <link
        rel="icon"
        href="https://rss3.io/favicon-32x32.png"
        sizes="32x32"
        type="image/png"
      />
      <link
        rel="mask-icon"
        href="https://rss3.io/safari-pinned-tab.svg"
        color="#1477FB"
      />
      <link
        rel="apple-touch-icon"
        href="https://rss3.io/apple-touch-icon.png"
      />

      {/** Other */}
      <meta name="msapplication-TileColor" content="#1477FB" />
      <meta name="google" content="notranslate" />

      {/** ld json */}
      <script type="application/ld+json">
        {JSON.stringify(seo.website, null, 2)}
      </script>

      <script type="application/ld+json">
        {JSON.stringify(seo.organization, null, 2)}
      </script>
      {children}
    </>
  );
};
