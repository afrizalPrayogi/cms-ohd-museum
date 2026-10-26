export type HeaderTable = {
  label: string;
  key: string;
  type: "text" | "boolean" | "number" | "date" | "html";
  sort?: boolean;
  typeForm?: FieldType;
  uriSelect?: string;
  join?: boolean;
  joinSearch?: any;
  trigerValue?: string[];
  noSearch?: boolean;
};
export type Option = {
  label: string;
  value: string | number;
};
export type FieldType =
  | "text"
  | "email"
  | "number"
  | "price"
  | "date"
  | "datetime-local"
  | "time"
  | "file"
  | "textarea"
  | "checkbox"
  | "switch"
  | "select-single"
  | "select-multi"
  | "hide"
  | "password"
  | "autocomplete"
  | "password-repassword"
  | "hide"
  | "text-editor"
  | "upload-fm"
  | "custom-section-builder"
  | "addRowTable";
export type Field = {
  name: string;
  label: string;
  type: FieldType;
  cols?: string;
  options?: Option[];
  fetchOptions?: () => Promise<{ label: string; value: string }[]>;
  value?: any;
  uriSelect?: string;
  allLang?: boolean;
  fieldAddRow?: any[];
  isFieldAddRow?: boolean;
  hideFields?: { name: string; value: any[] }[];
  disabled?: boolean;
  sameValue?: string[];
  replaceValue?: { from: string; to: string };
  trigerValue?: string[];
  styleFieldName?: string;
  required?: boolean;
  info?: string | { value: string; key?: string };
};

export type Step = {
  title: string;
  fields: Field[];
};
