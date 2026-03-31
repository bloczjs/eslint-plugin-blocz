import { RuleTester } from "eslint";
import tsEslintParser from "@typescript-eslint/parser";

import rule, { type RuleConfig } from "../src/prevent-imports.ts";

const suites: Array<{
  file: string;
  code: string;
  output?: string;
  errors?: string[];
  config: RuleConfig;
}> = [
  {
    file: "ok.ts",
    code: "import a, { b } from 'c';import * as a from 'c'",
    config: [
      {
        module: "react",
        names: ["a"],
      },
    ],
  },

  {
    file: "no-named-import.ts",
    code: "import { a } from 'b';import _c from 'c';class D extends _c.d {}; const e: _c.e = {};",
    config: [
      {
        module: "b",
        names: ["a"],
      },
      {
        module: "c",
        names: ["d", "e"],
        reason: "Prefer f",
      },
    ],
    errors: [
      'You shouldn’t import "a" from "b"',
      'You shouldn’t use "d" from "c": Prefer f',
      'You shouldn’t use "e" from "c": Prefer f',
    ],
  },

  {
    file: "multiple-from-same-module.ts",
    code: "import A, { b, c } from 'a';const b = A.b;function c(_c = A.c) {}",
    config: [
      {
        module: "a",
        names: ["b"],
        reason: "B",
      },
      {
        module: "a",
        names: ["c"],
        reason: "C",
      },
    ],
    errors: [
      'You shouldn’t import "b" from "a": B',
      'You shouldn’t import "c" from "a": C',
      'You shouldn’t use "b" from "a": B',
      'You shouldn’t use "c" from "a": C',
    ],
  },
];

for (const suite of suites) {
  const ruleTester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      parser: tsEslintParser,
    },
  });

  const valid: RuleTester.ValidTestCase[] = [];
  const invalid: RuleTester.InvalidTestCase[] = [];

  if (suite.errors) {
    invalid.push({
      name: suite.file,
      filename: suite.file,
      code: suite.code,
      output: suite.output || null,
      errors: suite.errors,
      options: suite.config,
    });
  } else {
    valid.push({
      name: suite.file,
      filename: suite.file,
      code: suite.code,
      options: suite.config,
    });
  }

  ruleTester.run("blocz/prevent-imports", rule, {
    valid,
    invalid,
  });
}
