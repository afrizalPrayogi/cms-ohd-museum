// OrderTableWithFeatures.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronRight as FiChevronCollapsed,
  FiCircle,
  FiSave,
  FiXCircle,
  FiEye,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiCopy,
  FiClock,
  FiSearch,
  FiAlertTriangle,
} from "react-icons/fi";
import { buildApiUrl, FetchData, GetEncrypt, startCmsNavigationLoading } from "../../../lib/helper";
import { useDecryptedLoginState } from "../../../lib/authUtils";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import ButtonUi from "./ButtonUi";
import InputField from "./InputField";
import { HeaderTable, Step } from "../../../types";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageTitle } from "../../../lib/PageTitelCmsContext";
import { wordingTr } from "app/lib/translationWording";
import { toast } from "react-toastify";

// Define Order Type
type Order = {
  [key: string]: any;
  id: string;
  children?: Order[];
};
type AuditHistoryItem = {
  id: number;
  user: string;
  action: string;
  urlApi: string;
  urlFe: string;
  bodyApi: string;
  createdAt: string;
  ip: string;
  menuLabel: string;
  pageLabel: string;
};
type Props = {
  moduleName: string;
  folder: string;
};

const TableWPM: React.FC<Props> = ({ moduleName, folder }) => {
  const [editTable, setEditTable] = useState<boolean>(false);
  const [loadBtn, setLoadBtn] = useState<boolean>(false);
  const [permission, setPermission] = useState<any>({});
  const [searchCol, setSearchCol] = useState<boolean>(true);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [btnAdd, setBtnAdd] = useState<boolean>(true);
  const [btnAddLabel, setBtnAddLabel] = useState<string>("");
  const [btnCopy, setBtnCopy] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number | null>(null);

  const [columns, setColumns] = useState<HeaderTable[]>([]);
  const [data, setData] = useState<Order[]>([]);
  const [sortBy, setSortBy] = useState<keyof Order | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const user = useDecryptedLoginState();
  const [totalRows, setTotalRows] = useState(0);
  const [addRow, setAddRow] = useState(false);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [editRowindex, setEditRowindex] = useState(-1);
  const [editRow, setEditRow] = useState<Record<string, any>>({});
  const [viewData, setViewData] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [viewLang, setViewLang] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<AuditHistoryItem[]>([]);
  const [historyRow, setHistoryRow] = useState<Order | null>(null);
  const [viewExpandedSteps, setViewExpandedSteps] = useState<
    Record<number, boolean>
  >({});
  const router = useRouter();
  const [loadingTable, setLoadingTable] = useState(false);
  const searchParams = useSearchParams();
  const [draggedRowId, setDraggedRowId] = useState<number | null>(null);
  const { setTitle } = usePageTitle();
  const forceShowAddButton =
    folder === "sosmed" &&
    ["keytopic", "calendercontent", "editorialplan"].includes(moduleName) &&
    ["Add Calender Content", "Add Editorial Plan"].includes(btnAddLabel);
  const getTable = async (isDownload: any) => {
    setLoadingTable(true);
    const params = new URLSearchParams();
    //search
    for (const [key, value] of searchParams.entries()) {
      params.append(key, value);
    }

    for (const key in filterState) {
      const value = filterState[key];
      if (value) {
        params.append(key, value);
      }
    }
    // Sorting
    if (sortBy) {
      params.append("sortBy", sortBy + "");
      params.append("order", sortAsc ? "asc" : "desc"); // "asc" or "desc"
    }
    // Pagination
    params.append("page", currentPage.toString());
    params.append("limit", rowsPerPage.toString());
    //isdownload
    if (isDownload) params.append("isdownload", isDownload);
    const uriData = `api/${folder}/${moduleName}/list?${params.toString()}`;

    try {
      if (isDownload) {
        const res = await fetch(
          buildApiUrl(uriData),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user?.data?.token}`,
            },
          }
        );

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        const isTopicPlan = folder === "sosmed" && moduleName === "topicplan";
        if (isDownload === "pdf") {
          a.download = "user-data.pdf";
        } else {
          a.download = isTopicPlan ? "Topic plan Data.xlsx" : "user-data.xlsx";
        }
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
        setLoadingTable(false);
        return;
      }
      const dataapi = await FetchData(
        uriData,
        "GET",
        "",
        false,
        user?.data?.token
      );
      // console.log("itni prem", dataapi?.data?.initTable);
      setPermission(dataapi?.data?.initTable?.permission);
      setEditTable(dataapi?.data?.initTable?.editTable);
      setBtnAdd(dataapi?.data?.initTable?.buttonAdd);
      setBtnAddLabel(dataapi?.data?.initTable?.buttonAddLabel || "");
      setBtnCopy(dataapi?.data?.initTable?.buttonCopy);
      setSearchCol(dataapi?.data?.initTable?.searchTable);
      setTitle(dataapi?.data?.title);
      setColumns(dataapi?.data?.header);
      setData(dataapi?.data?.body);
      setTotalRows(dataapi?.data?.total ?? 0); // tambahkan ini di backend response
      const defaultFilters: Record<string, string> = {};
      dataapi?.data?.header?.forEach(
        (col: HeaderTable) => (defaultFilters[col.key] = "")
      );
      setFilterState((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(defaultFilters).forEach((key) => {
          if (!(key in next)) {
            next[key] = "";
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    } catch (error) {
    } finally {
      setLoadingTable(false);
    }
  };
  const toggleSort = (field: keyof Order) => {
    const asc = field === sortBy ? !sortAsc : true;
    setSortBy(field);
    setSortAsc(asc);
  };
  useEffect(() => {
    getTable(false);
  }, [filterState, sortAsc, sortBy, currentPage, rowsPerPage, searchParams]);

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const currentData = data;
  const isPageList = folder === "cms" && moduleName === "page";
  const updateQuickFilter = (key: string, value: string) => {
    setCurrentPage(1);
    setFilterState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const searchableColumns = columns.filter((col) => !col.noSearch);
  async function handleView(id: string) {
    setLoadingView(true);
    setShowViewModal(true); // tampilkan modal dulu (optional)

    try {
      const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
      const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
      const uriView = `api/${folder}/${moduleName}/form/${id}${rawQs}`;
      const res = await FetchData(uriView, "GET", "", false, user?.data?.token);
      const formPayload = res?.data ?? null;
      const formLangs = formPayload?.data ?? [];
      setViewData(formPayload);
      setViewLang(formLangs[0]?.name || "");
      setViewExpandedSteps(
        Object.fromEntries(
          (formLangs[0]?.data || []).map((_: Step, index: number) => [
            index,
            true,
          ])
        )
      );
      await logTableAction("VIEW", id, uriView, { id }, { id });
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setViewData(null);
    } finally {
      setLoadingView(false);
    }
  }
  function handleEdit(index) {
    setEditRowindex(index);
  }
  function handleDelete(rowId, row?: Order): void {
    const confirmed = window.confirm(
      "Are you sure you want to delete this data?"
    );
    if (!confirmed) return;

    // Lakukan DELETE request
    const deleteRow = async () => {
      try {
        const uriDelete = `api/${folder}/${moduleName}/delete`;
        const idDel = GetEncrypt(JSON.stringify({ id: rowId }));
        await FetchData(uriDelete, "PUT", idDel, false, user?.data?.token);
        await logTableAction("DELETE", String(rowId), uriDelete, { id: rowId }, row);
        getTable(false);
      } catch (err) {
        console.error("Delete failed", err);
      }
    };

    deleteRow();
  }
  function handleCopy(rowId, row?: Order): void {
    const confirmed = window.confirm(
      "Are you sure you want to Copy this data?"
    );
    if (!confirmed) return;

    // Lakukan copy request
    const CopyRow = async () => {
      try {
        const rawQueryString = searchParams.toString();
        const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
        const uriCopy = `api/${folder}/${moduleName}/copy${rawQs}`;
        const idDel = GetEncrypt(JSON.stringify({ id: rowId }));
        const result = await FetchData(uriCopy, "PUT", idDel, false, user?.data?.token);
        if (result?.code !== 200) return;
        await logTableAction(
          "COPY",
          String(rowId),
          uriCopy,
          {
            id: rowId,
            resultId: result?.data?.id,
          },
          row
        );
        getTable(false);
      } catch (err) {
        console.error("Delete failed", err);
      }
    };

    CopyRow();
  }
  const renderRow = (row: Order, level = 0, index = -1) => {
    // Kalau row belum ada di expandedRows, default true
    const isExpanded = expandedRows[row.id] ?? true;
    const hasChildren = !!row.children?.length;
    const rowNo =
      level === 0
        ? (currentPage - 1) * rowsPerPage + index + 1
        : index + 1;

    // Pastikan kalau default true, langsung masuk ke state biar konsisten
    if (expandedRows[row.id] === undefined) {
      setExpandedRows((prev) => ({ ...prev, [row.id]: true }));
    }

    return (
      <React.Fragment key={row.id}>
        <tr
          key={"rw  " + row.id}
          className="border-t-2 border-gray-200"
          draggable
          onDragStart={() => setDraggedRowId(Number(row.id))}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(Number(row.id))}
        >
          <td
            className="w-14 px-2 py-2 text-center text-sm font-semibold text-slate-600"
            style={level > 0 ? { paddingLeft: `${level * 14 + 8}px` } : {}}
          >
            {rowNo}
          </td>
          {columns?.map((col, idx) => (
            <td
              key={col.key as string}
              className="py-2 px-2 text-sm"
              style={idx === 0 ? { paddingLeft: `${level * 20 + 16}px` } : {}}
            >
              {idx === 0 && hasChildren && (
                <button
                  onClick={() =>
                    setExpandedRows((prev) => ({
                      ...prev,
                      [row.id]: !prev[row.id],
                    }))
                  }
                  className="text-xs mr-1"
                >
                  {isExpanded ? <FiChevronDown /> : <FiChevronCollapsed />}
                </button>
              )}

              {editRowindex != index ? (
                col.type == "text" || col.type == "number" || col.type == "date" ? (
                  col.key === "approvalStatus" ? (
                    renderApprovalBadge(row[col.key])
                  ) : (
                    <>
                      {typeof row[col.key] == "object"
                      ? String(row[col.key]?.label ?? "")
                      : String(row[col.key] ?? "")}
                    </>
                  )
                ) : col.type == "boolean" ? (
                  row[col.key] ? (
                    <div className="text-blue-600">
                      <FaCheckCircle />
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <FiCircle />
                    </div>
                  )
                ) : col.type == "html" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: String(row[col.key] ?? ""),
                    }}
                    onClick={handleLinkClick}
                  />
                ) : (
                  ""
                )
              ) : (
                <React.Fragment key={index + " " + col.key}>
                  <InputField
                    type={col.typeForm}
                    name={col.key}
                    label={""}
                    value={editRow[col.key] ?? ""}
                    onChange={handleChangeEdit}
                    formValues={editRow}
                    trigerValue={col.trigerValue}
                    uriSelect={col.uriSelect}
                  />
                </React.Fragment>
              )}
            </td>
          ))}
          <td className="py-2 px-2 flex items-start text-center text-lg cursor-pointer sticky right-0 bg-white z-10">
            {editRowindex == index ? (
              <div className="flex gap-2 ">
                <ButtonUi
                  children={""}
                  onClick={async () => {
                    setEditRowindex(-1);
                    setEditRow({});
                  }}
                  variant={"secondary"}
                  icon={<FiXCircle />}
                />
                <ButtonUi
                  children={""}
                  onClick={() => postEditrow(row.id)}
                  icon={<FiSave />}
                />
              </div>
            ) : (
              <div className="flex space-x-2">
                {permission?.view && (
                  <FiEye
                    className="text-green-500 hover:text-green-700 cursor-pointer"
                    onClick={() => handleView(row.id)}
                  />
                )}
                {permission?.edit && (
                  <>
                    <FiEdit
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      onClick={() => {
                        if (editTable) {
                          handleEdit(index);
                          setEditRow(row);
                        } else {
                          const rawQueryString = searchParams.toString();
                          const rawQs =
                            rawQueryString.length > 0
                              ? "&" + rawQueryString
                              : "";
                          startCmsNavigationLoading();
                          router.push(
                            `/cms/module/${moduleName}/${folder}/form?id=${row.id}${rawQs}`
                          );
                        }
                      }}
                    />
                    {btnCopy && (
                      <FiCopy
                        className="text-yellow-500 hover:text-yellow-700 cursor-pointer"
                        onClick={() => {
                          handleCopy(row.id, row);
                        }}
                      />
                    )}
                  </>
                )}
                {permission?.delete && (
                  <FiTrash2
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    onClick={() => {
                      handleDelete(row.id, row);
                    }}
                  />
                )}
                <FiClock
                  className="text-blue-500 hover:text-blue-700 cursor-pointer"
                  title="Log history"
                  onClick={() => handleHistory(row)}
                />
              </div>
            )}
          </td>
        </tr>

        {isExpanded &&
          row.children?.map((child, i) => renderRow(child, level + 1, i))}
      </React.Fragment>
    );
  };
  const getRowLabel = (row?: Partial<Order> | null) => {
    if (!row) return "-";
    return String(
      row.title ??
        row.name ??
        row.slug ??
        row.email ??
        row.PageLabel ??
        row.id ??
        "-"
    );
  };
  const logTableAction = async (
    action: string,
    rowId: string,
    urlApi: string,
    bodyApi: any,
    row?: Partial<Order> | null
  ) => {
    if (!rowId || !user?.data?.token) return;
    try {
      await FetchData(
        "api/cms/audit/history",
        "POST",
        GetEncrypt(
          JSON.stringify({
            moduleName,
            folder,
            rowId,
            action,
            urlApi,
            urlFe:
              typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "-",
            label: getRowLabel(row || { id: rowId }),
            bodyApi,
          })
        ),
        false,
        user.data.token
      );
    } catch (error) {
      console.warn("Audit log failed", error);
    }
  };
  const handleHistory = async (row: Order) => {
    setHistoryRow(row);
    setHistoryLoading(true);
    setShowHistoryModal(true);
    try {
      const res = await FetchData(
        `api/cms/audit/history?moduleName=${encodeURIComponent(
          moduleName
        )}&folder=${encodeURIComponent(folder)}&rowId=${encodeURIComponent(
          row.id
        )}`,
        "GET",
        "",
        false,
        user?.data?.token
      );
      setHistoryData(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("Gagal mengambil history:", error);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  const renderApprovalBadge = (value: any) => {
    const status = String(value?.value ?? value ?? "APPROVED").toUpperCase();
    const config =
      status === "APPROVED"
        ? {
            label: "Approved",
            className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
            icon: <FaCheckCircle className="text-[11px]" />,
          }
        : status === "REJECTED"
          ? {
              label: "Rejected",
              className: "bg-red-50 text-red-700 ring-red-200",
              icon: <FaTimesCircle className="text-[11px]" />,
            }
          : {
              label: "Requested",
              className: "bg-amber-50 text-amber-700 ring-amber-200",
              icon: <FiAlertTriangle className="text-[12px]" />,
            };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${config.className}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };
  const formAddrow = () => {
    return (
      <React.Fragment key={"-1"}>
        <tr className="border-t-2 border-gray-200 bg-sky-100">
          <td className="w-14 px-2 py-2 text-center text-sm font-semibold text-slate-400">
            -
          </td>
          {columns?.map((col, idx) => (
            <td
              key={col.key as string}
              className="p-2 text-sm"
              style={idx === 0 ? { paddingLeft: `${0 * 20 + 16}px` } : {}}
            >
              {/* isi input */}
              <InputField
                type={col.typeForm}
                name={col.key}
                label={""}
                value={newRow[col.key] ?? ""}
                onChange={handleChangeNew}
                formValues={newRow}
                trigerValue={col.trigerValue}
                uriSelect={col.uriSelect}
              />
            </td>
          ))}
          <td className="py-2 px-2 flex items-start  text-lg cursor-pointer sticky right-0 z-10">
            <div className="flex gap-2 ">
              <ButtonUi
                children={""}
                onClick={async () => {
                  setAddRow(false);
                  setNewRow({});
                }}
                variant={"secondary"}
                icon={<FiXCircle />}
              />
              <ButtonUi children={""} onClick={postAddrow} icon={<FiSave />} />
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };
  const handleChangeNew = (name: string, value: any) => {
    setNewRow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleChangeEdit = (name: string, value: any) => {
    setEditRow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const addData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // simulasi API
    setAddRow(true);
    setNewRow({});
  };
  const postAddrow = async () => {
    try {
      const uriPost: string = `api/${folder}/${moduleName}/form/0`;
      const aesraw = GetEncrypt(JSON.stringify({ row: newRow }));
      const dataapi = await FetchData(
        uriPost,
        "POST",
        aesraw,
        true,
        user?.data?.token,
        true
      );
      const createdId = dataapi?.data?.id || dataapi?.data?.data?.id || newRow.id;
      if (createdId) {
        await logTableAction("CREATE", String(createdId), uriPost, newRow, {
          ...newRow,
          id: createdId,
        });
      }
      getTable(false);
      setAddRow(false);
      setNewRow({});
    } catch (error) {
      //console.log("err", newRow);
    }
  };
  const postEditrow = async (id) => {
    try {
      const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
      const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
      const uriPost: string =
        "api/" + folder + "/" + moduleName + "/form/" + id + rawQs;
      const aesraw = GetEncrypt(JSON.stringify({ row: editRow }));
      const dataapi = await FetchData(
        uriPost,
        "PUT",
        aesraw,
        true,
        user?.data?.token,
        true
      );
      await logTableAction("UPDATE", String(id), uriPost, editRow, {
        ...editRow,
        id,
      });
      getTable(false);
      setEditRowindex(-1);
      setEditRow({});
    } catch (error) {
      //console.log("err", newRow);
    }
  };
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Cari elemen <a>
    if (target.tagName === "A") {
      const anchor = target as HTMLAnchorElement;
      const href = anchor.getAttribute("href");

      // Jika internal link (bukan http:// atau https://)
      if (href && !href.startsWith("http")) {
        e.preventDefault();
        startCmsNavigationLoading();
        router.push(href);
      }
    }
  };
  // Untuk flatten data dari nested tree
  const handleDrop = async (targetRowId: number) => {
    if (draggedRowId === null || draggedRowId === targetRowId) return;

    const rawQueryString = searchParams.toString();
    const rawQs = rawQueryString.length > 0 ? "" + rawQueryString : "";
    try {
      const uriPost: string = "api/" + folder + "/" + moduleName + "/reorder";
      const aesraw = GetEncrypt(
        JSON.stringify({
          rawQs,
          draggedId: draggedRowId,
          targetId: targetRowId,
        })
      );
      const dataapi = await FetchData(
        uriPost,
        "POST",
        aesraw,
        true,
        user?.data?.token,
        true
      );
      if (dataapi.code === 200) {
        getTable(false);
      }
      console.log("Minimal payload sent to API");
    } catch (error) {
      console.error("Failed to update order", error);
    }

    setDraggedRowId(null);
  };

  const activeViewForm =
    viewData?.data?.find((item: any) => item.name === viewLang) ??
    viewData?.data?.[0];
  const activeViewSteps: Step[] = activeViewForm?.data ?? [];
  const formatAuditDate = (value: string) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };
  const formatAuditBody = (value: string) => {
    if (!value) return "-";
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  };
  const activeViewValues = activeViewSteps.reduce<Record<string, any>>(
    (values, step) => {
      step.fields.forEach((field) => {
        values[field.name] = field.value ?? "";
      });
      return values;
    },
    {}
  );

  const isViewFieldHidden = (field: any) => {
    if (!field.hideFields) return false;

    return field.hideFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((name: string) => {
        const currentValue = activeViewValues[name];
        const normalizedValue =
          currentValue && typeof currentValue === "object"
            ? currentValue.value
            : currentValue;
        return condition.value.includes(normalizedValue);
      });
    });
  };

  const getViewStepColumn = (title: string) => {
    const normalizedTitle = String(title || "").trim().toLowerCase();
    return ["media", "security", "wording", "variabel", "variable"].includes(
      normalizedTitle
    )
      ? "right"
      : "left";
  };

  const renderViewStep = (step: Step, stepIndex: number) => {
    const isOpen = viewExpandedSteps[stepIndex] ?? true;
    const visibleFields = step.fields.filter(
      (field) => field.type !== "hide" && !isViewFieldHidden(field)
    );

    return (
      <section
        key={`${viewLang}-${stepIndex}-${step.title}`}
        className="overflow-visible rounded-md border border-gray-200 bg-white shadow-sm"
      >
        <button
          type="button"
          onClick={() =>
            setViewExpandedSteps((previous) => ({
              ...previous,
              [stepIndex]: !(previous[stepIndex] ?? true),
            }))
          }
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-gray-50"
          aria-expanded={isOpen}
        >
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {step.title}
            </div>
            <div className="text-[11px] text-gray-500">
              {visibleFields.length} field
            </div>
          </div>
          {isOpen ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        {isOpen && (
          <div className="grid grid-cols-1 gap-2 border-t border-gray-100 p-3 md:grid-cols-12">
            {visibleFields.map((field, fieldIndex) => (
              <div
                key={`${stepIndex}-${fieldIndex}-${field.name}`}
                className={field.cols ?? "col-span-6"}
              >
                <div className="pointer-events-none">
                  <InputField
                    name={field.name}
                    label={field.label}
                    type={field.type}
                    value={field.value ?? ""}
                    onChange={() => undefined}
                    uriSelect={field.uriSelect}
                    disabled
                    formValues={activeViewValues}
                    trigerValue={field.trigerValue}
                    info={field.info}
                    fieldAddRow={field.fieldAddRow}
                    isFieldAddRow={field.isFieldAddRow}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <React.Fragment>
      {loadingTable && (
        <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-xl">
          <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="rounded-2xl shadow-xl">
        {btnAdd && (
          <div className="w-full flex items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-2">
              {folder === "sosmed" && moduleName === "topicplan" ? (
                <>
                  <button
                    type="button"
                    onClick={() => getTable("xls")}
                    className="px-3 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                  >
                    Export Excel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (syncLoading) return;
                      setSyncLoading(true);
                      setSyncProgress(0);
                      let progressTimer: ReturnType<typeof setInterval> | null = null;
                      progressTimer = setInterval(() => {
                        setSyncProgress((prev) => {
                          const current = typeof prev === "number" ? prev : 0;
                          if (current >= 90) return current;
                          return Math.min(90, current + Math.max(1, Math.floor(Math.random() * 6)));
                        });
                      }, 800);
                      try {
                        const res = await FetchData(
                          "api/sosmed/topicplan/sync",
                          "POST",
                          "",
                          false,
                          user?.data?.token
                        );
                        if (res?.code === 200) {
                          await getTable(false);
                          setSyncProgress(100);
                          setTimeout(() => setSyncProgress(null), 800);
                          toast.success(res?.message || "Sync berhasil");
                        } else if (res?.data?.authUrl) {
                          window.open(res.data.authUrl, "_blank");
                        } else {
                          toast.error(res?.message || "Sync gagal");
                        }
                      } finally {
                        if (progressTimer) clearInterval(progressTimer);
                        setSyncLoading(false);
                      }
                    }}
                    className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-70"
                    disabled={syncLoading}
                  >
                    {syncLoading
                      ? `Syncing${typeof syncProgress === "number" ? ` ${syncProgress}%` : "..."}`
                      : "Sync"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await FetchData(
                        "api/sosmed/topicplan/oauth/url",
                        "GET",
                        "",
                        false,
                        user?.data?.token
                      );
                      if (res?.code === 200 && res?.data?.authUrl) {
                        window.open(res.data.authUrl, "_blank");
                      }
                    }}
                    className="px-3 py-2 rounded border border-blue-600 text-blue-700 text-sm hover:bg-blue-50"
                  >
                    Connect Google
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await FetchData(
                        "api/sosmed/topicplan/oauth/reset",
                        "POST",
                        "",
                        false,
                        user?.data?.token
                      );
                      const res = await FetchData(
                        "api/sosmed/topicplan/oauth/url",
                        "GET",
                        "",
                        false,
                        user?.data?.token
                      );
                      if (res?.code === 200 && res?.data?.authUrl) {
                        window.open(res.data.authUrl, "_blank");
                      }
                    }}
                    className="px-3 py-2 rounded border border-amber-600 text-amber-700 text-sm hover:bg-amber-50"
                  >
                    Reconnect Google
                  </button>
                </>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <ButtonUi
                variant="secondary"
                onClick={async () => {
                  startCmsNavigationLoading();
                  router.back();
                }}
                icon={<FiArrowLeft />}
              >
                {wordingTr(user?.data?.langCode, "back")}
              </ButtonUi>
              {(permission?.add || forceShowAddButton) && (
                <ButtonUi
                  icon={<FiSave />}
                  onClick={async () => {
                    if (editTable) {
                      console.log("newrow");
                      addData();
                    } else {
                      setLoadBtn(true);
                      const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
                      const rawQs =
                        rawQueryString.length > 0 ? "?" + rawQueryString : "";
                      startCmsNavigationLoading();
                      router.push(
                        `/cms/module/${moduleName}/${folder}/form${rawQs}`
                      );

                      await new Promise((resolve) => setTimeout(resolve, 200)); // simulasi API
                    }
                  }}
                  variant="primary"
                  children={btnAddLabel || wordingTr(user?.data?.langCode, "add")}
                  load={loadBtn}
                />
              )}
            </div>
          </div>
        )}

        {searchCol && (
          <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <button
              type="button"
              onClick={() => setIsSearchPanelOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={isSearchPanelOpen}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <FiSearch />
                </span>
                Search & Filter
              </span>
              <FiChevronDown
                className={`text-slate-500 transition-transform ${
                  isSearchPanelOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSearchPanelOpen && (
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                {searchableColumns.map((col) => (
                  <div key={col.key}>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      {col.label}
                    </label>
                    {col.type === "boolean" ? (
                      <select
                        className="w-full rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-700"
                        value={filterState[col.key] ?? ""}
                        onChange={(event) =>
                          updateQuickFilter(col.key, event.target.value)
                        }
                      >
                        <option value="">Semua</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : isPageList && col.key === "approvalStatus" ? (
                      <select
                        className="w-full rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-700"
                        value={filterState[col.key] ?? ""}
                        onChange={(event) =>
                          updateQuickFilter(col.key, event.target.value)
                        }
                      >
                        <option value="">Semua Approval</option>
                        <option value="REQUESTED">Requested</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={`Search ${col.label}`}
                        className="w-full rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-700"
                        value={filterState[col.key] ?? ""}
                        onChange={(event) =>
                          updateQuickFilter(col.key, event.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
                <div className="flex items-end">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setCurrentPage(1);
                      setFilterState((prev) => {
                        const next = { ...prev };
                        searchableColumns.forEach((col) => {
                          next[col.key] = "";
                        });
                        return next;
                      });
                    }}
                  >
                    Reset Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide rounded-2xl">
          <table className="min-w-full text-left text-gray-900">
            <thead>
              <tr className="bg-card-gradient text-white ">
                <th className="w-14 rounded-tl-2xl px-2 py-2 text-center text-sm font-semibold">
                  No
                </th>
                {columns?.map((col, i) => (
                  <th
                    key={col.key as string}
                    className={`py-2 px-2 font-semibold text-sm cursor-pointer select-none ${
                      ""
                    }`}
                    onClick={() => col.sort && toggleSort(col.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{col.label}</span>
                      {col.sort && (
                        <FiChevronDown
                          className={`text-xs transition-transform ${
                            sortBy === col.key
                              ? sortAsc
                                ? "rotate-180"
                                : ""
                              : "opacity-30"
                          }`}
                        />
                      )}
                    </div>
                  </th>
                ))}
                <th className="py-2 px-2 font-semibold text-sm text-center rounded-tr-2xl sticky right-0 bg-card-gradient z-20">
                  {wordingTr(user?.data?.langCode, "action")}
                </th>
              </tr>
              {false && searchCol && (
                <tr className="bg-white text-gray-700">
                  {columns?.map((col) => (
                    <th key={col.key as string} className="py-2 px-2">
                      {!col.noSearch && (
                        <input
                          type="text"
                          placeholder="Search"
                          className="text-xs w-full px-2 py-1 border rounded"
                          value={filterState[col.key] ?? ""}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              [col.key]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </th>
                  ))}
                  <th className="py-2 px-2 text-center text-lg cursor-pointer sticky right-0 bg-white z-10"></th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white bg-opacity-90 rounded-b-2xl">
              {addRow && formAddrow()}
              {currentData?.length ? (
                <React.Fragment>
                  {currentData?.map((row, i) => renderRow(row, 0, i))}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <tr>
                    <td
                      colSpan={columns?.length + 2}
                      className="text-center p-2"
                    >
                      {wordingTr(user?.data?.langCode, "data_not_avilable")}
                    </td>
                  </tr>
                </React.Fragment>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center p-2 text-sm bg-gray-100">
          <div>
            {wordingTr(user?.data?.langCode, "page")} {currentPage}{" "}
            {wordingTr(user?.data?.langCode, "of")}{" "}
            {totalPages ? totalPages : 1}
          </div>
          <div className="flex items-center space-x-2">
            {!(folder === "sosmed" && moduleName === "topicplan") && (
              <>
                <button
                  onClick={() => {
                    getTable("pdf");
                  }}
                  className="flex items-center gap-2 text-white  rounded hover:bg-red-200"
                >
                  <img src={"/images/file.png"} className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    getTable("xls");
                  }}
                  className="flex items-center gap-2  text-white rounded hover:bg-green-600"
                >
                  <img src={"/images/xls.png"} className="w-6 h-6" />
                </button>
              </>
            )}
            {totalPages ? (
              <React.Fragment>
                <select
                  id="rowsPerPage"
                  className="px-2 py-1 border rounded text-sm"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setCurrentPage(1); // reset ke halaman pertama
                    setRowsPerPage(parseInt(e.target.value, 10));
                  }}
                >
                  {[5, 10, 20, 50, 80].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-black bg-gray-400 hover:bg-gray-300 disabled:opacity-30"
                >
                  <FiChevronLeft />
                </button>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-400 !text-black-500 hover:bg-gray-300 disabled:opacity-30"
                >
                  <FiChevronRight />
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment></React.Fragment>
            )}
          </div>
        </div>
      </div>
      {showViewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowViewModal(false);
          }}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-gray-50 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label={viewData?.title || "View data"}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {viewData?.title ||
                    wordingTr(user?.data?.langCode, "detailed_data")}
                </h2>
                <p className="text-xs text-gray-500">View only</p>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                title="Tutup"
                aria-label="Tutup"
              >
                <FiXCircle className="h-5 w-5" />
              </button>
            </div>

            {loadingView ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : viewData ? (
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {viewData.data?.length > 1 && (
                  <div className="mb-3 flex gap-2">
                    {viewData.data.map((language: any) => (
                      <button
                        type="button"
                        key={language.name}
                        onClick={() => setViewLang(language.name)}
                        className={`rounded-md border px-3 py-1 text-xs font-medium uppercase ${
                          activeViewForm?.name === language.name
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {language.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-10">
                  <div className="flex flex-col gap-2 xl:col-span-7">
                    {activeViewSteps
                      .map((step, stepIndex) => ({ step, stepIndex }))
                      .filter(
                        ({ step }) => getViewStepColumn(step.title) === "left"
                      )
                      .map(({ step, stepIndex }) =>
                        renderViewStep(step, stepIndex)
                      )}
                  </div>
                  <div className="flex flex-col gap-2 xl:col-span-3">
                    {activeViewSteps
                      .map((step, stepIndex) => ({ step, stepIndex }))
                      .filter(
                        ({ step }) => getViewStepColumn(step.title) === "right"
                      )
                      .map(({ step, stepIndex }) =>
                        renderViewStep(step, stepIndex)
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="p-4 text-sm text-red-500">
                {wordingTr(user?.data?.langCode, "failed_to_load")}
              </p>
            )}
          </div>
        </div>
      )}
      {showHistoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowHistoryModal(false);
          }}
        >
          <div
            className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Log history"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-700 px-4 py-3 text-white">
              <div>
                <h2 className="text-base font-semibold">Log History</h2>
                <p className="text-xs text-emerald-50/80">
                  {moduleName} #{historyRow?.id} {getRowLabel(historyRow)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
                title="Tutup"
                aria-label="Tutup"
              >
                <FiXCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
                </div>
              ) : historyData.length ? (
                <div className="space-y-3">
                  {historyData.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {item.action}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.user} - {formatAuditDate(item.createdAt)}
                          </div>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                          IP {item.ip || "-"}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-700">API</div>
                          <div className="truncate">{item.urlApi || "-"}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-700">Page</div>
                          <div className="truncate">{item.urlFe || "-"}</div>
                        </div>
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-semibold text-emerald-700">
                          Payload
                        </summary>
                        <pre className="mt-2 max-h-52 overflow-auto rounded bg-slate-900 p-3 text-[11px] leading-4 text-slate-100">
                          {formatAuditBody(item.bodyApi)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  Belum ada log history untuk data ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default TableWPM;
