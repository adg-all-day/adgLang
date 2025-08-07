/**
 * Test Helper: Compile and Run ADGLANG Code
 *
 * Provides utilities for compiling and running ADGLANG code in tests.
 * Handles temporary file creation, cleanup, and error reporting.
 */

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const ADGLANG_CLI = path.resolve(__dirname, "../../index.ts");
const TEMP_DIR = path.join(__dirname, "../tmp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Options for compileAndRun
 */
export interface CompileAndRunOptions {
  /** Additional arguments to pass to the ADGLANG CLI */
  args?: string[];
  /** Input to pass to stdin */
  input?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Working directory */
  cwd?: string;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Whether to keep temp files for debugging */
  keepFiles?: boolean;
}

/**
 * Result from compileAndRun
 */
export interface CompileAndRunResult {
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Exit code */
  exitCode: number;
  /** Path to temp file (if keepFiles=true) */
  tempFile?: string;
}

/**
 * Generate a unique temp file path
 */
function getTempFilePath(prefix = "test"): string {
  const id = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now();
  return path.join(TEMP_DIR, `${prefix}_${timestamp}_${id}.adg`);
}

/**
 * Clean up temp files
 */
function cleanupTempFiles(basePath: string): void {
  const extensions = ["", ".ll", ".o", ".s"];
  for (const ext of extensions) {
    const filePath = basePath.replace(".adg", ext);
    if (ext === "") {
      // Binary file (no extension after removing .adg)
      const binPath = basePath.replace(".adg", "");
      if (fs.existsSync(binPath)) {
        try {
          fs.unlinkSync(binPath);
        } catch {
          /* ignore */
        }
      }
    }
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        /* ignore */
      }
    }
  }
  // Also try to remove .adg file
  if (fs.existsSync(basePath)) {
    try {
      fs.unlinkSync(basePath);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Compile and run ADGLANG source code
 *
 * @param sourceCode - ADGLANG source code to compile and run
 * @param options - Optional configuration
 * @returns The stdout from running the program
 * @throws Error if compilation or execution fails
 *
 * @example
 * ```typescript
 * const output = compileAndRun(`
 *   extern printf(fmt: *i8, ...) ret i32;
 *   frame main() {
 *     printf("Hello, World!\\n");
 *   }
 * `);
 * expect(output).toContain("Hello, World!");
 * ```
 */
export function compileAndRun(
  sourceCode: string,
  options: CompileAndRunOptions = {},
): string {
  const result = compileAndRunFull(sourceCode, options);

  if (result.exitCode !== 0) {
    const errorMsg = [
      `ADGLANG execution failed with code ${result.exitCode}`,
      result.stderr ? `stderr: ${result.stderr}` : "",
      result.stdout ? `stdout: ${result.stdout}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    throw new Error(errorMsg);
  }

  return result.stdout;
}

/**
 * Compile and run ADGLANG source code, returning full result
 *
 * Unlike `compileAndRun`, this doesn't throw on failure and returns
 * the full result including exit code and stderr.
 *
 * @param sourceCode - ADGLANG source code to compile and run
 * @param options - Optional configuration
 * @returns Full result including stdout, stderr, and exit code
 */
export function compileAndRunFull(
  sourceCode: string,
  options: CompileAndRunOptions = {},
): CompileAndRunResult {
  const {
    args = [],
    input,
    env,
    cwd = __dirname,
    timeout = 30000,
    keepFiles = false,
  } = options;

  const tempFile = getTempFilePath();
  fs.writeFileSync(tempFile, sourceCode);

  try {
    const spawnOptions: Parameters<typeof spawnSync>[2] = {
      encoding: "utf-8" as const,
      cwd,
      timeout,
      input,
      env: env ? { ...process.env, ...env } : process.env,
    };

    const result = spawnSync(
      "bun",
      [ADGLANG_CLI, "run", tempFile, ...args],
      spawnOptions,
    );

    return {
      stdout: String(result.stdout || ""),
      stderr: String(result.stderr || ""),
      exitCode: result.status ?? -1,
      tempFile: keepFiles ? tempFile : undefined,
    };
  } finally {
    if (!keepFiles) {
      cleanupTempFiles(tempFile);
    }
  }
}

/**
 * Compile ADGLANG source code without running
 *
 * @param sourceCode - ADGLANG source code to compile
 * @param options - Optional configuration
 * @returns Result including path to compiled binary
 */
export function compileOnly(
  sourceCode: string,
  options: Omit<CompileAndRunOptions, "input"> = {},
): CompileAndRunResult & { binaryPath?: string } {
  const { args = [], env, cwd = __dirname, timeout = 30000 } = options;

  const tempFile = getTempFilePath();
  fs.writeFileSync(tempFile, sourceCode);

  const spawnOptions: Parameters<typeof spawnSync>[2] = {
    encoding: "utf-8" as const,
    cwd,
    timeout,
    env: env ? { ...process.env, ...env } : process.env,
  };

  const result = spawnSync(
    "bun",
    [ADGLANG_CLI, "build", tempFile, ...args],
    spawnOptions,
  );

  const binaryPath = tempFile.replace(".adg", "");

  return {
    stdout: String(result.stdout || ""),
    stderr: String(result.stderr || ""),
    exitCode: result.status ?? -1,
    tempFile,
    binaryPath: fs.existsSync(binaryPath) ? binaryPath : undefined,
  };
}

/**
 * Check if ADGLANG code compiles successfully without running
 *
 * @param sourceCode - ADGLANG source code to check
 * @returns true if compilation succeeds
 */
export function compilesSuccessfully(sourceCode: string): boolean {
  const result = compileAndRunFull(sourceCode);
  return result.exitCode === 0;
}

/**
 * Get compilation errors from ADGLANG code
 *
 * @param sourceCode - ADGLANG source code to check
 * @returns Array of error messages, or empty array if compilation succeeds
 */
export function getCompilationErrors(sourceCode: string): string[] {
  const result = compileAndRunFull(sourceCode);
  if (result.exitCode === 0) {
    return [];
  }

  // Parse errors from stderr
  const errorLines = result.stderr
    .split("\n")
    .filter((line) => line.includes("error") || line.includes("Error"));

  return errorLines.length > 0 ? errorLines : [result.stderr];
}
