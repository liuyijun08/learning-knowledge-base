import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(content: string): string {
  try {
    const html = marked.parse(content) as string;
    return DOMPurify.sanitize(html);
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return '<p>渲染失败</p>';
  }
}

export function extractTextFromMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/#{1,6}\s/g, ' ')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/>\s/g, ' ')
    .replace(/[-*+]\s/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function highlightText(text: string, keyword: string): string {
  if (!keyword.trim()) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
