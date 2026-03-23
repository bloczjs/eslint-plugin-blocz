import type { TSESTree } from "@typescript-eslint/utils";
import type * as ESTree from "estree";

import type { Rule } from "eslint";

interface Config {
  module: string;
  names: string[];
  reason?: string;
}
export interface RuleConfig extends Array<Config> {}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",

    docs: {
      description: "prevent certain named imports from being used",
    },

    fixable: "code",

    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          module: { type: "string" },
          names: { type: "array", items: { type: "string" } },
          reason: { type: "string" },
        },
        required: ["module", "names"],
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  create(context) {
    const toCheck = new Set<{
      module: string;
      importedModule: string;
      names: string[];
      reason?: string;
    }>();

    return {
      ImportDeclaration(node) {
        const moduleName = node.source.value;
        if (typeof moduleName !== "string") {
          return;
        }
        const foundOptions = (context.options as RuleConfig).filter(
          (option) => moduleName === option.module,
        );
        if (foundOptions.length === 0) {
          // No setting about this import statement
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") {
            // Default import or namespace import
            for (const possibleOption of foundOptions) {
              toCheck.add({
                module: moduleName,
                importedModule: specifier.local.name,
                names: possibleOption.names,
                reason: possibleOption.reason,
              });
            }
            continue;
          }

          let foundOption: Config | undefined;
          let matchedName: string | undefined;
          outer: for (const option of foundOptions) {
            for (const name of option.names) {
              // All possible ImportSpecifier forms:
              // - import { foo } from "mod"           → imported: Identifier("foo")
              // - import { foo as bar } from "mod"    → imported: Identifier("foo")
              // - import { "foo" as bar } from "mod"  → imported: Literal("foo") (ES2022+)

              const importedName =
                specifier.imported.type === "Identifier"
                  ? specifier.imported.name // `foo` in both `import { foo } from "mod"` and `import { foo as bar } from "mod"`
                  : String(specifier.imported.value); // `foo` in `import { "foo" as bar } from "mod"`
              if (name === importedName) {
                foundOption = option;
                matchedName = name;
                break outer;
              }
            }
          }
          if (!matchedName || !foundOption) {
            continue;
          }

          let message = `You shouldn’t import "${matchedName}" from "${foundOption.module}"`;
          if (foundOption.reason) {
            message += `: ${foundOption.reason}`;
          }

          context.report({
            node: specifier,
            loc: specifier.loc!,
            message,
          });
          continue;
        }
      },

      "MemberExpression:exit"(node) {
        if (
          node.object.type !== "Identifier" ||
          node.property.type !== "Identifier"
        ) {
          return;
        }
        checkNode(node.object.name, node.property.name, node);
      },

      "TSQualifiedName:exit"(node: TSESTree.TSQualifiedName) {
        if (
          node.left.type !== "Identifier" ||
          node.right.type !== "Identifier"
        ) {
          return;
        }
        checkNode(
          node.left.name,
          node.right.name,
          node as unknown as ESTree.Node,
        );
      },

      "Program:exit"() {
        toCheck.clear();
      },
    };

    function checkNode(object: string, property: string, node: ESTree.Node) {
      for (const elementToCheck of toCheck) {
        if (
          elementToCheck.importedModule !== object ||
          !elementToCheck.names.includes(property)
        ) {
          continue;
        }
        let message = `You shouldn’t use "${property}" from "${elementToCheck.module}"`;
        if (elementToCheck.reason) {
          message += `: ${elementToCheck.reason}`;
        }

        context.report({
          node: node,
          loc: node.loc!,
          message,
        });
      }
    }
  },
};

export default rule;
