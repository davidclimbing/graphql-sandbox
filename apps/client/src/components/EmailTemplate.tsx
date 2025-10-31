import { useState, useEffect } from 'react';

interface EmailTemplateProps {
  apiEndpoint: string;
}

export function EmailTemplate({ apiEndpoint }: EmailTemplateProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiEndpoint)
      .then(res => res.json())
      .then(data => {
        setHtmlContent(data.htmlContent);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load email template:', err);
        setLoading(false);
      });
  }, [apiEndpoint]);

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className="email-container"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
