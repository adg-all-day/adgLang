/**
 * Run Command Handler
 * Compiles and executes a ADGLANG program in one step
 */

import { Command } from "commander";
import { processFile } from "../CompilationRunner";
import type { CompileOptions } from "../types";
import { Logger } from "../../compiler/common/Logger";

const log = new Logger("Run");

/**
 * Register the run command
 *
 * The `run` command is a convenience wrapper that compiles a ADGLANG file
 * and immediately executes it. It's equivalent to `adgLang file.adg --run`
 * but with cleaner syntax.
 *
 * Examples:
 *   adgLang run main.adg
 *   adgLang run main.adg arg1 arg2 arg3
 *   adgLang run main.adg -v
 *   adgLang run main.adg -O2
 */
export function registerRunCommand(program: Command): void {
  program
    .command("run")
    .argument("<file>", "ADGLANG file to compile and run")
    .argument("[args...]", "arguments to pass to the program")
    .description("Compile and execute a ADGLANG program")
    .option("-v, --verbose", "enable verbose output")
    .option("-q, --quiet", "suppress non-error output")
    .option("-O <level>", "optimization level: 0, 1, 2, or 3", "0")
    .option("--debug", "generate debug information (DWARF)")
    .option("--time", "show compilation time statistics")
    .option("--cache", "enable incremental compilation with module caching")
    .option("--no-prelude", "do not load implicit primitives")
    .option("--color", "force colored output")
    .option("--no-color", "disable colored output")
    .action(
      (
        file: string,
        args: string[],
        options: CompileOptions,
        command: Command,
      ) => {
        try {
          // Merge parent options if any
          const globalOpts = command.parent?.opts() || {};
          const compileOptions: CompileOptions = {
            ...globalOpts,
            ...options,
            run: true,
            dwarf: options.debug || options.dwarf,
          };

          processFile(file, compileOptions, args);
        } catch (e) {
          log.error(`${e instanceof Error ? e.message : String(e)}`);
          process.exit(1);
        }
      },
    );
}
