This ESLint plugin comes with multiple rules to help you apply some pattern on various topics (only imports for now) on a whole codebase.

## Rules

1. [Rules](#rules)
   1. [preferred-export-default-naming](#preferred-export-default-naming)
      1. [Configuration](#configuration)
      2. [Example](#example)
   2. [prevent-imports](#prevent-imports)
      1. [Configuration](#configuration-1)
      2. [Example](#example-1)

### preferred-export-default-naming

This rule enforces a default name for export default & namespace. By default, default exports are preferred:

```js
/*
  eslint blocz/preferred-export-default-naming: [
    "error", { "module": "react", "name": "React" }
  ]
*/

// ❌
import react from "react"; // Should be named React
import * as React from "react"; // Should be used with a default import
import * as react from "react";

// ✅
import React from "react";
```

You can specify if you would prefer to use a namespace:

```js
/*
  eslint blocz/preferred-export-default-naming: [
    "error", { "module": "react", "name": "React", preferNamespace: true }
  ]
*/

// ❌
import * as react from "react"; // Should be named React
import React from "react"; // Should be used with a namespace import
import react from "react";

// ✅
import * as React from "react";
```

By default, this rule is auto-fixed, but this can be disabled with `autofix: false`.

#### Configuration

This rule accepts an **array** of configs:

| Option            | Type      | Description                                         |                 |
| ----------------- | --------- | --------------------------------------------------- | --------------- |
| `module`          | `string`  | Imported module name                                | Required        |
| `name`            | `string`  | Name of the identifier that is imported             | Required        |
| `autofix`         | `boolean` | Is this import auto fixed?                          | true (default)  |
| `preferNamespace` | `boolean` | Should use a namespace instead of a default import? | false (default) |

#### Example

```jsonc
{
  "plugins": "blocz",
  "rules": {
    "blocz/preferred-export-default-naming": [
      "warn",
      {
        "module": "classnames",
        "name": "classNames",
        "autofix": false // disable autofix
      },
      {
        "module": "react-dom",
        "name": "ReactDOM" // as autofix by default
      },
      {
        "module": "react",
        "name": "React",
        "preferNamespace": true
      }
    ]
  }
}
```

### prevent-imports

This rule enforces a default name for export default & namespace. By default, default exports are preferred:

```js
/*
  eslint blocz/prevent-imports: [
    "error", { "module": "react-dom", "names": ["findDOMNode"] }
  ]
*/

// ❌
import { findDOMNode } from "react-dom"; // findDOMNode shouldn’t be imported

import * as ReactDOM from "react-dom";
ReactDOM.findDOMNode(); // ❌ It recognizes that findDOMNode is from react-dom

import ReactDOM from "react-dom";
ReactDOM.findDOMNode(); // ❌ It recognizes that findDOMNode is from react-dom

// ✅
import ReactDOM from "react-dom"; // findDOMNode isn't imported
ReactDOM.render(); // findDOMNode isn’t used
```

You can specify a reason why multiple imports are forbidden:

```tsx
/*
  eslint blocz/prevent-imports: [
    "error", { "module": "react", "names": ["FC", "FunctionComponent", "VFC"], "reason": "Prefer React.VoidFunctionComponent" }
  ]
*/

// ❌
import type { FC } from "react"; // Error: `You shouldn’t import "FC" from "react": Prefer React.VoidFunctionComponent`
const MyComponent: FC = () => {};

import React from "react";
const MyComponent: React.FunctionComponent = () => {}; // Error: `You shouldn’t use "FunctionComponent" from "react": Prefer React.VoidFunctionComponent`

import * as React from "react";
const MyComponent: React.VFC = () => {}; // Error: `You shouldn’t use "VFC" from "react": Prefer React.VoidFunctionComponent`

// ✅
import * as React from "react";
const MyComponent: React.VoidFunctionComponent = () => {};
```

> Note: some of those examples use TypeScript. You’ll need to enable `@typescript-eslint/parser` to be able to use it. See https://typescript-eslint.io/.

#### Configuration

This rule accepts an **array** of configs:

| Option   | Type       | Description                                |          |
| -------- | ---------- | ------------------------------------------ | -------- |
| `module` | `string`   | Imported module name                       | Required |
| `names`  | `string[]` | Names of the all the forbidden identifiers | Required |
| `reason` | `string`   | Reason for the interdiction                | Optional |

#### Example

```jsonc
{
  "plugins": "blocz",
  "rules": {
    "blocz/prevent-imports": [
      "warn",
      {
        "module": "react-dom",
        "names": ["findDOMNode", "render"],
        "reason": "Deprecated methods"
      },
      {
        "module": "react",
        "names": ["FC", "FunctionComponent", "VFC"],
        "reason": "Prefer React.VoidFunctionComponent"
      }
      {
        "module": "react",
        "names": "Component", // no reason
      },

    ]
  }
}
```
