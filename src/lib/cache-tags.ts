/**
 * Cache tag'leri her zaman tenant_id içerir.
 * tenant_id'siz tag yasak — çapraz tenant sızıntısı.
 */
function requireTenantId(tenantId: string) {
  const id = tenantId.trim();
  if (!id) throw new Error("cache tag için tenant_id zorunlu.");
  return id;
}

export function cacheTags(tenantId: string) {
  const t = requireTenantId(tenantId);
  return {
    article: (slug: string) => `t-${t}-article-${slug}`,
    articles: `t-${t}-articles`,
    home: `t-${t}-home`,
    categories: `t-${t}-categories`,
    category: (slug: string) => `t-${t}-category-${slug}`,
    blog: `t-${t}-blog`,
  };
}
