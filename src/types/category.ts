export type Category = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  sort_order: number;
  meta_title?: string | null;
  meta_description?: string | null;
};
