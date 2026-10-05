import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter,
  FiAlignRight, FiList, FiUpload, FiMinus,
} from 'react-icons/fi';

function Btn({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-7 h-7 flex items-center justify-center text-xs rounded transition-colors ${
        active
          ? 'bg-flare-deep text-star'
          : 'text-mist hover:bg-night-700 hover:text-star'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-night-700 mx-0.5 shrink-0" />;
}

export default function RichEditor({
  value,
  onChange,
  placeholder = 'Paste content here, or upload a .docx / .pdf file…',
  minHeight = 320,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const initialised = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'outline-none leading-relaxed',
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // One-time initial sync when DB content arrives
  useEffect(() => {
    if (!editor || initialised.current || !value) return;
    editor.commands.setContent(value, false);
    initialised.current = true;
  }, [editor, value]);

  // ── File upload ──────────────────────────────────────────────────────────────
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploadError('');
    setUploading(true);

    try {
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = DOMPurify.sanitize(result.value);
        editor.commands.setContent(html);
        onChange(html);

      } else if (ext === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let html = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          let lastY = null;
          const lines = [];
          let line = '';
          for (const item of content.items) {
            const y = item.transform?.[5] ?? 0;
            if (lastY !== null && Math.abs(y - lastY) > 6) {
              if (line.trim()) lines.push(line.trim());
              line = '';
            }
            line += item.str;
            lastY = y;
          }
          if (line.trim()) lines.push(line.trim());
          html += lines.map(l => `<p>${l}</p>`).join('');
        }
        const sanitized = DOMPurify.sanitize(html);
        editor.commands.setContent(sanitized);
        onChange(sanitized);

      } else {
        setUploadError('Please upload a .docx or .pdf file.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Could not parse the file. Try pasting the content directly.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  if (!editor) return null;

  const hl = editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3'
    : editor.isActive('heading', { level: 4 }) ? '4' : '0';

  const inTable = editor.isActive('table');

  return (
    <div className="border border-night-600 rounded-lg overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="bg-night-850 border-b border-night-600 px-2 py-2 flex flex-wrap gap-1 items-center">

        {/* Heading / Paragraph */}
        <select
          value={hl}
          onChange={e => {
            const lv = parseInt(e.target.value);
            if (lv === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: lv }).run();
          }}
          className="h-7 bg-night-700 text-mist text-xs rounded px-2 border border-night-500 focus:outline-none focus:border-flare"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>

        <Sep />

        {/* Text style */}
        <Btn active={editor.isActive('bold')}
             onClick={() => editor.chain().focus().toggleBold().run()}
             title="Bold (Ctrl+B)">
          <FiBold />
        </Btn>
        <Btn active={editor.isActive('italic')}
             onClick={() => editor.chain().focus().toggleItalic().run()}
             title="Italic (Ctrl+I)">
          <FiItalic />
        </Btn>
        <Btn active={editor.isActive('underline')}
             onClick={() => editor.chain().focus().toggleUnderline().run()}
             title="Underline (Ctrl+U)">
          <FiUnderline />
        </Btn>
        <Btn active={editor.isActive('strike')}
             onClick={() => editor.chain().focus().toggleStrike().run()}
             title="Strikethrough">
          <s className="text-xs leading-none">S</s>
        </Btn>

        <Sep />

        {/* Text color */}
        <label
          title="Text colour"
          className="w-7 h-7 flex items-center justify-center rounded cursor-pointer hover:bg-night-700 transition-colors relative"
        >
          <span className="text-xs font-bold text-mist select-none">A</span>
          <input
            type="color"
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
            title="Text colour"
          />
        </label>

        <Sep />

        {/* Alignment */}
        <Btn active={editor.isActive({ textAlign: 'left' })}
             onClick={() => editor.chain().focus().setTextAlign('left').run()}
             title="Align left">
          <FiAlignLeft />
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'center' })}
             onClick={() => editor.chain().focus().setTextAlign('center').run()}
             title="Align centre">
          <FiAlignCenter />
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'right' })}
             onClick={() => editor.chain().focus().setTextAlign('right').run()}
             title="Align right">
          <FiAlignRight />
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn active={editor.isActive('bulletList')}
             onClick={() => editor.chain().focus().toggleBulletList().run()}
             title="Bullet list">
          <FiList />
        </Btn>
        <Btn active={editor.isActive('orderedList')}
             onClick={() => editor.chain().focus().toggleOrderedList().run()}
             title="Numbered list">
          <span className="text-xs leading-none">1.</span>
        </Btn>

        <Sep />

        {/* Block */}
        <Btn active={editor.isActive('blockquote')}
             onClick={() => editor.chain().focus().toggleBlockquote().run()}
             title="Blockquote">
          <span className="text-base leading-none">"</span>
        </Btn>
        <Btn active={false}
             onClick={() => editor.chain().focus().setHorizontalRule().run()}
             title="Horizontal rule">
          <FiMinus />
        </Btn>

        <Sep />

        {/* Table */}
        <Btn active={false}
             onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
             title="Insert 3×3 table">
          <span className="text-xs leading-none">⊞</span>
        </Btn>

        {/* Table context controls */}
        {inTable && (
          <>
            <Sep />
            {[
              ['+Row',  () => editor.chain().focus().addRowAfter().run(),   'Add row after'],
              ['-Row',  () => editor.chain().focus().deleteRow().run(),     'Delete row'],
              ['+Col',  () => editor.chain().focus().addColumnAfter().run(),'Add column after'],
              ['-Col',  () => editor.chain().focus().deleteColumn().run(),  'Delete column'],
            ].map(([label, fn, title]) => (
              <button
                key={label}
                type="button"
                onMouseDown={e => { e.preventDefault(); fn(); }}
                title={title}
                className="px-2 h-7 text-xs text-mist hover:bg-night-700 hover:text-star rounded transition-colors"
              >{label}</button>
            ))}
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
              title="Delete table"
              className="px-2 h-7 text-xs text-red-400 hover:bg-night-700 hover:text-red-300 rounded transition-colors"
            >✕ Table</button>
          </>
        )}

        <div className="flex-1" />

        {/* File upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload a .docx or .pdf file"
          className="flex items-center gap-1.5 px-2.5 h-7 text-xs rounded bg-flare-deep/50 hover:bg-flare-deep/60 text-amber border border-flare-deep/50 transition-colors disabled:opacity-50 shrink-0"
        >
          <FiUpload className="text-xs" />
          {uploading ? 'Reading…' : 'Upload File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* ── Editor ── */}
      <div className="bg-night-800 p-4">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="bg-night-800 border-t border-night-600 px-4 py-2">
          <p className="text-red-400 text-xs">{uploadError}</p>
        </div>
      )}
    </div>
  );
}
