import { getLocaleText } from "./locale";
import type { Fields } from "./type";

const X_COMPONENT_MAP: Record<string, string> = {
  Input: "Input",
  "Input.TextArea": "Input.TextArea",
  "Input.URL": "Input",
  InputNumber: "InputNumber",
  Percent: "InputNumber",
  AssociationField: "Select",
  Password: "Input",
};

const TYPE_MAP: Record<string, string> = {
  bigInt: "number",
  // 关联表
  /** 多对一 */
  belongsTo: "object",
  /** 多对多 */
  belongsToMany: "array",
  string: "string",
  /** 排序 */
  sort: "number",
  /** 不带时区的时间戳 -> string */
  datetimeNoTz: "string",
  /** 一对多 */
  hasMany: "array",
  array: "array",
  dateOnly: "string",
  integer: "number",
  decimal: "number",
  text: "string",
  boolean: "boolean",
  float: "number",
  date: "string",
  double: "number",
  /** 自动编码 */
  sequence: "string",
  /** [TODO] 根据 公式类型的 Storage type 做判断 */
  formula: "string",
  /** 点，基于地图的定位 [number, number] */
  point: "array",
  uid: "string",
  password: "string",
};

const fieldConvert = (field: Fields[0]) => {
  if (field.uiSchema) {
    const { uiSchema } = field;
    uiSchema.title = getLocaleText(uiSchema.title) || field.name;
    uiSchema.type = TYPE_MAP[field.type];

    if (!uiSchema["x-read-pretty"]) {
      // 非只读的，转换x-component
      if (!X_COMPONENT_MAP[uiSchema["x-component"]]) {
        // console.warn(`[nocobase x-component] 待处理`, field);
      }

      uiSchema["x-component"] =
        X_COMPONENT_MAP[uiSchema["x-component"]] || uiSchema["x-component"];
    }

    if (!TYPE_MAP[field.type]) {
      console.warn(`[nocobase type] 待处理`, field);
    }
  }

  return field;
};

export { fieldConvert };
