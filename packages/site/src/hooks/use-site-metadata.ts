import { graphql, useStaticQuery } from 'gatsby';
import { SEO_DATA } from '../../seo-data';

export type TSEO_DATA = typeof SEO_DATA;
export const useSiteMetadata = () => {
  const data = useStaticQuery<{ site: { siteMetadata: TSEO_DATA } }>(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          language
          url
          image
          logo
          twitter
          website {
            context
            type
            name
            url
          }
          organization {
            context
            type
            name
            url
            logo
            sameAs
          }
          keywords
        }
      }
    }
  `);

  const { website, organization } = data.site.siteMetadata;
  return {
    ...data.site.siteMetadata,
    website: {
      '@content': website.context,
      '@type': website.type,
      name: website.name,
      url: website.url,
    },
    organization: {
      '@content': organization.context,
      '@type': organization.type,
      name: organization.name,
      url: organization.url,
      logo: organization.logo,
      sameAs: organization.sameAs,
    },
  };
};
