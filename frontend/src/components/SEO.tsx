import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: object | object[];
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Kuduchee (Kudu Chee) — Handcrafted Stoneware & Ceramic Tableware | Anil Panda',
  description = 'Kuduchee (Kudu Chee) by Anil Panda & Kaviz Creations Private Limited — Premium 1280°C high-fired stoneware dinnerware, ceramic dinner sets, serving bowls & artisan mugs inspired by Indian heritage.',
  keywords = 'Kuduchee, Kudu Chee, Anil Panda, kuduchee.in, Kaviz Creations Private Limited, Kuduchee Studio, stoneware dinnerware, ceramic dinner sets India, handcrafted pottery, high fired stoneware, luxury tableware, stoneware plates, ceramic bowls, stoneware mugs',
  canonicalUrl = 'https://kuduchee.in/',
  ogImage = 'https://kuduchee.in/kuduchee-logo.jpg',
  ogType = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title.includes('Kuduchee') ? title : `${title} | Kuduchee (Kudu Chee)`;

    // 2. Helper to set or create meta tag
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Set Primary SEO Metas
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    setMetaTag('meta[name="author"]', 'name', 'author', 'Anil Panda (Kuduchee / Kaviz Creations Private Limited)');
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setLinkTag('canonical', canonicalUrl);

    // Set OpenGraph Metas
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Kuduchee');

    // Set Twitter Metas
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalUrl);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // Set Dynamic JSON-LD Schema
    const scriptId = 'dynamic-jsonld-schema';
    let scriptElem = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptElem) {
      scriptElem = document.createElement('script');
      scriptElem.id = scriptId;
      scriptElem.type = 'application/ld+json';
      document.head.appendChild(scriptElem);
    }

    const defaultSchemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Kuduchee',
        'alternateName': ['Kudu Chee', 'Kuduchee Studio', 'Kaviz Creations Private Limited'],
        'url': 'https://kuduchee.in/',
        'logo': 'https://kuduchee.in/kuduchee-logo-dark.png',
        'founder': {
          '@type': 'Person',
          'name': 'Anil Panda'
        },
        'sameAs': [
          'https://www.instagram.com',
          'https://wa.me/919971118219'
        ]
      }
    ];

    const schemasToInject = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : defaultSchemas;
    scriptElem.textContent = JSON.stringify(schemasToInject);

  }, [title, description, keywords, canonicalUrl, ogImage, ogType, jsonLd]);

  return null;
};
