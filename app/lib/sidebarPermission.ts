type PermissionItem = {
  menuId?: number | string | null;
  view?: boolean | null;
  menu?: {
    translations?: Array<{
      slug?: string | null;
    }>;
  };
};

type SidebarNode = {
  id?: number | string | null;
  slug?: string | null;
  isFe?: boolean;
  children?: SidebarNode[];
  [key: string]: any;
};

function normalizeId(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim();
}

function normalizeSlug(value: string | null | undefined) {
  const normalized = String(value || "").trim();
  if (!normalized || normalized === "#" || normalized === "-") return "";
  return normalized;
}

export function filterSidebarTreeByPermission(
  nodes: SidebarNode[],
  permission: PermissionItem[] | null | undefined
) {
  if (!Array.isArray(nodes) || !nodes.length) return [];
  if (!Array.isArray(permission) || !permission.length) return nodes;

  const allowedMenuIds = new Set(
    permission
      .filter((item) => Boolean(item?.view))
      .map((item) => normalizeId(item?.menuId))
      .filter(Boolean) as string[]
  );

  const allowedSlugs = new Set(
    permission
      .filter((item) => Boolean(item?.view))
      .flatMap((item) =>
        !normalizeId(item?.menuId) && Array.isArray(item?.menu?.translations)
          ? item.menu.translations
              .map((translation) => normalizeSlug(translation?.slug))
              .filter(Boolean)
          : []
      )
  );

  // const cmsBuilderSlugs = new Set([
  //   "/cms/module/menu/cms/list",
  //   "/cms/module/page/cms/list",
  //   "/cms/module/category/cms/list",
  //   "/cms/module/menuweb/cms/list",
  //   "/cms/module/template/cms/list",
  //   "/cms/module/typeMenu/cms/list",
  //   "/cms/module/wording/general/list",
  // ]);

  // const canAccessCmsContent = Array.from(allowedSlugs).some((slug) =>
  //   cmsBuilderSlugs.has(slug)
  // );

  if (!allowedMenuIds.size && !allowedSlugs.size) return nodes;

  const visit = (items: SidebarNode[]): SidebarNode[] =>
    items.reduce<SidebarNode[]>((acc, item) => {
      const children = visit(Array.isArray(item.children) ? item.children : []);
      const itemId = normalizeId(item.id);
      const itemSlug = normalizeSlug(item.slug);
      const isAllowed =
        (item.isFe) ||
        (itemId && allowedMenuIds.has(itemId)) ||
        (itemSlug && allowedSlugs.has(itemSlug));

      if (!isAllowed && !children.length) return acc;

      acc.push({
        ...item,
        children,
      });
      return acc;
    }, []);
console.log('nodes',nodes)
  return visit(nodes);
}
