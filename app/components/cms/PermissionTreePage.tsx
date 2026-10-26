"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { FetchData, GetEncrypt } from "app/lib/helper";
import { useDecryptedLoginState } from "app/lib/authUtils";
import { usePageTitle } from "app/lib/PageTitelCmsContext";

type PermissionFlags = {
  view: boolean;
  create: boolean;
  update: boolean;
  deleted: boolean;
  approval: boolean;
  isActive: boolean;
} | null;

type PermissionTreeNode = {
  id: number;
  parentId: number | null;
  title: string;
  slug: string;
  sort: number;
  permissionId: number | null;
  flags: PermissionFlags;
  children: PermissionTreeNode[];
};

type PermissionTreeResponse = {
  permission: {
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    view?: boolean;
  };
  selectedRoleId: number | null;
  roles: {
    value: number;
    label: string;
  }[];
  tree: PermissionTreeNode[];
};

function PermissionBadge({ active, children }: { active: boolean; children: string }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {children}
    </span>
  );
}

function FlagCheckbox({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
        checked
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export default function PermissionTreePage() {
  const user = useDecryptedLoginState<any>();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roles, setRoles] = useState<PermissionTreeResponse["roles"]>([]);
  const [tree, setTree] = useState<PermissionTreeNode[]>([]);
  const [permission, setPermission] = useState<PermissionTreeResponse["permission"]>({});
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [savingIds, setSavingIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setTitle("Permission Tree");
  }, [setTitle]);

  const expandAll = (nodes: PermissionTreeNode[]) => {
    const next: Record<number, boolean> = {};
    const walk = (items: PermissionTreeNode[]) => {
      items.forEach((item) => {
        next[item.id] = true;
        if (item.children?.length) walk(item.children);
      });
    };
    walk(nodes);
    setExpandedIds(next);
  };

  const loadTree = async (roleId?: number | null) => {
    if (!user?.data?.token) return;
    setLoading(true);
    try {
      const qs = roleId ? `?roleId=${roleId}` : "";
      const rsp = await FetchData(
        `api/cms/permission/tree${qs}`,
        "GET",
        "",
        false,
        user.data.token
      );
      if (rsp?.code === 200) {
        const data = rsp.data as PermissionTreeResponse;
        setPermission(data.permission || {});
        setRoles(data.roles || []);
        setTree(data.tree || []);
        setSelectedRoleId(data.selectedRoleId || null);
        expandAll(data.tree || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [user?.data?.token]);

  const filteredTree = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tree;

    const filterNodes = (nodes: PermissionTreeNode[]): PermissionTreeNode[] =>
      nodes
        .map((node) => {
          const nextChildren = filterNodes(node.children || []);
          const matchesSelf =
            node.title.toLowerCase().includes(keyword) ||
            node.slug.toLowerCase().includes(keyword);

          if (!matchesSelf && nextChildren.length === 0) return null;

          return {
            ...node,
            children: nextChildren,
          };
        })
        .filter((item): item is PermissionTreeNode => Boolean(item));

    return filterNodes(tree);
  }, [tree, search]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const updateNodeFlags = (
    nodes: PermissionTreeNode[],
    nodeId: number,
    nextFlags: NonNullable<PermissionFlags>
  ): PermissionTreeNode[] =>
    nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          flags: nextFlags,
          permissionId: node.permissionId || -1,
        };
      }

      if (!node.children.length) return node;

      return {
        ...node,
        children: updateNodeFlags(node.children, nodeId, nextFlags),
      };
    });

  const handleToggleFlag = async (
    node: PermissionTreeNode,
    field: keyof NonNullable<PermissionFlags>,
    value: boolean
  ) => {
    if (!user?.data?.token || !selectedRoleId) return;

    const currentFlags = node.flags || {
      view: false,
      create: false,
      update: false,
      deleted: false,
      approval: false,
      isActive: true,
    };

    const nextFlags = {
      ...currentFlags,
      [field]: value,
    };

    setTree((prev) => updateNodeFlags(prev, node.id, nextFlags));
    setSavingIds((prev) => ({ ...prev, [node.id]: true }));

    try {
      const rsp = await FetchData(
        "api/cms/permission/toggle",
        "PUT",
        GetEncrypt(
          JSON.stringify({
            roleId: selectedRoleId,
            menuId: node.id,
            ...nextFlags,
          })
        ),
        false,
        user.data.token,
        true
      );

      // await loadTree(selectedRoleId);
      // window.dispatchEvent(new CustomEvent("cms:permission:updated"));
    } finally {
      setSavingIds((prev) => ({ ...prev, [node.id]: false }));
    }
  };

  const renderNode = (node: PermissionTreeNode, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const isOpen = expandedIds[node.id] ?? true;
    const currentFlags = node.flags || {
      view: false,
      create: false,
      update: false,
      deleted: false,
      approval: false,
      isActive: true,
    };
    const isSaving = savingIds[node.id] === true;

    return (
      <div key={node.id} className="space-y-2">
        <div
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          style={{ marginLeft: `${depth * 18}px` }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(node.id)}
                    className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
                  >
                    {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                  </button>
                ) : (
                  <span className="inline-block h-8 w-8" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{node.title}</div>
                  <div className="truncate text-xs text-slate-500">{node.slug}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <FlagCheckbox
                  label="View"
                  checked={currentFlags.view}
                  disabled={isSaving}
                  onChange={(next) => handleToggleFlag(node, "view", next)}
                />
                <FlagCheckbox
                  label="Create"
                  checked={currentFlags.create}
                  disabled={isSaving}
                  onChange={(next) => handleToggleFlag(node, "create", next)}
                />
                <FlagCheckbox
                  label="Update"
                  checked={currentFlags.update}
                  disabled={isSaving}
                  onChange={(next) => handleToggleFlag(node, "update", next)}
                />
                <FlagCheckbox
                  label="Delete"
                  checked={currentFlags.deleted}
                  disabled={isSaving}
                  onChange={(next) => handleToggleFlag(node, "deleted", next)}
                />
                <FlagCheckbox
                  label="Approval"
                  checked={currentFlags.approval}
                  disabled={isSaving}
                  onChange={(next) => handleToggleFlag(node, "approval", next)}
                />
                <FlagCheckbox
                  label="Active"
                  checked={currentFlags.isActive}
                  disabled={isSaving}
                  onChange={(next) => handleToggleFlag(node, "isActive", next)}
                />
                {!node.flags ? (
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                    Belum ada permission
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              {isSaving ? (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
                  Menyimpan...
                </span>
              ) : node.permissionId ? (
                <PermissionBadge active>Permission Tersimpan</PermissionBadge>
              ) : null}
            </div>
          </div>
        </div>

        {hasChildren && isOpen ? (
          <div className="space-y-2">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Permission Tree</div>
            <div className="text-sm text-slate-500">
              Lihat permission berdasarkan struktur menu parent-child agar lebih mudah diupdate.
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:w-auto lg:min-w-[540px]">
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Role</div>
              <select
                value={selectedRoleId || ""}
                onChange={(e) => loadTree(Number(e.target.value) || null)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Cari Menu</div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama menu atau slug"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading permission tree...
        </div>
      ) : filteredTree.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Tidak ada data permission yang sesuai.
        </div>
      ) : (
        <div className="space-y-3">{filteredTree.map((node) => renderNode(node))}</div>
      )}
    </div>
  );
}
