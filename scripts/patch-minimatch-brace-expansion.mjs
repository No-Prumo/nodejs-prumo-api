import { glob, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

// Temporary bridge for GHSA-mh99-v99m-4gvg: the patched brace-expansion 5
// exposes a named `expand` export, while minimatch 3 expects the legacy module
// itself to be callable. Remove this script when no minimatch 3 installation
// remains in the supported ESLint/Nest CLI dependency tree.
const legacyImport = "var expand = require('brace-expansion')";
const patchedImport = "var expand = require('brace-expansion').expand";
let patchedPackages = 0;

for await (const minimatchPackagePath of glob(
  "node_modules/**/minimatch/package.json",
)) {
  const minimatchPackage = JSON.parse(
    await readFile(minimatchPackagePath, "utf8"),
  );

  if (!minimatchPackage.version.startsWith("3.")) {
    continue;
  }

  const minimatchEntryPath = resolve(
    dirname(minimatchPackagePath),
    minimatchPackage.main,
  );
  const minimatchSource = await readFile(minimatchEntryPath, "utf8");

  if (
    !minimatchSource.includes(legacyImport) &&
    !minimatchSource.includes(patchedImport)
  ) {
    throw new Error(
      `Could not find the expected brace-expansion import in ${minimatchPackagePath}.`,
    );
  }

  if (minimatchSource.includes(legacyImport)) {
    await writeFile(
      minimatchEntryPath,
      minimatchSource.replace(legacyImport, patchedImport),
      "utf8",
    );
  }

  const minimatchRequire = createRequire(minimatchEntryPath);
  const braceExpansion = minimatchRequire("brace-expansion");

  if (typeof braceExpansion.expand !== "function") {
    throw new TypeError(
      `The brace-expansion resolved by ${minimatchPackagePath} does not expose the expected expand function.`,
    );
  }

  patchedPackages += 1;
}

if (patchedPackages === 0) {
  throw new Error(
    "No minimatch 3.x installation was found. Remove the compatibility patch and revalidate the dependency tree.",
  );
}

console.log(`Patched ${patchedPackages} minimatch 3.x installation(s).`);
