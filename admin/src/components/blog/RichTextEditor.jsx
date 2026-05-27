import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  Quote,
  Code2,
  Heading1,
  Heading2,
  Eraser,
} from 'lucide-react';

const controls = [
  { command: 'bold', label: 'Bold', icon: Bold },
  { command: 'italic', label: 'Italic', icon: Italic },
  { command: 'underline', label: 'Underline', icon: Underline },
  { command: 'formatBlock', label: 'H1', icon: Heading1, value: 'H1' },
  { command: 'formatBlock', label: 'H2', icon: Heading2, value: 'H2' },
  { command: 'insertUnorderedList', label: 'Bullet List', icon: List },
  { command: 'insertOrderedList', label: 'Numbered List', icon: ListOrdered },
  { command: 'formatBlock', label: 'Quote', icon: Quote, value: 'BLOCKQUOTE' },
  { command: 'formatBlock', label: 'Code', icon: Code2, value: 'PRE' },
  { command: 'createLink', label: 'Link', icon: Link2 },
  { command: 'removeFormat', label: 'Clear', icon: Eraser },
];

const RichTextEditor = ({ value, onChange, placeholder = 'Write your story here...' }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execute = (command, commandValue) => {
    editorRef.current?.focus();
    if (command === 'createLink') {
      const url = window.prompt('Enter URL');
      if (url) document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false, commandValue || null);
    }
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90">
      <div className="flex flex-wrap gap-2 border-b border-white/10 bg-white/5 p-3">
        {controls.map(({ command, label, icon: Icon, value: commandValue }) => (
          <button
            key={label}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => execute(command, commandValue)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-white"
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        className="min-h-[380px] max-w-full overflow-hidden break-words whitespace-pre-wrap px-5 py-4 text-sm leading-7 text-slate-100 outline-none"
        data-placeholder={placeholder}
        style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
      />
      <style>{`
        [contenteditable=true]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
        }

        [contenteditable=true],
        [contenteditable=true] * {
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: pre-wrap;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
