# React component library workspace

An npm workspace with two packages:

| Package            | What it is                                              | Built with             |
| ------------------ | ------------------------------------------------------- | ---------------------- |
| `packages/library` | React component library on top of [Base UI](https://base-ui.com) (`@base-ui/react`) | `tsc` + a CSS copy step |
| `packages/app`     | Example consumer app                                    | Vite                   |

## Getting started

Requires Node.js `^20.19.0` or `>=22.12.0` (Vite 8's minimum).

```sh
npm install
npm run storybook  # develop components in Storybook on http://localhost:6006
```

### Developing components: use Storybook

Storybook is the development environment for the library. It reads `packages/library/src`
directly, with hot reload for both TSX and CSS, so there's no build step while you work.
Every component has stories, including the states that are hard to reach in an app (errors,
disabled, pending, themed).

### Checking the built library in a real app

`packages/app` consumes the library exactly as an external app would: through `library/...`
imports resolved to the built `dist/`. Use it to check that the **build output** works, not
for day-to-day development:

```sh
npm run dev        # builds the library, then starts the app's Vite dev server
npm run build      # builds the library, then the app
npm run typecheck  # typechecks both packages
```

After changing the library, rerun `npm run build -w library`. The running app picks up the new
`dist/` without restarting the dev server, but the page fully reloads. While the build deletes and
recreates `dist/`, Vite briefly logs "Failed to load url … Does the file exist?" errors. They
clear up on their own once the build finishes.

### All scripts

| Script | What it does |
| --- | --- |
| `npm run storybook` | Storybook dev server (alias for `npm run storybook -w library`) |
| `npm run dev` | Build the library, then start the app's dev server |
| `npm run build` | Build the library, then the app |
| `npm run typecheck` | Typecheck both packages, including stories |
| `npm run build -w library` | Clean, validate + copy CSS into `packages/library/dist/`, then `tsc` |
| `npm run check:css -w library` | Validate the CSS only (no build) |
| `npm run build-storybook -w library` | Static Storybook into `packages/library/storybook-static/` |

## Using the library

Import each component from its own path:

```tsx
import Button from "library/components/Button";
import TextField from "library/components/TextField";
import LoginForm from "library/components/LoginForm";
import IconButton from "library/components/IconButton";
import { Heart } from "@phosphor-icons/react";

<IconButton icon={Heart} label="Like" variant="secondary" />
<TextField label="Name" hint="What should we call you?" onValueChange={setName} />
<Button variant="secondary" size="large" fullWidth>Submit</Button>
<LoginForm onSubmit={async ({ email, password }) => { /* return a promise to show a pending state */ }} />
```

| Component   | What it is |
| ----------- | ---------- |
| `Button`    | Base UI `Button`, with `variant`, `size` and `fullWidth` |
| `TextField` | Base UI `Field` + `Input`, with `label`, `hint` and `error` |
| `LoginForm` | Composed from `TextField` + `Button`, with email/password, a pending state and a form-level `error` |
| `IconButton` | Square, icon-only `Button`. Takes a [Phosphor](https://phosphoricons.com) icon (`icon`), a required accessible `label`, and `variant`, `size` and `weight` |

### Icons (Phosphor)

`IconButton` uses [`@phosphor-icons/react`](https://github.com/phosphor-icons/react). The app
imports the icons it needs and passes them in:

```tsx
import { Heart } from "@phosphor-icons/react";
<IconButton icon={Heart} label="Like" weight="fill" />
```

The library imports only Phosphor's *types* (`import type { Icon, IconWeight }`), which compile
to nothing, so `dist/` contains no icons. Phosphor is ESM and marked side-effect free, so the
app's bundler keeps only the icons it actually imports. (Checked: an app using `Heart` and
`Trash` contains exactly those two icons' SVG data and none of the other ~1,500. `IconButton`
plus both icons in all six weights add about 6.8 kB of JS.)

`@phosphor-icons/react` is a peer dependency, so apps that use `IconButton` install it themselves.

You don't need to import any CSS, and you don't need a provider. Each component brings its own
styles.

## How styling works

Components are styled with **CSS modules** (`Button.module.css`, etc.). The library does **not**
compile or bundle CSS. `tsc` emits plain ES modules that still contain the CSS import:

```js
// packages/library/dist/components/Button/Button.js
import { Button as BaseButton } from "@base-ui/react/button";
import styles from "./Button.module.css";
```

`scripts/copy-assets.mjs` copies every `.css` file from `src/` into `dist/` next to the emitted JS,
so that import still resolves. The **consumer's bundler** (Vite here) then processes the CSS
module: it scopes the class names and bundles the CSS. The library targets **Vite + React apps**,
which handle this out of the box. Other bundlers can work too, but they need CSS-module support
and must allow dependencies to import global CSS (`tokens.css`). This setup is only tested with
Vite.

### CSS validation

Because the CSS ships uncompiled, a broken file would otherwise only fail in the consumer's
build. So before copying, `scripts/copy-assets.mjs` runs every `.css` file through the same
tools Vite uses for CSS modules (PostCSS with `postcss-modules`), and stops the build with
file, line and column:

```
Invalid CSS (3 of 5 files):
  src/tokens.css:55:7  Unclosed bracket
  src/components/Button/Button.module.css:46:1  Unclosed block
  src/components/TextField/TextField.module.css:54:10  referenced class name "doesNotExist" in composes not found
```

This catches syntax errors (unclosed blocks and brackets, e.g. a broken `:global(` or
`:where(`) and invalid `composes`. All of these break a consumer's Vite build. The validated
output is discarded: `dist/` gets the original files.

It doesn't catch a typo in a class name used from TSX (`styles.titel`): CSS modules return a
plain object, so the missing key is just `undefined` and no class is rendered. A Vite library
build wouldn't catch it either. Check components in Storybook.

Base UI components are headless (no styles of their own), so the CSS modules are the only source
of styling. State styling uses the data attributes Base UI sets, e.g.
`.input[data-invalid]`, `.input[data-focused]` and `.root[data-disabled]`.

## Design tokens

Shared design values live in [`packages/library/src/tokens.css`](packages/library/src/tokens.css)
as CSS custom properties, all prefixed `--lib-`:

| Group      | Tokens |
| ---------- | ------ |
| Colors     | `--lib-color-text`, `-text-muted`, `-text-inverse`, `-surface`, `-surface-disabled`, `-border`, `-primary`, `-primary-hover`, `-secondary`, `-secondary-hover`, `-tertiary-hover`, `-focus`, `-danger`, `-danger-surface` |
| Typography | `--lib-font-family`, `--lib-font-size-xs` … `-xl` (12–20px), `--lib-font-weight-medium`, `-bold` |
| Spacing    | `--lib-space-1` … `-5` (4, 8, 12, 16, 20px) |
| Shape      | `--lib-radius`, `--lib-control-height-sm` / `-md` / `-lg`, `--lib-transition` |

Component CSS only uses tokens, with no hard-coded colors:

```css
/* Button.module.css */
.primary { background: var(--lib-color-primary); color: var(--lib-color-text-inverse); }
```

### How tokens.css is loaded

`tokens.css` is plain global CSS, not a module. Each component imports it from its **`.tsx`**:

```tsx
// Button.tsx
import "../../tokens.css";
import styles from "./Button.module.css";
```

Because it's a normal module in the import graph, the consumer's bundler includes it **exactly
once**, as soon as any component is used, however many components the app uses. (Checked in
unminified builds: one `:where(:root)` block for the full app, and one for a Button-only app.)

**Don't `@import` it from a `.module.css` file.** Vite copies an `@import`ed file into every CSS
module that imports it, so the tokens would appear once per component. The minifier sometimes
merges the copies, but you can't rely on that.

### Theming / overriding tokens

The tokens are declared on `:where(:root)`, which has zero specificity. A consumer can override
any of them with plain CSS, and the override always wins regardless of stylesheet order:

```css
/* in the consuming app */
:root {
  --lib-color-primary: #276ef1;
  --lib-color-primary-hover: #1e54b7;
  --lib-radius: 999px;
}
```

You can also override tokens on any subtree, e.g. `.marketing { --lib-color-primary: hotpink; }`
or an inline `style`. The `Themed` stories for Button, LoginForm and IconButton in Storybook do
exactly that.

### Limitation: media queries

`var()` doesn't work inside `@media` conditions, so breakpoints can't be custom properties. If you
need shared breakpoints, use CSS-module `@value` from a separate `breakpoints.module.css`, e.g.
`@value md from "../../breakpoints.module.css"; @media (min-width: md) { … }`. It's resolved at
build time by the consumer's bundler and adds no CSS of its own, but it can't be themed at runtime.

## Server-side rendering (SSR)

The components are SSR-safe: none of them touch `window` or `document`, and label/input IDs
come from React's `useId`, so they match between server and client.

### Vite SSR: add `ssr.noExternal`

A consuming app that renders on the server needs one setting:

```ts
// vite.config.ts in the consuming app
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  ssr: { noExternal: ["library"] },
});
```

**Why:** in SSR, Vite doesn't bundle packages in `node_modules`. It leaves them to Node.js to load
at runtime. Node can't handle this library's `dist/`: it can't follow the extensionless imports
(`Cannot find module '…/library/dist/cx' imported from …/Button/Button.js`), and it can't
import `.module.css` files at all.
`noExternal` tells Vite to bundle the library for the server the same way it does for the
browser, so CSS modules and import paths are handled.

Checked with a packed tarball installed into a separate Vite app:

| Test | Without `noExternal` | With `noExternal` |
| --- | --- | --- |
| Production SSR build (`vite build --ssr`) + `renderToString` | fails (`ERR_MODULE_NOT_FOUND`) | works: HTML with scoped class names |
| Dev SSR (`ssrLoadModule`) | fails (same error) | works |
| Hydrating the server HTML in the browser | | no hydration errors, event handlers work, styles and tokens apply |

The `packages/app` in this workspace doesn't use SSR. If it did, it wouldn't need the setting:
Vite treats linked workspace packages as source code and never leaves them to Node. (Checked:
dev and production SSR both work in `packages/app` without it.)

### React Server Components (e.g. Next.js App Router)

Components that use state, effects or other client-only hooks start with a `"use client"`
directive, so they can be imported from server components. Currently that's `LoginForm`:

```tsx
// packages/library/src/components/LoginForm/LoginForm.tsx
"use client";

import { useState, type FormEvent } from "react";
```

`tsc` keeps the directive at the top of the emitted `dist/` file. `Button`, `TextField` and
`IconButton` don't use hooks themselves, and the Base UI components they render already carry
`'use client'`.

**Icons in Server Components:** Phosphor's default icons use React context, which Server
Components don't support. There, import icons from `@phosphor-icons/react/ssr` instead, as
Phosphor's own docs recommend. They have the same `Icon` type, so `IconButton` accepts both. In
plain SSR (`renderToString`) both kinds work. Checked with `IconButton` and Vite SSR.

**Not tested with Next.js.** It would need `transpilePackages: ["library"]` in `next.config`
(Next's equivalent of `noExternal`) to handle the CSS modules and extensionless imports.

## You only get the code and CSS for the components you import

If your app only imports `Button`, **none of TextField's code or CSS ends up in the build.**
That includes the Base UI parts that only TextField uses (`Field`, `Input`). JS and CSS follow
the same import graph, so the same rule covers both.

This holds because every component is a separate entry point. The `exports` map in
`packages/library/package.json` maps each import path to that component's own file:

```json
"exports": {
  "./components/*": {
    "types": "./dist/components/*/*.d.ts",
    "default": "./dist/components/*/*.js"
  }
}
```

Every `*` in the target is replaced with the same name, so `library/components/Button` maps to
`dist/components/Button/Button.js`. There's no `index` file: each component's own file is its
entry point. (Checked with TypeScript, Vite and Node, including that an unknown component name
fails to resolve.)

So the import graph for `import Button from "library/components/Button"` is:

```
dist/components/Button/Button.js
├── @base-ui/react/button
└── Button.module.css
```

`TextField.js`, `TextField.module.css`, `@base-ui/react/field` and `@base-ui/react/input` are
never reached, so the bundler never loads them: no code and no CSS. This doesn't depend on
tree-shaking: the files simply aren't part of the graph.

### Composed components bring their dependencies along

`LoginForm` is built from `TextField` and `Button`. It imports them through their entry files:

```tsx
// packages/library/src/components/LoginForm/LoginForm.tsx
import Button from "../Button/Button";
import TextField from "../TextField/TextField";
import styles from "./LoginForm.module.css";
```

So importing `LoginForm` pulls in all three components' code and CSS. That's correct, because
it can't render without them:

```
dist/components/LoginForm/LoginForm.js
├── LoginForm.module.css
├── Button/Button.js       → Button.module.css, @base-ui/react/button
└── TextField/TextField.js → TextField.module.css, @base-ui/react/field, /input
```

`IconButton` is the other composed component: it renders `Button` and adds its own CSS module
to make it square. Its rules override some of Button's at equal specificity, which works because
`IconButton.tsx` imports `Button` *before* its own CSS module. The bundler keeps CSS in import
order, so Button's rules always come first. (Checked: also when the app imports `IconButton`
before `Button`.)

Nothing is duplicated. If the app imports `LoginForm` *and* `Button`, both paths reach the same
`Button.js` and `Button.module.css` files, and the bundler includes that code and CSS once.
Shared dependencies (React, Base UI internals) are also included once.

### Measured

Production builds of the app (`vite build`) with different imports:

| App imports            | CSS     | JS       | Tokens | Button CSS          | TextField CSS | LoginForm CSS | TextField / LoginForm code |
| ---------------------- | ------- | -------- | ------ | ------------------- | ------------- | ------------- | -------------------------- |
| `Button`               | 2.28 kB | 227.7 kB | 1×     | 1×                  | none          | none          | none                       |
| `LoginForm`            | 3.73 kB | 246.9 kB | 1×     | 1×                  | 1×            | 1×            | included                   |
| `LoginForm` + `Button` | 3.73 kB | 247.0 kB | 1×     | 1× (not duplicated) | 1×            | 1×            | included                   |

About 1.4 kB of the CSS is `tokens.css`, which every build includes once. Most of the JS is React
itself. The `Button`-only build is about 19 kB smaller because it contains no TextField,
LoginForm, `Field` or `Input` code at all. See [Verifying a build](#verifying-a-build) to repeat
this.

## How to avoid breaking it

The guarantee rests on one rule: **importing a component must only reach that component's own
files, plus whatever it genuinely depends on.** Everything below follows from that rule.

### Things that break it

| Change | What goes wrong |
| --- | --- |
| Adding a barrel file (`src/index.ts` re-exporting every component) and a `"."` entry in `exports` | `import { Button } from "library"` pulls every component's code and CSS into the graph. Dropping the unused parts is then up to tree-shaking, which mostly works for JS but is unreliable for CSS. |
| Replacing the `"./components/*"` wildcard in `exports` with one combined entry | Same as a barrel: one entry point means one big graph. |
| Shared modules that import components or CSS, e.g. a `utils.ts` that imports `TextField`, or a `shared.css` with real rules (classes, element styles) imported by every component | Every component that imports the shared module drags that code and CSS along. (`tokens.css` is the deliberate exception: it holds only custom properties, so including it everywhere is the point.) |
| Putting rules other than custom properties into `tokens.css` | Every app that uses any component gets those styles, and global selectors start leaking into the consumer's page. |
| `@import "../../tokens.css"` from a `.module.css` | The tokens are copied into every component's CSS instead of being included once. |
| CSS-module `composes` from another component's file, e.g. `composes: input from "../TextField/TextField.module.css"` | Button's CSS now includes TextField's CSS. |
| A component importing another component's CSS or helper files (`../TextField/TextField.module.css`) instead of its entry file (`../TextField/TextField`) | Couples to private files that may be renamed or split later. Importing another component's `.module.css` is worst: you depend on its private class names. |
| Setting `"sideEffects": false`, or dropping the `"**/*.css"` pattern | Production builds may silently **drop the CSS of components you do use**, because bundlers treat CSS imports as unused. |
| Switching the library build to a bundler that extracts all CSS into one `style.css` | Consumers get one stylesheet with every component's CSS, or have to import it manually. Keep the build to `tsc` plus the copy step. |

### Rules to follow

- **One folder per component, with an entry file of the same name** (`Button/Button.tsx`) that
  default-exports the component. The folder is a convention for keeping a component's files
  together. What matters for the guarantee is that each component has its own entry file. Don't
  add a root `index.ts` or a `"."` export.
- **Shared code must be CSS-free and component-free**, with one exception: `src/tokens.css`.
  Helpers like `src/cx.ts` are fine because they import nothing. If several components need the
  same *value*, add a token. If they need the same *rules*, duplicate a few lines. Don't
  `composes` or import across component folders.
- **`tokens.css` holds only custom properties under `:where(:root)`.** No classes, no element
  selectors, no resets.
- **Import `tokens.css` from the component's `.tsx`** (`import "../../tokens.css";`), never with
  `@import` from CSS.
- **If a component uses another component, import its entry file** (`../Button/Button`), never
  its CSS or other internal files. The other component's code and CSS will then come along,
  which is correct and expected. `LoginForm` and `IconButton` are the reference examples.
- **To override another component's styles, import that component before your own CSS module**
  (as `IconButton` does with `Button`). CSS follows import order, so your rules come later and
  win at equal specificity.
- **Components that use hooks (`useState`, `useEffect`, …) start with `"use client";`**, so they
  work in React Server Components. See [SSR](#server-side-rendering-ssr).
- **Never change `"sideEffects": ["**/*.css"]`** in `packages/library/package.json`.
- **Keep the library build to `tsc` plus `scripts/copy-assets.mjs`.** No CSS bundling in the
  library. The consumer's bundler handles CSS.
- **Consumers should always use the deep import paths** (`library/components/Button`).

### Review checklist

When reviewing a change to `packages/library`, check:

- [ ] No new `src/index.ts`, and no new `"."` or combined entry in `package.json` `exports`
- [ ] `"sideEffects": ["**/*.css"]` is unchanged
- [ ] No `import` of `*.css` from outside the component's own folder, except `../../tokens.css`
- [ ] `tokens.css` contains only `--lib-*` custom properties under `:where(:root)`
- [ ] No `@import` in any `.css` file
- [ ] Colors, font sizes, spacing, radii and control heights in component CSS use `var(--lib-*)`
      (1–2px borders and outlines are fine as literal values)
- [ ] No `composes: … from "../…"` in any `.module.css`
- [ ] Imports between components use the entry file (`../<Name>/<Name>`), not its CSS or helpers
- [ ] A component that overrides another's styles imports it before its own CSS module
- [ ] Shared files in `src/` (outside `components/`) don't import CSS or components
- [ ] The `build` script is still `tsc` plus the copy step, and the copy step still validates
      the CSS
- [ ] Components that use hooks start with `"use client";`
- [ ] No `window`, `document` or other browser globals at module level or during render
      (only inside effects and event handlers), so SSR keeps working

Quick checks for the import rules:

```sh
cd packages/library
# CSS imported from another folder (should print nothing):
grep -rnE "from \"\.\./.*\.css\"" src
# composes from another file (should print nothing):
grep -rn "composes:.*from" src
# shared modules importing CSS or components (should print nothing):
grep -rnE "\.css\"|components/" src --include='*.ts' --exclude='*.d.ts' --exclude-dir=components
# @import in CSS (should print nothing):
grep -rnE "^\s*@import" src --include='*.css'
# hard-coded colors in component CSS (should print nothing):
grep -rnE "#[0-9a-fA-F]{3,8}\b" src/components --include='*.css'
```

### Verifying a build

To confirm the guarantee still holds, build an app that imports a single component and check
both the CSS and the JS it produces:

```sh
npm run build -w library
cd packages/app
cp src/App.tsx /tmp/App.tsx.bak
cat > src/App.tsx <<'EOF'
import Button from "library/components/Button";
export default function App() {
  return <Button>Only a button</Button>;
}
EOF
npx vite build --outDir /tmp/button-only --emptyOutDir
cat /tmp/button-only/assets/*.css              # tokens (:where(:root){…}) + Button classes (._root_, ._primary_, …)
grep -cE "_hint_|_error_|_label_" /tmp/button-only/assets/*.css   # CSS: expect 0, i.e. no TextField styles
grep -cE "_hint_|_formError_|Logging in" /tmp/button-only/assets/*.js  # code: expect 0, i.e. no TextField/LoginForm code
grep -oE ":where\(:root\) ?\{" /tmp/button-only/assets/*.css | wc -l          # tokens: expect 1
cp /tmp/App.tsx.bak src/App.tsx                # restore the app
```

If either check finds a component you didn't import, use the rules above to find the import that
pulled it in.

## Adding a component

1. Create `packages/library/src/components/<Name>/`, containing:
   - `<Name>.tsx`: the component and its entry point. Export it as a named export and as
     `export default <Name>;`, plus its props type. Relative imports are extensionless
     (`"../Button/Button"`). Start with `import "../../tokens.css";` before its own CSS-module
     import. If it uses hooks, put `"use client";` on the very first line.
   - `<Name>.module.css`: its styles, using `var(--lib-*)` tokens for colors, sizes and spacing
   - `<Name>.stories.tsx`: Storybook stories (excluded from the build)
2. Run `npm run build -w library`. It's importable straight away as
   `library/components/<Name>`, because the `exports` wildcard picks it up with no config change.

## Project layout

```
.
├── package.json                  workspaces + root scripts
└── packages/
    ├── library/
    │   ├── .storybook/           Storybook config (react-vite framework)
    │   ├── scripts/copy-assets.mjs   validates src/**/*.css, then copies it → dist/
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── Button/       Button.tsx (entry), Button.module.css, Button.stories.tsx
    │   │   │   ├── TextField/    TextField.tsx (entry), TextField.module.css, TextField.stories.tsx
    │   │   │   ├── LoginForm/    composed from Button + TextField; same file layout
    │   │   │   └── IconButton/   icon-only Button using Phosphor icons; same file layout
    │   │   ├── tokens.css        design tokens (CSS custom properties), imported by every component
    │   │   ├── css-modules.d.ts  types for *.module.css and plain *.css imports
    │   │   └── cx.ts             tiny className joiner
    │   ├── tsconfig.json         shared options; typechecks src + .storybook (no emit)
    │   └── tsconfig.build.json   emits dist/; excludes *.stories.tsx
    └── app/
        ├── src/                  example usage
        └── vite.config.ts
```

## Why tsc instead of a Vite library build

A common alternative is to build the library with Vite in library mode, plus
[`vite-plugin-lib-inject-css`](https://github.com/emosheeep/vite-plugin-lib-inject-css). Vite
compiles the CSS modules into plain `.css` files during the library build, and the plugin adds
`import './assets/Button.css'` to the top of each output chunk.

We compared the two by building this library both ways (Vite 8.3, plugin 2.2.2) and installing
each as a packed tarball into a fresh Vite app:

| | `tsc` + copy step (this repo) | Vite library mode + plugin |
| --- | --- | --- |
| Button only: CSS in the app | 2,279 B (tokens + Button) | 2,279 B, identical |
| LoginForm + Button: CSS in the app | 3,728 B, nothing duplicated | 3,728 B, identical |
| Unused components' code left out | yes | yes |
| Vite dev server | works | works |
| SSR without `ssr.noExternal` | fails | also fails (Node can't import `.css`) |
| SSR with `ssr.noExternal` | works | works |
| `"use client"` kept in output | yes | no, stripped during bundling |
| `.d.ts` files | built in | needs a plugin or a separate `tsc` run |
| New component | nothing to configure (`exports` pattern) | add it to the build's entry list |
| `dist/` layout | mirrors `src/` | hashed shared chunks |
| Consumer must support CSS modules | yes | no, plain CSS only |
| Broken CSS fails the library build | yes, via the PostCSS check in the copy step | yes, Vite compiles it |
| Class-name typo in TSX (`styles.titel`) caught | no | no |

**Recommendation: use `tsc` for a library like this one** (Vite + React consumers, CSS modules,
a headless component base). Our test bundles were identical, and `tsc` comes out ahead on
everything that differs:

- **`"use client"` survives**, so components keep working in React Server Components.
- **Fewer moving parts**: one compiler and a copy script (which validates the CSS with PostCSS),
  instead of Vite library mode, the plugin, its native dependency and a separate step for `.d.ts`
  files.
- **No config to maintain**: new components work through the `exports` pattern, with no entry
  list to update.
- **`dist/` mirrors `src/`**, so the output is easy to read and debug.

A bundler helps a library when its source has something the consumer's bundler can't handle,
and this one doesn't.

The plugin also has a known issue on Vite 8.1+
([#36](https://github.com/emosheeep/vite-plugin-lib-inject-css/issues/36)): a chunk with several
CSS files gets its imports in reverse order, which changes which rules win when specificity is
equal.

### When a Vite (or tsup/tsdown) build would be the better choice

- Consumers without CSS-module support, or without a bundler
- Sass or Less in the source, if you don't want consumers to install `sass`
- Imports `tsc` can't handle: SVG-as-component (`?react`), images, `?raw`, `import.meta.env`
- Path aliases (`@/components/...`), which `tsc` copies unchanged into `dist/`
- CommonJS, UMD or single-file CDN output

Even then, try an unbundled build first (tsdown/tsup, or Vite with `preserveModules`). It keeps
`dist/` mirroring `src/`, so one component per entry point still works the same way.

## Notes

- **Relative imports are extensionless** (`"../Button/Button"`, `"../../cx"`), the form
  editors suggest by default. `tsc` copies import paths unchanged, so `dist/` contains the same
  extensionless paths, and the consumer's bundler fills in `.js`. This means
  `dist/` is meant for bundlers (Vite, webpack, Rollup, esbuild). It can't be loaded directly by
  Node.js or a browser, but it couldn't be anyway because of the `.module.css` imports. That's
  also why SSR apps need `ssr.noExternal` (see [SSR](#server-side-rendering-ssr)). Checked
  with a packed tarball installed into a separate Vite app: both `vite build` and the dev server
  (which pre-bundles dependencies with esbuild) work.
- `@base-ui/react`, `@phosphor-icons/react`, `react` and `react-dom` are **peer dependencies** of
  the library, so the app installs them and only one copy of each ends up in the bundle.
- Storybook and Vite are dev dependencies of the library, used only by Storybook. The library
  build itself is just `tsc` plus the copy step, which uses `postcss` and `postcss-modules`
  (also dev dependencies) to validate the CSS.
- `npm audit` reports moderate advisories in Storybook's dev-only dependencies (glob and minimatch,
  pulled in by its docgen plugin). `npm audit fix --force` would downgrade Storybook to v8, so
  they're left alone. None of this code ships in the library or the app.
