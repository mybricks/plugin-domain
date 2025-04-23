const X_COMPONENT_MAP: Record<string, string> = {
  Percent: "InputNumber.Percent",
  "Input.URL": "Input",
};

/** xComponent转换为通用的命名 */
const xComponentConvert = (xComponent: string) => {
  return X_COMPONENT_MAP[xComponent] || xComponent;
};

export { xComponentConvert };
