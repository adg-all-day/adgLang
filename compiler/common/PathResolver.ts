/**
 * Path Resolution Utilities
 *
 * Provides centralized path resolution using ADGLANG_HOME environment variable
 * to ensure the compiler can locate resources (grammar, lib) from anywhere.
 */

import { existsSync, realpathSync, lstatSync } from "fs";
import { dirname, resolve } from "path";

/**
 * Get the ADGLANG installation root directory
 * Priority:
 * 1. ADGLANG_HOME environment variable (if set and valid)
 * 2. Directory containing the adgLang executable (resolving symlinks)
 * 3. Current working directory (development mode)
 * 4. __dirname fallback (for non-compiled mode)
 */
export function getBplHome(): string {
  // 1. Check ADGLANG_HOME environment variable
  const adgLangHome = process.env.ADGLANG_HOME;
  if (adgLangHome && existsSync(adgLangHome)) {
    return adgLangHome;
  }

  // 2. Try to determine from executable location
  let execPath = process.argv[1] || process.execPath;

  // If the executable is a symlink, resolve it to the real path
  // This handles cases like /usr/bin/adgLang -> /home/user/Projects/adgLang/adgLang-wrapper.sh
  if (existsSync(execPath)) {
    try {
      const stats = lstatSync(execPath);
      if (stats.isSymbolicLink()) {
        execPath = realpathSync(execPath);
      }
    } catch {
      // If realpath fails, continue with original path - this can happen with permission issues
    }
  }

  const execDir = dirname(execPath);

  // Check if grammar exists in execDir (compiled binary case)
  if (existsSync(resolve(execDir, "grammar"))) {
    return execDir;
  }

  // 3. Try current working directory (development)
  if (existsSync(resolve(process.cwd(), "grammar"))) {
    return process.cwd();
  }

  // 4. Try __dirname/../.. (TypeScript source case)
  const sourceRoot = resolve(__dirname, "../..");
  if (existsSync(resolve(sourceRoot, "grammar"))) {
    return sourceRoot;
  }

  // 5. Try common install locations
  const commonPaths = ["/usr/local/lib/adgLang", "/usr/lib/adgLang", "/opt/adgLang"];

  for (const p of commonPaths) {
    if (existsSync(resolve(p, "grammar"))) {
      return p;
    }
  }

  // Fallback: return execDir even if grammar not found
  // This will cause a more specific error message later
  return execDir;
}

/**
 * Resolve a path relative to ADGLANG_HOME
 */
export function resolveBplPath(...pathSegments: string[]): string {
  const adgLangHome = getBplHome();
  return resolve(adgLangHome, ...pathSegments);
}

/**
 * Get the grammar directory path
 */
export function getGrammarPath(): string {
  return resolveBplPath("grammar");
}

/**
 * Get the standard library path
 */
export function getLibPath(): string {
  return resolveBplPath("lib");
}

/**
 * Get the adgLang_modules directory path (relative to a project directory)
 */
export function getBplModulesPath(projectDir: string): string {
  return resolve(projectDir, "adgLang_modules");
}
