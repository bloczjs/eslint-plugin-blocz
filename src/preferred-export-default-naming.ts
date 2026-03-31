import type { Rule } from "eslint";

interface Config {
  module: string;
  name: string;
  autofix?: boolean;
  preferNamespace?: boolean;
}
export interface RuleConfig extends Array<Config> {}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",

    docs: {
      description: "set preferred name for default imports",
    },

    fixable: "code",

    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          module: { type: "string" },
          name: { type: "string" },
          autofix: { type: "boolean" },
          preferNamespace: { type: "boolean" },
        },
        required: ["module", "name"],
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const foundOption = (context.options as RuleConfig).find(
          (option) => node.source.value === option.module,
        );
        if (!foundOption) {
          // No setting about this import statement
          return;
        }

        const foundImportDefaultSpecifier = node.specifiers.find(
          (specifier) =>
            specifier.type === "ImportDefaultSpecifier" ||
            specifier.type === "ImportNamespaceSpecifier",
        );
        if (!foundImportDefaultSpecifier) {
          // No default import in this statement
          return;
        }

        const messages: string[] = [];

        // If the import doesn’t match the setting
        if (foundImportDefaultSpecifier.local.name !== foundOption.name) {
          messages.push(
            `The preferred name of the ${foundOption.module}'s default export is "${foundOption.name}"`,
          );
        }

        if (
          foundImportDefaultSpecifier.type === "ImportDefaultSpecifier" &&
          foundOption.preferNamespace
        ) {
          messages.push(
            `"${foundOption.module}" should be used with "import *"`,
          );
        }

        if (
          foundImportDefaultSpecifier.type === "ImportNamespaceSpecifier" &&
          !foundOption.preferNamespace
        ) {
          messages.push(
            `"${foundOption.module}" should be used with default imports`,
          );
        }

        if (messages.length === 0) {
          return;
        }

        context.report({
          node: foundImportDefaultSpecifier,
          loc: foundImportDefaultSpecifier.loc!,
          message: messages.join("\n"),
          fix(fixer) {
            if (foundOption.autofix === false) {
              return [];
            }

            const fixes = [
              // Fix import
              fixer.replaceText(
                foundImportDefaultSpecifier,
                `${foundOption.preferNamespace ? "* as " : ""}${
                  foundOption.name
                }`,
              ),
            ];

            // Fix every usage of this import
            for (const variable of context.sourceCode.getDeclaredVariables(
              foundImportDefaultSpecifier,
            )) {
              fixes.push(
                ...variable.references.map((reference) =>
                  fixer.replaceText(reference.identifier, foundOption.name),
                ),
              );
            }

            return fixes;
          },
        });
      },
    };
  },
};

export default rule;
