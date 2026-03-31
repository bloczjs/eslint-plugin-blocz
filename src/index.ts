import preferredExportDefaultNaming from "./preferred-export-default-naming.js";
import preventImports from "./prevent-imports.js";

const config = {
  rules: {
    "preferred-export-default-naming": preferredExportDefaultNaming,
    "prevent-imports": preventImports,
  },
};

export = config;
