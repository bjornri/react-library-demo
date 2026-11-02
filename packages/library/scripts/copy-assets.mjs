// tsc only emits .js/.d.ts. This script validates every CSS file in src/ and then copies
// them next to the emitted files, so `import styles from "./X.module.css"` keeps resolving.
//
// The CSS is shipped uncompiled: the consumer's bundler compiles the CSS modules. To catch
// broken files here instead of in the consumer's build, each file goes through the same
// tools Vite uses by default for CSS modules: PostCSS with postcss-modules. Nothing they
// produce is written; dist/ gets the original files.
//
// Usage: node scripts/copy-assets.mjs           validate, then copy into dist/
//        node scripts/copy-assets.mjs --check   validate only
import { cpSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import postcssModules from "postcss-modules";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "src");
const checkOnly = process.argv.includes("--check");

const cssFiles = readdirSync(src, { recursive: true })
  .filter((file) => file.endsWith(".css"))
  .map((file) => join(src, file));

const errors = [];
for (const file of cssFiles) {
  // Plain .css (tokens.css) runs in "global" mode: no class renaming, but its selectors are
  // still parsed, so e.g. an unclosed `:where(` is caught. PostCSS alone doesn't check that.
  const scopeBehaviour = file.endsWith(".module.css") ? "local" : "global";
  try {
    await postcss([postcssModules({ scopeBehaviour, getJSON: () => {} })]).process(
      readFileSync(file, "utf8"),
      { from: file },
    );
  } catch (error) {
    const where = error.line ? `:${error.line}:${error.column}` : "";
    errors.push(`  ${relative(root, file)}${where}  ${error.reason ?? error.message}`);
  }
}

if (errors.length) {
  console.error(`Invalid CSS (${errors.length} of ${cssFiles.length} files):\n${errors.join("\n")}`);
  process.exit(1);
}

if (!checkOnly) {
  cpSync(src, join(root, "dist"), {
    recursive: true,
    filter: (path) => statSync(path).isDirectory() || path.endsWith(".css"),
  });
}

console.log(`CSS OK: ${cssFiles.length} files validated${checkOnly ? "" : " and copied to dist/"}`);
