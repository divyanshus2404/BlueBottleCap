import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    'image-compressor', 'format-converter', 'image-resizer', 'crop-image',
    'jpg-to-png', 'background-remover', 'ocr-image-to-text', 'ai-rewriter',
    'grammar-checker', 'paraphrasing-tool', 'question-generator', 'answer-generator',
    'summary-generator', 'email-generator', 'caption-generator', 'assignment-formatter',
    'flashcard-generator', 'study-planner', 'notes-to-questions', 'topic-explainer'
  ];

  const toolUrls = tools.map((tool) => ({
    url: `https://bluebottlecap.com/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://bluebottlecap.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://bluebottlecap.com/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...toolUrls,
  ];
}
