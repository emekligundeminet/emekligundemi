"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EvergreenLinkPicker } from "@/components/evergreen-link-picker";
import { CtaLinkDialog } from "@/components/cta-link-dialog";
import { IcLinkCta, type IcLinkCtaAttrs } from "@/lib/tiptap/ic-link-cta";
import { uploadArticleImage } from "@/lib/upload-article-image";
import { readNaturalSize } from "@/lib/read-natural-size";
import { toast } from "sonner";
import {
  Bold,
  Heading2,
  Heading3,
  Heading4,
  ImageIcon,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Loader2,
  SquareArrowOutUpRight,
  Table,
} from "lucide-react";

type ArticleEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  variant?: "news" | "blog";
  excludeArticleId?: string;
  categoryId?: string;
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
  variant = "news",
  excludeArticleId,
  categoryId,
}: ArticleEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [savedRange, setSavedRange] = useState<{ from: number; to: number } | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageAlt, setImageAlt] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [ctaDialogOpen, setCtaDialogOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
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
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-md max-w-full h-auto",
          loading: "lazy",
          decoding: "async",
        },
      }),
      TableKit.configure({
        table: { resizable: false, renderWrapper: true },
      }),
      IcLinkCta,
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[260px] text-slate-700 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_a]:text-red-600 [&_a]:underline [&_img]:my-3 [&_img]:rounded-md [&_img]:h-auto [&_img]:w-full [&_img]:max-w-full",
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
    const { from, to } = editor.state.selection;
    setSavedRange({ from, to });
    setSelectedText(editor.state.doc.textBetween(from, to, " ").trim());
    setLinkDialogOpen(true);
  }, [editor]);

  const insertLinkAtCursor = useCallback(
    (href: string, anchor: string) => {
      const safeHref = href.trim();
      const safeAnchor = anchor.trim();
      if (!safeHref || !safeAnchor) return;
      if (!editor) {
        void navigator.clipboard
          .writeText(`[${safeAnchor}](${safeHref})`)
          .then(() => toast.success("Link panoya kopyalandı."))
          .catch(() => toast.error("Link eklenemedi."));
        return;
      }
      if (savedRange) {
        editor.chain().focus().setTextSelection(savedRange).run();
      }
      const { from, to } = editor.state.selection;
      const selected = editor.state.doc.textBetween(from, to, " ").trim();
      const mark = { type: "link", attrs: { href: safeHref, target: "_self", rel: "" } };
      const insertLinked = () =>
        editor
          .chain()
          .focus()
          .insertContent({ type: "text", text: safeAnchor, marks: [mark] })
          .run();
      const ok =
        from !== to && selected === safeAnchor
          ? editor.chain().focus().extendMarkRange("link").setLink(mark.attrs).run()
          : from !== to
            ? editor.chain().focus().deleteSelection().run() && insertLinked()
            : insertLinked();
      if (!ok) {
        void navigator.clipboard
          .writeText(`[${safeAnchor}](${safeHref})`)
          .then(() => toast.success("Link panoya kopyalandı."))
          .catch(() => toast.error("Link eklenemedi."));
      }
    },
    [editor, savedRange]
  );

  const insertCta = useCallback(
    (attrs: IcLinkCtaAttrs) => {
      if (!editor) return;
      editor.chain().focus().setIcLinkCta(attrs).run();
    },
    [editor]
  );

  const insertEditorImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !editor) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Lütfen bir görsel seçin.");
        return;
      }
      setImageUploading(true);
      try {
        const src = await uploadArticleImage(file);
        let width: number | undefined;
        let height: number | undefined;
        try {
          const size = await readNaturalSize(file);
          width = size.width;
          height = size.height;
        } catch {
          // Boyut yoksa img yine eklenir; public katman 16/9 fallback uygular.
        }
        editor
          .chain()
          .focus()
          .setImage({
            src,
            alt: imageAlt.trim() || file.name,
            ...(width && height ? { width, height } : {}),
          })
          .run();
        setImageDialogOpen(false);
        setImageAlt("");
        toast.success("Görsel eklendi.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Yükleme başarısız.");
      } finally {
        setImageUploading(false);
      }
    },
    [editor, imageAlt]
  );

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
        {variant === "news" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={active(editor.isActive("heading", { level: 3 }))}
              title="İç başlık (H3)"
            >
              <Heading3 className="size-4" />
              H3
            </Button>
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
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              className={active(editor.isActive("heading", { level: 4 }))}
              title="Başlık 4"
            >
              <Heading4 className="size-4" />
              H4
            </Button>
          </>
        ) : (
          <>
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
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              className={active(editor.isActive("heading", { level: 4 }))}
              title="Başlık 4"
            >
              <Heading4 className="size-4" />
              H4
            </Button>
          </>
        )}
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
          onClick={() => setCtaDialogOpen(true)}
          title="İç link kutusu (rehber / hesaplama aracı)"
          className={active(editor.isActive("icLinkCta"))}
        >
          <SquareArrowOutUpRight className="size-4" />
          İç link kutusu
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setImageAlt("");
            setImageDialogOpen(true);
          }}
          title="Görsel ekle"
        >
          <ImageIcon className="size-4" />
          Görsel
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

      <EvergreenLinkPicker
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        excludeId={excludeArticleId}
        categoryId={categoryId}
        selectedText={selectedText}
        linkCount={(editor.getHTML().match(/<a\s/gi) ?? []).length}
        onInsert={insertLinkAtCursor}
      />

      <CtaLinkDialog
        open={ctaDialogOpen}
        onOpenChange={setCtaDialogOpen}
        excludeId={excludeArticleId}
        onInsert={insertCta}
      />

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Görsel ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Alt metin (SEO)
              </label>
              <Input
                placeholder="Görseli kısaca anlatın"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
            <Input
              type="file"
              accept="image/*"
              disabled={imageUploading}
              onChange={insertEditorImage}
              className="cursor-pointer text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1"
            />
            {imageUploading ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Yükleniyor…
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
