import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'course';
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  course?: {
    id: string;
    title: string;
    description?: string;
    instructor?: string;
    duration?: string;
    level?: string;
    price?: number;
    currency?: string;
  };
}

const defaultSEO = {
  title: 'Course Website - Learn with Expert-Led Online Courses',
  description: 'Discover high-quality online courses and unlock your potential with expert instruction, hands-on projects, and recognized certifications.',
  image: '/og-image.jpg', // You would add this to public folder
  siteName: 'Course Website',
  url: typeof window !== 'undefined' ? window.location.href : '',
};

export const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = defaultSEO.siteName,
  author,
  publishedTime,
  modifiedTime,
  tags,
  course,
}: SEOProps) => {
  const seoTitle = title ? `${title} | ${defaultSEO.siteName}` : defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoImage = image || defaultSEO.image;
  const seoUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    // Update document title
    document.title = seoTitle;

    // Update meta description
    updateOrCreateMetaTag('description', seoDescription);
    
    // Update canonical URL
    updateOrCreateLinkTag('canonical', seoUrl);

    // Update Open Graph tags
    updateOrCreateMetaTag('og:title', seoTitle, 'property');
    updateOrCreateMetaTag('og:description', seoDescription, 'property');
    updateOrCreateMetaTag('og:type', type, 'property');
    updateOrCreateMetaTag('og:site_name', siteName, 'property');
    updateOrCreateMetaTag('og:url', seoUrl, 'property');
    
    // Update image (make absolute if needed)
    const absoluteImageUrl = seoImage.startsWith('http') 
      ? seoImage 
      : `${window.location.origin}${seoImage}`;
    updateOrCreateMetaTag('og:image', absoluteImageUrl, 'property');

    // Update Twitter Card tags
    updateOrCreateMetaTag('twitter:card', 'summary_large_image');
    updateOrCreateMetaTag('twitter:title', seoTitle);
    updateOrCreateMetaTag('twitter:description', seoDescription);
    updateOrCreateMetaTag('twitter:image', absoluteImageUrl);

    // Update additional meta tags
    if (author) updateOrCreateMetaTag('author', author);
    if (publishedTime) updateOrCreateMetaTag('article:published_time', publishedTime, 'property');
    if (modifiedTime) updateOrCreateMetaTag('article:modified_time', modifiedTime, 'property');
    if (tags && tags.length > 0) updateOrCreateMetaTag('keywords', tags.join(', '));

    // Add structured data for courses
    if (course) {
      const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.description || seoDescription,
        "provider": {
          "@type": "Organization",
          "name": siteName,
          "url": window.location.origin
        },
        ...(course.instructor && {
          "instructor": {
            "@type": "Person",
            "name": course.instructor
          }
        }),
        ...(course.duration && {
          "timeRequired": course.duration
        }),
        ...(course.level && {
          "coursePrerequisites": course.level
        }),
        ...(course.price && course.price > 0 && {
          "offers": {
            "@type": "Offer",
            "price": course.price,
            "priceCurrency": course.currency || "USD"
          }
        })
      };
      
      updateOrCreateJsonLd('course-schema', courseSchema);
    }

    // Add general website structured data for homepage
    if (type === 'website') {
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": siteName,
        "url": window.location.origin,
        "description": seoDescription,
      };
      
      updateOrCreateJsonLd('website-schema', websiteSchema);
    }
  }, [seoTitle, seoDescription, seoImage, seoUrl, type, siteName, author, publishedTime, modifiedTime, tags, course]);

  return null; // This component only manages head tags
};

// Helper functions for managing meta tags
function updateOrCreateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateOrCreateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

function updateOrCreateJsonLd(id: string, schema: object) {
  let element = document.querySelector(`script[data-schema-id="${id}"]`) as HTMLScriptElement;
  
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.setAttribute('data-schema-id', id);
    document.head.appendChild(element);
  }
  
  element.textContent = JSON.stringify(schema);
}