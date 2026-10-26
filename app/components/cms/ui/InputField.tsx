"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiGrid,
  FiInfo,
  FiLayers,
  FiMove,
  FiSliders,
  FiTag,
} from "react-icons/fi";
import Select from "react-select";
import { FetchData, generatePassword } from "../../../lib/helper";
import AsyncSelect from "react-select/async";
import { FieldType } from "../../../types";
import { Editor } from "@tinymce/tinymce-react";
import Script from "next/script";
import UploadFlmngr from "./uploadFileManager";
import { useDecryptedLoginState } from "../../../lib/authUtils";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
type Option = { label: string; value: any };

type Props = {
  type: FieldType;
  label: string;
  name: string;
  value?: any;
  options?: Option[]; // fallback options
  fetchOptions?: (inputValue?: string) => Promise<Option[]>; // 🆕 fetch options from API
  onChange: (name: string, value: any, notCopy?: boolean) => void;
  formatOptionLabel?: (data: Option) => React.ReactNode;
  fieldAddRow?: any[];
  isFieldAddRow?: boolean;
  uriSelect?: string;
  disabled?: boolean;
  formValues?: Record<string, any>;
  trigerValue?: string[];
  styleFieldName?: string;
  info?: string | { value: string; key?: string };
  onInfoChange?: (name: string, info: { value: string; key?: string }) => void;
};

