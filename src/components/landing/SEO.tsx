import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, image = '/og-image.png', url = 'https://ccna-3d-lab.dev' }: SEOProps) {
  const fullTitle = `${title} | CCNA Zero-to-Hero 3D Lab`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="CCNA, Cisco, networking, 3D lab, subnetting, OSPF, VLAN, switch, router, packet tracer, GNS3, network engineering" />
      <meta name="author" content="Eric Omari" />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'CCNA Zero-to-Hero 3D Lab Platform',
          url,
          author: {
            '@type': 'Person',
            name: 'Eric Omari',
          },
        })}
      </script>
    </Helmet>
  );
}
