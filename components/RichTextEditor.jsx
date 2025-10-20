'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-base-300 p-2 flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`btn btn-xs ${editor.isActive('bold') ? 'btn-primary' : 'btn-ghost'}`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`btn btn-xs ${editor.isActive('italic') ? 'btn-primary' : 'btn-ghost'}`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`btn btn-xs ${editor.isActive('strike') ? 'btn-primary' : 'btn-ghost'}`}
      >
        Strike
      </button>
      <div className="divider divider-horizontal mx-0"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`btn btn-xs ${editor.isActive('heading', { level: 2 }) ? 'btn-primary' : 'btn-ghost'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`btn btn-xs ${editor.isActive('heading', { level: 3 }) ? 'btn-primary' : 'btn-ghost'}`}
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`btn btn-xs ${editor.isActive('heading', { level: 4 }) ? 'btn-primary' : 'btn-ghost'}`}
      >
        H4
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`btn btn-xs ${editor.isActive('paragraph') ? 'btn-primary' : 'btn-ghost'}`}
      >
        P
      </button>
      <div className="divider divider-horizontal mx-0"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`btn btn-xs ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-ghost'}`}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`btn btn-xs ${editor.isActive('orderedList') ? 'btn-primary' : 'btn-ghost'}`}
      >
        Numbered List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`btn btn-xs ${editor.isActive('blockquote') ? 'btn-primary' : 'btn-ghost'}`}
      >
        Quote
      </button>
      <div className="divider divider-horizontal mx-0"></div>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`btn btn-xs ${editor.isActive('link') ? 'btn-primary' : 'btn-ghost'}`}
      >
        Link
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className="btn btn-xs btn-ghost"
      >
        Unlink
      </button>
      <div className="divider divider-horizontal mx-0"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="btn btn-xs btn-ghost"
      >
        HR
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="btn btn-xs btn-ghost"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="btn btn-xs btn-ghost"
      >
        Redo
      </button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Write your content here...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className="border border-base-300 rounded-lg bg-base-100">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