export default function InputField({
  type,
  label,
  name,
  value,
  options = [],
  fetchOptions,
  onChange,
  onInfoChange,
  formatOptionLabel,
  fieldAddRow,
  isFieldAddRow = true,
  uriSelect,
  disabled,
  formValues,
  trigerValue,
  styleFieldName,
  info,
}: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectOptions, setSelectOptions] = useState<Option[]>(options);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [hasFetchedOptions, setHasFetchedOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [customExpanded, setCustomExpanded] = useState<number[]>([]);
  const [isInfoHovering, setIsInfoHovering] = useState(false);
  const [infoPosition, setInfoPosition] = useState({ top: 0, left: 0 });
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);
  const [visibleTinyToolbars, setVisibleTinyToolbars] = useState<
    Record<string, boolean>
  >({});
  const [infoText, setInfoText] = useState(
    typeof info === "object" ? info.value : info || ""
  );
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false);

  const toggleExpand = (idx: number) => {
    setExpanded((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleCustomExpand = (idx: number) => {
    setCustomExpanded((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const getAddRowItemDomId = (idx: number, item: any) =>
    `add-row-${name}-${item?.id || idx}`;

  const textStyleValue = styleFieldName ? formValues?.[styleFieldName] || {} : {};
  const updateTextStyle = (patch: Record<string, any>) => {
    if (!styleFieldName) return;
    onChange(styleFieldName, { ...textStyleValue, ...patch });
  };
  const toggleTextDecoration = (key: "bold" | "italic" | "underline") => {
    updateTextStyle({ [key]: !textStyleValue?.[key] });
  };
  const isSectionAddRow = type === "addRowTable" && name === "sections";

  const getOptionValue = (optionValue: any) => {
    if (optionValue && typeof optionValue === "object") return optionValue.value;
    return optionValue;
  };

  const renderIconChoice = ({
    currentValue,
    options: choiceOptions,
    onSelect,
  }: {
    currentValue: any;
    options: Array<{
      value: string;
      label: string;
      description?: string;
      icon: React.ReactNode;
    }>;
    onSelect: (option: { value: string; label: string }) => void;
  }) => {
    const selectedValue = getOptionValue(currentValue);

    return (
      <div className="grid grid-cols-2 gap-2">
        {choiceOptions.map((choice) => {
          const selected = selectedValue === choice.value;

          return (
            <button
              key={choice.value}
              type="button"
              onClick={() =>
                onSelect({ value: choice.value, label: choice.label })
              }
              className={`flex min-h-[76px] flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition ${
                selected
                  ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-slate-50"
              }`}
            >
              <span
                className={`mb-1 flex h-8 w-8 items-center justify-center rounded-lg ${
                  selected ? "bg-sky-600 text-white" : "bg-slate-100"
                }`}
              >
                {choice.icon}
              </span>
              <span className="text-xs font-bold">{choice.label}</span>
              {choice.description ? (
                <span className="mt-0.5 text-[10px] leading-tight text-slate-500">
                  {choice.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    setInfoText(typeof info === "object" ? info.value : info || "");
  }, [info]);

  useEffect(() => {
    if (type !== "addRowTable" || name !== "sections") return;
    if (typeof window === "undefined") return;

    const focusSectionId = new URLSearchParams(window.location.search).get(
      "focusSectionId"
    );
    if (!focusSectionId || !Array.isArray(value)) return;

    const targetIndex = value.findIndex(
      (item: any) => String(item?.id || "") === String(focusSectionId)
    );
    if (targetIndex < 0) return;

    setExpanded((prev) =>
      prev.includes(targetIndex) ? prev : [...prev, targetIndex]
    );
    window.setTimeout(() => {
      document
        .getElementById(getAddRowItemDomId(targetIndex, value[targetIndex]))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
  }, [type, name, value]);

  useEffect(() => {
    if (type !== "custom-section-builder") return;
    const columns = Math.min(
      4,
      Math.max(1, Number(value?.columns || value?.columnCount || 1))
    );
    setCustomExpanded((prev) => {
      const nextIndexes = Array.from({ length: columns }).map((_, idx) => idx);
      if (prev.length) {
        const preserved = prev.filter((idx) => idx < columns);
        return preserved.length ? preserved : nextIndexes;
      }
      return nextIndexes;
    });
  }, [type, value?.columns, value?.columnCount]);


  // 🆕 Fetch options on mount if it's select and fetchOptions is provided
  useEffect(() => {
    if (
      (type === "select-single" || type === "select-multi") &&
      fetchOptions &&
      !hasFetchedOptions
    ) {
      setLoadingOptions(true);
      fetchOptions()
        .then((fetched) => {
          setSelectOptions(fetched);
          setHasFetchedOptions(true); // 🆕 jangan fetch ulang
        })
        .finally(() => setLoadingOptions(false));
    }
  }, [type, fetchOptions, hasFetchedOptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(name, file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const formatPrice = (val: string | number): string => {
    const numberVal =
      typeof val === "number" ? val : parseFloat(val.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numberVal)) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numberVal);
  };

  const parsePrice = (val: string): number => {
    return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
  };
  const user = useDecryptedLoginState();
  // Fungsi bertingkat: terima uri dulu, lalu return fungsi loadOptions
  const fetchOptionsData =
    (url: string, params: Record<string, any> = {}) =>
    async (inputValue: string) => {
      try {
        const searchParams = new URLSearchParams();
        if (inputValue) {
          searchParams.set("search", inputValue);
        }
        for (const key in params) {
          if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key]);
          }
        }
        const response = await FetchData(
          `${url}?${searchParams.toString()}`,
          "GET",
          "",
          false,
          user?.data?.token
        );
        return response?.data ?? [];
      } catch (err) {
        console.error("Error fetching options:", err);
        return [];
      }
    };
  const getConditionalFieldValue = (fieldValue: any) => {
    if (fieldValue && typeof fieldValue === "object") {
      return fieldValue.value;
    }
    return fieldValue;
  };

  const isFieldHidden = (field: any, formValues: any) => {
    if (!field.hideFields) return false;

    return field.hideFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((n: string) =>
        condition.value.includes(getConditionalFieldValue(formValues?.[n]))
      );
    });
  };

  const isFieldDisabled = (field: any, formValues: any) => {
    if (!field.disableFields) return false;

    return field.disableFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((n: string) =>
        condition.value.includes(getConditionalFieldValue(formValues?.[n]))
      );
    });
  };
  const handleDrop = (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const updated = [...value];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIdx, 0, moved);
    onChange(name, updated);
    setDraggedIndex(null);
  };

  const normalizeCustomSectionConfig = (rawValue: any) => {
    const rawItems = Array.isArray(rawValue?.items) ? rawValue.items : [];
    const columns = Math.min(
      4,
      Math.max(1, Number(rawValue?.columns || rawValue?.columnCount || 1))
    );

    return {
      mode: "CUSTOM",
      backgroundType: rawValue?.backgroundType || "color",
      backgroundColor: rawValue?.backgroundColor || "#ffffff",
      backgroundImage: rawValue?.backgroundImage || null,
      width: rawValue?.width || "container",
      sectionStyle: rawValue?.sectionStyle || "flat",
      columns,
      contentType: rawValue?.contentType || "",
      sourceCategoryId: rawValue?.sourceCategoryId || null,
      items: Array.from({ length: columns }).map((_, index) => ({
        backgroundType: rawItems[index]?.backgroundType || "color",
        backgroundColor: rawItems[index]?.backgroundColor || "#ffffff",
        backgroundImage: rawItems[index]?.backgroundImage || null,
        columnStyle: rawItems[index]?.columnStyle || "flat",
        title: rawItems[index]?.title || "",
        subTitle: rawItems[index]?.subTitle || "",
        content: rawItems[index]?.content || "",
        image: rawItems[index]?.image || null,
      })),
    };
  };

  const updateCustomSectionConfig = (patch: Record<string, any>) => {
    const current = normalizeCustomSectionConfig(value || {});
    onChange(name, normalizeCustomSectionConfig({ ...current, ...patch }));
  };

  const updateCustomSectionItem = (
    itemIndex: number,
    patch: Record<string, any>
  ) => {
    const current = normalizeCustomSectionConfig(value || {});
    const items = [...current.items];
    items[itemIndex] = { ...items[itemIndex], ...patch };
    onChange(name, normalizeCustomSectionConfig({ ...current, items }));
  };

  const triggerParams = (() => {
    if (!trigerValue || !Array.isArray(trigerValue)) return {} as Record<string, any>;
    const params: Record<string, any> = {};
    for (const trigName of trigerValue) {
      const val = formValues?.[trigName];
      if (typeof val === "object" && val?.value !== undefined) {
        params[trigName] = val.value;
      } else if (val !== undefined) {
        params[trigName] = val;
      }
    }
    return params;
  })();

  const triggerSignature = JSON.stringify(triggerParams);
  const updateInfoPosition = () => {
    const rect = infoButtonRef.current?.getBoundingClientRect();
    if (!rect) return;

    setInfoPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  };

  const canUsePortal = typeof document !== "undefined";
  const infoTooltip =
    canUsePortal && info && isInfoHovering && !isEditingInfo
      ? createPortal(
          <div
            className="fixed z-[99999] w-max max-w-[280px] -translate-x-1/2 whitespace-normal break-words rounded bg-gray-800 px-3 py-2 text-left text-xs leading-snug text-white shadow-xl"
            style={{ top: infoPosition.top, left: infoPosition.left }}
          >
            {infoText}
          </div>,
          document.body
        )
      : null;
  const infoEditor =
    canUsePortal && info && isEditingInfo
      ? createPortal(
          <div
            className="fixed z-[99999] w-[260px] -translate-x-1/2 rounded-xl border border-gray-300 bg-white p-3 shadow-xl"
            style={{ top: infoPosition.top, left: infoPosition.left }}
          >
            <textarea
              value={infoText}
              onChange={(event) => setInfoText(event.target.value)}
              className="w-full min-h-[80px] resize-none rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingInfo(false);
                  setInfoText(typeof info === "object" ? info.value : info || "");
                }}
                className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingInfo(false);
                  onInfoChange?.(name, {
                    value: infoText,
                    key: typeof info === "object" ? info.key : undefined,
                  });
                }}
                className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>,
          document.body
        )
      : null;
  const compactSelectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: 32,
      borderRadius: 6,
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: "0 8px",
    }),
    input: (base: any) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      minHeight: 30,
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: 5,
    }),
    clearIndicator: (base: any) => ({
      ...base,
      padding: 5,
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  const tinyToolbar =
    "code undo redo | formatselect | bold italic underline | " +
    "alignleft aligncenter alignright alignjustify | " +
    "bullist numlist outdent indent | removeformat | flmngr | file-manager ";

  const renderTinyEditor = ({
    editorKey,
    editorValue,
    height,
    onEditorChange,
    isDisabled = disabled,
  }: {
    editorKey: string;
    editorValue: string;
    height: number;
    onEditorChange: (content: string) => void;
    isDisabled?: boolean;
  }) => {
    const isToolbarVisible = !!visibleTinyToolbars[editorKey];

    return (
      <div className="space-y-1">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              setVisibleTinyToolbars((current) => ({
                ...current,
                [editorKey]: !current[editorKey],
              }))
            }
            className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            disabled={isDisabled}
          >
            {isToolbarVisible ? "Hide toolbar" : "Show toolbar"}
          </button>
        </div>
        <Editor
          key={`${editorKey}-${isToolbarVisible ? "toolbar" : "compact"}`}
          disabled={isDisabled}
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={editorValue}
          onEditorChange={onEditorChange}
          licenseKey="gpl"
          init={{
            height,
            menubar: isToolbarVisible
              ? "file edit view insert format tools table help"
              : false,
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "help",
              "wordcount",
              "file-manager",
            ],
            toolbar: isToolbarVisible ? tinyToolbar : false,
            Flmngr: {
              apiKey: "FLMNFLMN",
              urlFileManager: process.env.NEXT_PUBLIC_FLMANAGER_URI ?? "",
              urlFiles:
                process.env.NEXT_PUBLIC_FLMANAGER_FILE ??
                "/" + "uploads/FileManager",
            },
            flmngr: {
              apiKey: "FLMNFLMN",
              uploadUrl: "",
            },
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    if (
      type !== "select-single" ||
      !uriSelect ||
      !trigerValue ||
      !Array.isArray(trigerValue) ||
      !disabled
    ) {
      return;
    }

    const load = async () => {
      const options = await fetchOptionsData(uriSelect, triggerParams)("");
      if (Array.isArray(options) && options.length === 1) {
        onChange(name, options[0], true);
        return;
      }
      onChange(name, null, true);
    };

    load();
  }, [type, uriSelect, disabled, triggerSignature, name]);

  return (
    <React.Fragment key={name}>
      {type != "hide" && (
        <div className="text-sm">
          {label != "" && (
            <div className="mb-1 flex gap-2 items-center justify-between text-xs font-medium text-gray-700">
              <div className="flex items-center gap-2">
                {label}
                {styleFieldName ? (
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setIsStylePanelOpen((current) => !current)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      aria-label="Adjust text style"
                      title="Adjust text style"
                    >
                      <FiSliders size={13} />
                    </button>
                    {isStylePanelOpen ? (
                      <div className="absolute left-0 top-7 z-[9999] w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xl">
                        <div className="mb-2 font-bold text-slate-900">
                          Text Style
                        </div>
                        <div className="mb-2 grid grid-cols-[70px_1fr] items-center gap-2">
                          <span className="text-slate-600">Color</span>
                          <input
                            type="color"
                            value={textStyleValue?.color || "#0f172a"}
                            onChange={(event) =>
                              updateTextStyle({ color: event.target.value })
                            }
                            className="h-8 w-full rounded border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="mb-2 grid grid-cols-[70px_1fr] items-center gap-2">
                          <span className="text-slate-600">Size</span>
                          <select
                            value={textStyleValue?.size || ""}
                            onChange={(event) =>
                              updateTextStyle({ size: event.target.value })
                            }
                            className="h-8 rounded border border-slate-200 bg-white px-2"
                          >
                            <option value="">Default</option>
                            <option value="xs">XS</option>
                            <option value="sm">SM</option>
                            <option value="base">Base</option>
                            <option value="lg">LG</option>
                            <option value="xl">XL</option>
                            <option value="2xl">2XL</option>
                            <option value="3xl">3XL</option>
                            <option value="4xl">4XL</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { key: "bold", label: "Bold" },
                            { key: "italic", label: "Italic" },
                            { key: "underline", label: "Underline" },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() =>
                                toggleTextDecoration(
                                  item.key as "bold" | "italic" | "underline"
                                )
                              }
                              className={`rounded-full border px-2 py-1 font-semibold ${
                                textStyleValue?.[item.key]
                                  ? "border-slate-950 bg-slate-950 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {info && (
                  <div className="relative inline-block">
                    <button
                      ref={infoButtonRef}
                      type="button"
                      onMouseEnter={() => {
                        updateInfoPosition();
                        setIsInfoHovering(true);
                      }}
                      onMouseLeave={() => setIsInfoHovering(false)}
                      onClick={() => {
                        if (disabled) return;
                        updateInfoPosition();
                        setIsInfoHovering(false);
                        setIsEditingInfo(true);
                      }}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label="Edit info"
                    >
                      <FiInfo size={14} />
                    </button>
                    {infoTooltip}
                    {infoEditor}
                  </div>
                )}
              </div>
              {type == "password-repassword" && (
                <button
                  type="button"
                  onClick={() => {
                    const newPassword = generatePassword();
                    onChange(name, {
                      password: newPassword,
                      repassword: newPassword,
                    });
                  }}
                  className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                  title="Generate Password"
                >
                  Generate
                </button>
              )}
              {type == "addRowTable" && isFieldAddRow && (
                <button
                  type="button"
                  onClick={() => {
                    const currentRows = Array.isArray(value) ? value : [];
                    const nextIndex = currentRows.length;
                    onChange(name, [
                      ...currentRows,
                      Object.fromEntries(
                        fieldAddRow.map((f) => [f.name, f.value ?? ""])
                      ),
                    ]);
                    if (isSectionAddRow) {
                      setExpanded([nextIndex]);
                    }
                  }}
                  className="mt-1 px-2 py-1 border border-green-300 rounded text-xs bg-gray-100 hover:bg-gray-200"
                >
                  + Add Item
                </button>
              )}
            </div>
          )}

          {type === "textarea" ? (
            <textarea
              name={name}
              value={value}
              onChange={(e) => onChange(name, e.target.value)}
              className={`w-full min-h-[72px] border rounded px-2 py-1 text-sm ${
                disabled ? " !bg-gray-200" : " "
              }`}
              disabled={disabled}
            />
          ) : type === "text-editor" ? (
            renderTinyEditor({
              editorKey: name,
              editorValue: value || "",
              height: 220,
              onEditorChange: (content) => onChange(name, content),
            })
          ) : type === "checkbox" ? (
            <input
              type="checkbox"
              name={name}
              checked={!!value}
              onChange={(e) => onChange(name, e.target.checked)}
              className={`h-4 w-4 ${disabled ? " !bg-gray-200" : " "}`}
              disabled={disabled}
            />
          ) : type === "switch" ? (
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(name, e.target.checked)}
                className={`sr-only peer ${disabled ? " !bg-gray-200" : " "}`}
                disabled={disabled}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 relative transition">
                <div
                  className={
                    (!value ? "left-1 " : "right-1 ") +
                    "absolute  top-1 w-4 h-4 bg-white rounded-full transform transition-transform peer-checked:translate-x-5"
                  }
                ></div>
              </div>
            </label>
          ) : type === "select-single" || type === "select-multi" ? (
            uriSelect || fetchOptions ? (
              <AsyncSelect
                key={`${name}-${triggerSignature}`}
                isMulti={type === "select-multi"}
                name={name}
                value={value}
                loadOptions={
                  fetchOptions
                    ? (inputValue) => fetchOptions(inputValue)
                    : fetchOptionsData(uriSelect || "", triggerParams)
                }
                isLoading={loadingOptions}
                defaultOptions={true}
                onChange={(selected) => onChange(name, selected)}
                className="text-sm"
                formatOptionLabel={formatOptionLabel}
                isClearable
                isDisabled={disabled}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                styles={compactSelectStyles}
              />
            ) : (
              <Select
                isMulti={type === "select-multi"}
                name={name}
                value={value}
                options={selectOptions}
                onChange={(selected) => onChange(name, selected)}
                className="text-sm"
                formatOptionLabel={formatOptionLabel}
                isClearable
                isDisabled={disabled}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                styles={compactSelectStyles}
              />
            )
          ) : type === "file" ? (
            <>
              <input
                type="file"
                name={name}
                onChange={handleFileChange}
              className={`w-full text-sm ${disabled ? " !bg-gray-200" : " "}`}
                disabled={disabled}
              />
              {filePreview && (
                <img
                  src={filePreview}
                  alt="preview"
                  className="mt-2 h-32 object-contain border"
                />
              )}
            </>
          ) : type === "price" ? (
            <input
              type="text"
              name={name}
              value={formatPrice(value ?? "")}
              onChange={(e) => {
                const rawValue = parsePrice(e.target.value);
                onChange(name, rawValue);
              }}
              className={`w-full border rounded px-2 py-1 text-sm text-right ${
                disabled ? " !bg-gray-200" : " "
              }`}
              disabled={disabled}
            />
          ) : type === "password" || type === "password-repassword" ? (
            <div className="space-y-1">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name={name}
                  value={value?.password || ""}
                  onChange={(e) =>
                    onChange(name, { ...value, password: e.target.value })
                  }
                  className={`w-full border rounded px-2 py-1 pr-10 text-sm ${
                    disabled ? " !bg-gray-200" : " "
                  }`}
                  placeholder="Password"
                  disabled={disabled}
                />
                <div
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
              {type === "password-repassword" && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name={`${name}_confirm`}
                    value={value?.repassword || ""}
                    onChange={(e) =>
                      onChange(name, { ...value, repassword: e.target.value })
                    }
                    className={`w-full border rounded px-2 py-1 pr-10 text-sm ${
                      disabled ? " !bg-gray-200" : " "
                    }`}
                    placeholder="Ulangi Password"
                    disabled={disabled}
                  />
                  <div
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
              )}
              {type === "password-repassword" &&
                value?.password &&
                value?.repassword &&
                value.password !== value.repassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Password tidak cocok
                  </p>
                )}
            </div>
          ) : type === "autocomplete" ? (
            <AsyncSelect
              cacheOptions
              defaultOptions
              value={value}
              loadOptions={(inputValue) =>
                fetchOptions ? fetchOptions(inputValue) : Promise.resolve([])
              }
              onChange={(selected) => onChange(name, selected)}
              className="text-sm"
              formatOptionLabel={formatOptionLabel}
              isDisabled={disabled}
              styles={compactSelectStyles}
            />
          ) : type === "upload-fm" ? (
            <React.Fragment>
              {disabled ? (
                <div className={`${disabled ? " !bg-gray-200" : " "}`}></div>
              ) : (
                <UploadFlmngr
                  name={name}
                  value={value}
                  onChange={(name, val) => {
                    onChange(name, val);
                  }}
                />
              )}
            </React.Fragment>
          ) : type === "custom-section-builder" ? (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              {(() => {
                const config = normalizeCustomSectionConfig(value || {});
                const backgroundOptions = [
                  { label: "Color", value: "color" },
                  { label: "Image", value: "image" },
                ];
                const widthOptions = [
                  { label: "Container", value: "container" },
                  { label: "Full Width", value: "full" },
                  { label: "Narrow", value: "narrow" },
                ];
                const styleOptions = [
                  { label: "Flat", value: "flat" },
                  { label: "Rounded", value: "rounded" },
                  { label: "Shadow", value: "shadow" },
                  { label: "Rounded Shadow", value: "rounded-shadow" },
                ];
                const columnOptions = [1, 2, 3, 4].map((column) => ({
                  label: `${column} Kolom`,
                  value: column,
                }));
                const findOption = (items: Option[], current: any) =>
                  items.find((item) => item.value === current) || null;

                return (
                  <>
                    {config.contentType ? (
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 md:col-span-4">
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Background Section
                        </label>
                        <Select
                          value={findOption(backgroundOptions, config.backgroundType)}
                          options={backgroundOptions}
                          onChange={(selected) =>
                            updateCustomSectionConfig({
                              backgroundType: selected?.value || "color",
                            })
                          }
                          styles={compactSelectStyles}
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Lebar Section
                        </label>
                        <Select
                          value={findOption(widthOptions, config.width)}
                          options={widthOptions}
                          onChange={(selected) =>
                            updateCustomSectionConfig({
                              width: selected?.value || "container",
                            })
                          }
                          styles={compactSelectStyles}
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Style Section
                        </label>
                        <Select
                          value={findOption(styleOptions, config.sectionStyle)}
                          options={styleOptions}
                          onChange={(selected) =>
                            updateCustomSectionConfig({
                              sectionStyle: selected?.value || "flat",
                            })
                          }
                          styles={compactSelectStyles}
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                        />
                      </div>

                      {config.backgroundType === "color" ? (
                        <div className="col-span-12 md:col-span-4">
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Warna Background
                          </label>
                          <input
                            type="color"
                            value={config.backgroundColor}
                            onChange={(event) =>
                              updateCustomSectionConfig({
                                backgroundColor: event.target.value,
                              })
                            }
                            className="h-9 w-full rounded border border-slate-200 bg-white"
                          />
                        </div>
                      ) : (
                        <div className="col-span-12">
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Gambar Background
                          </label>
                          <UploadFlmngr
                            name="backgroundImage"
                            value={config.backgroundImage}
                            onChange={(_, selectedValue) =>
                              updateCustomSectionConfig({
                                backgroundImage: selectedValue,
                              })
                            }
                          />
                        </div>
                      )}

                      <div className="col-span-12 md:col-span-4">
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Jumlah Kolom
                        </label>
                        <Select
                          value={findOption(columnOptions, config.columns)}
                          options={columnOptions}
                          onChange={(selected) =>
                            updateCustomSectionConfig({
                              columns: Number(selected?.value || 1),
                            })
                          }
                          styles={compactSelectStyles}
                          menuPortalTarget={
                            typeof window !== "undefined" ? document.body : null
                          }
                        />
                      </div>
                      {config.contentType === "category" ? (
                        <div className="col-span-12 md:col-span-4">
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Source Data Category
                          </label>
                          <AsyncSelect
                            name="sourceCategoryId"
                            value={config.sourceCategoryId}
                            loadOptions={fetchOptionsData("api/cms/category/master")}
                            defaultOptions={true}
                            onChange={(selected) =>
                              updateCustomSectionConfig({
                                sourceCategoryId: selected,
                              })
                            }
                            className="text-sm"
                            formatOptionLabel={formatOptionLabel}
                            isClearable
                            styles={compactSelectStyles}
                            menuPortalTarget={
                              typeof window !== "undefined"
                                ? document.body
                                : null
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                    ) : null}

                    {config.contentType === "content" ? (
                    <div className="grid grid-cols-1 gap-3">
                      {config.items.map((contentItem: any, itemIndex: number) => (
                        <div
                          key={`custom-section-item-${itemIndex}`}
                          className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => toggleCustomExpand(itemIndex)}
                            className="flex w-full items-center justify-between bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-900 hover:bg-slate-100"
                          >
                            <span>
                              Content Kolom {itemIndex + 1}
                              {contentItem.title ? ` - ${contentItem.title}` : ""}
                            </span>
                            {customExpanded.includes(itemIndex) ? (
                              <FiChevronUp />
                            ) : (
                              <FiChevronDown />
                            )}
                          </button>
                          <AnimatePresence initial={false}>
                            {customExpanded.includes(itemIndex) ? (
                              <motion.div
                                key={`custom-content-${itemIndex}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-12 gap-2 p-3"
                              >
                            <div className="col-span-12 md:col-span-4">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Background Kolom
                              </label>
                              <Select
                                value={findOption(
                                  backgroundOptions,
                                  contentItem.backgroundType
                                )}
                                options={backgroundOptions}
                                onChange={(selected) =>
                                  updateCustomSectionItem(itemIndex, {
                                    backgroundType: selected?.value || "color",
                                  })
                                }
                                styles={compactSelectStyles}
                                menuPortalTarget={
                                  typeof window !== "undefined"
                                    ? document.body
                                    : null
                                }
                              />
                            </div>
                            <div className="col-span-12 md:col-span-4">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Style Kolom
                              </label>
                              <Select
                                value={findOption(
                                  styleOptions,
                                  contentItem.columnStyle
                                )}
                                options={styleOptions}
                                onChange={(selected) =>
                                  updateCustomSectionItem(itemIndex, {
                                    columnStyle: selected?.value || "flat",
                                  })
                                }
                                styles={compactSelectStyles}
                                menuPortalTarget={
                                  typeof window !== "undefined"
                                    ? document.body
                                    : null
                                }
                              />
                            </div>
                            {contentItem.backgroundType === "color" ? (
                              <div className="col-span-12 md:col-span-4">
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                  Warna Kolom
                                </label>
                                <input
                                  type="color"
                                  value={contentItem.backgroundColor}
                                  onChange={(event) =>
                                    updateCustomSectionItem(itemIndex, {
                                      backgroundColor: event.target.value,
                                    })
                                  }
                                  className="h-9 w-full rounded border border-slate-200 bg-white"
                                />
                              </div>
                            ) : (
                              <div className="col-span-12">
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                  Gambar Background Kolom
                                </label>
                                <UploadFlmngr
                                  name={`backgroundImage-${itemIndex}`}
                                  value={contentItem.backgroundImage}
                                  onChange={(_, selectedValue) =>
                                    updateCustomSectionItem(itemIndex, {
                                      backgroundImage: selectedValue,
                                    })
                                  }
                                />
                              </div>
                            )}
                            <div className="col-span-12 md:col-span-6">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Title
                              </label>
                              <input
                                type="text"
                                value={contentItem.title}
                                onChange={(event) =>
                                  updateCustomSectionItem(itemIndex, {
                                    title: event.target.value,
                                  })
                                }
                                className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                              />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Sub Title
                              </label>
                              <input
                                type="text"
                                value={contentItem.subTitle}
                                onChange={(event) =>
                                  updateCustomSectionItem(itemIndex, {
                                    subTitle: event.target.value,
                                  })
                                }
                                className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                              />
                            </div>
                            <div className="col-span-12">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Image
                              </label>
                              <UploadFlmngr
                                name={`image-${itemIndex}`}
                                value={contentItem.image}
                                onChange={(_, selectedValue) =>
                                  updateCustomSectionItem(itemIndex, {
                                    image: selectedValue,
                                  })
                                }
                              />
                            </div>
                            <div className="col-span-12">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Content
                              </label>
                              {renderTinyEditor({
                                editorKey: `${name}-content-${itemIndex}`,
                                editorValue: contentItem.content || "",
                                height: 180,
                                onEditorChange: (content) =>
                                  updateCustomSectionItem(itemIndex, {
                                    content,
                                  }),
                              })}
                            </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                    ) : null}
                  </>
                );
              })()}
            </div>
          ) : type === "addRowTable" ? (
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {(value || []).map((item: any, idx: number) => {
                  const isOpen = expanded.includes(idx);

                  return (
                    <motion.div
                      id={getAddRowItemDomId(idx, item)}
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="border border-sky-200 rounded-md shadow-sm overflow-visible bg-white"
                    >
                      {/* Header Item */}
                      <div
                        draggable
                        onDragStart={() => setDraggedIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(idx)}
                        className="flex justify-between items-center bg-sky-50 px-2 py-1.5 cursor-pointer"
                        onClick={() => toggleExpand(idx)}
                      >
                        <div className="flex gap-2 items-center">
                          {" "}
                          <FiMove />
                          <span className="text-xs font-medium text-sky-700">
                            {`Item ${idx + 1} ${
                              typeof item[fieldAddRow[0].name] == "string"
                                ? item[fieldAddRow[0].name]
                                  ? " - " + item[fieldAddRow[0].name]
                                  : ""
                                : " " +
                                  (item[fieldAddRow[0].name]?.label
                                    ? " - " + item[fieldAddRow[0].name].label
                                    : "")
                            }`}
                          </span>
                        </div>
                        <span className="text-xs text-sky-500">
                          {isOpen ? "▲ Collapse" : "▼ Expand"}
                        </span>
                      </div>

                      {/* Isi Form */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="p-2 grid grid-cols-12 gap-2 relative"
                          >
                            {fieldAddRow?.map((field, i) => {
                              const fieldValue = item;
                              const isSectionModeChoice =
                                isSectionAddRow && field.name === "sectionMode";
                              const selectedSectionMode = getOptionValue(
                                item?.sectionMode
                              );
                              const customConfigValue = normalizeCustomSectionConfig(
                                item?.customConfig || {}
                              );
                              const customContentType =
                                customConfigValue?.contentType || "";

                              if (isSectionAddRow) {
                                if (!selectedSectionMode && !isSectionModeChoice) {
                                  return null;
                                }
                                if (selectedSectionMode && isSectionModeChoice) {
                                  return null;
                                }
                                if (
                                  selectedSectionMode === "CUSTOM" &&
                                  field.name !== "customConfig" &&
                                  !customContentType
                                ) {
                                  return null;
                                }
                              }

                              const hidden = isFieldHidden(field, fieldValue);
                              if (hidden) return null;
                              const isSectionCustomConfig =
                                isSectionAddRow &&
                                selectedSectionMode === "CUSTOM" &&
                                field.name === "customConfig";
                              const showTemplateBack =
                                isSectionAddRow &&
                                selectedSectionMode === "TEMPLATE" &&
                                field.name === "templateId";

                              return (
                                <div
                                  key={i + "-" + field.name}
                                  className={field.cols ?? "col-span-6"}
                                >
                                  {isSectionModeChoice ? (
                                    <div>
                                      <div className="mb-2 flex items-center justify-between gap-2">
                                        <label className="text-xs font-semibold text-slate-700">
                                          {field.label}
                                        </label>
                                      </div>
                                      {renderIconChoice({
                                        currentValue: item[field.name],
                                        options: [
                                          {
                                            value: "TEMPLATE",
                                            label: "Template",
                                            description: "Layout dari template",
                                            icon: <FiLayers />,
                                          },
                                          {
                                            value: "CUSTOM",
                                            label: "Custom",
                                            description: "Layout manual CMS",
                                            icon: <FiGrid />,
                                          },
                                        ],
                                        onSelect: (selected) => {
                                          const updated = [...value];
                                          const updatedItem = {
                                            ...updated[idx],
                                            sectionMode: selected,
                                          };

                                          if (selected.value === "TEMPLATE") {
                                            updatedItem.customConfig = null;
                                          } else {
                                            updatedItem.templateId = null;
                                            updatedItem.type = null;
                                            updatedItem.categoryId = null;
                                            updatedItem.pageIdData = null;
                                            updatedItem.shortLink = "";
                                            updatedItem.customConfig =
                                              normalizeCustomSectionConfig({
                                                ...(updatedItem.customConfig || {}),
                                                contentType:
                                                  updatedItem.customConfig
                                                    ?.contentType || "",
                                              });
                                          }

                                          updated[idx] = updatedItem;
                                          onChange(name, updated, false);
                                        },
                                      })}
                                    </div>
                                  ) : isSectionCustomConfig && !customContentType ? (
                                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...value];
                                          updated[idx] = {
                                            ...updated[idx],
                                            sectionMode: null,
                                            customConfig: null,
                                          };
                                          onChange(name, updated, false);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                      >
                                        <FiArrowLeft />
                                        Back
                                      </button>
                                      <div>
                                        <label className="mb-2 block text-xs font-semibold text-slate-700">
                                          Type Content
                                        </label>
                                        {renderIconChoice({
                                          currentValue: customContentType,
                                          options: [
                                            {
                                              value: "content",
                                              label: "Content",
                                              description: "Isi manual per kolom",
                                              icon: <FiFileText />,
                                            },
                                            {
                                              value: "category",
                                              label: "Category",
                                              description: "Ambil data kategori",
                                              icon: <FiTag />,
                                            },
                                          ],
                                          onSelect: (selected) => {
                                            const updated = [...value];
                                            updated[idx] = {
                                              ...updated[idx],
                                              customConfig:
                                                normalizeCustomSectionConfig({
                                                  ...(updated[idx]
                                                    ?.customConfig || {}),
                                                  contentType: selected.value,
                                                }),
                                            };
                                            onChange(name, updated, false);
                                          },
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                  <>
                                  {showTemplateBack ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...value];
                                        updated[idx] = {
                                          ...updated[idx],
                                          sectionMode: null,
                                          templateId: null,
                                          type: null,
                                          categoryId: null,
                                          pageIdData: null,
                                        };
                                        onChange(name, updated, false);
                                      }}
                                      className="mb-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                      <FiArrowLeft />
                                      Back
                                    </button>
                                  ) : null}
                                  {isSectionCustomConfig && customContentType ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...value];
                                        updated[idx] = {
                                          ...updated[idx],
                                          customConfig:
                                            normalizeCustomSectionConfig({
                                              ...(updated[idx]?.customConfig || {}),
                                              contentType: "",
                                              sourceCategoryId: null,
                                            }),
                                        };
                                        onChange(name, updated, false);
                                      }}
                                      className="mb-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                      <FiArrowLeft />
                                      Back
                                    </button>
                                  ) : null}
                                  <InputField
                                    type={field.type}
                                    name={field.name}
                                    label={field.label}
                                    value={item[field.name]}
                                    options={field.options}
                                    info={field?.info}
                                    onInfoChange={onInfoChange}
                                    onChange={(subName, subVal) => {
                                      const updated = [...value];
                                      const updatedItem = { ...updated[idx] };

                                      // Replace value
                                      const currentField = fieldAddRow?.find(
                                        (f) => f.name === subName,
                                      );
                                      let finalValue = subVal;
                                      if (
                                        currentField?.replaceValue &&
                                        typeof subVal === "string"
                                      ) {
                                        const { from, to } =
                                          currentField.replaceValue;
                                        finalValue = subVal
                                          .split(from)
                                          .join(to);
                                      }
                                      updatedItem[subName] = finalValue;

                                      // SameValue processing
                                      if (currentField?.sameValue?.length > 0) {
                                        for (const sameFieldName of currentField.sameValue) {
                                          const targetField = fieldAddRow?.find(
                                            (f) => f.name === sameFieldName,
                                          );
                                          let copiedValue = finalValue;
                                          if (
                                            targetField?.replaceValue &&
                                            typeof copiedValue === "string"
                                          ) {
                                            const { from, to } =
                                              targetField.replaceValue;
                                            copiedValue = copiedValue
                                              .split(from)
                                              .join(to);
                                          }
                                          updatedItem[sameFieldName] =
                                            copiedValue;
                                        }
                                      }

                                      updated[idx] = updatedItem;
                                      let noCopy = field.allLang ? false : true;
                                      onChange(name, updated, noCopy);
                                    }}
                                    uriSelect={field.uriSelect}
                                    disabled={field.disabled ?? false}
                                    formValues={item}
                                    trigerValue={field.trigerValue}
                                    styleFieldName={field.styleFieldName}
                                  />
                                  </>
                                  )}
                                </div>
                              );
                            })}

                            {/* Tombol Hapus */}
                            {isFieldAddRow && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = value.filter(
                                    (_, i) => i !== idx,
                                  );
                                  onChange(name, updated);
                                }}
                                className="absolute top-2 right-2 text-red-500 text-sm"
                              >
                                ✕
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={(e) => onChange(name, e.target.value)}
              className={`w-full border rounded px-2 py-1 text-sm ${
                disabled ? " !bg-gray-200" : " "
              }`}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
}
