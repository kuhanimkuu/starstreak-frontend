import DOMPurify from 'dompurify';
import { plainTextToHtml } from '../lib/plainText';

/**
 * Renders rich content stored as HTML (from TipTap editor) or as plain text
 * (legacy DB content before the rich editor was introduced).
 *
 * TipTap always serialises its output starting with an HTML tag, so we use
 * a simple startsWith('<') check rather than a greedy regex that can stall
 * on very long documents.
 */
export default function RichContent({ content, className = '' }) {
  if (!content?.trim()) return null;

  const trimmed = content.trimStart();

  // HTML content: always starts with an opening tag when coming from TipTap
  // or from a file upload (mammoth / pdfjs both produce <p>/<h1>/etc.)
  if (trimmed.startsWith('<')) {
    const sanitized = DOMPurify.sanitize(content, {
      // Use DOMPurify defaults (safe HTML) but explicitly keep the tags and
      // attributes that TipTap generates, including inline colour styles.
      ADD_TAGS: ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col'],
      ADD_ATTR: ['style', 'colspan', 'rowspan', 'class', 'id'],
    });

    return (
      <div
        className={`rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // Plain text (pasted, often with hard line breaks and stray indents):
  // reflowed into headings, paragraphs and lists rather than shown as typed.
  // plainTextToHtml escapes everything, and DOMPurify runs over it anyway.
  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(plainTextToHtml(content)) }}
    />
  );
}
