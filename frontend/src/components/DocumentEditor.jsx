import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";

// const contentInitialized = useRef(false);

const DocumentEditor = ({ onChange, initialContent = "" }) => {
  const contentInitialized = useRef(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Link,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent || "<p>Start writing here...</p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] p-3 focus:outline-none prose prose-sm sm:prose lg:prose-lg max-w-none",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // This ensures content is reset on load or when initialContent changes
  // useEffect(() => {
  //   if (editor && initialContent) {
  //     editor.commands.setContent(initialContent, false);
  //   }
  // }, [editor, initialContent]);

  useEffect(() => {
    if (editor && initialContent && !contentInitialized.current) {
      editor.commands.setContent(initialContent, false);
      contentInitialized.current = true;
    }
  }, [editor, initialContent]);

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded bg-white h-full overflow-auto">
      {/* Toolbar */}
      <div className="p-2 border-b flex flex-wrap items-center gap-2 text-sm font-medium bg-gray-50">
        {[
          { label: "Bold", action: () => editor.chain().focus().toggleBold().run() },
          { label: "Italic", action: () => editor.chain().focus().toggleItalic().run() },
          { label: "Underline", action: () => editor.chain().focus().toggleUnderline().run() },
          { label: "• List", action: () => editor.chain().focus().toggleBulletList().run() },
          { label: "1. List", action: () => editor.chain().focus().toggleOrderedList().run() },
          { label: "Clear", action: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
        ].map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            className="px-2 py-1 rounded border bg-white hover:bg-blue-50 text-gray-700"
          >
            {btn.label}
          </button>
        ))}

        {/* Heading Dropdown */}
        <select
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: val }).run();
          }}
          defaultValue=""
          className="text-sm border px-2 py-1 rounded"
        >
          <option value="">Text</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
        </select>

        {/* Alignment */}
        {["left", "center", "right"].map((align) => (
          <button
            key={align}
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
            className="px-2 py-1 rounded border bg-white hover:bg-blue-50 text-gray-700"
          >
            {align.charAt(0).toUpperCase() + align.slice(1)}
          </button>
        ))}

        {/* Font Color */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Font Color"
        />

        {/* Highlight Color Palette */}
        {["#fef08a", "#fca5a5", "#bbf7d0", "#a5b4fc"].map((color, i) => (
          <button
            key={i}
            onClick={() => editor.chain().focus().setHighlight({ color }).run()}
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: color }}
            title={`Highlight ${color}`}
          />
        ))}

        {/* Font Family Dropdown */}
        <select
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="text-sm border px-2 py-1 rounded"
          defaultValue=""
        >
          <option value="" disabled>Font</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Verdana">Verdana</option>
        </select>

        {/* Insert Table */}
        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          className="px-2 py-1 rounded border bg-white hover:bg-blue-50 text-gray-700"
        >
          Insert Table
        </button>

        {/* Table Controls */}
        {[
          { label: "+ Row", action: () => editor.chain().focus().addRowAfter().run() },
          { label: "- Row", action: () => editor.chain().focus().deleteRow().run() },
          { label: "+ Col", action: () => editor.chain().focus().addColumnAfter().run() },
          { label: "- Col", action: () => editor.chain().focus().deleteColumn().run() },
        ].map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            className="px-2 py-1 rounded border bg-white hover:bg-blue-50 text-gray-700"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Editor Body */}
      <EditorContent editor={editor} className="h-[calc(100%-40px)] overflow-auto bg-white" />
    </div>
  );
};

export default DocumentEditor;
