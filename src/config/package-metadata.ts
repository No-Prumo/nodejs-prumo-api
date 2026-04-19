import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type PackageMetadata = {
  name: string;
  version: string;
};

const defaultPackageMetadata: PackageMetadata = {
  name: 'nodejs-prumo-api',
  version: '0.0.1',
};

let cachedPackageMetadata: PackageMetadata | undefined;

export function getPackageMetadata(): PackageMetadata {
  if (cachedPackageMetadata) {
    return cachedPackageMetadata;
  }

  try {
    const packageJsonPath = resolve(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      name?: unknown;
      version?: unknown;
    };

    cachedPackageMetadata = {
      name:
        typeof packageJson.name === 'string' && packageJson.name.trim()
          ? packageJson.name
          : defaultPackageMetadata.name,
      version:
        typeof packageJson.version === 'string' && packageJson.version.trim()
          ? packageJson.version
          : defaultPackageMetadata.version,
    };
  } catch {
    cachedPackageMetadata = defaultPackageMetadata;
  }

  return cachedPackageMetadata;
}
