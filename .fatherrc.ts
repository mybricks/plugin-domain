import { defineConfig } from "father";

export default defineConfig({
  esm: { input: "src" },
  cjs: { input: "src" },
  umd: {
    output: {
      filename: "index.js",
    },
    extractCSS: false,
    externals: {
      react: "React",
      antd: "antd",
      axios: "axios",
    },
  },
});
