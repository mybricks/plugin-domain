import { getLocaleText } from "./locale";
import type { Fields } from "./type";

const X_COMPONENT_MAP: Record<string, string> = {
  Input: "Input",
  "Input.TextArea": "Input.TextArea",
  "Input.URL": "Input",
  InputNumber: "InputNumber",
  Percent: "InputNumber",
  AssociationField: "Select",
};

const TYPE_MAP: Record<string, string> = {
  uid: "string",
  bigInt: "number",
  date: "string",
  belongsTo: "object",
  belongsToMany: "array",
  string: "string",
  text: "string",
  double: "number",
  float: "number",
};

const fieldConvert = (field: Fields[0]) => {
  if (field.hidden) {
    return field;
  }
  if (field.uiSchema) {
    const { uiSchema } = field;
    uiSchema.title = getLocaleText(uiSchema.title) || field.name;
    uiSchema.type = TYPE_MAP[field.type] || uiSchema.type;

    if (!uiSchema["x-read-pretty"]) {
      // 非只读的，转换x-component
      if (!X_COMPONENT_MAP[uiSchema["x-component"]]) {
        console.warn(`[nocobase x-component] 待处理`, field);
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
