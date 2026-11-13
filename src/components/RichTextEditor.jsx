import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {TextStyle} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import {Table} from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

const ToolbarButton = ({ onClick, active, disabled, children, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`px-2 py-1 text-xs rounded border whitespace-nowrap ${
      active
        ? "bg-black text-white border-black"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px bg-gray-300 mx-1 my-1" />
);

const COLORS = [
  "#000000",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

const RichTextEditor = ({ value, onChange, disabled }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Image,
      Placeholder.configure({
        placeholder: "Write the product description here...",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="w-full max-w-[700px] border border-gray-300 rounded">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
        {/* Headings */}
        <select
          className="text-xs border border-gray-300 rounded px-1 py-1 bg-white"
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(val) })
                .run();
            }
          }}
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
              ? "3"
              : editor.isActive("heading", { level: 4 })
              ? "4"
              : editor.isActive("heading", { level: 5 })
              ? "5"
              : editor.isActive("heading", { level: 6 })
              ? "6"
              : "p"
          }
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        <ToolbarDivider />

        <ToolbarButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <b>B</b>
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          label="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          label="Subscript"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive("subscript")}
        >
          X&#8322;
        </ToolbarButton>
        <ToolbarButton
          label="Superscript"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive("superscript")}
        >
          X&sup2;
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text color swatches */}
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => editor.chain().focus().setColor(color).run()}
            className="w-5 h-5 rounded-full border border-gray-300"
            style={{ backgroundColor: color }}
          />
        ))}
        <ToolbarButton
          label="Remove color"
          onClick={() => editor.chain().focus().unsetColor().run()}
        >
          &times;
        </ToolbarButton>
        <ToolbarButton
          label="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
        >
          Hi-lite
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Align left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        >
          &#8676;
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        >
          &#8596;
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        >
          &#8677;
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          &bull; List
        </ToolbarButton>
        <ToolbarButton
          label="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          &ldquo;&rdquo;
        </ToolbarButton>
        <ToolbarButton
          label="Code Block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        >
          &lt;/&gt;
        </ToolbarButton>
        <ToolbarButton
          label="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          &mdash;
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton label="Link" onClick={setLink} active={editor.isActive("link")}>
          Link
        </ToolbarButton>
        <ToolbarButton label="Image" onClick={addImage}>
          Image
        </ToolbarButton>
        <ToolbarButton label="Table" onClick={addTable}>
          Table
        </ToolbarButton>

        {editor.isActive("table") && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              label="Add column"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              +Col
            </ToolbarButton>
            <ToolbarButton
              label="Delete column"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              -Col
            </ToolbarButton>
            <ToolbarButton
              label="Add row"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              +Row
            </ToolbarButton>
            <ToolbarButton
              label="Delete row"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              -Row
            </ToolbarButton>
            <ToolbarButton
              label="Delete table"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              Del Table
            </ToolbarButton>
          </>
        )}

        <ToolbarDivider />

        <ToolbarButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          &#8630;
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          &#8631;
        </ToolbarButton>
      </div>

      {/* Editable area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-3 py-2 min-h-[200px] max-h-[500px] overflow-y-auto focus:outline-none [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:outline-none [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100"
      />
    </div>
  );
};

export default RichTextEditor;