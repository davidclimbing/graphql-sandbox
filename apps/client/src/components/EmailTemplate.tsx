import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

export function EmailTemplate({ apiEndpoint }: { apiEndpoint: string }) {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    fetch(apiEndpoint)
      .then(res => res.json())
      .then(data => {
        // HTML sanitize
        const cleanHTML = DOMPurify.sanitize(data.htmlContent, {
          WHOLE_DOCUMENT: true,
          ADD_TAGS: ['link', 'style'],
          ADD_ATTR: ['target', 'href', 'src', 'alt', 'class', 'id', 'style'],
          ALLOW_DATA_ATTR: false,
          FORBID_TAGS: ['script', 'title'],
          FORBID_ATTR: ['onerror', 'onload']
        });
        setHtmlContent(cleanHTML);
      });
  }, [apiEndpoint]);

  return (
    <div 
      className="email-preview"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}