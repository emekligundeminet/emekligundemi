"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArticleForm } from "@/components/article-form";
import type { Article } from "@/types/article";
import { Loader2 } from "lucide-react";

export default function AdminArticleEditPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [article, setArticle] = useState<Article | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setArticle(null);
      return;
    }
    fetch(`/api/admin/articles/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setArticle(data))
      .catch(() => setArticle(null));
  }, [id]);

  if (article === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (article === null) {
    return <p className="text-muted-foreground">Haber bulunamadı.</p>;
  }

  return (
    <div className="w-full max-w-none py-4">
      <ArticleForm initialData={article} />
    </div>
  );
}
