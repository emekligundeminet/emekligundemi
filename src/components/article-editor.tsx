"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Heading2,
  Heading3,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Table,
} from "lucide-react";

type ArticleEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

function cx(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ArticleEditor({
  value,
  onChange,
  placeholder = "İçeriği buraya yazın",
  className,
  minHeight = "320px",
}: ArticleEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          HTMLAttributes: { target: "_self", rel: "" },
        },
      }),
      Placeholder.configure({ placeholder }),
      TableKit.configure({
        table: { resizable: false, renderWrapper: true },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[260px] text-slate-700 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_a]:text-red-600 [&_a]:underline",
      },
    },
  });

  useEffect(() => {
    if (!editor || value === undefined) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const href = editor.getAttributes("link").href as string | undefined;
    setCustomUrl(href ?? "");
    setLinkNewTab(editor.getAttributes("link").target === "_blank");
    setLinkDialogOpen(true);
  }, [editor]);

  const insertCustomLink = useCallback(() => {
    if (!editor) return;
    const href = customUrl.trim();
    if (!href) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href,
        target: linkNewTab ? "_blank" : "_self",
        rel: linkNewTab ? "noopener noreferrer" : "",
      })
      .run();
    setLinkDialogOpen(false);
    setCustomUrl("");
  }, [editor, customUrl, linkNewTab]);

  if (!editor) return null;

  const active = (on: boolean) =>
    on
      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
      : "";

  return (
    <div
      className={cx(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-input bg-background",
        className
      )}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-input bg-muted/40 px-2 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={active(editor.isActive("heading", { level: 2 }))}
          title="Başlık 2"
        >
          <Heading2 className="size-4" />
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={active(editor.isActive("heading", { level: 3 }))}
          title="Başlık 3"
        >
          <Heading3 className="size-4" />
          H3
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={active(editor.isActive("bold"))}
          title="Kalın"
        >
          <Bold className="size-4" />
          Kalın
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={active(editor.isActive("bulletList"))}
          title="Madde listesi"
        >
          <List className="size-4" />
          Madde
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={active(editor.isActive("orderedList"))}
          title="Numaralı liste"
        >
          <ListOrdered className="size-4" />
          Numaralı
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLinkDialog}
          title="Link ekle"
          className={active(editor.isActive("link"))}
        >
          <Link2 className="size-4" />
          Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="Linki kaldır"
        >
          <Link2Off className="size-4" />
          Link kaldır
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          disabled={editor.isActive("table")}
          title="Tablo ekle"
          className={active(editor.isActive("table"))}
        >
          <Table className="size-4" />
          Tablo
        </Button>
        {editor.isActive("table") ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              + Satır
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              + Sütun
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              Tablo sil
            </Button>
          </>
        ) : null}
      </div>
      <div
        className="rich-editor min-h-0 flex-1 overflow-y-auto px-3 py-2 text-sm outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset [&_.tiptap]:outline-none [&_.tiptap_.is-empty::before]:text-muted-foreground [&_.tiptap_.is-empty::before]:content-[attr(data-placeholder)]"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="https://… veya /haber/slug"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={linkNewTab}
                onChange={(e) => setLinkNewTab(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">Yeni sekmede aç</span>
            </label>
            <Button onClick={insertCustomLink} className="w-full" disabled={!customUrl.trim()}>
              Linki uygula
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
